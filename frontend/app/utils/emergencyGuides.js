// คู่มือรับมือเหตุฉุกเฉินเขียนเป็น Markdown ใน data/guides/<topic>.md (ชื่อไฟล์ = id หัวข้อในเมนูคู่มือ)
// ฉบับภาษาอื่นตั้งชื่อ <topic>.<locale>.md เช่น flood.en.md (ถ้าไม่มี จะใช้ฉบับภาษาไทยแทน)
// Vite ฝังเนื้อหาไฟล์มาเป็นข้อความตอน build ไม่ต้องโหลดเพิ่มตอนเปิดหน้า
const guideFiles = import.meta.glob('../data/guides/*.md', { query: '?raw', import: 'default', eager: true })

// { th: { flood: source }, en: { flood: source } }
const guideSources = {}
for (const [path, source] of Object.entries(guideFiles)) {
  const [, topic, locale = 'th'] = path.match(/([\w-]+?)(?:\.(\w+))?\.md$/)
  guideSources[locale] = { ...guideSources[locale], [topic]: source }
}

// หมวดและหัวข้อของคู่มือ ใช้ร่วมกันทั้งเมนูด้านข้างและหน้า /safety-guide
export const guideCategories = [
  { id: 'natural', topics: ['flood', 'storm', 'earthquake', 'landslide'] },
  { id: 'accident', topics: ['fire', 'collapse', 'crowd'] },
  { id: 'violence', topics: ['violence'] },
]

export const emergencyNumbers = [
  { number: '1784', key: 'disaster' },
  { number: '1669', key: 'medical' },
  { number: '191', key: 'police' },
  { number: '199', key: 'fire' },
]

// ชื่อหัวข้อ ## ในไฟล์ md -> ช่วงของคู่มือ (หัวข้อ ## อื่นที่ไม่อยู่ในนี้จะไม่ถูกแสดงเป็นแท็บ)
export const guidePhases = [
  { key: 'before', headings: ['ก่อนเกิด', 'Before'] },
  { key: 'during', headings: ['ระหว่างเกิด', 'During'] },
  { key: 'after', headings: ['หลังเกิด', 'After'] },
]

