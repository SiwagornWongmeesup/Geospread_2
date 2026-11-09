// รายการเมนูของแอดมิน ใช้ร่วมกันระหว่าง sidebar (คอม) และแถบเมนูด้านล่าง (มือถือ)
// mock: true = หน้านั้นยังเป็นหน้าตัวอย่าง (ข้อมูลจำลอง ยังไม่เชื่อม API) หน้าจะมีแถบบอกไว้

const menus = {
  dashboard: { label: 'admin.menu.dashboard', icon: '/icons/Chart.svg', to: '/admin' },
  incidents: { label: 'admin.menu.incidents', icon: '/icons/Report.svg', to: '/admin/incidents' },
  requests: { label: 'admin.menu.requests', icon: '/icons/Help.svg', to: '/admin/help-requests', mock: true },
  events: { label: 'admin.menu.events', icon: '/icons/Calendar.svg', to: '/admin/events', mock: true },
  users: { label: 'admin.menu.users', icon: '/icons/Users.svg', to: '/admin/users' },
  guides: { label: 'admin.menu.guides', icon: '/icons/Alert.svg', to: '/admin/guides', mock: true },
  analytics: { label: 'admin.menu.analytics', icon: '/icons/Analysis.svg', to: '/admin/analytics', mock: true },
  notifications: { label: 'admin.menu.notifications', icon: '/icons/Notification.svg', to: '/admin/notifications', mock: true },
  settings: { label: 'admin.menu.settings', icon: '/icons/Settings.svg', to: '/admin/settings', mock: true },
  profile: { label: 'nav.profile', icon: '/icons/User.svg', to: '/admin/profile' },
}

const toItems = (ids) => ids.map((id) => ({ id, ...menus[id] }))

export const adminMenuGroups = [
  { label: 'admin.groups.overview', items: toItems(['dashboard']) },
  { label: 'admin.groups.community', items: toItems(['incidents', 'requests', 'events', 'users']) },
  { label: 'admin.groups.dataSafety', items: toItems(['guides', 'analytics', 'notifications']) },
]

// เมนูกลุ่ม "ระบบ" ด้านล่างของ sidebar (โปรไฟล์อยู่ในเมนูบัญชีของ header แล้ว จึงมีแค่ในแผ่น "เมนูอื่น" บนมือถือ)
export const adminSystemItems = toItems(['settings'])
export const adminAccountItems = toItems(['profile'])

// แท็บในแถบเมนูด้านล่างของมือถือ (ที่เหลืออยู่ในแผ่น "เมนูอื่น")
export const adminBottomNavItems = [
  { ...menus.dashboard, id: 'dashboard', shortLabel: 'admin.bottomNav.dashboard' },
  { ...menus.incidents, id: 'incidents', shortLabel: 'admin.bottomNav.incidents' },
  { ...menus.users, id: 'users', shortLabel: 'admin.bottomNav.users' },
]
