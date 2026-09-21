import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { config } from '../config.js';
import { HttpError } from '../lib/util.js';
import { resolveStoredPath, safeBaseName } from '../services/storage.js';
import { createRequestType, resetDb, testApp, uploadTextSource } from './helpers.js';

const app = testApp();

beforeEach(() => resetDb());

describe('حدود الملفات والأمان', () => {
  it('يمنع اجتياز المسار عند قراءة ملف مخزَّن', () => {
    expect(() => resolveStoredPath('../../etc/passwd')).toThrow(HttpError);
    expect(() => resolveStoredPath('/etc/passwd')).toThrow(HttpError);
    expect(() => resolveStoredPath('')).toThrow(HttpError);
  });

  it('يخزّن الملف باسم يولّده الخادم ولا يعتمد اسم المستخدم', async () => {
    const id = await uploadTextSource(app, { title: 'ملف', body: 'نص اللائحة للاختبار.', fileName: '../../خبيث.txt' });
    const detail = await request(app).get(`/api/sources/${id}`).expect(200);
    expect(detail.body.source.fileName).toBe('خبيث.txt');
    const files = fs.readdirSync(config.uploadsDir);
    expect(files.some((name) => name.includes('..'))).toBe(false);
    expect(files.some((name) => name.startsWith('f_') && path.extname(name) === '.txt')).toBe(true);
  });

  it('ينزّل المرفقات دائمًا كملفات، فلا تُفسَّر داخل التطبيق', async () => {
    const id = await uploadTextSource(app, { title: 'ملف', body: 'نص اللائحة للاختبار.' });
    const response = await request(app).get(`/api/sources/${id}/file`).expect(200);
    expect(response.headers['content-type']).toBe('application/octet-stream');
    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('يرفض رفع ملف HTML أو SVG قابل للتنفيذ في المتصفح', async () => {
    for (const name of ['صفحة.html', 'رسم.svg']) {
      const response = await request(app)
        .post('/api/sources')
        .field('title', 'محاولة')
        .attach('file', Buffer.from('<script>alert(1)</script>', 'utf8'), name)
        .expect(400);
      expect(response.body.error).toContain('غير مسموح');
    }
  });

  it('ينظّف اسم الملف من أحرف التحكم والمسارات', () => {
    expect(safeBaseName('a/b/c.txt')).toBe('c.txt');
    expect(safeBaseName('...hidden.txt')).toBe('hidden.txt');
    expect(safeBaseName('')).toBe('ملف');
  });

  it('يمنع حذف نوع طلب مستخدم في طلبات قائمة', async () => {
    const typeId = await createRequestType(app, { name: 'نوع مستخدم' });
    await request(app).post('/api/requests').send({ refNo: 'س-1', typeId, title: 'طلب' }).expect(201);
    const response = await request(app).delete(`/api/request-types/${typeId}`).expect(409);
    expect(response.body.error).toContain('عطّله بدل حذفه');
  });
});
