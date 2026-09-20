import { useState, type FormEvent } from 'react';
import { api, type Scope, type TrackRecord } from '../api';
import { Field, useAsync, useToast } from './ui';

interface Props {
  scope: Scope;
  asTemplate?: boolean;
  onDone: () => void;
}

export default function SourceUploadForm({ scope, asTemplate = false, onDone }: Props) {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [version, setVersion] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [kind, setKind] = useState(asTemplate ? 'form_template' : 'regulation');
  const [track, setTrack] = useState('');
  const [expectedSha256, setExpectedSha256] = useState('');
  const tracks = useAsync<{ tracks: TrackRecord[] }>(() => api.get('/tracks', scope), [scope]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!file) nextErrors.file = 'اختر ملفًا.';
    if (title.trim().length < 2) nextErrors.title = 'العنوان مطلوب.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !file) return;

    const form = new FormData();
    form.append('file', file);
    form.append('title', title.trim());
    form.append('kind', kind);
    form.append('issuer', issuer.trim());
    form.append('version', version.trim());
    form.append('effectiveDate', effectiveDate.trim());
    form.append('referenceNo', referenceNo.trim());
    form.append('notes', notes.trim());
    form.append('scope', scope);
    form.append('track', track);
    form.append('expectedSha256', expectedSha256.trim());
    form.append('isOfficialTemplate', asTemplate ? 'true' : 'false');

    setBusy(true);
    try {
      const result = await api.upload<{
        extraction: { status: string; note: string };
        intake: { status: string; note: string };
      }>('/sources', form);
      push(`تم الرفع. ${result.intake.note} حالة الاستخراج: ${result.extraction.note}`, result.intake.status === 'hash_mismatch' ? 'error' : 'success');
      setFile(null);
      setTitle('');
      setIssuer('');
      setVersion('');
      setEffectiveDate('');
      setReferenceNo('');
      setNotes('');
      setExpectedSha256('');
      onDone();
    } catch (error) {
      push((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="form-row">
        <Field label="الملف" hint="PDF ذو نص، أو DOCX، أو ملف نصي. الملفات الممسوحة ضوئيًا تُعلّم بأنها تحتاج OCR." error={errors.file}>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md,.csv,.doc,.png,.jpg,.jpeg,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <Field label="العنوان" error={errors.title}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اسم اللائحة أو الدليل كما ورد في المصدر" />
        </Field>
      </div>
      <div className="form-row">
        <Field label="الجهة المُصدِرة">
          <input value={issuer} onChange={(e) => setIssuer(e.target.value)} />
        </Field>
        <Field label="الإصدار">
          <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="مثال: 3.0" />
        </Field>
        <Field label="تاريخ النفاذ" hint="أدخله كما ورد في المصدر. لا يُفترض أي تحويل هجري/ميلادي.">
          <input value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        </Field>
        <Field label="الرقم المرجعي">
          <input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} />
        </Field>
      </div>
      <div className="form-row">
        <Field
          label="المسار"
          hint="ضوابط كل مسار مستقلة تمامًا: لا تُسحب ضوابط مسار على مسار آخر."
        >
          <select value={track} onChange={(e) => setTrack(e.target.value)}>
            <option value="">عام (غير مقيّد بمسار)</option>
            {(tracks.data?.tracks ?? []).map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="بصمة الملف المتوقعة (SHA-256)"
          hint="اختياري. إن أُدخلت، يقارنها التطبيق بالملف المستلم ويعلن عدم التطابق بدل اعتماده."
        >
          <input dir="ltr" value={expectedSha256} onChange={(e) => setExpectedSha256(e.target.value)} />
        </Field>
      </div>
      {!asTemplate && (
        <Field label="النوع">
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="regulation">لائحة/نظام</option>
            <option value="policy">سياسة</option>
            <option value="guide">دليل إجراءات</option>
            <option value="other">أخرى</option>
          </select>
        </Field>
      )}
      <Field label="ملاحظات">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? 'جارٍ الرفع والفهرسة…' : 'رفع وفهرسة'}
      </button>
    </form>
  );
}
