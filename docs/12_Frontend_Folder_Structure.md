# โครงสร้างโฟลเดอร์ Frontend และสถาปัตยกรรม Component (Nuxt 4 + Vue 3)

เอกสารนี้ใช้อ้างอิงสำหรับการจัดโครงสร้างโค้ดส่วนของ Frontend (Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS) สำหรับโปรเจกต์ **GeoSpread**

---

## 🏛️ แนวคิดสถาปัตยกรรม (Architecture Concept)

เพื่อรองรับการใช้งานทั้งบน **Desktop (จอคอมพิวเตอร์)** และ **Mobile (สมาร์ตโฟน)** ซึ่งมีพฤติกรรมการใช้งานและ Layout ที่ต่างกันมากในระบบแผนที่และเหตุการณ์ฉุกเฉิน เราจึงแบ่งสถาปัตยกรรมออกเป็น **2 เลเยอร์หลัก (Container-Presentational Pattern)**:

1. **Layer 1: Pages / Smart Containers (ศูนย์กลางข้อมูลและ API)**
   * อยู่ใน `app/pages/` หรือ `app/app.vue`
   * ทำหน้าที่เรียก API (`$fetch`, `useFetch`, Composables), จัดการ State กลาง, และจัดการ Business Events
   * ส่งข้อมูล (Props) และฟังก์ชัน (Callbacks) ต่อไปยัง View Component

2. **Layer 2: Responsive Views (แยกหน้า Desktop และ Mobile ชัดเจน)**
   * แยกโฟลเดอร์เป็น `components/desktop/` และ `components/mobile/`
   * เป็น Presentational / Dumb Components: มีหน้าที่แค่รับ Props มา Render UI และ Emit Event กลับไปหา Page หลัก
   * **ห้ามยิง API ซ้ำซ้อนที่ระดับ Component แสดงผล** เพื่อป้องกันการยิง Request ซ้ำและทำให้โค้ดเป็นระเบียบ

---

## 📁 โครงสร้างโฟลเดอร์หลัก

```text
frontend/
├── app/
│   ├── app.vue                 # จุดเริ่มต้นของแอปพลิเคชัน
│   ├── pages/                  # หน้าต่างๆ (Smart Containers / API Fetching)
│   │   ├── index.vue           # หน้าหลัก (Live Map & Incident Feed)
│   │   ├── login.vue           # หน้าเข้าสู่ระบบ
│   │   ├── register.vue        # หน้าสมัครสมาชิก
│   │   └── events/
│   │       └── [id].vue        # หน้า Event Room
│   ├── components/             # คอมโพเนนต์แสดงผล (Presentational Views)
│   │   ├── common/             # UI ทั่วไปที่ใช้ร่วมกัน (ปุ่ม, โมดอล, อินพุต, Badge)
│   │   │   ├── AppButton.vue
│   │   │   ├── AppModal.vue
│   │   │   └── SeverityBadge.vue
│   │   ├── desktop/            # ส่วนแสดงผลสำหรับหน้าจอ Desktop (Sidebar, Multi-panel)
│   │   │   ├── DesktopHeader.vue
│   │   │   ├── DesktopMapLayout.vue
│   │   │   └── DesktopIncidentFeed.vue
│   │   └── mobile/             # ส่วนแสดงผลสำหรับหน้าจอ Mobile (Bottom Sheet, FAB, Full-screen Map)
│   │       ├── MobileBottomNav.vue
│   │       ├── MobileBottomSheet.vue
│   │       └── MobileIncidentCard.vue
│   ├── composables/            # Reusable Logic & API Calls (useAuth, useIncidents, useMap)
│   │   ├── useAuth.ts
│   │   ├── useIncident.ts
│   │   └── useLocation.ts
│   ├── types/                  # TypeScript Interfaces / Types (User, Incident, Event)
│   │   └── index.ts
│   └── assets/                 # สไตล์ CSS, รูปภาพ, ฟอนต์
│       └── css/
│           └── main.css
├── nuxt.config.ts
└── package.json
```

---

## 🔄 ตัวอย่างรูปแบบการทำงาน (Data Flow Example)

