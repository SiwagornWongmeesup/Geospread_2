const helpRequestIcons = {
  evacuation: '/Life-saving.svg',
  medical: '/Health.svg',
  food: '/Food.svg',
  shelter: '/Shelter.svg',
  vehicle: '/Car.svg',
}

export const getHelpRequestIcon = (helpType) => (
  helpRequestIcons[helpType] || '/Life-saving.svg'
)
