<script setup>
import { computed } from "vue";
import StatusBadge from "~/components/common/StatusBadge.vue";
import { getReportStatus } from "~/composables/useHomeDashboard";

const props = defineProps({
  incident: { type: Object, required: true },
  incidentDetail: { type: Object, default: null },
  // ฟังก์ชันจาก usePlaceNames ที่ MapboxMap ส่งมาให้ ใช้หาชื่อสถานที่ของหมุด
  getPlaceLabel: { type: Function, default: null },
  // true = แสดงอยู่ใน bottom sheet บนมือถือ (กว้างเต็มจอ แทนกล่อง popup)
  inSheet: { type: Boolean, default: false },
});

// ชื่อสถานที่ของหมุดนี้ พอ Mapbox ส่งชื่อมา ค่านี้จะเปลี่ยนเองอัตโนมัติ
const placeLabel = computed(() => {
  if (!props.getPlaceLabel) {
    return "พื้นที่ที่รายงาน";
  }
  return props.getPlaceLabel(props.incident);
});

const emit = defineEmits(["close","open-report"]);

const openReport = (report) => {
  // ID ของกลุ่ม Marker
  const incidentId = props.incident.incidentId
  // ID ของรายงานคนนั้น
  const reportId = report.report_id
  // ส่งข้อมูลไปให้หน้าอื่นใช้งาน
  emit('open-report',
  {
    incidentId,
    reportId
  })
}

const reports = computed(() => {
  const reportList = props.incidentDetail?.reports;
  if (!Array.isArray(reportList)) return [];

  return [...reportList].sort((firstReport, secondReport) => {
    return new Date(secondReport.created_at) - new Date(firstReport.created_at);
  });
});

const reportCount = computed(() => {
  const countFromDetail = Number(props.incidentDetail?.incident?.report_count);
  if (Number.isFinite(countFromDetail) && countFromDetail > 0)
    return countFromDetail;

  return reports.value.length || Number(props.incident?.reportCount) || 1;
});

const getReporterInitial = (reporterName) => {
  const name = String(reporterName || "").trim();
  return name ? name.slice(0, 1).toUpperCase() : "?";
};

