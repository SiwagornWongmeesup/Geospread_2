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
