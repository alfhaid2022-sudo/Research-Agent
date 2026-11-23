/* سكرتير اللجنة التنفيذية — واجهة المتصفح (بدون مكتبات خارجية).
   كل نص يُدرج عبر textContent لا innerHTML، فلا يُفسَّر محتوى المستخدم كـ HTML. */
'use strict';
const S = { me: null, cfg: null, tab: 'info' };
const $app = document.getElementById('app');

// ---------- أدوات
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'value') e.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'selected') e[k] = !!v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid === null || kid === undefined || kid === false) continue;
    e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return e;
}
async function api(method, path, body, raw) {
  const opt = { method, headers: { 'X-Requested-With': 'secretary-app' }, credentials: 'same-origin' };
  if (raw) { opt.body = raw.body; Object.assign(opt.headers, raw.headers); }
  else if (body !== undefined) { opt.body = JSON.stringify(body); opt.headers['Content-Type'] = 'application/json'; }
  const r = await fetch(path, opt);
  let data = null;
  try { data = await r.json(); } catch (_) { /* لا محتوى */ }
  if (r.status === 401 && path !== '/api/login') { S.me = null; renderLogin(); throw new Error('انتهت الجلسة؛ سجّل الدخول من جديد'); }
  if (!r.ok) throw new Error((data && data.error) || `خطأ (${r.status})`);
  return data;
}
function toast(msg, err) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = err ? 'err' : ''; t.style.display = 'block';
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.style.display = 'none'; }, err ? 7000 : 3000);
}
async function run(fn) { try { return await fn(); } catch (e) { toast(e.message, true); } }
function modal(title, body, buttons) {
  const root = document.getElementById('modal-root');
  const close = () => { root.replaceChildren(); };
  const box = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('h2', { style: 'margin-top:0' }, title), body,
    h('div', { class: 'actions' }, (buttons || []).map(b => h('button', { class: b.cls || '', onclick: () => b.fn(close), disabled: b.disabled, id: b.id }, b.label)),
      h('button', { onclick: close }, 'إغلاق')));
  root.replaceChildren(h('div', { class: 'modal-back' }, box));
  const f = box.querySelector('input,select,textarea,button'); if (f) f.focus();
  return close;
}
const can = (...roles) => S.me && roles.includes(S.me.role);
const field = (label, input) => h('div', {}, h('label', {}, label), input);
const val = id => document.getElementById(id).value.trim();
function hijriFromBrowser(iso) {
  try {
    const f = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    if (!f.resolvedOptions().calendar.startsWith('islamic')) return '';
    return f.format(new Date(iso + 'T00:00:00Z'));
  } catch (_) { return ''; }
}
const statusBadge = m => h('span', { class: 'badge ' + (m.status === 'approved' ? 'ok' : m.status === 'review' ? 'warn' : '') }, m.status_label);
const flagBadge = () => h('span', { class: 'badge danger' }, 'يحتاج تأكيد');
const defType = t => (t && !t.startsWith('ال')) ? 'ال' + t : (t || '');
const phoneEl = p => h('span', { class: 'ltr' }, p);

// ---------- الدخول والهيكل
function renderLogin() {
  const submit = e => { e.preventDefault(); run(async () => {
    await api('POST', '/api/login', { username: val('u'), password: document.getElementById('p').value });
    await boot();
  }); };
  $app.replaceChildren(h('div', { class: 'login' }, h('form', { class: 'card', onsubmit: submit },
    h('h1', {}, 'سكرتير اللجنة التنفيذية'),
    field('اسم المستخدم', h('input', { id: 'u', autocomplete: 'username', dir: 'ltr', required: true })),
    field('كلمة المرور', h('input', { id: 'p', type: 'password', autocomplete: 'current-password', dir: 'ltr', required: true })),
    h('div', { class: 'actions' }, h('button', { class: 'primary', type: 'submit' }, 'دخول')),
    h('p', { class: 'muted' }, 'النسخة التجريبية: الحسابات muqarrir (مقرر)، raees (رئيس)، odw (عضو) وكلمة المرور demo-1234 — بيانات غير حقيقية، وتُغيَّر قبل أي استخدام فعلي.'))));
}
const NAV = [['#/', 'الرئيسية'], ['#/meetings', 'الاجتماعات'], ['#/decisions', 'سجل القرارات'], ['#/archive', 'الأرشيف والبحث'],
  ['#/whatsapp', 'واتساب', ['secretary', 'chair']], ['#/audit', 'سجل التعديلات', ['secretary', 'chair']], ['#/settings', 'الإعدادات']];
function shell(content) {
  const cur = location.hash || '#/';
  const top = h('header', { class: 'top' },
    h('div', { class: 'title' }, S.cfg.settings.org_name + ' — ' + S.cfg.settings.committee_name),
    h('div', { class: 'who' }, S.me.name + ' · ' + S.me.role_label),
    h('button', { class: 'small', onclick: () => run(async () => { await api('POST', '/api/logout', {}); S.me = null; renderLogin(); }) }, 'خروج'));
  const nav = h('nav', { class: 'main', 'aria-label': 'التنقل الرئيسي' }, NAV.filter(n => !n[2] || can(...n[2])).map(([href, label]) =>
    h('a', { href, class: (href === '#/' ? cur === '#/' : cur.startsWith(href) || (href === '#/meetings' && cur.startsWith('#/meeting'))) ? 'on' : '' }, label)));
  const notices = [];
  if (S.me.demo_password) notices.push(h('div', { class: 'notice warn' }, 'حسابك يستخدم كلمة المرور التجريبية. غيّرها من «الإعدادات» قبل إدخال أي بيانات حقيقية.'));
  $app.replaceChildren(top, nav, h('main', {}, notices, content));
}
async function boot() {
  const d = await api('GET', '/api/me');
  if (!d.user) return renderLogin();
  S.me = d.user; S.cfg = d;
  route();
}
function route() {
  if (!S.me) return renderLogin();
  const p = (location.hash || '#/').slice(2).split('/');
  const views = { '': vHome, meetings: vMeetings, meeting: () => vMeeting(+p[1]), decisions: vDecisions, archive: vArchive, whatsapp: vWhatsapp, audit: vAudit, settings: vSettings };
  run(views[p[0]] || vHome);
}
window.addEventListener('hashchange', route);

