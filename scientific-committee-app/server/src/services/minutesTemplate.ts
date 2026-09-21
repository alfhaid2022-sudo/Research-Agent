import JSZip from 'jszip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { HttpError } from '../lib/util.js';
import { ATTENDANCE_LABELS, calendarLabel, type MinutesExportModel } from './export.js';

/**
 * Fills the institution's own minutes template.
 *
 * The template file is opened as-is and only `word/document.xml` is rewritten:
 * the header with its images, the footer, styles, numbering, theme, settings,
 * fonts, customXml and every relationship are copied through untouched, so the
 * page setup and right-to-left layout stay exactly as the institution authored
 * them.
 *
 * Anchors are found by their visible Arabic labels, never by position, and a
 * missing anchor fails the export instead of producing a document that silently
 * does not match the form.
 */

export interface TemplateFillReport {
  filled: string[];
  deviations: string[];
  warnings: string[];
  preservedParts: string[];
}

export interface TemplateFillResult {
  buffer: Buffer;
  report: TemplateFillReport;
}

type El = ReturnType<Document['createElement']>;

const LABEL = {
  committee: 'اسم اللجنة',
  date: 'التاريخ',
  session: 'رقم الجلسة',
  time: 'الوقت',
  attendanceState: 'حالة الحضور',
  absenceReason: 'سبب التغيب',
  subject: 'الموضوع',
  discussion: 'ملخص وصف الموضوع ومناقشته',
  decision: 'القرار/التوصية',
  relatedEntity: 'الجهة ذات العلاقة',
  signature: 'التوقيع',
} as const;

function norm(text: string): string {
  return text.replace(/[ً-ْـ]/g, '').replace(/\s+/g, ' ').trim();
}

function children(parent: El, tag: string): El[] {
  const out: El[] = [];
  for (let i = 0; i < parent.childNodes.length; i += 1) {
    const node = parent.childNodes[i] as El;
    if (node.nodeType === 1 && node.nodeName === tag) out.push(node);
  }
  return out;
}

function descendants(parent: El, tag: string): El[] {
  return Array.from(parent.getElementsByTagName(tag)) as unknown as El[];
}

function textOf(node: El): string {
  return norm(descendants(node, 'w:t').map((t) => t.textContent ?? '').join(''));
}

function rows(table: El): El[] {
  return children(table, 'w:tr');
}

function cells(row: El): El[] {
  return children(row, 'w:tc');
}

/**
 * Replaces a cell's text while keeping its paragraph and run properties, so the
 * font, size and direction the template defines are preserved.
 */
function setCellText(doc: Document, cell: El, value: string): void {
  const paragraphs = children(cell, 'w:p');
  if (paragraphs.length === 0) return;
  const first = paragraphs[0]!;

  // Reuse the formatting of a run that is already there.
  const templateRun = descendants(first, 'w:r')[0] ?? descendants(cell, 'w:r')[0];
  const rPr = templateRun ? descendants(templateRun, 'w:rPr')[0] : undefined;

  for (const extra of paragraphs.slice(1)) cell.removeChild(extra);
  for (const run of children(first, 'w:r')) first.removeChild(run);
  for (const hyperlink of children(first, 'w:hyperlink')) first.removeChild(hyperlink);

  const lines = value.split('\n');
  lines.forEach((line, index) => {
    const target = index === 0 ? first : (() => {
      const clone = first.cloneNode(false) as El;
      const pPr = children(first, 'w:pPr')[0];
      if (pPr) clone.appendChild(pPr.cloneNode(true));
      cell.appendChild(clone);
      return clone;
    })();
    const run = doc.createElement('w:r');
    if (rPr) run.appendChild(rPr.cloneNode(true));
    const textNode = doc.createElement('w:t');
    textNode.setAttribute('xml:space', 'preserve');
    textNode.appendChild(doc.createTextNode(line));
    run.appendChild(textNode);
    target.appendChild(run);
  });
}

/** Replaces the text of a body paragraph, keeping its style. */
function setParagraphText(doc: Document, paragraph: El, value: string): void {
  const templateRun = children(paragraph, 'w:r')[0];
  const rPr = templateRun ? descendants(templateRun, 'w:rPr')[0] : undefined;
  for (const run of children(paragraph, 'w:r')) paragraph.removeChild(run);
  const run = doc.createElement('w:r');
  if (rPr) run.appendChild(rPr.cloneNode(true));
  const textNode = doc.createElement('w:t');
  textNode.setAttribute('xml:space', 'preserve');
  textNode.appendChild(doc.createTextNode(value));
  run.appendChild(textNode);
  paragraph.appendChild(run);
}

