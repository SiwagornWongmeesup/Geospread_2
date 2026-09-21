import { computed } from 'vue'

const commonGuide = {
  guideTitle: 'คำแนะนำเบื้องต้น',
  guideSteps: [
    'อยู่ในจุดที่ปลอดภัยและสังเกตความเสี่ยงรอบตัว',
    'ระบุตำแหน่งและผลกระทบที่พบให้ชัดเจน',
    'ติดตามประกาศจากหน่วยงานในพื้นที่',
  ],
}

export const reportIncidentTypeGroups = [
  {
    id: 'natural',
    label: 'ภัยธรรมชาติ',
    icon: 'sprout',
    tone: 'green',
    types: [
      { id: 'flood', label: 'น้ำท่วม', icon: 'flood', keywords: ['น้ำท่วม', 'น้ำขัง', 'น้ำเอ่อ', 'น้ำล้น'], guideTitle: 'แนวทางรับมือน้ำท่วม', guideSteps: ['หลีกเลี่ยงการเดินหรือขับรถผ่านน้ำท่วมขัง', 'ย้ายอุปกรณ์ไฟฟ้าและของจำเป็นขึ้นที่สูง', 'ติดตามประกาศจากหน่วยงานในพื้นที่'] },
      { id: 'storm', label: 'พายุ', icon: 'storm', keywords: ['พายุ', 'ลมแรง', 'ฝนหนัก'], guideTitle: 'แนวทางรับมือพายุ', guideSteps: ['อยู่ห่างจากต้นไม้ ป้าย และเสาไฟ', 'เก็บของที่ปลิวได้ไว้ในอาคาร', 'ติดตามประกาศเตือนภัยอย่างใกล้ชิด'] },
      { id: 'drought', label: 'ภัยแล้ง', icon: 'drought', keywords: ['ภัยแล้ง', 'ขาดน้ำ', 'น้ำไม่พอ'], guideTitle: 'แนวทางรับมือภัยแล้ง', guideSteps: ['สำรองน้ำสะอาดสำหรับการอุปโภคบริโภค', 'ใช้น้ำเท่าที่จำเป็น', 'แจ้งพื้นที่เสี่ยงขาดแคลนน้ำให้หน่วยงานทราบ'] },
      { id: 'wildfire', label: 'ไฟป่า', icon: 'fire', keywords: ['ไฟป่า', 'ไฟลาม', 'ควันไฟ'], guideTitle: 'แนวทางรับมือไฟป่า', guideSteps: ['หลีกเลี่ยงพื้นที่ที่มีควันหนาแน่น', 'ปิดประตูหน้าต่างเพื่อลดฝุ่นควัน', 'สวมหน้ากากเมื่อต้องออกนอกอาคาร'] },
      { id: 'tsunami', label: 'สึนามิ', icon: 'tsunami', keywords: ['สึนามิ', 'คลื่นยักษ์'], guideTitle: 'แนวทางรับมือสึนามิ', guideSteps: ['เคลื่อนย้ายไปยังที่สูงทันที', 'อย่ากลับเข้าพื้นที่ชายฝั่งจนกว่าจะมีประกาศ', 'ติดตามเส้นทางอพยพจากเจ้าหน้าที่'] },
      { id: 'earthquake', label: 'แผ่นดินไหว', icon: 'earthquake', keywords: ['แผ่นดินไหว', 'สั่น', 'แรงสั่นสะเทือน'], guideTitle: 'แนวทางรับมือแผ่นดินไหว', guideSteps: ['หลบใต้โต๊ะที่แข็งแรงและป้องกันศีรษะ', 'อยู่ห่างจากกระจกและของที่อาจหล่น', 'ออกจากอาคารเมื่อแรงสั่นสะเทือนหยุดลง'] },
    ],
  },
  {
    id: 'traffic',
    label: 'อุบัติเหตุและจราจร',
    icon: 'car',
    tone: 'blue',
    types: [
      { id: 'traffic_accident', label: 'รถชน', icon: 'car', keywords: ['รถชน', 'อุบัติเหตุ', 'เฉี่ยวชน', 'มอเตอร์ไซค์ล้ม'], guideTitle: 'แนวทางเมื่อพบอุบัติเหตุบนถนน', guideSteps: ['จอดรถในจุดปลอดภัยและเปิดสัญญาณฉุกเฉิน', 'อย่าเคลื่อนย้ายผู้บาดเจ็บหากไม่จำเป็น', 'แจ้งตำแหน่งและสภาพการจราจรให้ชัดเจน'] },
      { id: 'vehicle_obstruction', label: 'รถเสีย', icon: 'wrench', keywords: ['รถเสีย', 'รถดับ', 'รถกีดขวาง'], guideTitle: 'แนวทางเมื่อรถเสียกีดขวาง', guideSteps: ['เปิดสัญญาณฉุกเฉินและนำรถเข้าจุดปลอดภัย', 'วางสัญญาณเตือนหากทำได้โดยปลอดภัย', 'แจ้งช่องทางหรือจุดที่รถกีดขวาง'] },
      { id: 'road_damage', label: 'ถนนทรุด', icon: 'road', keywords: ['ถนนทรุด', 'หลุม', 'ถนนพัง', 'ผิวถนนเสีย'], guideTitle: 'แนวทางเมื่อพบถนนชำรุด', guideSteps: ['หลีกเลี่ยงจุดเสี่ยงและลดความเร็ว', 'แจ้งตำแหน่งหรือจุดสังเกตที่ชัดเจน', 'เตือนผู้ใช้ทางคนอื่นเมื่อทำได้อย่างปลอดภัย'] },
      { id: 'road_obstruction', label: 'ถนนกีดขวาง', icon: 'barrier', keywords: ['ถนนกีดขวาง', 'กีดขวาง', 'ปิดถนน'], ...commonGuide },
      { id: 'building_fire', label: 'ไฟไหม้', icon: 'fire', keywords: ['ไฟไหม้', 'เพลิงไหม้', 'ควัน'], guideTitle: 'แนวทางเมื่อพบเหตุไฟไหม้', guideSteps: ['ออกจากพื้นที่เสี่ยงและอย่าเข้าใกล้จุดเกิดเหตุ', 'แจ้งหน่วยฉุกเฉินหากมีอันตรายต่อชีวิต', 'ระบุว่ามีควัน เปลวไฟ หรือผู้ได้รับผลกระทบหรือไม่'] },
    ],
  },
  {
    id: 'safety',
    label: 'ความปลอดภัย',
    icon: 'shield',
    tone: 'blue',
    types: [
      { id: 'violent_incident', label: 'เหตุรุนแรง', icon: 'warning', keywords: ['เหตุรุนแรง', 'ทะเลาะ', 'ทำร้าย', 'อันตราย'], guideTitle: 'แนวทางเมื่อพบเหตุรุนแรง', guideSteps: ['อย่าเข้าใกล้จุดเกิดเหตุ', 'พาตนเองและผู้อื่นออกสู่จุดปลอดภัย', 'ติดต่อหน่วยฉุกเฉินเมื่อมีภัยคุกคามทันที'] },
      { id: 'lost_item', label: 'ของหาย', icon: 'search', keywords: ['ของหาย', 'ทำหาย', 'สูญหาย'], ...commonGuide },
      { id: 'missing_person', label: 'เด็กหาย', icon: 'person', keywords: ['เด็กหาย', 'คนหาย', 'บุคคลสูญหาย'], guideTitle: 'แนวทางเมื่อพบคนหรือเด็กหาย', guideSteps: ['ระบุลักษณะ เสื้อผ้า และเวลาที่พบล่าสุด', 'อย่าเผยแพร่ข้อมูลส่วนบุคคลที่อ่อนไหวเกินจำเป็น', 'ติดต่อหน่วยงานที่เกี่ยวข้องเมื่อมีความเสี่ยงเร่งด่วน'] },
      { id: 'dangerous_animal', label: 'สัตว์ดุร้าย', icon: 'paw', keywords: ['สัตว์ดุร้าย', 'สัตว์อันตราย', 'สุนัขดุ', 'งู'], guideTitle: 'แนวทางเมื่อพบสัตว์อันตราย', guideSteps: ['รักษาระยะห่างและอย่าพยายามจับสัตว์', 'เตือนผู้คนให้หลีกเลี่ยงบริเวณนั้น', 'แจ้งเจ้าหน้าที่ที่เกี่ยวข้องหากมีความเสี่ยง'] },
    ],
  },
  {
    id: 'environment',
    label: 'สิ่งแวดล้อม / สาธารณูปโภค',
    icon: 'leaf',
    tone: 'green',
    types: [
      { id: 'pm25', label: 'PM2.5 / ฝุ่น', icon: 'wind', keywords: ['pm2.5', 'ฝุ่น', 'หมอกควัน'], guideTitle: 'แนวทางเมื่อฝุ่น PM2.5 สูง', guideSteps: ['ลดกิจกรรมกลางแจ้งเมื่อมีฝุ่นหนาแน่น', 'สวมหน้ากากที่กรองฝุ่นละเอียดได้', 'ติดตามข้อมูลคุณภาพอากาศในพื้นที่'] },
      { id: 'chemical_odor', label: 'กลิ่นแก๊ส', icon: 'wind', keywords: ['กลิ่นแก๊ส', 'กลิ่นสารเคมี', 'แก๊สรั่ว'], guideTitle: 'แนวทางเมื่อพบกลิ่นแก๊สหรือสารเคมี', guideSteps: ['ออกจากพื้นที่และหลีกเลี่ยงประกายไฟ', 'อย่าเปิดหรือปิดอุปกรณ์ไฟฟ้าใกล้จุดเสี่ยง', 'แจ้งหน่วยงานที่เกี่ยวข้องพร้อมตำแหน่ง'] },
      { id: 'power_outage', label: 'ไฟฟ้าดับ', icon: 'bolt', keywords: ['ไฟฟ้าดับ', 'ไฟดับ', 'ไฟไม่ติด'], guideTitle: 'แนวทางเมื่อไฟฟ้าดับ', guideSteps: ['ใช้ไฟฉายแทนเทียนเมื่อทำได้', 'ถอดปลั๊กอุปกรณ์ไฟฟ้าที่ไม่จำเป็น', 'แจ้งพื้นที่และระยะเวลาที่ไฟฟ้าดับ'] },
      { id: 'water_supply_outage', label: 'น้ำประปาไม่ไหล', icon: 'drop', keywords: ['น้ำประปาไม่ไหล', 'น้ำไม่ไหล', 'ประปาขัดข้อง'], guideTitle: 'แนวทางเมื่อน้ำประปาขัดข้อง', guideSteps: ['สำรองน้ำสะอาดสำหรับความจำเป็น', 'แจ้งจุดหรือพื้นที่ที่ได้รับผลกระทบ', 'ติดตามประกาศจากผู้ให้บริการน้ำประปา'] },
    ],
  },
]

export const reportIncidentTypes = reportIncidentTypeGroups.flatMap((group) => group.types)

const defaultSuggestedTypeIds = ['traffic_accident', 'building_fire', 'road_damage', 'pm25', 'violent_incident', 'flood']

export const getRecommendedIncidentTypes = (reportedObservation = '') => {
  const normalizedObservation = reportedObservation.trim().toLocaleLowerCase()
  const matchedTypes = normalizedObservation
    ? reportIncidentTypes.filter((type) => type.keywords.some((keyword) => normalizedObservation.includes(keyword.toLocaleLowerCase())))
    : []
  const defaultTypes = defaultSuggestedTypeIds
    .map((id) => reportIncidentTypes.find((type) => type.id === id))
    .filter(Boolean)

  return [...new Map([...matchedTypes, ...defaultTypes].map((type) => [type.id, type])).values()].slice(0, 6)
}

export const useReportIncident = () => {
  const selectedTypeId = useState('report-incident-type', () => 'flood')
  const selectedType = computed(() => reportIncidentTypes.find((type) => type.id === selectedTypeId.value) ?? reportIncidentTypes[0])

  return {
    selectedTypeId,
    selectedType,
  }
}