// ---------- الرئيسية
async function vHome() {
  const [meetings, overdue, open] = await Promise.all([api('GET', '/api/meetings'), api('GET', '/api/decisions?overdue=1'), api('GET', '/api/decisions')]);
  const next = meetings.filter(m => m.date >= S.cfg.today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const wa = S.cfg.whatsapp;
  shell([h('h1', {}, 'لوحة المتابعة'),
    h('div', { class: 'grid' },
      h('div', { class: 'card' }, h('div', { class: 'muted' }, 'الاجتماع القادم'), next
        ? h('div', {}, h('a', { href: '#/meeting/' + next.id }, `اجتماع رقم (${next.number || '—'})`), h('div', {}, `${next.date} م`), h('div', { class: 'muted' }, next.hijri_date || ''))
        : h('div', {}, 'لا يوجد اجتماع قادم مسجّل')),
      h('div', { class: 'card' }, h('div', { class: 'muted' }, 'قرارات متأخرة'), h('div', { class: 'stat', style: overdue.length ? 'color:var(--danger)' : '' }, overdue.length),
        h('a', { href: '#/decisions' }, 'فتح السجل')),
      h('div', { class: 'card' }, h('div', { class: 'muted' }, 'قرارات مفتوحة'), h('div', { class: 'stat' }, open.filter(d => ['لم يبدأ', 'قيد التنفيذ'].includes(d.status)).length)),
      h('div', { class: 'card' }, h('div', { class: 'muted' }, 'محاضر غير معتمدة'), h('div', { class: 'stat' }, meetings.filter(m => m.status !== 'approved').length))),
    overdue.length ? h('div', { class: 'notice danger' }, h('strong', {}, 'تنبيه — قرارات تجاوزت موعدها:'),
      h('ul', {}, overdue.map(d => h('li', {}, `${d.kind} ${d.number || ''}: ${d.text} — المسؤول: ${d.owner || 'غير محدد'} — الموعد: ${d.due_date}`)))) : null,
    !wa.configured ? h('div', { class: 'notice' }, wa.message) : null,
  ]);
}

// ---------- الاجتماعات
async function vMeetings() {
  const list = await api('GET', '/api/meetings');
  shell([h('h1', {}, 'الاجتماعات'),
    can('secretary') ? h('div', { class: 'actions noprint', style: 'margin:0 0 1rem' }, h('button', { class: 'primary', onclick: newMeeting }, '+ اجتماع جديد')) : null,
    h('div', { class: 'card tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['الرقم', 'النوع', 'التاريخ الميلادي', 'التاريخ الهجري', 'المكان', 'البنود', 'القرارات', 'حالة المحضر'].map(x => h('th', {}, x)))),
      h('tbody', {}, list.map(m => h('tr', {}, h('td', {}, h('a', { href: '#/meeting/' + m.id }, m.number || '—')), h('td', {}, m.type), h('td', {}, m.date),
        h('td', {}, m.hijri_date), h('td', {}, m.location), h('td', {}, m.items), h('td', {}, m.decisions), h('td', {}, statusBadge(m)))))))]);
}
function newMeeting() {
  const body = h('div', {}, h('div', { class: 'row' }, field('رقم الاجتماع', h('input', { id: 'nm-no' })), field('التاريخ الميلادي', h('input', { id: 'nm-date', type: 'date' }))),
    h('p', { class: 'muted' }, 'تُستكمل بقية البيانات في صفحة الاجتماع.'));
  modal('اجتماع جديد', body, [{ label: 'إنشاء', cls: 'primary', fn: close => run(async () => {
    const date = val('nm-date'); const hij = date ? hijriFromBrowser(date) : '';
    const r = await api('POST', '/api/meetings', { number: val('nm-no'), date, type: 'عادي', hijri_date: hij, hijri_source: hij ? S.cfg.hijri_sources.browser : '' });
    close(); S.tab = 'info'; location.hash = '#/meeting/' + r.id;
  }) }]);
}

async function vMeeting(id) {
  const m = await api('GET', '/api/meetings/' + id);
  const locked = m.status === 'approved';
  const edit = can('secretary') && !locked;
  const tabs = [['info', 'البيانات والحضور'], ['agenda', 'جدول الأعمال'], ['minutes', 'المحضر'], ['out', 'التصدير والإرسال'], ['versions', 'النسخ السابقة']];
  const reload = () => run(() => vMeeting(id));
  const panel = { info: tInfo, agenda: tAgenda, minutes: tMinutes, out: tOut, versions: tVersions }[S.tab] || tInfo;
  shell([h('h1', {}, `اجتماع ${m.type || ''} رقم (${m.number || '—'}) `, statusBadge(m)),
    h('div', { class: 'muted', style: 'margin-top:-.8rem;margin-bottom:.8rem' }, `${m.date || '—'} م · ${m.hijri_date || '—'}`),
    locked ? h('div', { class: 'notice' }, `المحضر معتمد ومقفل (اعتمده ${m.approved_by || ''}). التعديل يتطلب أن يعيد الرئيس فتحه؛ متابعة القرارات تبقى متاحة.`) : null,
    h('div', { class: 'tabs noprint', role: 'tablist' }, tabs.map(([k, l]) => h('button', { class: S.tab === k ? 'on' : '', role: 'tab', 'aria-selected': S.tab === k, onclick: () => { S.tab = k; reload(); } }, l))),
    await panel(m, edit, reload)]);
}

// --- تبويب البيانات
function tInfo(m, edit, reload) {
  const dis = !edit;
  let src = m.hijri_source || '';
  const srcEl = h('div', { class: 'muted', id: 'hsrc' }, 'مصدر التحويل: ' + (src || 'غير محدد'));
  const setSrc = s => { src = s; srcEl.textContent = 'مصدر التحويل: ' + (s || 'غير محدد'); };
  const hij = h('input', { id: 'm-hij', value: m.hijri_date || '', disabled: dis, oninput: () => setSrc(S.cfg.hijri_sources.manual) });
  const date = h('input', { id: 'm-date', type: 'date', value: m.date || '', disabled: dis, onchange: e => {
    const t = e.target.value ? hijriFromBrowser(e.target.value) : '';
    if (t) { hij.value = t; setSrc(S.cfg.hijri_sources.browser); }
    else { hij.value = ''; setSrc(''); toast('تعذّر التحويل في المتصفح؛ سيحسب الخادم تاريخاً تقريبياً أو أدخله يدوياً', true); }
  } });
  const types = ['عادي', 'طارئ', 'استثنائي'];
  const tbody = h('tbody', {});
  const addRow = a => tbody.append(h('tr', {},
    h('td', {}, h('input', { class: 'a-name', value: a.name || '', disabled: dis, 'aria-label': 'الاسم' })),
    h('td', {}, h('input', { class: 'a-title', value: a.title || '', disabled: dis, 'aria-label': 'الصفة' })),
    h('td', {}, h('select', { class: 'a-status', disabled: dis, 'aria-label': 'الحالة' }, ['', 'حاضر', 'معتذر', 'غائب'].map(s => h('option', { value: s, selected: a.status === s }, s || '— لم تُحدَّد —')))),
    h('td', {}, edit ? h('button', { class: 'small danger', onclick: e => e.target.closest('tr').remove() }, 'حذف') : null)));
  m.attendance.forEach(addRow);
  const save = () => run(async () => {
    const attendance = [...tbody.querySelectorAll('tr')].map(tr => ({ name: tr.querySelector('.a-name').value, title: tr.querySelector('.a-title').value, status: tr.querySelector('.a-status').value }));
    await api('PUT', '/api/meetings/' + m.id, { number: val('m-no'), type: val('m-type'), date: val('m-date'), time: val('m-time'), end_time: val('m-end'),
      location: val('m-loc'), hijri_date: val('m-hij'), hijri_source: val('m-hij') ? src : '', chair: val('m-chair'), secretary: val('m-sec'), attendance });
    toast('حُفظت بيانات الاجتماع'); reload();
  });
  return h('div', {},
    h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'بيانات الاجتماع'),
      h('div', { class: 'grid' },
        field('رقم الاجتماع', h('input', { id: 'm-no', value: m.number || '', disabled: dis })),
        field('نوع الاجتماع', h('select', { id: 'm-type', disabled: dis }, [...new Set([...types, m.type || 'عادي'])].map(t => h('option', { value: t, selected: m.type === t }, t)))),
        field('التاريخ الميلادي', date),
        h('div', {}, h('label', {}, 'التاريخ الهجري'), hij, srcEl),
        field('وقت البداية', h('input', { id: 'm-time', type: 'time', value: m.time || '', disabled: dis })),
        field('وقت النهاية', h('input', { id: 'm-end', type: 'time', value: m.end_time || '', disabled: dis })),
        field('المكان', h('input', { id: 'm-loc', value: m.location || '', disabled: dis })),
        field('رئيس الاجتماع', h('input', { id: 'm-chair', value: m.chair || '', disabled: dis })),
        field('مقرر الاجتماع', h('input', { id: 'm-sec', value: m.secretary || '', disabled: dis })))),
    h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'الحضور والاعتذارات'),
      h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['الاسم', 'الصفة', 'الحالة', ''].map(x => h('th', {}, x)))), tbody)),
      edit ? h('div', { class: 'actions' }, h('button', { onclick: () => addRow({}) }, '+ إضافة اسم'), h('button', { class: 'primary', onclick: save }, 'حفظ البيانات والحضور')) : null));
}

