# โครงสร้างโฟลเดอร์ Frontend และสถาปัตยกรรม Component (Nuxt 4 + Vue 3)

เอกสารนี้ใช้อ้างอิงสำหรับการจัดโครงสร้างโค้ดส่วนของ Frontend (Nuxt 4 + Vue 3 + JavaScript + Tailwind CSS) สำหรับโปรเจกต์ **GeoSpread**

---

## 🏛️ แนวคิดสถาปัตยกรรม (Architecture Concept)

เพื่อรองรับการใช้งานทั้งบน **Desktop (จอคอมพิวเตอร์)** และ **Mobile (สมาร์ตโฟน)** ซึ่งมีพฤติกรรมการใช้งานและ Layout ที่ต่างกันมากในระบบแผนที่และเหตุการณ์ฉุกเฉิน เราจึงแบ่งสถาปัตยกรรมออกเป็น **3 เลเยอร์** โดย Nuxt Layout เป็นเจ้าของ shell ของแอปเพียงจุดเดียว:

1. **Layer 1: Nuxt Layout Shell (Chrome ที่ใช้ร่วมกัน)**
   * อยู่ใน `app/layouts/default.vue` สำหรับ Desktop และ `app/layouts/mobile.vue` สำหรับ Mobile
   * `default.vue` เป็นเจ้าของ Header, Sidebar, Main `<slot />` และ Right Panel เพียงชุดเดียว
   * Component ใน `components/layout/` เป็นชิ้นส่วนของ shell; ห้ามสร้าง shell ซ้อนอีกชั้นใน `components/AppLayout.vue`

2. **Layer 2: Pages / Smart Containers (ศูนย์กลางข้อมูลและ API)**
   * อยู่ใน `app/pages/` หรือ `app/app.vue`
   * ทำหน้าที่เรียก API (`$fetch`, `useFetch`, Composables), จัดการ State กลาง, และจัดการ Business Events
   * ส่งข้อมูล (Props) และฟังก์ชัน (Callbacks) ต่อไปยัง View Component
   * หน้าที่ต้องแสดง Right Panel กำหนดด้วย `definePageMeta({ showRightPanel: true })`; ปัจจุบันคือ Home และ Map

3. **Layer 3: Responsive Views (แยกหน้า Desktop และ Mobile ชัดเจน)**
   * วาง View ของแต่ละหน้าไว้คู่กันที่ `components/pages/<route>/Desktop.vue` และ `Mobile.vue`
   * เป็น Presentational / Dumb Components: มีหน้าที่แค่รับ Props มา Render UI และ Emit Event กลับไปหา Page หลัก
   * **ห้ามยิง API ซ้ำซ้อนที่ระดับ Component แสดงผล** เพื่อป้องกันการยิง Request ซ้ำและทำให้โค้ดเป็นระเบียบ

---

## 📁 โครงสร้างโฟลเดอร์หลัก