### 1. Page หลัก (`app/pages/index.vue`) — เป็น Smart Container
ทำหน้าที่ยิง API ดึงข้อมูลเหตุการณ์ และสลับ Component ตามขนาดหน้าจอ:

```vue
<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import DesktopMapLayout from '~/components/desktop/DesktopMapLayout.vue';
import MobileMapLayout from '~/components/mobile/MobileMapLayout.vue';

// 1. ดึงข้อมูลจาก API (ทำที่ Page เดียวเท่านั้น)
const { data: incidents, pending, refresh } = await useFetch('http://localhost:5000/incidents');

// 2. เช็คขนาดหน้าจอ (Desktop หรือ Mobile)
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

// 3. ฟังก์ชันจัดการเมื่อผู้ใช้กดสร้างเหตุการณ์
const handleReportIncident = async (newIncidentData: any) => {
  await $fetch('http://localhost:5000/incidents', {
    method: 'POST',
    body: newIncidentData
  });
  refresh();
};
</script>

<template>
  <div>
    <!-- Render สำหรับ Mobile -->
    <MobileMapLayout 
      v-if="isMobile" 
      :incidents="incidents" 
      :loading="pending"
      @report="handleReportIncident" 
    />

    <!-- Render สำหรับ Desktop -->
    <DesktopMapLayout 
      v-else 
      :incidents="incidents" 
      :loading="pending"
      @report="handleReportIncident" 
    />
  </div>
</template>
```

### 2. Desktop Component (`app/components/desktop/DesktopMapLayout.vue`)
แสดงผลแบบ Split Screen (แถบ Sidebar ซ้าย + แผนที่ขวา):
```vue
<script setup lang="ts">
defineProps<{
  incidents: any[];
  loading: boolean;
}>();

defineEmits(['report']);
</script>

<template>
  <div class="flex h-screen w-screen">
    <!-- แถบด้านข้างซ้ายสำหรับ Desktop -->
    <aside class="w-96 border-r overflow-y-auto p-4">
      <h2 class="text-xl font-bold mb-4">รายการเหตุการณ์</h2>
      <!-- ลิสต์รายการ -->
    </aside>

    <!-- แผนที่ด้านขวา -->
    <main class="flex-1">
      <div id="desktop-map" class="w-full h-full"></div>
    </main>
  </div>
</template>
```

### 3. Mobile Component (`app/components/mobile/MobileMapLayout.vue`)
แสดงผลแบบ แผนที่เต็มจอ + แผ่นดึงด้านล่าง (Bottom Sheet) + ปุ่มแจ้งเหตุด่วน (FAB):
```vue
<script setup lang="ts">
defineProps<{
  incidents: any[];
  loading: boolean;
}>();

defineEmits(['report']);
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden">
    <!-- แผนที่เต็มจอสำหรับมือถือ -->
    <div id="mobile-map" class="w-full h-full"></div>

    <!-- ปุ่มแจ้งเหตุฉุกเฉินลอยตัว (Floating Action Button) -->
    <button class="fixed bottom-20 right-4 bg-red-600 text-white rounded-full p-4 shadow-lg">
      🚨 แจ้งเหตุด่วน
    </button>

    <!-- Bottom Sheet เลื่อนดูเหตุการณ์ -->
    <div class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-xl max-h-[50vh] overflow-y-auto">
      <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
      <h3 class="font-bold">เหตุการณ์ใกล้ตัวคุณ</h3>
    </div>
  </div>
</template>
```

---

## 🎯 ข้อดีของโครงสร้างนี้
1. **Separation of Concerns:** แยก Logic การดึงข้อมูล (API) ออกจาก Layout ทำให้ไม่งง
2. **ปรับแต่ง UX ได้อิสระ:** การใช้งานแผนที่บนมือถือ (เน้นสัมผัส/Bottom Sheet) ต่างจาก Desktop (เน้น Sidebar/เมาส์คลิก) สองส่วนนี้จะไม่ปนและไม่กระทบกัน
3. **ลดการยิง API ซ้ำ:** ทั้ง Mobile และ Desktop ใช้ข้อมูลชุดเดียวกันจาก Page หลัก