// --- تبويب جدول الأعمال
function tAgenda(m, edit, reload) {
  const move = (i, d) => run(async () => {
    const ids = m.items.map(x => x.id); const j = i + d; if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    await api('POST', `/api/meetings/${m.id}/agenda/reorder`, { ids }); reload();
  });
  const upload = it => {
    const body = h('div', {}, field('وصف المرفق أو المذكرة', h('input', { id: 'at-label' })), field('رقم المذكرة / رابط (اختياري)', h('input', { id: 'at-ref' })),
      field('ملف (اختياري، حتى 15 ميغابايت)', h('input', { id: 'at-file', type: 'file' })));
    modal('إضافة مرفق للبند: ' + it.title, body, [{ label: 'إضافة', cls: 'primary', fn: close => run(async () => {
      const f = document.getElementById('at-file').files[0];
      if (f) await api('POST', `/api/agenda/${it.id}/attachments`, undefined, { body: f, headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': encodeURIComponent(f.name), 'X-Label': encodeURIComponent(val('at-label')) } });
      else await api('POST', `/api/agenda/${it.id}/attachments`, { label: val('at-label'), ref: val('at-ref') });
      close(); reload();
    }) }]);
  };
  return h('div', {},
    m.items.map((it, i) => h('div', { class: 'item' },
      h('div', { class: 'row' }, h('div', { class: 'fit' }, h('strong', {}, `البند (${it.position})`)),
        field('الموضوع', h('input', { id: 'ag-t' + it.id, value: it.title, disabled: !edit })),
        field('مقدم الموضوع', h('input', { id: 'ag-p' + it.id, value: it.presenter, disabled: !edit }))),
      h('div', { style: 'margin-top:.5rem' }, h('strong', {}, 'المرفقات والمذكرات: '), it.attachments.length ? null : h('span', { class: 'muted' }, 'لا يوجد'),
        h('ul', { style: 'margin:.2rem 0' }, it.attachments.map(a => h('li', {}, a.label, a.ref ? ` — ${a.ref}` : '', a.orig_name ? [' — ', h('a', { href: `/api/attachments/${a.id}/file` }, 'تنزيل: ' + a.orig_name)] : null,
          edit ? [' ', h('button', { class: 'small danger', onclick: () => run(async () => { if (confirm('حذف المرفق؟')) { await api('DELETE', '/api/attachments/' + a.id); reload(); } }) }, 'حذف')] : null)))),
      edit ? h('div', { class: 'actions' },
        h('button', { class: 'small', onclick: () => move(i, -1), disabled: i === 0, 'aria-label': 'تقديم البند' }, '↑ تقديم'),
        h('button', { class: 'small', onclick: () => move(i, 1), disabled: i === m.items.length - 1, 'aria-label': 'تأخير البند' }, '↓ تأخير'),
        h('button', { class: 'small', onclick: () => upload(it) }, '+ مرفق'),
        h('button', { class: 'small primary', onclick: () => run(async () => { await api('PUT', '/api/agenda/' + it.id, { title: val('ag-t' + it.id), presenter: val('ag-p' + it.id) }); toast('حُفظ البند'); reload(); }) }, 'حفظ'),
        h('button', { class: 'small danger', onclick: () => run(async () => { if (confirm('حذف البند؟')) { await api('DELETE', '/api/agenda/' + it.id); reload(); } }) }, 'حذف البند')) : null)),
    m.items.length ? null : h('div', { class: 'card muted' }, 'لم تُضف موضوعات بعد.'),
    edit ? h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'إضافة موضوع'),
      h('div', { class: 'row' }, field('الموضوع', h('input', { id: 'ag-new-t' })), field('مقدم الموضوع', h('input', { id: 'ag-new-p' })),
        h('div', { class: 'fit' }, h('button', { class: 'primary', onclick: () => run(async () => { await api('POST', `/api/meetings/${m.id}/agenda`, { title: val('ag-new-t'), presenter: val('ag-new-p') }); reload(); }) }, 'إضافة')))) : null);
}

