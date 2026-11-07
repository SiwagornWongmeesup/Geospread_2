// สร้าง HTML ของ tooltip สำหรับกราฟ Unovis (Unovis รับ tooltip เป็นข้อความ HTML)
// rows: [{ label, value, color }] — ข้อความถูก escape ก่อนใส่ลง HTML

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

export function chartTooltip(title, rows) {
  const items = rows.map(({ label, value, color }) => `
    <div style="display:flex;align-items:center;gap:8px;min-width:140px">
      <span style="width:8px;height:8px;border-radius:2px;background:${escapeHtml(color)}"></span>
      <span style="color:var(--gs-muted)">${escapeHtml(label)}</span>
      <b style="margin-left:auto;font-variant-numeric:tabular-nums">${escapeHtml(value)}</b>
    </div>`).join('')

  return `<div style="display:grid;gap:4px;font-size:12px">
    ${title ? `<strong style="margin-bottom:2px">${escapeHtml(title)}</strong>` : ''}${items}
  </div>`
}
