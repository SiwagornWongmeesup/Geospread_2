import { computed } from 'vue'

export const reportIncidentTypes = [
  {
    id: 'flood',
    label: 'น้ำท่วม',
    guideTitle: 'แนวทางรับมือน้ำท่วม',
    guideSteps: ['หลีกเลี่ยงการเดินหรือขับรถผ่านน้ำท่วมขัง', 'ย้ายอุปกรณ์ไฟฟ้าและของจำเป็นขึ้นที่สูง', 'ติดตามประกาศจากหน่วยงานในพื้นที่'],
  },
  {
    id: 'storm',
    label: 'พายุ',
    guideTitle: 'แนวทางรับมือพายุ',
    guideSteps: ['อยู่ห่างจากต้นไม้ ป้าย และเสาไฟ', 'เก็บของที่ปลิวได้ไว้ในอาคาร', 'ติดตามประกาศเตือนภัยอย่างใกล้ชิด'],
  },
  {
    id: 'drought',
    label: 'ภัยแล้ง',
    guideTitle: 'แนวทางรับมือภัยแล้ง',
    guideSteps: ['สำรองน้ำสะอาดสำหรับการอุปโภคบริโภค', 'ใช้น้ำเท่าที่จำเป็น', 'แจ้งพื้นที่เสี่ยงขาดแคลนน้ำให้หน่วยงานทราบ'],
  },
  {
    id: 'wildfire',
    label: 'ไฟป่า',
    guideTitle: 'แนวทางรับมือไฟป่า',
    guideSteps: ['หลีกเลี่ยงพื้นที่ที่มีควันหนาแน่น', 'ปิดประตูหน้าต่างเพื่อลดฝุ่นควัน', 'สวมหน้ากากเมื่อต้องออกนอกอาคาร'],
  },
  {
    id: 'tsunami',
    label: 'สึนามิ',
    guideTitle: 'แนวทางรับมือสึนามิ',
    guideSteps: ['เคลื่อนย้ายไปยังที่สูงทันที', 'อย่ากลับเข้าพื้นที่ชายฝั่งจนกว่าจะมีประกาศ', 'ติดตามเส้นทางอพยพจากเจ้าหน้าที่'],
  },
  {
    id: 'earthquake',
    label: 'แผ่นดินไหว',
    guideTitle: 'แนวทางรับมือแผ่นดินไหว',
    guideSteps: ['หลบใต้โต๊ะที่แข็งแรงและป้องกันศีรษะ', 'อยู่ห่างจากกระจกและของที่อาจหล่น', 'ออกจากอาคารเมื่อแรงสั่นสะเทือนหยุดลง'],
  },
]

export const useReportIncident = () => {
  const selectedTypeId = useState('report-incident-type', () => 'flood')
  const selectedSeverityId = useState('report-incident-severity', () => 'critical')
  const selectedType = computed(() => reportIncidentTypes.find((type) => type.id === selectedTypeId.value) ?? reportIncidentTypes[0])

  return {
    selectedTypeId,
    selectedSeverityId,
    selectedType,
  }
}