// --- نموذج قرار/توصية (مشترك)
function decisionForm(d, items, opts) {
  const o = d || {};
  const full = opts.full;
  const body = h('div', {},
    full ? [h('div', { class: 'row' },
      field('النوع', h('select', { id: 'd-kind' }, S.cfg.kinds.map(k => h('option', { value: k, selected: o.kind === k }, k)))),
      field('رقم القرار', h('input', { id: 'd-no', value: o.number || '', placeholder: 'يُترك فارغاً إن لم يثبت' })),
      items ? field('البند', h('select', { id: 'd-item' }, h('option', { value: '' }, '— غير منسوب —'), items.map(i => h('option', { value: i.id, selected: o.agenda_item_id === i.id }, `${i.position}. ${i.title}`)))) : null),
    field('النص', h('textarea', { id: 'd-text' }, o.text || '')),
    h('div', { class: 'row' }, field('المسؤول عن التنفيذ', h('input', { id: 'd-owner', value: o.owner || '' })),
      field('الموعد المستهدف', h('input', { id: 'd-due', type: 'date', value: o.due_date || '' })),
      field('الموعد كما ورد نصاً', h('input', { id: 'd-duet', value: o.due_text || '' }))),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'd-flag', checked: o.needs_confirm }), h('span', {}, 'يحتاج تأكيد',
      (o.confirm_reasons || []).length ? h('span', { class: 'muted' }, ' — ' + o.confirm_reasons.join('؛ ')) : null))] : h('p', {}, h('strong', {}, `${o.kind} ${o.number || ''}: `), o.text),
    d ? h('div', { class: 'row' }, field('حالة التنفيذ', h('select', { id: 'd-status' }, S.cfg.decision_status.map(s => h('option', { value: s, selected: o.status === s }, s)))),
      field('ملاحظة متابعة جديدة', h('input', { id: 'd-fu' }))) : null,
    d && o.followups && o.followups.length ? h('div', {}, h('h3', {}, 'ملاحظات المتابعة'), h('ul', {}, o.followups.map(f => h('li', {}, f.note, h('span', { class: 'muted' }, ` — ${f.user}، ${f.ts.slice(0, 16).replace('T', ' ')}`))))) : null);
  const collect = () => {
    const b = {};
    if (full) Object.assign(b, { kind: val('d-kind'), number: val('d-no'), text: val('d-text'), owner: val('d-owner'), due_date: val('d-due'), due_text: val('d-duet'), needs_confirm: document.getElementById('d-flag').checked });
    if (full && items) b.agenda_item_id = +val('d-item') || null;
    if (d) { b.status = val('d-status'); if (val('d-fu')) b.followup = val('d-fu'); }
    return b;
  };
  return { body, collect };
}
function openDecision(d, m, reload) {
  const locked = (d ? d.meeting_status || m.status : m.status) === 'approved';
  const full = can('secretary') && !locked;
  if (!d && !full) return;
  const f = decisionForm(d, m ? m.items : null, { full });
  const btns = [];
  if (can('secretary', 'chair')) btns.push({ label: 'حفظ', cls: 'primary', fn: close => run(async () => {
    if (d) await api('PUT', '/api/decisions/' + d.id, f.collect()); else await api('POST', `/api/meetings/${m.id}/decisions`, f.collect());
    close(); toast('حُفظ'); reload();
  }) });
  if (d && full) btns.push({ label: 'حذف', cls: 'danger', fn: close => run(async () => { if (confirm('حذف نهائي؟')) { await api('DELETE', '/api/decisions/' + d.id); close(); reload(); } }) });
  modal(d ? 'قرار / توصية' : 'إضافة قرار / توصية', f.body, btns);
}
function outcomesTable(list, onOpen, extraCols) {
  if (!list.length) return h('p', { class: 'muted' }, 'لا يوجد.');
  return h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, [...(extraCols ? ['الاجتماع'] : []), 'الرقم', 'النوع', 'النص', 'المسؤول', 'الموعد', 'الحالة', ''].map(x => h('th', {}, x)))),
    h('tbody', {}, list.map(o => h('tr', { class: o.overdue ? 'overdue' : '' },
      extraCols ? h('td', {}, h('a', { href: '#/meeting/' + o.meeting_id }, `(${o.meeting_number || '—'}) ${o.meeting_date || ''}`)) : null,
      h('td', {}, o.number || h('span', { class: 'muted' }, '[يُستكمل]')), h('td', {}, o.kind),
      h('td', {}, o.text, o.needs_confirm ? [' ', flagBadge()] : null, o.followups && o.followups.length ? h('div', { class: 'muted' }, 'آخر متابعة: ' + o.followups[o.followups.length - 1].note) : null),
      h('td', {}, o.owner || h('span', { class: 'muted' }, '[يُستكمل]')), h('td', {}, o.due_date || o.due_text || h('span', { class: 'muted' }, '—'), o.overdue ? [' ', h('span', { class: 'badge danger' }, 'متأخر')] : null),
      h('td', {}, o.status), h('td', {}, h('button', { class: 'small', onclick: () => onOpen(o) }, can('secretary', 'chair') ? 'فتح' : 'عرض')))))));
}

