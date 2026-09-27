const fallbackIconFile = 'Alert.svg'
const pendingIconFile = 'Warning-Error.svg'

const iconFilesByTypeCode = {
  flood: 'Flood.svg',
  flash_flood: 'Flash-flood.svg',
  storm: 'Storm.svg',
  wildfire: 'Fire.svg',
  earthquake: 'Earthquake.svg',
  tsunami: 'Tsunami.svg',
  landslide: 'Landslide-mudslide.svg',
  drought: 'Drought.svg',
  traffic_accident: 'Car.svg',
  vehicle_rollover: 'Car.svg',
  vehicle_obstruction: 'Roadblock.svg',
  road_obstruction: 'Road-barrier.svg',
  other_road_accident: 'Car.svg',
  building_fire: 'Fire.svg',
  conflict: 'Conflict.svg',
  violent_incident: 'Security.svg',
  missing_person: 'Missing.svg',
  suspicious_object: 'Warning-Error.svg',
  other_fire: 'Fire.svg',
  power_outage: 'Power-outage.svg',
  fallen_pole: 'Power-electricity.svg',
  broken_power_line: 'Power-electricity.svg',
  water_pipe_break: 'Water-source.svg',
  water_supply_outage: 'Potable-water.svg',
  road_damage: 'Road-affected.svg',
  bridge_damage: 'Bridge-affected.svg',
  building_collapse: 'Building-facility-affected.svg',
  pm25: 'Respiratory.svg',
  abnormal_smoke: 'Respiratory.svg',
  air_pollution: 'Respiratory.svg',
  wastewater: 'Water-Sanitation-and-Hygiene.svg',
  chemical_odor: 'Warning-Error.svg',
  chemical_leak: 'Technological-disaster.svg',
  waste: 'Solid-waste.svg',
  missing_pet: 'Livestock.svg',
  found_pet: 'Livestock.svg',
  lost_item: 'Search.svg',
  found_item: 'Selected.svg',
  dangerous_animal: 'Livestock.svg',
  public_obstruction: 'Roadblock.svg',
}

const iconFilesByIconName = {
  activity: 'Earthquake.svg',
  'building-2': 'Building-facility-affected.svg',
  'car-front': 'Car.svg',
  cloud: 'Respiratory.svg',
  'cloud-lightning': 'Storm.svg',
  'cloud-rain': 'Heavy-rain.svg',
  construction: 'Road-affected.svg',
  'droplet-off': 'Potable-water.svg',
  droplets: 'Water-source.svg',
  flame: 'Fire.svg',
  'flask-conical': 'Technological-disaster.svg',
  leaf: 'Environment.svg',
  mountain: 'Landslide-mudslide.svg',
  'package-check': 'Selected.svg',
  'package-search': 'Search.svg',
  'paw-print': 'Livestock.svg',
  search: 'Search.svg',
  'shield-alert': 'Security.svg',
  sun: 'Drought.svg',
  'trash-2': 'Solid-waste.svg',
  'triangle-alert': 'Warning-Error.svg',
  users: 'Group.svg',
  'utility-pole': 'Power-electricity.svg',
  waves: 'Flood.svg',
  'waves-arrow-up': 'Flash-flood.svg',
  wind: 'Respiratory.svg',
  zap: 'Power-electricity.svg',
  'zap-off': 'Power-outage.svg',
}

const normalizeKey = (value) => String(value ?? '').trim()

const toPublicIconUrl = (fileName) => `/${encodeURIComponent(fileName)}`

export const getIncidentIconFile = ({ typeCode, iconName, kind } = {}) => {
  if (kind === 'pending_report') return pendingIconFile

  const normalizedTypeCode = normalizeKey(typeCode)
  const normalizedIconName = normalizeKey(iconName)

  return iconFilesByTypeCode[normalizedTypeCode]
    ?? iconFilesByIconName[normalizedIconName]
    ?? fallbackIconFile
}

export const getIncidentIconUrl = (input) => toPublicIconUrl(getIncidentIconFile(input))