interface Anchors {
  sessionTable: El;
  attendanceTable: El;
  agendaTable: El;
  discussionTable: El;
  entityTable: El;
  signatureTable: El;
  addresseeParagraph: El | null;
  additionsParagraph: El | null;
}

function findAnchors(body: El): Anchors {
  const tables = children(body, 'w:tbl');
  const paragraphs = children(body, 'w:p');

  const headerCells = (table: El) => (rows(table)[0] ? cells(rows(table)[0]!).map(textOf) : []);
  const firstColumn = (table: El) => rows(table).map((row) => textOf(cells(row)[1] ?? cells(row)[0]!));

  const sessionTable = tables.find((table) => headerCells(table).includes(LABEL.committee));
  const attendanceTable = tables.find((table) => {
    const header = headerCells(table);
    return header.includes(LABEL.attendanceState) && header.includes(LABEL.absenceReason);
  });
  const signatureTable = tables.find((table) => headerCells(table).includes(LABEL.signature));
  const agendaTable = tables.find((table) => {
    const header = headerCells(table);
    return header.length === 2 && header[1] === LABEL.subject;
  });
  const discussionTable = tables.find((table) => firstColumn(table).includes(LABEL.discussion));
  const entityTable = tables.find((table) => textOf(table).includes(LABEL.relatedEntity));

  const missing: string[] = [];
  if (!sessionTable) missing.push('جدول بيانات الجلسة');
  if (!attendanceTable) missing.push('جدول أعضاء اللجنة وحالة الحضور');
  if (!agendaTable) missing.push('جدول أعمال الجلسة');
  if (!discussionTable) missing.push('جدول المناقشات والقرارات');
  if (!entityTable) missing.push('جدول الجهة ذات العلاقة');
  if (!signatureTable) missing.push('جدول رأي الأعضاء والتوقيع');
  if (missing.length > 0) {
    throw new HttpError(
      422,
      `الملف المرفوع كنموذج رسمي لا يطابق هيكل نموذج المحضر المتوقع؛ لم تُعثر على: ${missing.join('، ')}. لم يُصدَّر أي مستند.`,
    );
  }

  return {
    sessionTable: sessionTable!,
    attendanceTable: attendanceTable!,
    agendaTable: agendaTable!,
    discussionTable: discussionTable!,
    entityTable: entityTable!,
    signatureTable: signatureTable!,
    // Compare against the normalized label: the template writes "رابعاً" with harakat.
    addresseeParagraph: paragraphs.find((p) => textOf(p).startsWith(norm('رابعاً'))) ?? null,
    additionsParagraph:
      paragraphs.find((p) => /^\.{10,}$/.test(textOf(p).replace(/\s/g, ''))) ?? null,
  };
}

/** Rebuilds a table's data rows from one source list, using an existing row as the style model. */
function rebuildRows(
  doc: Document,
  table: El,
  headerRowCount: number,
  records: string[][],
  report: TemplateFillReport,
  label: string,
): void {
  const allRows = rows(table);
  const modelRow = allRows[headerRowCount];
  if (!modelRow) {
    report.warnings.push(`${label}: لا يوجد صف نموذجي في القالب، فلم تُضف صفوف.`);
    return;
  }
  const templateRow = modelRow.cloneNode(true) as El;
  for (const row of allRows.slice(headerRowCount)) table.removeChild(row);

  for (const record of records) {
    const row = templateRow.cloneNode(true) as El;
    const rowCells = cells(row);
    record.forEach((value, index) => {
      const cell = rowCells[index];
      if (cell) setCellText(doc, cell, value);
    });
    // Any column the data does not cover is cleared, never left with template content.
    for (let index = record.length; index < rowCells.length; index += 1) {
      setCellText(doc, rowCells[index]!, '');
    }
    table.appendChild(row);
  }
  report.filled.push(`${label}: ${records.length} صفًا من مصدر واحد داخل التطبيق.`);
}

