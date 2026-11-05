// รายการเมนูหลักของเว็บ ใช้ร่วมกันระหว่าง sidebar (คอม) และหน้าโปรไฟล์ (มือถือ)
// เพิ่ม/แก้เมนูที่นี่ที่เดียว ทั้งสองที่จะเปลี่ยนตาม

export const menuGroups = [
  {
    label: 'nav.groups.main',
    items: [
      { label: 'nav.home', to: '/', icon: '/icons/House.svg' },
      { label: 'nav.incidents', to: '/incidents', icon: '/icons/Alert.svg' },
      { label: 'nav.helpRequests', to: '/help-requests', icon: '/icons/Help.svg' },
    ],
  },
  {
    label: 'nav.groups.actions',
    kind: 'actions',
    items: [
      { label: 'nav.reportIncident', to: '/report-incident', icon: '/icons/Report.svg', tone: 'report' },
      { label: 'nav.requestHelp', to: '/request-help', icon: '/icons/Life-saving.svg', tone: 'help' },
    ],
  },
  {
    label: 'nav.groups.mine',
    items: [
      { label: 'nav.followedLocations', to: '/followed-locations', icon: '/icons/Location.svg' },
      { label: 'nav.safetyGuide', to: '/safety-guide', icon: '/icons/Safety-and-security.svg', kind: 'guide' },
    ],
  },
]

export const accountItems = [
  { label: 'nav.profile', to: '/profile', icon: '/icons/User.svg' },
  { label: 'nav.settings', to: '/settings', icon: '/icons/Settings.svg' },
]

// หน้าที่มีในแถบเมนูด้านล่างของมือถืออยู่แล้ว (รวมปุ่มบวก แจ้งเหตุ/ขอความช่วยเหลือ)
// หน้าโปรไฟล์บนมือถือจะไม่แสดงซ้ำ
const bottomNavPaths = ['/', '/incidents', '/report-incident', '/request-help', '/notifications', '/profile']

// เมนูสำหรับหน้าโปรไฟล์บนมือถือ: เอาเฉพาะเมนูจาก sidebar ที่ยังไม่มีในแถบล่าง
export const getMobileProfileMenu = () => {
  const groups = []

  // เมนูที่ไม่อยู่ในแถบล่าง (เช่น ดูคำขอช่วยเหลือ จากเมนูหลัก) รวมไว้ในกลุ่ม "พื้นที่ของฉัน"
  const mineItems = []
  for (const group of menuGroups) {
    for (const item of group.items) {
      if (!bottomNavPaths.includes(item.to)) {
        mineItems.push(item)
      }
    }
  }
  if (mineItems.length > 0) {
    groups.push({ label: 'nav.groups.mine', items: mineItems })
  }

  return groups
}

// เมนูบัญชีที่ไม่อยู่ในแถบล่าง (เช่น ตั้งค่า) แสดงในกลุ่ม "การใช้งาน" ของหน้าโปรไฟล์มือถือ
export const getMobileSettingsItems = () => {
  return accountItems.filter((item) => !bottomNavPaths.includes(item.to))
}
