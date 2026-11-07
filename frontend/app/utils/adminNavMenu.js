// รายการเมนูของแอดมิน ใช้ร่วมกันระหว่าง sidebar (คอม) และแถบเมนูด้านล่าง (มือถือ)
// เมนูที่ยังไม่มีหน้า (ไม่มี to) แสดงเป็นปุ่มกดไม่ได้ พร้อมบอกว่า "กำลังพัฒนา"

const menus = {
  dashboard: { label: 'admin.menu.dashboard', icon: '/icons/Chart.svg', to: '/admin' },
  incidents: { label: 'admin.menu.incidents', icon: '/icons/Report.svg', to: '/admin/incidents' },
  requests: { label: 'admin.menu.requests', icon: '/icons/Help.svg' },
  events: { label: 'admin.menu.events', icon: '/icons/Calendar.svg' },
  users: { label: 'admin.menu.users', icon: '/icons/Users.svg', to: '/admin/users' },
  guides: { label: 'admin.menu.guides', icon: '/icons/Alert.svg' },
  analytics: { label: 'admin.menu.analytics', icon: '/icons/Analysis.svg' },
  notifications: { label: 'admin.menu.notifications', icon: '/icons/Notification.svg', badge: 3 },
  settings: { label: 'admin.menu.settings', icon: '/icons/Settings.svg' },
}

const toItems = (ids) => ids.map((id) => ({ id, ...menus[id] }))

export const adminMenuGroups = [
  { label: 'admin.groups.overview', items: toItems(['dashboard']) },
  { label: 'admin.groups.community', items: toItems(['incidents', 'requests', 'events', 'users']) },
  { label: 'admin.groups.dataSafety', items: toItems(['guides', 'analytics', 'notifications']) },
]

export const adminSystemItems = toItems(['settings'])

// แท็บในแถบเมนูด้านล่างของมือถือ (ที่เหลืออยู่ในเมนู "เมนูอื่น")
export const adminBottomNavItems = [
  { ...menus.dashboard, id: 'dashboard', shortLabel: 'admin.bottomNav.dashboard' },
  { ...menus.incidents, id: 'incidents', shortLabel: 'admin.bottomNav.incidents' },
  { ...menus.users, id: 'users', shortLabel: 'admin.bottomNav.users' },
]