const getRelativeTime = (createdAt) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "เมื่อสักครู่";

  const minutesAgo = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60000),
  );
  if (minutesAgo < 1) return "เมื่อสักครู่";
  if (minutesAgo < 60) return `${minutesAgo} นาทีที่แล้ว`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} ชั่วโมงที่แล้ว`;

  return `${Math.floor(hoursAgo / 24)} วันที่แล้ว`;
};

const getImageLabel = (imageCount) => `${Number(imageCount) || 0} รูป`;

const incidentSummary = (incident) => {
  return (
    String(incident?.description || "").trim() || "ยังไม่มีรายละเอียดเพิ่มเติม"
  );
};
</script>

<template>
  <div
    class="incident-map-popup"
    :class="{ 'incident-map-popup--sheet': props.inSheet }"
    aria-live="polite"
  >
    <header class="incident-map-popup__header">
      <div class="incident-map-popup__group-title">
        <img :src="props.incident.iconUrl || '/icons/Alert.svg'" alt="" />
        <div>
          <h2>กลุ่มรายงาน{{ props.incident.category || "เหตุการณ์" }}</h2>
          <p>{{ reportCount }} รายงานในบริเวณนี้</p>
        </div>
      </div>

      <button
        class="incident-map-popup__close"
        type="button"
        aria-label="ปิดรายละเอียดเหตุการณ์"
        @click="$emit('close')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 7 10 10M17 7 7 17" />
        </svg>
      </button>
    </header>

    <section
      class="incident-map-popup__context"
      aria-label="ข้อมูลพื้นที่เหตุการณ์"
    >
      <p>
        <img src="/icons/Location.svg" alt="" aria-hidden="true" />
        {{ placeLabel }}
      </p>
      <!-- แสดงระยะทางเฉพาะเมื่อรู้ตำแหน่งผู้ใช้แล้ว -->
      <p
        v-if="props.incident.distanceFromUserLabel"
        class="incident-map-popup__distance"
      >
        {{ props.incident.distanceFromUserLabel }}
      </p>
    </section>

    <section
      v-if="props.incident.kind === 'incident'"
      class="incident-map-popup__reports"
      aria-label="รายงานในกลุ่มเหตุการณ์"
    >
      <span class="incident-map-popup__reports-heading">ล่าสุดก่อน</span>

      <p v-if="!reports.length" class="incident-map-popup__loading">
        กำลังโหลดรายงาน…
      </p>

      <div
        v-for="report in reports"
        :key="report.report_id"
        class="incident-map-popup__report"
      >
        <div class="incident-map-popup__avatar" aria-hidden="true">
          <img
            v-if="report.reporter_profile"
            :src="report.reporter_profile"
            alt=""
          />
          <span v-else>{{ getReporterInitial(report.reporter_name) }}</span>
        </div>

        <div class="incident-map-popup__report-content">
          <div class="incident-map-popup__report-meta">
            <p>
              <strong>{{ report.reporter_name || "ไม่ระบุชื่อ" }}</strong>
              <span aria-hidden="true">·</span>
              {{ getRelativeTime(report.created_at) }}
            </p>
            <StatusBadge
              :tone="getReportStatus(report.report_status).tone"
              :label="getReportStatus(report.report_status).label"
            />
          </div>

          <p class="incident-map-popup__report-description">
            {{ report.description || "ยังไม่มีรายละเอียดเพิ่มเติม" }}
          </p>
          <div class="incident-map-popup__report-footer">
            <div
              v-if="Number(report.image_count) > 0"
              class="incident-map-popup__report-media"
            >
              <img src="/icons/Photo.svg" alt="" aria-hidden="true" />
              {{ getImageLabel(report.image_count) }}
            </div>
            <button 
              class="incident-map-popup__report-link"
              type="button"
              @click="openReport(report)"
              >
              ดูรายละเอียดเพิ่มเติม
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="incident-map-popup__single-report">
      <p>{{ incidentSummary(props.incident) }}</p>
    </section>
  </div>
</template>

<style scoped>
.incident-map-popup {
  width: min(360px, calc(100vw - 32px));
  max-height: min(560px, calc(100dvh - 96px));
  overflow: hidden;
  color: #102968;
  font-family: inherit;
}

.incident-map-popup__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.incident-map-popup__group-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.incident-map-popup__group-title > img {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  object-fit: contain;
}
.incident-map-popup__group-title h2 {
  margin: 0;
  overflow: hidden;
  color: #123b78;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.incident-map-popup__group-title p {
  margin: 3px 0 0;
  color: #6480a8;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
}

.incident-map-popup__close {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 12px;
  background: #f1f6fc;
  color: #58719a;
  cursor: pointer;
}

.incident-map-popup__close:hover {
  background: #e2efff;
  color: #1d63c9;
}
.incident-map-popup__close:focus-visible {
  outline: 3px solid rgb(37 99 235 / 35%);
  outline-offset: 2px;
}
.incident-map-popup__close svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 2;
}

.incident-map-popup__context {
  display: grid;
  gap: 4px;
  margin-top: 14px;
  padding: 12px 0 14px;
  border-bottom: 1px solid #dce8f6;
}

.incident-map-popup__context p {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  color: #426b9f;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.35;
}
.incident-map-popup__context img {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  object-fit: contain;
}
.incident-map-popup__context .incident-map-popup__distance {
  padding-left: 25px;
  color: #5c7da9;
}

.incident-map-popup__reports {
  max-height: 340px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #b7cbe4 transparent;
}
.incident-map-popup__reports-heading {
  color: #6480a8;
  display: block;
  padding: 12px 0 8px;
  font-size: 12px;
  font-weight: 750;
  text-align: right;
  justify-content: space-between;
  color: #6a84a6;
  }
.incident-map-popup__loading {
  margin: 0;
  padding: 18px 0;
  color: #6b82a3;
  font-size: 14px;
  text-align: center;
}

.incident-map-popup__report {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 10px;
  padding: 13px 0;
  border-top: 1px solid #e1ebf7;
}
.incident-map-popup__avatar {
  display: grid;
  width: 40px;
  height: 40px;
  overflow: hidden;
  place-items: center;
  border-radius: 50%;
  background: #dcecff;
  color: #1e5cae;
  font-size: 15px;
  font-weight: 800;
}
.incident-map-popup__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.incident-map-popup__report-content {
  min-width: 0;
}
.incident-map-popup__report-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.incident-map-popup__report-meta p {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: #6681a6;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.incident-map-popup__report-meta strong {
  color: #163c77;
  font-weight: 800;
}
.incident-map-popup__report-meta p span {
  padding: 0 2px;
  color: #a4b4c8;
}
.incident-map-popup__report-description {
  display: -webkit-box;
  margin: 5px 0 0;
  overflow: hidden;
  color: #214878;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.incident-map-popup__report-footer{
  display: flex;
  align-items: center;
  min-height: 24px;
}
.incident-map-popup__report-media {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  color: #5275a2;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.25;
}
.incident-map-popup__report-media img {
  width: 17px;
  height: 17px;
  object-fit: contain;
}

.incident-map-popup__report-link{
  margin-left: auto;
  padding: 3px 0;
  border: 0;
  background: transparent;
  color: #2378df;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.incident-map-popup__single-report {
  margin-top: 14px;
  color: #527198;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.45;
}
.incident-map-popup__single-report p {
  margin: 0;
}

/* แบบ bottom sheet: กว้างเต็ม sheet และให้รายการรายงานเลื่อนได้ในความสูงที่เหลือ */
.incident-map-popup--sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: none;
  height: 100%;
}
.incident-map-popup--sheet .incident-map-popup__reports {
  flex: 1;
  min-height: 0;
  max-height: none;
}

@media (max-width: 420px) {
  .incident-map-popup:not(.incident-map-popup--sheet) {
    width: calc(100vw - 36px);
    max-height: min(520px, calc(100dvh - 80px));
  }
  .incident-map-popup__reports {
    max-height: 300px;
  }
  .incident-map-popup__group-title h2 {
    font-size: 17px;
  }
}
</style>
