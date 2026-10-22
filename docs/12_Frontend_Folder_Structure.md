# โครงสร้าง Frontend ปัจจุบัน

เอกสารนี้อธิบายโครงสร้างที่มีอยู่จริงใน `frontend/` ของ GeoSpread ณ ปัจจุบัน เพื่อให้หาไฟล์ได้เร็วและแยกหน้าที่ของแต่ละโฟลเดอร์ได้ชัดเจน

## ภาพรวม

```text
frontend/
├── app/
│   ├── app.vue                 # จุดเริ่ม Nuxt: NuxtLayout + NuxtPage
│   ├── layouts/                # เปลือกของหน้าจอแต่ละโหมด
│   ├── middleware/             # ตรวจอุปกรณ์และสิทธิ์ก่อนเข้า route
│   ├── pages/                  # Route ของ Nuxt: 1 ไฟล์ = 1 URL
│   ├── components/             # UI ที่นำกลับมาใช้ได้
│   ├── composables/            # state, API และ logic ที่ใช้ซ้ำ
│   ├── data/                   # ข้อมูลคงที่สำหรับ UI
│   └── plugins/                # Nuxt plugin ฝั่ง client
├── public/                     # ไฟล์ static แยกเป็น icons, images และ logos
├── nuxt.config.js              # Nuxt modules และ runtime config
└── package.json                # scripts และ dependencies
```

> `node_modules/`, `.nuxt/` และ `.output/` เป็นไฟล์จาก dependency หรือ build ไม่ใช่โค้ดที่ต้องแก้โดยตรง

## Route และ Page

ไฟล์ใน `app/pages/` สร้าง URL อัตโนมัติตามชื่อและตำแหน่งของไฟล์

| URL | ไฟล์ | หน้าที่ |
| --- | --- | --- |
| `/` | `app/pages/index.vue` | เลือก Home view สำหรับ Desktop หรือ Mobile และกำหนด right panel |
| `/incidents` | `app/pages/incidents.vue` | หน้ารายการเหตุการณ์ |
| `/report-incident` | `app/pages/report-incident.vue` | หน้าแจ้งเหตุ |
| `/request-help` | `app/pages/request-help.vue` | หน้าขอความช่วยเหลือ |
| `/help-requests` | `app/pages/help-requests.vue` | หน้ารายการขอความช่วยเหลือ |
| `/login`, `/register` | `app/pages/login.vue`, `app/pages/register.vue` | การเข้าสู่ระบบและสมัครสมาชิก |
| `/admin` | `app/pages/admin/index.vue` | Dashboard ผู้ดูแลระบบ |
| `/admin/incidents` | `app/pages/admin/incidents.vue` | ตรวจทานเหตุการณ์สำหรับผู้ดูแล |
| `/admin/users` | `app/pages/admin/users.vue` | จัดการผู้ใช้สำหรับผู้ดูแล |

ไฟล์หน้าอื่น เช่น `profile.vue`, `settings.vue`, `notifications.vue`, `followed-locations.vue` และ `safety-guide.vue` อยู่ในตำแหน่งเดียวกันและใช้หลักเดียวกัน

## Layout และ Middleware

```text
app/layouts/
├── default.vue   # Desktop shell: Header + Sidebar + เนื้อหาหลัก + Right Panel ตาม route meta
├── mobile.vue    # Mobile shell: เนื้อหาหลัก + Bottom Navigation
└── admin.vue     # Admin shell: AdminSidebar + AdminTopbar + เนื้อหา

app/middleware/
├── device.js     # ระบุ mobile/desktop และเก็บลง responsive state
└── admin.js      # กัน route ผู้ดูแลสำหรับผู้ที่ไม่ได้ล็อกอินหรือไม่ใช่ admin
```

`app/app.vue` เป็นจุดเดียวที่เรียก `<NuxtLayout>` และ `<NuxtPage>` จึงไม่ควรสร้าง layout shell ซ้ำใน component ของหน้า

## Components: หาไฟล์จากสิ่งที่ต้องแก้

```text
app/components/
├── MapboxMap.vue             # ตัว Mapbox หลักที่ใช้ซ้ำ
├── admin/                    # UI สำหรับผู้ดูแลระบบ
├── common/                   # UI ใช้ซ้ำทั่วไป เช่น AppButton
├── dashboard/                # ส่วนย่อยบนหน้าหลัก Desktop
├── incidents/                # การ์ดและ filter ของหน้ารายการเหตุการณ์
├── layout/                   # Header, sidebar และ right panel ของ layout
├── map/                      # Popup และเครื่องมือค้นหาบนแผนที่
├── mobile/                   # Bottom navigation และ mobile-only UI
├── pages/                    # หน้าตาเฉพาะ route แยกตามขนาดหน้าจอ
│   ├── index/Desktop.vue     # หน้าแรกบน Desktop
│   ├── index/Mobile.vue      # หน้าแรกบน Mobile
│   ├── login/Desktop.vue
│   ├── login/Mobile.vue
│   ├── register/Desktop.vue
│   └── register/Mobile.vue
├── report/                   # UI แจ้งเหตุและเลือกตำแหน่ง
└── request-help/             # UI ขอความช่วยเหลือ
```