// --- تبويب المحضر
function tMinutes(m, edit, reload) {
  const canText = can('secretary', 'chair') && m.status !== 'approved';
  const setStatus = s => run(async () => { await api('POST', `/api/meetings/${m.id}/minutes/status`, { status: s }); toast('تغيّرت حالة المحضر'); reload(); });
  const flow = h('div', { class: 'actions noprint' },
    m.status === 'draft' && can('secretary', 'chair') ? h('button', { class: 'primary', onclick: () => setStatus('review') }, 'إحالة للمراجعة') : null,
    m.status === 'review' && can('secretary', 'chair') ? h('button', { onclick: () => setStatus('draft') }, 'إعادة إلى مسودة') : null,
    m.status === 'review' && can('chair') ? h('button', { class: 'primary', onclick: () => { if (confirm('اعتماد المحضر وقفله؟')) setStatus('approved'); } }, 'اعتماد المحضر') : null,
    m.status === 'approved' && can('chair') ? h('button', { class: 'danger', onclick: () => { if (confirm('إعادة فتح المحضر للتعديل؟ سيُسجَّل ذلك.')) setStatus('review'); } }, 'إعادة فتح المحضر') : null);
  const pending = m.pending.length ? h('div', { class: 'notice danger' }, h('strong', {}, `نقاط «يحتاج تأكيد» (${m.pending.length}) — تمنع الاعتماد:`), h('ul', {}, m.pending.map(x => h('li', {}, x)))) : h('div', { class: 'notice' }, 'لا توجد نقاط معلّقة تحتاج تأكيداً.');

  const proposalBox = h('div', {});
  const organize = () => run(async () => {
    const p = await api('POST', `/api/meetings/${m.id}/organize`, { raw_notes: document.getElementById('raw').value, engine: val('engine') });
    renderProposal(p);
  });
  const renderProposal = p => {
    const blocks = [...p.items, { ...p.unassigned, title: 'ملاحظات غير منسوبة إلى بند', agenda_item_id: null }].filter(b => b.agenda_item_id || b.discussion || b.outcomes.length);
    proposalBox.replaceChildren(h('div', { class: 'card', style: 'border-color:var(--brand)' },
      h('h2', { style: 'margin-top:0' }, 'اقتراح المنظِّم — راجعه قبل التطبيق'),
      h('p', { class: 'muted' }, `المحرّك: ${p.engine_label}. لم يُحفظ شيء بعد. عدّل النصوص أو ألغِ تحديد ما لا تريده، ثم طبّق.`),
      p.pending.length ? h('div', { class: 'notice danger' }, h('strong', {}, 'يحتاج تأكيد:'), h('ul', {}, p.pending.map(x => h('li', {}, x)))) : null,
      blocks.map((b, bi) => h('div', { class: 'item' }, h('h3', {}, b.title),
        field('ملخص المناقشة (يُضاف إلى البند)', h('textarea', { class: 'pr-disc', 'data-b': bi }, b.discussion || '')),
        b.outcomes.map((o, oi) => h('div', { style: 'border-top:1px dashed var(--line);padding-top:.5rem;margin-top:.5rem' },
          h('label', { class: 'check' }, h('input', { type: 'checkbox', class: 'pr-inc', 'data-b': bi, 'data-o': oi, checked: true }),
            h('span', {}, h('strong', {}, o.kind + ': '), o.text, o.needs_confirm ? [' ', flagBadge()] : null,
              h('div', { class: 'muted' }, `المسؤول: ${o.owner || '[يُستكمل]'} · الموعد: ${o.due_date || o.due_text || '[يُستكمل]'}`),
              o.confirm_reasons.length ? h('div', { class: 'muted' }, 'السبب: ' + o.confirm_reasons.join('؛ ')) : null,
              h('div', { class: 'muted' }, 'المصدر في الملاحظات: «' + o.source_line + '»'))))))),
      h('div', { class: 'actions' }, h('button', { class: 'primary', onclick: () => run(async () => {
        const out = { engine_label: p.engine_label, pending: p.pending.filter(x => !/^(قرار|توصية|إحاطة|تكليف) «/.test(x)), items: [], unassigned: { discussion: '', outcomes: [] } };
        blocks.forEach((b, bi) => {
          const disc = proposalBox.querySelector(`.pr-disc[data-b="${bi}"]`).value;
          const outs = b.outcomes.filter((o, oi) => proposalBox.querySelector(`.pr-inc[data-b="${bi}"][data-o="${oi}"]`).checked);
          if (b.agenda_item_id) out.items.push({ agenda_item_id: b.agenda_item_id, discussion: disc, outcomes: outs }); else out.unassigned = { discussion: disc, outcomes: outs };
        });
        const r = await api('POST', `/api/meetings/${m.id}/apply`, { proposal: out });
        toast(`طُبّق الاقتراح: ${r.added} مخرجات`); reload();
      }) }, 'تطبيق على مسودة المحضر'), h('button', { onclick: () => proposalBox.replaceChildren() }, 'تجاهل الاقتراح'))));
    proposalBox.scrollIntoView({ behavior: 'smooth' });
  };

  const saveText = () => run(async () => {
    for (const it of m.items) {
      const v = document.getElementById('disc' + it.id).value;
      if (v.trim() !== (it.discussion || '').trim()) await api('PUT', '/api/agenda/' + it.id, { discussion: v });
    }
    await api('PUT', `/api/meetings/${m.id}/minutes`, { opening: document.getElementById('opening').value, closing: document.getElementById('closing').value,
      pending: document.getElementById('pend').value.split('\n') });
    toast('حُفظت المسودة'); reload();
  });
  const openD = o => openDecision(o, m, reload);
  return h('div', {}, h('div', { class: 'card' }, h('strong', {}, 'حالة المحضر: '), statusBadge(m), flow), pending,
    edit ? h('div', { class: 'card noprint' }, h('h2', { style: 'margin-top:0' }, 'الملاحظات الخام أو نص التفريغ الصوتي'),
      h('p', { class: 'muted' }, 'الصق الملاحظات كما هي. ابدأ كل بند بعنوانه أو بـ«البند 1»، وابدأ السطر بـ«قرار:» أو «توصية:» أو «إحاطة:» أو «تكليف:» ليُصنَّف. المنظِّم لا يضيف معلومة غير موجودة، ويوسم الغامض بـ«يحتاج تأكيد».'),
      h('textarea', { id: 'raw', style: 'min-height:10rem', 'aria-label': 'الملاحظات الخام' }, m.raw_notes || ''),
      h('div', { class: 'row', style: 'margin-top:.5rem' },
        field('محرّك التنظيم', h('select', { id: 'engine' }, h('option', { value: 'rules' }, 'منظِّم محلي (قواعد، دون إرسال بيانات)'),
          h('option', { value: 'claude', disabled: !S.cfg.llm.available }, 'Claude API' + (S.cfg.llm.available ? ' (تُرسل الملاحظات إلى خدمة خارجية)' : ' — غير مُعدّ')))),
        h('div', { class: 'fit' }, h('button', { class: 'primary', onclick: organize }, 'نظِّم الملاحظات'))),
      S.cfg.llm.available ? null : h('p', { class: 'muted' }, S.cfg.llm.reason)) : null,
    proposalBox,
    h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'مسودة المحضر'),
      field('الافتتاح', h('textarea', { id: 'opening', disabled: !canText }, m.opening || '')),
      m.items.map(it => h('div', { class: 'item', style: 'margin-top:.75rem' }, h('h3', {}, `البند (${it.position}): ${it.title}`),
        h('div', { class: 'muted' }, 'مقدم الموضوع: ' + (it.presenter || '[يُستكمل]') + (it.attachments.length ? ' · المرفقات: ' + it.attachments.map(a => a.label).join('؛ ') : '')),
        field('ملخص العرض والمناقشة', h('textarea', { id: 'disc' + it.id, disabled: !canText }, it.discussion || '')),
        h('h3', {}, 'القرارات والتوصيات'), outcomesTable(it.outcomes, openD))),
      m.unassigned.length ? h('div', { class: 'item' }, h('h3', {}, 'مخرجات غير منسوبة إلى بند ', flagBadge()), outcomesTable(m.unassigned, openD)) : null,
      field('الختام', h('textarea', { id: 'closing', disabled: !canText }, m.closing || '')),
      field('نقاط إضافية تحتاج تأكيداً (سطر لكل نقطة؛ احذف السطر بعد معالجته)', h('textarea', { id: 'pend', disabled: !canText }, m.pending_manual.join('\n'))),
      h('div', { class: 'actions noprint' },
        canText ? h('button', { class: 'primary', onclick: saveText }, 'حفظ المسودة') : null,
        edit ? h('button', { onclick: () => openDecision(null, m, reload) }, '+ قرار / توصية') : null,
        edit ? h('button', { onclick: () => run(async () => { const r = await api('POST', `/api/meetings/${m.id}/decisions/number`, {}); toast(`رُقّم ${r.numbered} قرار`); reload(); }) }, 'ترقيم القرارات غير المرقمة') : null)));
}

// --- عرض المحضر كوثيقة (للطباعة وللنسخ السابقة)
function docView(m) {
  const v = x => (x && String(x).trim()) ? x : '[يُستكمل]';
  const tbl = (head, rows) => h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, head.map(x => h('th', {}, x)))), h('tbody', {}, rows.map(r => h('tr', {}, r.map(c => h('td', {}, c)))))));
  return h('div', { class: 'doc' },
    m.status !== 'approved' ? h('p', { class: 'center flag' }, m.status === 'review' ? 'مسودة قيد المراجعة — غير معتمدة' : 'مسودة — غير معتمدة') : null,
    h('h2', { class: 'center' }, m.org_name), h('h3', { class: 'center' }, m.committee_name),
    h('h3', { class: 'center' }, `محضر الاجتماع ${defType(m.type)} رقم (${v(m.number)})`),
    h('h3', {}, 'أولاً: بيانات الاجتماع'),
    tbl(['البيان', 'التفصيل'], [['التاريخ الميلادي', v(m.date)], ['التاريخ الهجري', `${v(m.hijri_date)} (مصدر التحويل: ${m.hijri_source || 'غير محدد'})`],
      ['الوقت', v(m.time) + (m.end_time ? ' — ' + m.end_time : '')], ['المكان', v(m.location)], ['رئيس الاجتماع', v(m.chair)], ['مقرر الاجتماع', v(m.secretary)]]),
    h('h3', {}, 'ثانياً: الحضور والاعتذارات'), tbl(['م', 'الاسم', 'الصفة', 'الحالة'], m.attendance.map((a, i) => [i + 1, a.name, a.title, a.status || '[يُستكمل]'])),
    m.opening ? h('p', {}, m.opening) : null,
    m.pending.length ? h('div', {}, h('p', { class: 'flag' }, 'نقاط تحتاج تأكيداً قبل الاعتماد'), h('ul', { class: 'flag' }, m.pending.map(x => h('li', {}, x)))) : null,
    h('h3', {}, 'ثالثاً: الموضوعات وما دار حولها'),
    m.items.map(it => h('div', {}, h('h3', {}, `البند (${it.position}): ${it.title}`), h('p', {}, 'مقدم الموضوع: ' + v(it.presenter)),
      it.attachments.length ? h('p', {}, 'المرفقات: ' + it.attachments.map(a => a.label).join('؛ ')) : null,
      h('p', {}, h('strong', {}, 'ملخص العرض والمناقشة: ')), h('p', {}, v(it.discussion)),
      it.outcomes.length ? tbl(['النوع', 'الرقم', 'النص', 'المسؤول عن التنفيذ', 'الموعد المستهدف'], it.outcomes.map(o => [o.kind, v(o.number), o.text + (o.needs_confirm ? ' «يحتاج تأكيد»' : ''), v(o.owner), v(o.due_date || o.due_text)]))
        : h('p', {}, 'لم يُسجَّل قرار أو توصية في هذا البند.'))),
    m.closing ? h('p', {}, m.closing) : null,
    h('h3', {}, 'التوقيعات'), tbl(['الصفة', 'الاسم', 'التوقيع'], [['رئيس الاجتماع', v(m.chair), ''], ['مقرر الاجتماع', v(m.secretary), '']]));
}

