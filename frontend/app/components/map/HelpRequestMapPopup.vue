<script setup>
import { computed } from "vue";

// รับ props ชื่อเดียวกับ IncidentMapPopup เพื่อให้สลับใช้แทนกันได้เลย
const props = defineProps({
  // หมุดคำขอความช่วยเหลือที่เลือก (ข้อมูลจาก normalizeHelpRequest)
  incident: { type: Object, required: true },
  // ฟังก์ชันจาก usePlaceNames ใช้หาชื่อสถานที่ของหมุด
  getPlaceLabel: { type: Function, default: null },
  // true = แสดงอยู่ใน bottom sheet บนมือถือ
  inSheet: { type: Boolean, default: false },
});

defineEmits(["close"]);

// จำนวนผู้เสนอช่วย: ตอนนี้ยังไม่มีระบบจริง ใช้ตัวเลขสมมติไปก่อน
const MOCK_OFFER_COUNT = 1;

// ชื่อสถานที่ พอ Mapbox ส่งชื่อมา ค่านี้จะเปลี่ยนเองอัตโนมัติ
const placeLabel = computed(() => {
  if (!props.getPlaceLabel) {
    return "พื้นที่ที่ขอความช่วยเหลือ";
  }
  return props.getPlaceLabel(props.incident);
});

// บรรทัดข้อมูลย่อยใต้หัวข้อ เช่น "พื้นที่โดยประมาณ · พระโขนง · ห่าง 2.4 กม. · 12 นาทีที่แล้ว"
const metaLine = computed(() => {
  const parts = ["พื้นที่โดยประมาณ", placeLabel.value];

  if (props.incident.distanceFromUserLabel) {
    parts.push(props.incident.distanceFromUserLabel);
  }
  if (props.incident.time) {
    parts.push(props.incident.time);
  }

  return parts.join(" · ");
});

// ป้ายข้อมูลสั้น ๆ ใต้หัวข้อ
// (ประเภทความช่วยเหลือแสดงเป็นหัวข้ออยู่แล้ว จึงไม่ใส่ซ้ำในป้าย)
const tags = computed(() => {
  const tagList = [];
  tagList.push(`${props.incident.peopleCount || 1} คน`);
  return tagList;
});

const description = computed(() => {
  const text = String(props.incident.description || "").trim();
  if (text) {
    return text;
  }
  return "ยังไม่มีรายละเอียดเพิ่มเติม";
});

// ปุ่มยังไม่ได้ต่อระบบจริง กดแล้วยังไม่ทำอะไร
const offerHelp = () => {
  // TODO: ต่อกับระบบเสนอความช่วยเหลือเมื่อมี API
};

const openDetail = () => {
  // TODO: ไปหน้ารายละเอียดคำขอความช่วยเหลือเมื่อมีหน้านี้
};
</script>

<template>
  <div
    class="help-popup"
    :class="{ 'help-popup--sheet': props.inSheet }"
    aria-live="polite"
  >
    <header class="help-popup__header">
      <!-- สถานะของคำขอ พร้อมไอคอนประเภทความช่วยเหลือ -->
      <span class="help-popup__status">
        <img :src="props.incident.iconUrl || '/icons/Help.svg'" alt="" aria-hidden="true" />
        รอการช่วยเหลือ
      </span>

      <button
        class="help-popup__close"
        type="button"
        aria-label="ปิดรายละเอียดคำขอความช่วยเหลือ"
        @click="$emit('close')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 7 10 10M17 7 7 17" />
        </svg>
      </button>
    </header>

    <h2 class="help-popup__title">{{ props.incident.title || "คำขอความช่วยเหลือ" }}</h2>
    <p class="help-popup__meta">{{ metaLine }}</p>

    <ul class="help-popup__tags" aria-label="ข้อมูลคำขอ">
      <li v-for="tag in tags" :key="tag">{{ tag }}</li>
    </ul>

    <p class="help-popup__description">{{ description }}</p>

    <!-- บอกผู้ช่วยว่าตำแหน่งจริงยังถูกซ่อนอยู่ -->
    <p class="help-popup__privacy">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      ตำแหน่งจริงจะแสดงหลังผู้ขออนุมัติคุณ
    </p>

    <p class="help-popup__offers">มีผู้เสนอช่วยแล้ว {{ MOCK_OFFER_COUNT }} คน</p>

    <div class="help-popup__actions">
      <button type="button" class="help-popup__offer-button" @click="offerHelp">
        เสนอช่วยเหลือ
      </button>
      <button type="button" class="help-popup__detail-button" @click="openDetail">
        ดูรายละเอียด
      </button>
    </div>
  </div>
</template>

<style scoped>
.help-popup {
  width: min(360px, calc(100vw - 32px));
  color: #102968;
  font-family: inherit;
}

/* แบบ bottom sheet: กว้างเต็ม sheet และเลื่อนดูได้ถ้าเนื้อหายาว */
.help-popup--sheet {
  width: 100%;
  overflow-y: auto;
}

.help-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* ป้ายสถานะ "รอการช่วยเหลือ" */
.help-popup__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fde8e8;
  color: #b4232a;
  font-size: 14px;
  font-weight: 800;
}

.help-popup__status img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.help-popup__close {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 12px;
  background: #f1f6fc;
  color: #102968;
  cursor: pointer;
}

.help-popup__close:hover {
  background: #e2efff;
}

.help-popup__close:focus-visible {
  outline: 3px solid rgb(37 99 235 / 35%);
  outline-offset: 2px;
}

.help-popup__close svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 2;
}

.help-popup__title {
  margin: 14px 0 0;
  color: #102968;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
}

.help-popup__meta {
  margin: 6px 0 0;
  color: #60718c;
  font-size: 14px;
  line-height: 1.5;
}

/* ป้ายข้อมูล: ประเภทความช่วยเหลือ, จำนวนคน */
.help-popup__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.help-popup__tags li {
  padding: 6px 12px;
  border-radius: 10px;
  background: #edf4fe;
  color: #1f3f6e;
  font-size: 14px;
  font-weight: 700;
}

.help-popup__description {
  margin: 14px 0 0;
  color: #17345f;
  font-size: 15px;
  line-height: 1.5;
}

/* กล่องบอกว่าตำแหน่งจริงยังถูกซ่อน */
.help-popup__privacy {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f1f5fb;
  color: #4b5f80;
  font-size: 14px;
}

.help-popup__privacy svg {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.help-popup__offers {
  margin: 14px 0 0;
  color: #18764a;
  font-size: 14px;
  font-weight: 800;
}

.help-popup__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.help-popup__offer-button,
.help-popup__detail-button {
  min-height: 46px;
  padding: 0 12px;
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  font-weight: 800;
}

/* ปุ่มหลัก "เสนอช่วยเหลือ" สีแดง */
.help-popup__offer-button {
  border: 0;
  background: #e5262f;
  color: #ffffff;
}

.help-popup__offer-button:hover {
  background: #c81e26;
}

.help-popup__detail-button {
  border: 1px solid #d4dfee;
  background: #ffffff;
  color: #1d63d8;
}

.help-popup__detail-button:hover {
  background: #f3f8ff;
}

.help-popup__offer-button:focus-visible,
.help-popup__detail-button:focus-visible {
  outline: 3px solid rgb(37 99 235 / 35%);
  outline-offset: 2px;
}
</style>
