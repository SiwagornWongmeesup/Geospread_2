const helpRequestIcons = {
  evacuation: '/icons/Life-saving.svg',
  medical: '/icons/Health.svg',
  food: '/icons/Food.svg',
  shelter: '/icons/Shelter.svg',
  vehicle: '/icons/Car.svg',
}

export const getHelpRequestIcon = (helpType) => (
  helpRequestIcons[helpType] || '/icons/Life-saving.svg'
)

// ชื่อประเภทคำขอภาษาไทย ตรงกับตัวเลือกใน RequestHelpForm
const helpRequestLabels = {
  evacuation: 'ต้องการอพยพ',
  medical: 'ต้องการความช่วยเหลือทางการแพทย์',
  food: 'ต้องการอาหารและน้ำ',
  shelter: 'ต้องการที่พักพิง',
  vehicle: 'ต้องการพาหนะ',
}

export const getHelpRequestLabel = (helpType) => (
  helpRequestLabels[helpType] || 'คำขอความช่วยเหลือ'
)