```text
frontend/
├── app/
│   ├── app.vue                 # จุดเริ่มต้นของแอปพลิเคชัน
│   ├── layouts/                 # Nuxt application shell (มี slot เพียงชั้นเดียวต่อ route)
│   │   ├── default.vue          # Desktop: Header + Sidebar + Main + Right Panel
│   │   └── mobile.vue           # Mobile: Main + Bottom Navigation
│   ├── pages/                  # หน้าต่างๆ (Smart Containers / API Fetching)
│   │   ├── index.vue           # หน้าหลัก (Live Map & Incident Feed)
│   │   ├── map.vue
│   │   ├── incidents.vue
│   │   ├── report-incident.vue
│   │   ├── login.vue           # หน้าเข้าสู่ระบบ
│   │   ├── register.vue        # หน้าสมัครสมาชิก
│   │   └── events/
│   │       └── [id].vue        # หน้า Event Room
│   ├── components/             # คอมโพเนนต์แสดงผล (Presentational Views)
│   │   ├── MapboxMap.vue       # ตัวเรนเดอร์แผนที่ที่ใช้ร่วมกัน
│   │   ├── layout/             # ส่วนย่อยของ Nuxt Layout เท่านั้น
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppSidebar.vue
│   │   │   └── AppRightPanel.vue
│   │   ├── common/             # UI ทั่วไปที่ใช้ร่วมกัน (ปุ่ม, โมดอล, อินพุต, Badge)
│   │   │   ├── AppButton.vue
│   │   │   ├── AppModal.vue
│   │   │   └── SeverityBadge.vue
│   │   ├── mobile/             # Global mobile shell เช่น AppBottomNav
│   │   ├── dashboard/          # ส่วนประกอบข้อมูลของ Dashboard
│   │   ├── incidents/          # ส่วนประกอบของ Incident
│   │   ├── report/             # ส่วนประกอบของการแจ้งเหตุ
│   │   └── pages/              # View เฉพาะหน้า; CSS อยู่ในไฟล์ Desktop/Mobile ของหน้านั้น
│   │       ├── index/
│   │       │   ├── Desktop.vue
│   │       │   └── Mobile.vue
│   │       ├── login/
│   │       │   ├── Desktop.vue
│   │       │   └── Mobile.vue
│   │       └── register/
│   │           ├── Desktop.vue
│   │           └── Mobile.vue
│   ├── composables/            # Reusable Logic & API Calls (useAuth, useIncidents, useMap)
│   │   ├── useAuth.js
│   │   ├── useIncident.js
│   │   └── useLocation.js
│   └── assets/                 # สไตล์ CSS, รูปภาพ, ฟอนต์
│       └── css/
│           └── main.css
├── nuxt.config.js
└── package.json
```

### กฎสำคัญเพื่อไม่ให้ Layout ซ้ำ

- `app.vue` เรียก `<NuxtLayout><NuxtPage /></NuxtLayout>` เพียงครั้งเดียว
- `layouts/default.vue` และ `layouts/mobile.vue` คือไฟล์เดียวที่มี Main `<slot />` สำหรับ shell ของแอป
- `components/layout/` ห้ามมี `<slot />` ระดับหน้าหลัก และห้ามมี component ชื่อ `AppLayout.vue` ซ้ำกับ Nuxt Layout
- Login และ Register ใช้ `definePageMeta({ layout: false })` ได้ เพราะไม่ใช่ Dashboard
- `components/pages/<route>/Desktop.vue` และ `Mobile.vue` แสดงเฉพาะเนื้อหาของ route นั้น ห้ามวาง Header, Sidebar หรือ Right Panel ซ้ำ

---

## 🎨 กฎการเขียน CSS (CSS Convention)

| ✅ ทำ | ❌ ห้ามทำ |
|---|---|
| ใช้ `<style scoped>` ใน Component ย่อย (Desktop/Mobile) | ❌ ห้ามใช้ Inline Style (`style="..."`) ใน Template |
| ใช้ class-based styling (`class="..."`) | ❌ ห้ามใช้ `:style="{ ... }"` สำหรับ static CSS |
| เขียน CSS แยกไว้ด้านล่างไฟล์ `.vue` | ❌ ห้ามเขียน CSS ใน `<script>` |
| ใช้ Dynamic class binding (`:class`) สำหรับ state-based styling | ❌ ห้ามยัด Tailwind utilities ยาวๆ ใน template เกิน 5 classes |

### ตัวอย่างการเขียน CSS ที่ถูกต้อง:
```vue
<template>
  <!-- ✅ ถูกต้อง: ใช้ class name ที่มีความหมาย -->
  <div class="user-card">
    <h2 class="user-card__name">{{ name }}</h2>
  </div>
</template>

<style scoped>
/* CSS เขียนแยกด้านล่าง — สะอาด อ่านง่าย */
.user-card {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
}

.user-card__name {
  font-size: 18px;
  color: #0f172a;
}
</style>
```

---

## 🔄 ตัวอย่างรูปแบบการทำงาน (Data Flow Example)

### 1. Page หลัก (`app/pages/index.vue`) — เป็น Smart Container
ทำหน้าที่ยิง API ดึงข้อมูลเหตุการณ์ และสลับ Component ตามขนาดหน้าจอ:

