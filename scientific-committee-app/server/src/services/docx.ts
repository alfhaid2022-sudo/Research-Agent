import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { VERDICT_LABELS } from './study.js';
import { ATTENDANCE_LABELS, calendarLabel, type MinutesExportModel, type StudyExportModel } from './export.js';

const FONT = 'Arial';

function p(text: string, opts: { bold?: boolean; size?: number; heading?: boolean; color?: string } = {}): Paragraph {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    ...(opts.heading ? { heading: HeadingLevel.HEADING_2 } : {}),
    spacing: { after: 100 },
    children: [
      new TextRun({
        text,
        rightToLeft: true,
        font: FONT,
        bold: opts.bold ?? false,
        size: opts.size ?? 22,
        ...(opts.color ? { color: opts.color } : {}),
      }),
    ],
  });
}

function cell(text: string, opts: { bold?: boolean; width?: number } = {}): TableCell {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: text.split('\n').map((line) => p(line, { bold: opts.bold, size: 18 })),
  });
}

function table(rows: TableRow[]): Table {
  return new Table({
    visuallyRightToLeft: true,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: '9FB0BF' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '9FB0BF' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '9FB0BF' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '9FB0BF' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '9FB0BF' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '9FB0BF' },
    },
    rows,
  });
}

export async function renderStudyDocx(model: StudyExportModel): Promise<Buffer> {
  const children: Array<Paragraph | Table> = [
    p(model.org.university, { bold: true }),
    p(`${model.org.college} — ${model.org.department}`),
    p(`${model.org.committee} — مذكرة دراسة طلب`, { bold: true, size: 30 }),
    p(`الإصدار ${model.study.version} — ${model.study.status === 'final' ? 'نهائية' : 'مسودة'}`, { size: 18 }),
  ];

  if (model.demoNotice) children.push(p(model.demoNotice, { bold: true, color: 'A33333' }));
  children.push(p(model.templateNotice, { size: 18, color: '8A6412' }));

  const blocking = model.readiness.filter((r) => r.blocking && !r.ok);
  if (blocking.length) {
    children.push(p('الدراسة غير جاهزة للإصدار النهائي:', { bold: true, color: '8A6412' }));
    for (const item of blocking) children.push(p(`• ${item.label}: ${item.detail}`, { size: 18, color: '8A6412' }));
  }

  children.push(p('بيانات الطلب', { heading: true, bold: true }));
  children.push(
    table([
      new TableRow({ children: [cell('الرقم المرجعي', { bold: true, width: 25 }), cell(model.request.refNo)] }),
      new TableRow({ children: [cell('العنوان', { bold: true }), cell(model.request.title)] }),
      new TableRow({ children: [cell('نوع الطلب', { bold: true }), cell(model.request.typeName || 'غير محدد')] }),
      new TableRow({ children: [cell('مقدم الطلب', { bold: true }), cell(model.request.applicant || 'غير مذكور')] }),
      new TableRow({ children: [cell('الجهة', { bold: true }), cell(model.request.unit || 'غير مذكورة')] }),
      new TableRow({ children: [cell('تاريخ التقديم', { bold: true }), cell(model.request.submittedDate || 'غير مذكور')] }),
    ]),
  );

  children.push(p('ملخص الطلب', { heading: true, bold: true }));
  children.push(p(model.summary || 'لم يُدخل ملخص.'));

  children.push(p('مصفوفة المطابقة والأدلة', { heading: true, bold: true }));
  children.push(
    table([
      new TableRow({
        children: [
          cell('م', { bold: true, width: 5 }),
          cell('المتطلب', { bold: true, width: 24 }),
          cell('السند النظامي', { bold: true, width: 23 }),
          cell('دليل الطلب', { bold: true, width: 18 }),
          cell('النتيجة', { bold: true, width: 12 }),
          cell('ملاحظات', { bold: true, width: 18 }),
        ],
      }),
      ...model.findings.map(
        (f) =>
          new TableRow({
            children: [
              cell(String(f.ordinal)),
              cell(f.requirementText),
              cell(f.basisQuote ? `${f.basis}\n«${f.basisQuote}»` : `${f.basis}\nلا يوجد اقتباس محقَّق.`),
              cell(f.evidenceQuote ? `${f.evidence}\n«${f.evidenceQuote}»` : f.evidence),
              cell(`${VERDICT_LABELS[f.verdict]}${f.verdictReason ? `\n${f.verdictReason}` : ''}`),
              cell(
                [
                  f.facts ? `وقائع: ${f.facts}` : '',
                  f.inference ? `استنتاج: ${f.inference}` : '',
                  f.calculation ? `حساب: ${f.calculation}` : '',
                  f.notes ? `ملاحظة: ${f.notes}` : '',
                  f.gap ? `نقص: ${f.gap}` : '',
                ]
                  .filter(Boolean)
                  .join('\n') || '—',
              ),
            ],
          }),
      ),
    ]),
  );

  if (model.conflicts.length) {
    children.push(p('تعارض المصادر', { heading: true, bold: true }));
    for (const conflict of model.conflicts) {
      children.push(p(conflict.conflictKey, { bold: true }));
      for (const side of conflict.sides) {
        children.push(p(`• ${side.sourceTitle} (${side.locator}): ${side.value}`, { size: 18 }));
      }
      children.push(
        p(conflict.resolved ? `توجيه اللجنة المسجَّل: ${conflict.resolutionNote}` : 'لم يُحسم بعد — يحتاج توجيه اللجنة.', {
          size: 18,
        }),
      );
    }
  }

  children.push(p('مذكرة الدراسة', { heading: true, bold: true }));
  children.push(p(model.memo || 'لا توجد مذكرة.'));

  children.push(p('قائمة الاستكمال', { heading: true, bold: true }));
  if (model.completionItems.length) {
    for (const item of model.completionItems) children.push(p(`• ${item}`));
  } else children.push(p('لا توجد نواقص مسجَّلة.'));

  children.push(p('توصية مبدئية', { heading: true, bold: true }));
  children.push(p(model.recommendation || 'لم تُسجَّل توصية.'));
  children.push(p('توصية مبدئية للعرض على اللجنة. القرار النهائي واعتماد المحضر من صلاحية اللجنة.', { size: 18 }));

  if (model.revisions.length) {
    children.push(p('سجل تعديلات المراجع', { heading: true, bold: true }));
    children.push(
      table([
        new TableRow({
          children: [
            cell('الوقت', { bold: true }),
            cell('الحقل', { bold: true }),
            cell('قبل', { bold: true }),
            cell('بعد', { bold: true }),
            cell('السبب', { bold: true }),
          ],
        }),
        ...model.revisions.map(
          (r) =>
            new TableRow({
              children: [cell(r.at), cell(r.field), cell(r.oldValue || '—'), cell(r.newValue || '—'), cell(r.reason || '—')],
            }),
        ),
      ]),
    );
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

export async function renderMinutesDocx(model: MinutesExportModel): Promise<Buffer> {
  const dateLabel = [model.meetingDate, calendarLabel(model.meetingCalendar)].filter(Boolean).join(' — ');
  const children: Array<Paragraph | Table> = [
    p(model.org.university, { bold: true }),
    p(`${model.org.college} — ${model.org.department}`),
    p('محضر اجتماع', { bold: true, size: 30 }),
  ];
  if (model.demoNotice) children.push(p(model.demoNotice, { bold: true, color: 'A33333' }));
  children.push(p(model.templateNotice, { size: 18, color: '8A6412' }));
  children.push(
    p('مسودة غير معتمدة: لا توقيعات ولا اعتماد، وحالة الحضور خاصة بهذا الاجتماع.', { size: 18, color: '8A6412' }),
  );

  children.push(
    table([
      new TableRow({
        children: [cell('اسم اللجنة', { bold: true, width: 25 }), cell(model.committeeName || model.org.committee)],
      }),
      new TableRow({ children: [cell('رقم الجلسة', { bold: true }), cell(model.sessionNo || '—')] }),
      new TableRow({ children: [cell('التاريخ', { bold: true }), cell(dateLabel || '—')] }),
      new TableRow({ children: [cell('الوقت', { bold: true }), cell(model.meetingTime || '—')] }),
    ]),
  );

  children.push(p('أولاً: أعضاء اللجنة حسب قرار تكوينها', { heading: true, bold: true }));
  children.push(
    table([
      new TableRow({
        children: [
          cell('م', { bold: true, width: 6 }),
          cell('الاسم', { bold: true }),
          cell('الصفة', { bold: true }),
          cell('حالة الحضور', { bold: true }),
          cell('سبب التغيب', { bold: true }),
        ],
      }),
      ...(model.members.length
        ? model.members.map(
            (member) =>
              new TableRow({
                children: [
                  cell(String(member.ordinal)),
                  cell(member.name),
                  cell(member.role),
                  cell(ATTENDANCE_LABELS[member.state] ?? member.state),
                  cell(member.absenceReason || '—'),
                ],
              }),
          )
        : [new TableRow({ children: [cell('—'), cell('لم يُسجَّل تشكيل اللجنة بعد.'), cell('—'), cell('—'), cell('—')] })]),
    ]),
  );

  children.push(p('ثانياً: جدول أعمال الجلسة', { heading: true, bold: true }));
  children.push(
    table([
      new TableRow({ children: [cell('م', { bold: true, width: 6 }), cell('الموضوع', { bold: true })] }),
      ...(model.items.length
        ? model.items.map(
            (item) =>
              new TableRow({
                children: [cell(String(item.ordinal)), cell(item.subject || item.requestTitle || '—')],
              }),
          )
        : [new TableRow({ children: [cell('—'), cell('لا توجد بنود.')] })]),
    ]),
  );

  children.push(p('ثالثاً: المناقشات والقرارات أو التوصيات', { heading: true, bold: true }));
  if (model.items.length === 0) children.push(p('لا توجد بنود.'));
  for (const item of model.items) {
    children.push(
      table([
        new TableRow({
          children: [
            cell('الموضوع', { bold: true, width: 25 }),
            cell(`${item.subject || item.requestTitle || '—'}${item.refNo ? ` (طلب رقم ${item.refNo})` : ''}`),
          ],
        }),
        new TableRow({ children: [cell('ملخص وصف الموضوع ومناقشته', { bold: true }), cell(item.body || '—')] }),
        new TableRow({
          children: [
            cell('القرار/التوصية', { bold: true }),
            cell(item.decision || 'يُدوَّن في الجلسة — لا يُنشأ آليًا.'),
          ],
        }),
        new TableRow({ children: [cell('الجهة ذات العلاقة', { bold: true }), cell(item.relatedEntity || '—')] }),
      ]),
    );
    children.push(p('', { size: 12 }));
  }

  children.push(p('رابعاً', { heading: true, bold: true }));
  children.push(
    p(
      `يُرفع المحضر إلى ${model.addressee.title || '(الصفة غير محددة)'} ${model.addressee.name || '(الاسم غير محدد)'}.`,
    ),
  );
  if (model.addressee.state !== 'confirmed') {
    children.push(p('المخاطب وصفته بانتظار مراجعة المستخدم؛ لم يُؤخذا من النموذج تلقائيًا.', { size: 18, color: '8A6412' }));
  }

  children.push(p('خامساً: رأي الأعضاء في المحضر', { heading: true, bold: true }));
  children.push(
    table([
      new TableRow({
        children: [
          cell('م', { bold: true, width: 6 }),
          cell('الاسم', { bold: true }),
          cell('الصفة', { bold: true }),
          cell('التوقيع', { bold: true, width: 25 }),
        ],
      }),
      ...(model.members.length
        ? model.members.map(
            (member) =>
              new TableRow({
                children: [cell(String(member.ordinal)), cell(member.name), cell(member.role), cell(' ')],
              }),
          )
        : [new TableRow({ children: [cell('—'), cell('لم يُسجَّل تشكيل اللجنة بعد.'), cell('—'), cell(' ')] })]),
    ]),
  );
  children.push(p('تُوقَّع هذه الخانات يدويًا. لا ينشئ التطبيق توقيعًا ولا اعتمادًا.', { size: 18 }));

  children.push(p('سادساً: الإضافات والملحوظات', { heading: true, bold: true }));
  for (const line of (model.additions || 'لا توجد إضافات.').split('\n')) children.push(p(line));
  if (model.notes) for (const line of model.notes.split('\n')) children.push(p(line));

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