// หัวข้อที่ตัวอ่านต้องรู้จัก เขียนได้ทั้งไทยและอังกฤษ
const referenceHeadings = ['แหล่งอ้างอิง', 'Sources']
const quickStepHeadings = ['ทำทันที', 'Do now']
const isDont = (title) => title.startsWith('ห้าม') || /^don['’]?t\b/i.test(title)
const isScenario = (title) => title.startsWith('ถ้า') || /^if\b/i.test(title)

// type_code ของเหตุการณ์ -> หัวข้อคู่มือ (หัวข้อที่ยังไม่มีไฟล์ .md จะไม่แสดงคู่มือ)
const guideTopicByTypeCode = {
  flood: 'flood',
  flash_flood: 'flood',
  storm: 'storm',
  earthquake: 'earthquake',
  tsunami: 'earthquake',
  landslide: 'landslide',
  building_fire: 'fire',
  other_fire: 'fire',
  wildfire: 'fire',
  chemical_leak: 'fire',
  abnormal_smoke: 'fire',
  building_collapse: 'collapse',
  violent_incident: 'violence',
  conflict: 'violence',
}

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const stripMarkdown = (text) => text.replace(/\*\*/g, '').trim()

// ตัวแปลง Markdown ขนาดเล็กสำหรับรูปแบบไฟล์คู่มือเท่านั้น: ### หัวข้อ (แสดงเป็น h4 ใต้ชื่อหัวข้อในหน้า),
// รายการ 1. / -, ย่อหน้า และ **ตัวหนา**
// ขั้นตอนแบบ "1. **หัวข้อ** คำอธิบาย" จะแยกเป็นหัวข้อกับคำอธิบาย เพื่อจัดหน้าแบบการ์ดความปลอดภัย
const inline = (text) => escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

const renderItem = (text) => {
  const match = text.match(/^\*\*(.+?)\*\*\s*(.*)$/)
  if (!match) return `<li><span class="guide-item__text">${inline(text)}</span></li>`
  const detail = match[2] ? `<span class="guide-item__detail">${inline(match[2])}</span>` : ''
  return `<li><strong class="guide-item__title">${escapeHtml(match[1])}</strong>${detail}</li>`
}

const renderBlocks = (lines) => {
  const html = []
  let list = null
  let inDont = false

  const closeList = () => {
    if (!list) return
    html.push(`<${list.tag} class="guide-list guide-list--${list.tag === 'ol' ? 'steps' : 'points'}">${list.items.join('')}</${list.tag}>`)
    list = null
  }
  const closeDont = () => {
    if (inDont) html.push('</div>')
    inDont = false
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    const heading = line.match(/^###\s+(.+)$/)
    const ordered = line.match(/^\d+\.\s+(.+)$/)
    const bullet = line.match(/^[-*]\s+(.+)$/)

    if (heading) {
      closeList()
      closeDont()
      const title = stripMarkdown(heading[1])
      if (isDont(title)) {
        html.push('<div class="guide-dont">')
        inDont = true
      }
      html.push(`<h4>${escapeHtml(title)}</h4>`)
    } else if (ordered || bullet) {
      const tag = ordered ? 'ol' : 'ul'
      if (list && list.tag !== tag) closeList()
      if (!list) list = { tag, items: [] }
      list.items.push(renderItem((ordered ?? bullet)[1]))
    } else if (!line.startsWith('>')) {
      closeList()
      html.push(`<p>${inline(line)}</p>`)
    }
  }

  closeList()
  closeDont()
  return html.join('')
}

// แยกเนื้อหาช่วงหนึ่งเป็นส่วนตามหัวข้อ ### ให้หน้าจอคอมนำไปจัดวางเองเป็นคอลัมน์
// kind: 'dont' = ห้ามทำ, 'scenario' = ถ้า... (สถานการณ์เฉพาะ), 'main' = ส่วนหลักของช่วง
const parseSections = (lines) => {
  const sections = []
  let current = null

  for (const raw of lines) {
    const line = raw.trim()
    const heading = line.match(/^###\s+(.+)$/)
    const item = line.match(/^(\d+\.|[-*])\s+(.+)$/)

    if (heading) {
      const title = stripMarkdown(heading[1])
      const kind = isDont(title) ? 'dont' : isScenario(title) ? 'scenario' : 'main'
      current = { title, kind, ordered: false, items: [] }
      sections.push(current)
    } else if (item && current) {
      if (!current.items.length) current.ordered = item[1] !== '-' && item[1] !== '*'
      const bold = item[2].match(/^\*\*(.+?)\*\*\s*(.*)$/)
      current.items.push(bold ? { title: bold[1].trim(), detail: stripMarkdown(bold[2]) } : { title: '', detail: stripMarkdown(item[2]) })
    }
  }

  return sections
}

// แยกไฟล์เป็น: หัวเรื่อง, สรุปบนสุด, และส่วนตามหัวข้อ ## (แต่ละส่วนมีสรุป > ของตัวเอง)
const parseGuide = (topic, source) => {
  const lines = source.split(/\r?\n/)
  const title = stripMarkdown(lines.find((line) => line.startsWith('# '))?.slice(2) ?? '')

  const sections = []
  let current = { heading: null, lines: [] }
  for (const line of lines) {
    if (line.startsWith('## ')) {
      sections.push(current)
      current = { heading: stripMarkdown(line.slice(3)), lines: [] }
    } else if (!line.startsWith('# ')) {
      current.lines.push(line)
    }
  }
  sections.push(current)

  const summaryOf = (section) =>
    stripMarkdown(section?.lines.find((line) => line.startsWith('> '))?.slice(2) ?? '')

  const phases = guidePhases
    .map(({ key, headings }) => {
      const section = sections.find((item) => headings.includes(item.heading))
      if (!section) return null
      return {
        key,
        heading: section.heading,
        summary: summaryOf(section),
        html: renderBlocks(section.lines),
        sections: parseSections(section.lines),
        lines: section.lines,
      }
    })
    .filter(Boolean)

  const references = sections
    .find((item) => referenceHeadings.includes(item.heading))
    ?.lines.map((line) => line.match(/^[-*]\s+(.+)$/)?.[1])
    .filter(Boolean)
    .map(stripMarkdown) ?? []

  // คู่มือย่อ: สรุปของช่วงระหว่างเกิด + หัวข้อตัวหนาใต้ "### ทำทันที" (ข้อแรกๆ สำคัญที่สุด)
  const during = phases.find((phase) => phase.key === 'during')
  const steps = []
  if (during) {
    const start = during.lines.findIndex((line) => quickStepHeadings.includes(line.trim().replace(/^###\s+/, '')))
    if (start !== -1) {
      for (const line of during.lines.slice(start + 1)) {
        if (line.startsWith('#')) break
        const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*(.*)$/)
        if (match) steps.push({ title: match[1].trim(), detail: stripMarkdown(match[2]) })
      }
    }
  }

  return {
    topic,
    title,
    summary: summaryOf(sections[0]),
    phases: phases.map(({ lines: _lines, ...phase }) => phase),
    references,
    quick: { summary: during?.summary || summaryOf(sections[0]), steps },
  }
}

const parsedGuides = Object.fromEntries(
  Object.entries(guideSources).map(([locale, sources]) => [
    locale,
    Object.fromEntries(Object.entries(sources).map(([topic, source]) => [topic, parseGuide(topic, source)])),
  ]),
)

// ใช้ฉบับตามภาษาที่เลือก ถ้ายังไม่มีฉบับแปล ให้ใช้ฉบับภาษาไทย
export const getEmergencyGuide = (topic, locale = 'th') =>
  parsedGuides[locale]?.[topic] ?? parsedGuides.th?.[topic] ?? null

export const getEmergencyGuideForType = (typeCode, locale = 'th') => {
  const topic = guideTopicByTypeCode[typeCode]
  return topic ? getEmergencyGuide(topic, locale) : null
}
