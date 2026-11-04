// กำหนดการเลื่อนหน้าตอนเปลี่ยน URL
// หน้าคู่มือใช้ #fire, #storm เป็นชื่อหัวข้อ ไม่ใช่ id ของ element บนหน้า
// จึงเลื่อนไปที่ #... เฉพาะตอนที่มี element นั้นอยู่จริง ไม่อย่างนั้น Vue Router จะเตือนว่าหาไม่เจอ
export default {
  scrollBehavior(to, from, savedPosition) {
    // กดย้อนกลับ/ไปข้างหน้า: กลับไปตำแหน่งเดิม
    if (savedPosition) return savedPosition

    if (to.hash && document.getElementById(to.hash.slice(1))) {
      return { el: to.hash, behavior: 'smooth' }
    }

    // อยู่หน้าเดิมแค่เปลี่ยน #หัวข้อ: ไม่ต้องเลื่อน
    if (to.path === from.path) return false

    return { top: 0 }
  },
}