// --- تبويب التصدير والإرسال
async function tOut(m, edit, reload) {
  const parts = [h('div', { class: 'card noprint' }, h('h2', { style: 'margin-top:0' }, 'تصدير المحضر'),
    m.status !== 'approved' ? h('p', { class: 'muted' }, 'المحضر غير معتمد: الملفات المصدَّرة تحمل عبارة «مسودة — غير معتمدة».') : null,
    h('div', { class: 'actions' }, h('a', { class: 'btn primary', href: `/api/meetings/${m.id}/export.docx` }, 'تنزيل Word'),
      S.cfg.pdf ? h('a', { class: 'btn primary', href: `/api/meetings/${m.id}/export.pdf` }, 'تنزيل PDF') : null,
      h('button', { onclick: () => window.print() }, 'طباعة / حفظ PDF من المتصفح')),
    S.cfg.pdf ? null : h('p', { class: 'muted' }, 'تصدير PDF المباشر يتطلب LibreOffice على الخادم. استخدم «طباعة / حفظ PDF من المتصفح» بديلاً.'))];
  if (can('secretary', 'chair')) parts.push(await waCompose(m));
  parts.push(h('div', { class: 'card' }, docView(m)));
  return h('div', {}, parts);
}

// ---------- واتساب
async function waCompose(m) {
  const contacts = await api('GET', '/api/contacts');
  const wa = S.cfg.whatsapp;
  const kinds = m ? [['summary', 'ملخص المحضر (القرارات)'], ['minutes_text', 'مسودة المحضر نصاً'], ['document', 'ملف المحضر (' + (S.cfg.pdf ? 'PDF' : 'Word') + ')'], ['meeting_reminder', 'تذكير بموعد الاجتماع'], ['decisions_reminder', 'تذكير بقرارات الاجتماع المفتوحة'], ['custom', 'رسالة حرة']]
    : [['decisions_reminder', 'تذكير بالقرارات المفتوحة'], ['custom', 'رسالة حرة']];
  const preview = body => run(async () => {
    const p = await api('POST', '/api/whatsapp/preview', { contact_id: +val('wa-to') || null, kind: val('wa-kind'), meeting_id: m ? m.id : null, body });
    const ta = h('textarea', { style: 'min-height:12rem', 'aria-label': 'نص الرسالة' }, p.body);
    const ok = h('input', { type: 'checkbox', id: 'wa-ok' });
    let dirty = false;
    const sendBtn = { id: 'wa-send', label: 'أوافق — أرسل الآن', cls: 'primary', disabled: true, fn: close => run(async () => {
      const r = await api('POST', '/api/whatsapp/send', { pending_id: p.pending_id, confirm: true });
      close(); toast(r.ok ? `${r.status} — ${r.ts.slice(0, 16).replace('T', ' ')}` : 'فشل الإرسال: ' + r.error, !r.ok);
      if (location.hash.startsWith('#/whatsapp')) route();
    }) };
    const sync = () => { document.getElementById('wa-send').disabled = !(ok.checked && !dirty && p.configured); };
    ok.addEventListener('change', sync);
    ta.addEventListener('input', () => { dirty = true; ok.checked = false; sync(); });
    modal('معاينة قبل الإرسال — لم يُرسل شيء بعد', h('div', {},
      h('table', {}, h('tbody', {}, h('tr', {}, h('th', {}, 'المستلم'), h('td', {}, p.name)), h('tr', {}, h('th', {}, 'رقم الجوال'), h('td', {}, phoneEl(p.phone))),
        h('tr', {}, h('th', {}, 'نوع الرسالة'), h('td', {}, p.kind_label + (p.doc_format ? ` (${p.doc_format.toUpperCase()})` : ''))),
        h('tr', {}, h('th', {}, 'طريقة الإرسال'), h('td', {}, p.mode === 'template' ? `قالب معتمد: ${p.template}` : 'نص حر (يُسلَّم فقط خلال 24 ساعة من آخر رسالة من المستلم)')))),
      h('label', { style: 'margin-top:.75rem' }, p.kind === 'document' ? 'التعليق المرافق للملف' : 'نص الرسالة كما سيُرسل'), ta,
      h('p', { class: 'muted' }, 'إذا عدّلت النص فاضغط «تحديث المعاينة» ليُثبَّت النص الجديد قبل الموافقة.'),
      p.configured ? null : h('div', { class: 'notice warn' }, p.setup_message),
      h('label', { class: 'check' }, ok, h('span', {}, 'راجعتُ اسم المستلم ورقمه ونص الرسالة، وأوافق صراحةً على الإرسال.'))),
      [sendBtn, { label: 'تحديث المعاينة', fn: close => { close(); preview(ta.value); } },
        { label: 'نسخ النص', fn: () => navigator.clipboard.writeText(ta.value).then(() => toast('نُسخ النص'), () => toast('تعذّر النسخ', true)) }]);
  });
  return h('div', { class: 'card noprint' }, h('h2', { style: 'margin-top:0' }, 'إرسال عبر واتساب'),
    wa.configured ? null : h('div', { class: 'notice warn' }, wa.message),
    h('div', { class: 'row' },
      field('المستلم (من الجهات المعتمدة فقط)', h('select', { id: 'wa-to' }, h('option', { value: '' }, '— اختر —'), contacts.map(c => h('option', { value: c.id, disabled: !c.approved }, `${c.name} — ${c.phone}${c.approved ? '' : ' (غير معتمد)'}`)))),
      field('نوع الرسالة', h('select', { id: 'wa-kind' }, kinds.map(([k, l]) => h('option', { value: k }, l)))),
      h('div', { class: 'fit' }, h('button', { class: 'primary', onclick: () => preview('') }, 'معاينة'))),
    h('p', { class: 'muted' }, 'لا يُرسل أي شيء تلقائياً: تظهر معاينة باسم المستلم ورقمه ونص الرسالة، ولا يتم الإرسال إلا بعد موافقتك الصريحة.'));
}
async function vWhatsapp() {
  const [contacts, log] = await Promise.all([api('GET', '/api/contacts'), api('GET', '/api/whatsapp/log')]);
  const editC = c => {
    const o = c || {};
    const body = h('div', {}, field('الاسم', h('input', { id: 'c-name', value: o.name || '' })), field('الصفة', h('input', { id: 'c-title', value: o.title || '' })),
      field('رقم الجوال بالصيغة الدولية (مثال: ‎+9665XXXXXXXX)', h('input', { id: 'c-phone', value: o.phone || '', dir: 'ltr', inputmode: 'tel' })),
      field('ملاحظة', h('input', { id: 'c-note', value: o.note || '' })),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'c-ok', checked: o.approved }), h('span', {}, 'معتمد للإرسال — أؤكد أن الرقم صحيح وأن صاحبه وافق على استقبال رسائل اللجنة عبر واتساب.')));
    modal(c ? 'تعديل جهة' : 'جهة جديدة', body, [{ label: 'حفظ', cls: 'primary', fn: close => run(async () => {
      const b = { name: val('c-name'), title: val('c-title'), phone: val('c-phone'), note: val('c-note'), approved: document.getElementById('c-ok').checked };
      if (c) await api('PUT', '/api/contacts/' + c.id, b); else await api('POST', '/api/contacts', b);
      close(); route();
    }) }]);
  };
  shell([h('h1', {}, 'واتساب'),
    h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'الجهات المعتمدة'),
      h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['الاسم', 'الصفة', 'رقم الجوال', 'الاعتماد', 'ملاحظة', ''].map(x => h('th', {}, x)))),
        h('tbody', {}, contacts.map(c => h('tr', {}, h('td', {}, c.name), h('td', {}, c.title), h('td', {}, phoneEl(c.phone)),
          h('td', {}, h('span', { class: 'badge ' + (c.approved ? 'ok' : 'warn') }, c.approved ? 'معتمد' : 'غير معتمد')), h('td', {}, c.note),
          h('td', {}, can('secretary') ? h('button', { class: 'small', onclick: () => editC(c) }, 'تعديل') : null)))))),
      can('secretary') ? h('div', { class: 'actions' }, h('button', { class: 'primary', onclick: () => editC(null) }, '+ جهة جديدة')) : null),
    await waCompose(null),
    h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'سجل الإرسال'),
      log.length ? h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['الوقت', 'المستلم', 'الرقم', 'النوع', 'النتيجة', 'المرسِل', 'النص'].map(x => h('th', {}, x)))),
        h('tbody', {}, log.map(l => h('tr', {}, h('td', {}, l.ts.slice(0, 19).replace('T', ' ')), h('td', {}, l.name), h('td', {}, phoneEl(l.phone)), h('td', {}, l.kind),
          h('td', {}, h('span', { class: 'badge ' + (l.status === 'فشل' ? 'danger' : 'ok') }, l.status), l.error ? h('div', { class: 'muted' }, l.error) : null, l.wa_message_id ? h('div', { class: 'muted ltr' }, l.wa_message_id) : null),
          h('td', {}, l.user), h('td', {}, l.body.length > 120 ? l.body.slice(0, 120) + '…' : l.body)))))) : h('p', { class: 'muted' }, 'لم تُرسل أي رسالة بعد.'))]);
}