### ทางลัดสำหรับงานที่พบบ่อย

| ต้องการแก้ | เริ่มดูที่ |
| --- | --- |
| แผนที่หน้าหลัก | `components/pages/index/Desktop.vue` หรือ `Mobile.vue` → `components/MapboxMap.vue` |
| Popup ของหมุด | `components/map/IncidentMapPopup.vue` |
| ช่องค้นหา/ใช้ตำแหน่งปัจจุบันบนแผนที่ | `components/map/MapLocationSearch.vue` |
| การ์ดเหตุการณ์ใกล้ตัว | `components/dashboard/NearbyIncidents.vue` |
| data และ state ของแผนที่หน้าหลัก | `composables/useHomeDashboard.js` |
| ฟอร์มแจ้งเหตุ | `components/report/ReportIncidentForm.vue` |
| UI ของ sidebar/header | `components/layout/` |
| เส้นทางและชื่อเมนูผู้ดูแล | `pages/admin/` และ `components/layout/AdminSidebar.vue` |

## Composables และ Data

```text
app/composables/
├── useAuth.js                # สถานะการเข้าสู่ระบบและบทบาท
├── useHomeDashboard.js       # ข้อมูล/การเลือกเหตุการณ์/แผนที่หน้าหลัก
├── useAdminReview.js         # ข้อมูลและ action สำหรับตรวจทานเหตุการณ์
├── useGeolocation.js         # ขอพิกัดตำแหน่งปัจจุบัน
├── useIncidentIcon.js        # เลือกไอคอนเหตุการณ์
├── useHelpRequestIcon.js     # เลือกไอคอนขอความช่วยเหลือ
├── useReportIncident.js      # logic สำหรับแจ้งเหตุ
└── useResponsiveView.js      # สลับการแสดง Desktop/Mobile

app/data/
└── reportIncidentGuides.js   # ข้อมูลคงที่ของหน้าแจ้งเหตุ
```

กฎใช้งานง่าย ๆ: ถ้าโค้ดเกี่ยวกับการเรียก API, state ที่แชร์, หรือการแปลงข้อมูล ให้เริ่มค้นใน `composables/`; ถ้าเป็น HTML/CSS ของส่วนที่เห็น ให้เริ่มค้นใน `components/`

## Public Assets

ปัจจุบัน icon และรูป static อยู่ใน `public/` ระดับเดียวกันทั้งหมด เช่น:

```text
public/
├── icons/                      # SVG ทั้งหมด เช่น Alert.svg, Location.svg, Report.svg
├── images/                     # ภาพเนื้อหา/พื้นหลัง เช่น login-community-background.png
└── logos/                      # โลโก้ เช่น logo.png
```

ใช้ในโค้ดผ่าน path ที่เริ่มด้วย `/`:

```vue
<img src="/icons/Alert.svg" alt="" />
```

เมื่อเพิ่ม asset ใหม่ ให้เลือกหมวดก่อนเสมอ: ไอคอน SVG อยู่ใน `icons/`, รูปภาพอยู่ใน `images/`, และโลโก้อยู่ใน `logos/`

## วิธีสำรวจโครงสร้าง

ใช้คำสั่งด้านล่างจากโฟลเดอร์รากของโปรเจกต์:

```powershell
# ดูเฉพาะโฟลเดอร์ที่สำคัญ
tree /a frontend\app
tree /a backend\src

# ค้นหาว่า component ถูกเรียกใช้ที่ใด
rg -n "NearbyIncidents" frontend

# ดูรายชื่อไฟล์ frontend โดยไม่รวม dependency/build output
rg --files frontend -g '!node_modules' -g '!.nuxt' -g '!.output'
```

## ข้อตกลงสำหรับไฟล์ใหม่

1. เพิ่ม route ใหม่ใน `app/pages/` เท่านั้น
2. UI ที่ใช้เฉพาะ feature ให้อยู่ใน `components/<feature>/`
3. UI ที่ใช้ซ้ำหลาย feature ให้อยู่ใน `components/common/`
4. logic หรือ state ที่ใช้มากกว่าหนึ่ง component ให้อยู่ใน `composables/`
5. ไฟล์ Desktop/Mobile ของ route เดียวกันให้อยู่คู่กันใน `components/pages/<route>/`
6. ก่อนสร้างโฟลเดอร์ใหม่ ให้ตรวจชื่อ feature เดิมก่อน เพื่อไม่ให้มีชื่อซ้ำ เช่น `incident`, `incidents` หรือ `map` กระจายหลายที่โดยไม่มีเหตุผล

## หมายเหตุเรื่องการจัดระเบียบรอบถัดไป

โครงสร้างปัจจุบันใช้งานได้ จึงไม่ควรย้ายไฟล์จำนวนมากระหว่างทำ feature เล็ก ๆ งานจัดระเบียบที่ปลอดภัยที่สุดคือ:

1. ลบโฟลเดอร์ว่างที่ไม่มี route หรือ import รองรับ
2. พิจารณาย้าย `components/MapboxMap.vue` เข้า `components/map/` พร้อมแก้ imports ทั้งหมดใน PR เดียว
