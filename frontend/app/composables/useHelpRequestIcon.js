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

// ชื่อประเภทคำขอ (ข้อความอยู่ใน locales: helpTypes.*) ตรงกับตัวเลือกใน RequestHelpForm
const knownHelpTypes = ['evacuation', 'medical', 'food', 'shelter', 'vehicle']

export const getHelpRequestLabel = (helpType, t) => (
  knownHelpTypes.includes(helpType) ? t(`helpTypes.${helpType}`) : t('help.category')
)