// --- تبويب النسخ
async function tVersions(m) {
  const list = await api('GET', `/api/meetings/${m.id}/versions`);
  const box = h('div', {});
  return h('div', {}, h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'النسخ المحفوظة من المحضر'),
    list.length ? h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['الوقت', 'المستخدم', 'سبب الحفظ', ''].map(x => h('th', {}, x)))),
      h('tbody', {}, list.map(v => h('tr', {}, h('td', {}, v.ts.slice(0, 19).replace('T', ' ')), h('td', {}, v.user), h('td', {}, v.note),
        h('td', {}, h('button', { class: 'small', onclick: () => run(async () => { const r = await api('GET', '/api/versions/' + v.id); box.replaceChildren(h('div', { class: 'card' }, h('p', { class: 'muted' }, `نسخة ${r.ts.slice(0, 19).replace('T', ' ')} — للعرض فقط`), docView(r.content))); box.scrollIntoView({ behavior: 'smooth' }); }) }, 'عرض'))))))) : h('p', { class: 'muted' }, 'لا توجد نسخ محفوظة بعد. تُحفظ نسخة عند كل تعديل على نص المحضر أو قراراته أو حالته.')), box);
}

// ---------- سجل القرارات
async function vDecisions() {
  const f = vDecisions.f || (vDecisions.f = { q: '', status: '', kind: '', overdue: '' });
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
  const list = await api('GET', '/api/decisions?' + qs);
  const go = () => { f.q = val('f-q'); f.status = val('f-st'); f.kind = val('f-kind'); f.overdue = document.getElementById('f-od').checked ? '1' : ''; run(vDecisions); };
  const late = list.filter(d => d.overdue).length;
  shell([h('h1', {}, 'سجل القرارات والتوصيات'),
    h('form', { class: 'card noprint', onsubmit: e => { e.preventDefault(); go(); } }, h('div', { class: 'row' },
      field('بحث (الرقم، النص، المسؤول، المتابعة)', h('input', { id: 'f-q', value: f.q, type: 'search' })),
      field('الحالة', h('select', { id: 'f-st' }, h('option', { value: '' }, 'الكل'), S.cfg.decision_status.map(s => h('option', { value: s, selected: f.status === s }, s)))),
      field('النوع', h('select', { id: 'f-kind' }, h('option', { value: '' }, 'الكل'), S.cfg.kinds.map(s => h('option', { value: s, selected: f.kind === s }, s)))),
      h('label', { class: 'check fit' }, h('input', { type: 'checkbox', id: 'f-od', checked: f.overdue === '1' }), h('span', {}, 'المتأخر فقط')),
      h('div', { class: 'fit' }, h('button', { class: 'primary', type: 'submit' }, 'بحث')))),
    late ? h('div', { class: 'notice danger' }, `تنبيه: ${late} قرار/تكليف تجاوز موعده ولم يُنجز.`) : null,
    h('div', { class: 'card' }, h('p', { class: 'muted' }, `عدد النتائج: ${list.length}`), outcomesTable(list, o => openDecision(o, null, () => run(vDecisions)), true))]);
}