```vue
<script setup lang="ts">
import DesktopView from '~/components/pages/index/Desktop.vue';
import MobileView from '~/components/pages/index/Mobile.vue';

// 1. ดึงข้อมูลจาก API (ทำที่ Page เดียวเท่านั้น)
const { data: incidents, pending, refresh } = await useFetch('http://localhost:5000/incidents');

// 2. เช็คขนาดหน้าจอ (Desktop หรือ Mobile)
const windowWidth = ref(1024);
const updateWidth = () => { windowWidth.value = window.innerWidth; };
onMounted(() => { updateWidth(); window.addEventListener('resize', updateWidth); });
onUnmounted(() => { window.removeEventListener('resize', updateWidth); });
const isMobile = computed(() => windowWidth.value < 768);

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
  <div class="page-wrapper">
    <!-- Render สำหรับ Mobile -->
    <MobileView
      v-if="isMobile"
      :incidents="incidents"
      :loading="pending"
      @report="handleReportIncident"
    />

    <!-- Render สำหรับ Desktop -->
    <DesktopView
      v-else
      :incidents="incidents"
      :loading="pending"
      @report="handleReportIncident"
    />
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background-color: #f1f5f9;
}
</style>
```

### 2. Desktop Component (`app/components/pages/index/Desktop.vue`)
แสดงเฉพาะเนื้อหาของหน้าจอ Desktop เช่นแผนที่ — Header, Sidebar และ Right Panel อยู่ที่ `app/layouts/default.vue` แล้ว จึงไม่ต้องสร้างซ้ำใน component หน้านี้:
```vue
<script setup lang="ts">
defineProps<{
  incidents: any[];
  loading: boolean;
}>();

defineEmits(['report']);
</script>

<template>
  <main class="desktop-map">
    <div id="desktop-map"></div>
  </main>
</template>

<style scoped>
.desktop-map {
  height: 100vh;
  width: 100%;
}
</style>
```

### 3. Mobile Component (`app/components/pages/index/Mobile.vue`)
แสดงผลแบบ แผนที่เต็มจอ + แผ่นดึงด้านล่าง (Bottom Sheet) + ปุ่มแจ้งเหตุด่วน (FAB) — **CSS อยู่ใน `<style scoped>`**:
```vue
<script setup lang="ts">
defineProps<{
  incidents: any[];
  loading: boolean;
}>();

defineEmits(['report']);
</script>

<template>
  <div class="mobile-layout">
    <div id="mobile-map" class="mobile-map"></div>

    <button class="fab-button">
      🚨 แจ้งเหตุด่วน
    </button>

    <div class="bottom-sheet">
      <div class="bottom-sheet__handle"></div>
      <h3 class="bottom-sheet__title">เหตุการณ์ใกล้ตัวคุณ</h3>
    </div>
  </div>
</template>

<style scoped>
.mobile-layout {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.mobile-map {
  width: 100%;
  height: 100%;
}

.fab-button {
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  background-color: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  max-height: 50vh;
  overflow-y: auto;
}

.bottom-sheet__handle {
  width: 48px;
  height: 6px;
  background: #d1d5db;
  border-radius: 9999px;
  margin: 0 auto 12px;
}

.bottom-sheet__title {
  font-weight: bold;
}
</style>
```

---

## 🎯 ข้อดีของโครงสร้างนี้
1. **Separation of Concerns:** แยก Logic การดึงข้อมูล (API) ออกจาก Layout ทำให้ไม่งง
2. **ปรับแต่ง UX ได้อิสระ:** การใช้งานแผนที่บนมือถือ (เน้นสัมผัส/Bottom Sheet) ต่างจาก Desktop (เน้น Sidebar/เมาส์คลิก) สองส่วนนี้จะไม่ปนและไม่กระทบกัน
3. **ลดการยิง API ซ้ำ:** ทั้ง Mobile และ Desktop ใช้ข้อมูลชุดเดียวกันจาก Page หลัก
4. **CSS สะอาดและเป็นระเบียบ:** ใช้ `<style scoped>` ใน Component ย่อย ทำให้ Template อ่านง่าย CSS ไม่หลุดไปกระทบ Component อื่น