export async function fillMinutesTemplate(
  templateBuffer: Buffer,
  model: MinutesExportModel,
): Promise<TemplateFillResult> {
  const zip = await JSZip.loadAsync(templateBuffer);
  const documentFile = zip.file('word/document.xml');
  if (!documentFile) {
    throw new HttpError(422, 'الملف المرفوع ليس مستند Word صالحًا (لا يحتوي word/document.xml).');
  }

  const xml = await documentFile.async('string');
  const doc = new DOMParser().parseFromString(xml, 'text/xml') as unknown as Document;
  const body = (doc.getElementsByTagName('w:body')[0] as unknown as El) ?? null;
  if (!body) throw new HttpError(422, 'مستند القالب بلا محتوى (w:body مفقود).');

  const report: TemplateFillReport = {
    filled: [],
    deviations: [],
    warnings: [],
    preservedParts: Object.keys(zip.files).filter((name) => name !== 'word/document.xml'),
  };

  const anchors = findAnchors(body);

  // --- session information -------------------------------------------------
  const sessionRows = rows(anchors.sessionTable);
  const dateText = [model.meetingDate, calendarLabel(model.meetingCalendar)].filter(Boolean).join(' — ');
  const pairs: Array<[string, string]> = [
    [LABEL.committee, model.committeeName || model.org.committee],
    [LABEL.date, dateText],
    [LABEL.session, model.sessionNo],
    [LABEL.time, model.meetingTime],
  ];
  for (const row of sessionRows) {
    const rowCells = cells(row);
    rowCells.forEach((cell, index) => {
      const label = textOf(cell);
      const match = pairs.find(([name]) => name === label);
      const valueCell = rowCells[index + 1];
      if (match && valueCell) setCellText(doc, valueCell, match[1]);
    });
  }
  report.filled.push('بيانات الجلسة: اسم اللجنة والتاريخ ورقم الجلسة والوقت.');

  // --- attendance and signatures, both from the one composition ------------
  if (model.members.length === 0) {
    report.warnings.push(
      'تشكيل اللجنة فارغ في التطبيق، فبقي جدولا الحضور والتوقيع بلا صفوف. لم تُنسخ أسماء القالب.',
    );
    rebuildRows(doc, anchors.attendanceTable, 1, [], report, 'جدول الحضور');
    rebuildRows(doc, anchors.signatureTable, 1, [], report, 'جدول التوقيع');
  } else {
    rebuildRows(
      doc,
      anchors.attendanceTable,
      1,
      model.members.map((member) => [
        String(member.ordinal),
        member.name,
        member.role,
        ATTENDANCE_LABELS[member.state] ?? member.state,
        member.absenceReason,
      ]),
      report,
      'جدول الحضور',
    );
    // The signature column is deliberately left empty: signatures are handwritten.
    rebuildRows(
      doc,
      anchors.signatureTable,
      1,
      model.members.map((member) => [String(member.ordinal), member.name, member.role, '']),
      report,
      'جدول التوقيع',
    );
    report.filled.push(
      'جدولا الحضور والتوقيع بُنيا من تشكيل اللجنة نفسه، فلا يختلف اسم بينهما، ولم تُنسخ أسماء القالب ولا حالات حضوره ولا توقيعاته.',
    );
  }

  // --- agenda --------------------------------------------------------------
  // The "م" column of this table is numbered automatically by the template's own
  // list definition, so writing a digit would print it twice.
  rebuildRows(
    doc,
    anchors.agendaTable,
    1,
    model.items.map((item) => ['', item.subject || item.requestTitle || '']),
    report,
    'جدول أعمال الجلسة',
  );

  // --- discussions: one (block + related entity) pair per item -------------
  const discussionModel = anchors.discussionTable.cloneNode(true) as El;
  const entityModel = anchors.entityTable.cloneNode(true) as El;
  const spacer = anchors.discussionTable.nextSibling;
  const spacerModel = spacer && (spacer as El).nodeName === 'w:p' ? (spacer.cloneNode(true) as El) : null;

  const fillDiscussion = (table: El, item: MinutesExportModel['items'][number]) => {
    for (const row of rows(table)) {
      const rowCells = cells(row);
      const labelCell = rowCells[1] ?? rowCells[0]!;
      const label = textOf(labelCell);
      const valueCell = rowCells[2] ?? rowCells[rowCells.length - 1]!;
      if (label.startsWith(LABEL.subject)) {
        // The label column is narrow; the request number belongs with the subject.
        const subject = item.subject || item.requestTitle || '';
        setCellText(doc, valueCell, item.refNo ? `${subject} (طلب رقم ${item.refNo})` : subject);
        // The template labels each block "الموضوع 1"; keep that wording and renumber it.
        if (/\d/.test(label) && item.ordinal > 0) {
          setCellText(doc, labelCell, label.replace(/\d+/, String(item.ordinal)));
        }
      } else if (label === LABEL.discussion) {
        setCellText(doc, valueCell, item.body || '');
      } else if (label === LABEL.decision) {
        setCellText(doc, valueCell, item.decision || '');
      }
    }
  };

  const fillEntity = (table: El, item: MinutesExportModel['items'][number]) => {
    for (const row of rows(table)) {
      const rowCells = cells(row);
      const index = rowCells.findIndex((cell) => textOf(cell) === LABEL.relatedEntity);
      if (index >= 0) {
        const valueCell = rowCells[index + 1] ?? rowCells[rowCells.length - 1]!;
        if (valueCell !== rowCells[index]) setCellText(doc, valueCell, item.relatedEntity || '');
      }
    }
  };

  if (model.items.length === 0) {
    fillDiscussion(anchors.discussionTable, {
      ordinal: 0, refNo: '', requestTitle: '', subject: '', body: '', decision: '', relatedEntity: '',
    });
    fillEntity(anchors.entityTable, {
      ordinal: 0, refNo: '', requestTitle: '', subject: '', body: '', decision: '', relatedEntity: '',
    });
    report.warnings.push('لا توجد بنود في المحضر، فبقي قالب بند المناقشة فارغًا.');
  } else {
    fillDiscussion(anchors.discussionTable, model.items[0]!);
    fillEntity(anchors.entityTable, model.items[0]!);

    let insertAfter: El = anchors.entityTable;
    for (const item of model.items.slice(1)) {
      const discussionClone = discussionModel.cloneNode(true) as El;
      const entityClone = entityModel.cloneNode(true) as El;
      fillDiscussion(discussionClone, item);
      fillEntity(entityClone, item);

      // The template anchors this table to an absolute position on the page.
      // Repeating it as-is would stack every copy on the same spot, so clones
      // are made inline and stay attached to their own item.
      const tblPr = children(entityClone, 'w:tblPr')[0];
      const floating = tblPr ? children(tblPr, 'w:tblpPr')[0] : undefined;
      if (floating && tblPr) tblPr.removeChild(floating);

      const spacerClone = spacerModel ? (spacerModel.cloneNode(true) as El) : null;
      const nodes: El[] = spacerClone
        ? [spacerClone, discussionClone, spacerClone.cloneNode(true) as El, entityClone]
        : [discussionClone, entityClone];
      for (const node of nodes) {
        body.insertBefore(node, insertAfter.nextSibling);
        insertAfter = node;
      }
    }
    report.filled.push(`المناقشات والقرارات: ${model.items.length} بندًا، كل بند مع جهته ذات العلاقة.`);
    if (model.items.length > 1) {
      report.deviations.push(
        'جدول «الجهة ذات العلاقة» في القالب مثبَّت بموضع مطلق في الصفحة. عند تكرار البنود تُدرَج النسخ الإضافية داخل سياق النص (بدون التثبيت) لتبقى ملتصقة ببندها بدل أن تتراكم في الموضع نفسه.',
      );
    }
  }

  // --- addressee -----------------------------------------------------------
  if (anchors.addresseeParagraph) {
    if (model.addressee.state === 'confirmed' && (model.addressee.name || model.addressee.title)) {
      setParagraphText(
        doc,
        anchors.addresseeParagraph,
        `رابعاً: يوصي أعضاء اللجنة برفع هذا المحضر إلى ${[model.addressee.title, model.addressee.name].filter(Boolean).join(' ')}.`,
      );
      report.filled.push('فقرة «رابعاً»: المخاطب وصفته كما أكّدهما المستخدم.');
    } else {
      report.warnings.push(
        'المخاطب في فقرة «رابعاً» لم يؤكَّد في التطبيق، فتُركت صياغة القالب كما هي ولم تُستبدل بأي قيمة.',
      );
    }
  }

  // --- additions -----------------------------------------------------------
  if (anchors.additionsParagraph && model.additions.trim()) {
    setParagraphText(doc, anchors.additionsParagraph, model.additions.trim());
    report.filled.push('فقرة «سادساً»: الإضافات والملحوظات.');
  }

  const serialized = new XMLSerializer().serializeToString(doc as never);
  zip.file('word/document.xml', serialized);
  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  return { buffer: Buffer.from(buffer), report };
}