// ---------- الأرشيف
async function vArchive() {
  const f = vArchive.f || (vArchive.f = { q: '', from: '', to: '', status: '' });
  const list = await api('GET', '/api/search?' + new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString());
  const go = () => { f.q = val('s-q'); f.from = val('s-from'); f.to = val('s-to'); f.status = val('s-st'); run(vArchive); };
  shell([h('h1', {}, 'الأرشيف والبحث'),
    h('form', { class: 'card', onsubmit: e => { e.preventDefault(); go(); } }, h('div', { class: 'row' },
      field('كلمات البحث (موضوع، قرار، اسم…)', h('input', { id: 's-q', value: f.q, type: 'search' })),
      field('من تاريخ', h('input', { id: 's-from', type: 'date', value: f.from })), field('إلى تاريخ', h('input', { id: 's-to', type: 'date', value: f.to })),
      field('حالة المحضر', h('select', { id: 's-st' }, [['', 'الكل'], ['approved', 'معتمد'], ['review', 'قيد المراجعة'], ['draft', 'مسودة']].map(([v, l]) => h('option', { value: v, selected: f.status === v }, l)))),
      h('div', { class: 'fit' }, h('button', { class: 'primary', type: 'submit' }, 'بحث')))),
    list.length ? list.map(m => h('div', { class: 'card' }, h('a', { href: '#/meeting/' + m.id, onclick: () => { S.tab = 'out'; } }, h('strong', {}, `محضر الاجتماع ${defType(m.type)} رقم (${m.number || '—'})`)), ' ', statusBadge(m),
      h('div', { class: 'muted' }, `${m.date || '—'} م · ${m.hijri_date || '—'}`),
      m.hits.length ? h('ul', {}, m.hits.map(x => h('li', {}, h('strong', {}, x.where + ': '), x.snippet))) : null)) : h('div', { class: 'card muted' }, 'لا توجد نتائج مطابقة.')]);
}

// ---------- سجل التعديلات
async function vAudit() {
  const q = vAudit.q || '';
  const list = await api('GET', '/api/audit?q=' + encodeURIComponent(q));
  shell([h('h1', {}, 'سجل التعديلات'),
    h('form', { class: 'card', onsubmit: e => { e.preventDefault(); vAudit.q = val('au-q'); run(vAudit); } }, h('div', { class: 'row' }, field('بحث في السجل', h('input', { id: 'au-q', value: q, type: 'search' })), h('div', { class: 'fit' }, h('button', { class: 'primary', type: 'submit' }, 'بحث')))),
    h('div', { class: 'card tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['الوقت', 'المستخدم', 'الإجراء', 'العنصر', 'المعرّف', 'التفاصيل'].map(x => h('th', {}, x)))),
      h('tbody', {}, list.map(r => h('tr', {}, h('td', {}, r.ts.slice(0, 19).replace('T', ' ')), h('td', {}, r.user), h('td', {}, r.action), h('td', {}, r.entity), h('td', {}, r.entity_id), h('td', { style: 'word-break:break-word' }, r.details))))))]);
}

// ---------- الإعدادات
async function vSettings() {
  const parts = [h('h1', {}, 'الإعدادات'),
    h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'تغيير كلمة المرور'), h('div', { class: 'row' },
      field('الحالية', h('input', { id: 'pw-cur', type: 'password', dir: 'ltr', autocomplete: 'current-password' })),
      field('الجديدة (10 أحرف على الأقل)', h('input', { id: 'pw-new', type: 'password', dir: 'ltr', autocomplete: 'new-password' })),
      h('div', { class: 'fit' }, h('button', { class: 'primary', onclick: () => run(async () => { await api('POST', '/api/password', { current: document.getElementById('pw-cur').value, new: document.getElementById('pw-new').value }); toast('تغيّرت كلمة المرور'); await boot(); }) }, 'تغيير'))))];
  if (can('secretary')) {
    const users = await api('GET', '/api/users');
    parts.push(h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'بيانات الجمعية واللجنة'), h('div', { class: 'row' },
      field('اسم الجمعية (يظهر في ترويسة المحضر)', h('input', { id: 'st-org', value: S.cfg.settings.org_name })), field('اسم اللجنة', h('input', { id: 'st-com', value: S.cfg.settings.committee_name })),
      h('div', { class: 'fit' }, h('button', { class: 'primary', onclick: () => run(async () => { await api('PUT', '/api/settings', { org_name: val('st-org'), committee_name: val('st-com') }); toast('حُفظت'); await boot(); }) }, 'حفظ')))),
      h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'المستخدمون والصلاحيات'),
        h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['اسم الدخول', 'الاسم', 'الدور', 'الحالة', ''].map(x => h('th', {}, x)))),
          h('tbody', {}, users.map(u => h('tr', {}, h('td', { class: 'ltr' }, u.username), h('td', {}, u.name), h('td', {}, { secretary: 'المقرر', chair: 'الرئيس', member: 'عضو' }[u.role]),
            h('td', {}, u.active ? 'فعّال' : 'معطّل', u.demo_password ? [' ', h('span', { class: 'badge warn' }, 'كلمة مرور تجريبية')] : null),
            h('td', {}, u.username === S.me.username ? null : h('button', { class: 'small', onclick: () => run(async () => { await api('PUT', '/api/users/' + u.id, { active: !u.active }); route(); }) }, u.active ? 'تعطيل' : 'تفعيل'))))))),
        h('h3', {}, 'مستخدم جديد'), h('div', { class: 'row' }, field('اسم الدخول (لاتيني)', h('input', { id: 'nu-u', dir: 'ltr' })), field('الاسم', h('input', { id: 'nu-n' })),
          field('الدور', h('select', { id: 'nu-r' }, [['member', 'عضو (اطلاع فقط)'], ['chair', 'الرئيس (مراجعة واعتماد)'], ['secretary', 'المقرر (تحرير كامل)']].map(([v, l]) => h('option', { value: v }, l)))),
          field('كلمة مرور مبدئية', h('input', { id: 'nu-p', type: 'password', dir: 'ltr', autocomplete: 'new-password' })),
          h('div', { class: 'fit' }, h('button', { class: 'primary', onclick: () => run(async () => { await api('POST', '/api/users', { username: val('nu-u'), name: val('nu-n'), role: val('nu-r'), password: document.getElementById('nu-p').value }); toast('أُنشئ المستخدم'); route(); }) }, 'إنشاء')))),
      h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'النسخ الاحتياطي'), h('p', { class: 'muted' }, 'ينزّل نسخة متسقة من قاعدة البيانات. الملفات المرفوعة (data/uploads) تُنسخ يدوياً — انظر README.'),
        h('a', { class: 'btn primary', href: '/api/backup' }, 'تنزيل نسخة احتياطية الآن')));
  }
  parts.push(h('div', { class: 'card' }, h('h2', { style: 'margin-top:0' }, 'حالة التكاملات'),
    h('ul', {}, h('li', {}, 'واتساب: ', S.cfg.whatsapp.configured ? `مُعدّ (${S.cfg.whatsapp.mode === 'template' ? 'قالب ' + S.cfg.whatsapp.template : 'نص حر'}، ${S.cfg.whatsapp.api_version})` : S.cfg.whatsapp.message),
      h('li', {}, 'المنظِّم الذكي (Claude): ', S.cfg.llm.available ? 'مُعدّ' : S.cfg.llm.reason),
      h('li', {}, 'تصدير PDF: ', S.cfg.pdf ? 'متاح عبر LibreOffice' : 'غير متاح على الخادم (استخدم الطباعة من المتصفح)'))));
  shell(parts);
}

run(boot);
