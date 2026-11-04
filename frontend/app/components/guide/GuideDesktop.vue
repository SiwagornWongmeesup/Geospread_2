<template>
  <!-- หน้าคู่มือแบบจอคอม: เลือกหัวข้อด้านบน ดูทีละเหตุ แล้วจัดเนื้อหาเป็นคอลัมน์ให้เห็นครบในจอเดียว -->
  <div class="guide-desktop">
    <header class="guide-desktop__top">
      <div class="guide-desktop__intro">
        <h2 :id="`guide-title-${activeTopic}`">{{ t(`guideTopics.${activeTopic}`) }}</h2>
        <p>{{ t('safetyGuidePage.intro') }}</p>
      </div>

      <nav class="guide-desktop__numbers" :aria-label="t('safetyGuidePage.numbersLabel')">
        <a
          v-for="item in emergencyNumbers"
          :key="item.number"
          :href="`tel:${item.number}`"
          class="guide-desktop__number"
          :aria-label="t('safetyGuidePage.callNumber', { number: item.number, label: t(`safetyGuidePage.numbers.${item.key}`) })"
        >
          <strong>{{ item.number }}</strong>
          <span>{{ t(`safetyGuidePage.numbers.${item.key}`) }}</span>
        </a>
      </nav>
    </header>

    <article v-if="guide" class="guide-desktop__guide" :aria-labelledby="`guide-title-${activeTopic}`">

      <!-- ช่วงของเหตุ: เห็นคำสั่งหลักของทั้ง 3 ช่วงพร้อมกัน ช่วงที่เลือกเป็นแถบเหลือง -->
      <div
        class="guide-desktop__phases"
        role="tablist"
        :aria-label="t('safetyGuidePage.phasesLabel', { topic: guide.title })"
        @keydown="onPhaseKeydown"
      >
        <button
          v-for="item in guide.phases"
          :id="`phase-tab-${item.key}`"
          :key="item.key"
          ref="phaseButtons"
          type="button"
          role="tab"
          class="guide-desktop__phase"
          :aria-selected="item.key === phase.key"
          aria-controls="phase-panel"
          :tabindex="item.key === phase.key ? 0 : -1"
          @click="activePhase = item.key"
        >
          <span class="guide-desktop__phase-name">{{ t(`safetyGuidePage.phases.${item.key}`) }}</span>
          <span class="guide-desktop__phase-command">
            <!-- แต่ละคำไม่ตัดกลางคำ ให้ขึ้นบรรทัดใหม่ได้เฉพาะหลังจุดคั่น -->
            <template v-for="(word, index) in item.summary.split('·')" :key="index">
              <span class="guide-desktop__command-word">{{ word.trim() }}</span>
              <span v-if="index < item.summary.split('·').length - 1" aria-hidden="true"> · </span>
            </template>
          </span>
        </button>
      </div>

      <div id="phase-panel" class="guide-desktop__panel" role="tabpanel" :aria-labelledby="`phase-tab-${phase.key}`">
        <div class="guide-desktop__main">
          <div class="guide-desktop__col guide-desktop__col--steps">
            <section v-for="section in stepSections" :key="section.title" class="guide-section">
              <h3>{{ section.title }}</h3>
              <ol class="guide-steps">
                <li v-for="item in section.items" :key="item.title + item.detail">
                  <strong>{{ item.title }}</strong>
                  <span v-if="item.detail">{{ item.detail }}</span>
                </li>
              </ol>
            </section>
          </div>

          <div v-if="sideSections.length" class="guide-desktop__col">
            <section
              v-for="section in sideSections"
              :key="section.title"
              class="guide-section"
              :class="{ 'guide-section--dont': section.kind === 'dont' }"
            >
              <h3>
                <svg v-if="section.kind === 'dont'" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m5.7 5.7 12.6 12.6" />
                </svg>
                {{ section.title }}
              </h3>
              <ul class="guide-points">
                <li v-for="item in section.items" :key="item.title + item.detail">
                  <strong v-if="item.title">{{ item.title }}</strong>
                  {{ item.detail }}
                </li>
              </ul>
            </section>
          </div>
        </div>

        <section v-if="scenarioSections.length" class="guide-desktop__scenarios" :aria-label="t('safetyGuidePage.scenarios')">
          <h3 class="guide-desktop__scenarios-title">{{ t('safetyGuidePage.scenarios') }}</h3>
          <div class="guide-desktop__scenario-grid">
            <section v-for="section in scenarioSections" :key="section.title" class="guide-scenario">
              <h4>{{ section.title }}</h4>
              <ol class="guide-steps guide-steps--compact">
                <li v-for="item in section.items" :key="item.title + item.detail">
                  <strong>{{ item.title }}</strong>
                  <span v-if="item.detail">{{ item.detail }}</span>
                </li>
              </ol>
            </section>
          </div>
        </section>
      </div>

      <p v-if="guide.references.length" class="guide-desktop__references">
        {{ t('safetyGuidePage.references') }} {{ guide.references.join(' · ') }}.
        {{ t('safetyGuidePage.referencesNote') }}
      </p>
    </article>

    <!-- หัวข้อที่ยังไม่มีไฟล์คู่มือ -->
    <section v-else class="guide-desktop__draft">
      <p>{{ t('safetyGuidePage.draftBody') }}</p>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { emergencyNumbers, guideCategories } from '~/utils/emergencyGuides'

const props = defineProps({
  // { topic: guide | null } จาก getEmergencyGuide()
  guides: { type: Object, required: true },
})

const { t } = useLocale()
const route = useRoute()
const router = useRouter()

const allTopics = guideCategories.flatMap((category) => category.topics)
const firstReadyTopic = allTopics.find((topic) => props.guides[topic]) ?? allTopics[0]

const activeTopic = ref(firstReadyTopic)
// เริ่มที่ "ระหว่างเกิด" เพราะคนที่เปิดตอนตกใจส่วนใหญ่อยู่ในเหตุแล้ว
const activePhase = ref('during')
const phaseButtons = ref([])

const guide = computed(() => props.guides[activeTopic.value])

const phase = computed(() => {
  const phases = guide.value?.phases ?? []
  return phases.find((item) => item.key === activePhase.value) ?? phases[0] ?? { key: '', sections: [] }
})

// คอลัมน์ซ้าย = ขั้นตอนหลัก, คอลัมน์ขวา = ห้ามทำ / สัญญาณ / ข้อควรระวัง, แถวล่าง = สถานการณ์เฉพาะ
const stepSections = computed(() => phase.value.sections.filter((section) => section.kind === 'main' && section.ordered))
const sideSections = computed(() =>
  phase.value.sections
    .filter((section) => section.kind === 'dont' || (section.kind === 'main' && !section.ordered))
    .sort((a, b) => (a.kind === 'dont' ? -1 : 0) - (b.kind === 'dont' ? -1 : 0)),
)
const scenarioSections = computed(() => phase.value.sections.filter((section) => section.kind === 'scenario'))

const selectTopic = (topic) => {
  router.replace({ hash: `#${topic}` })
}

// เปิดจากหมุดหรือเมนูด้วย /safety-guide#flood (อ่านหลัง mount เพราะตอน SSR ไม่รู้ hash)
const syncFromHash = () => {
  const topic = route.hash.slice(1)
  if (!allTopics.includes(topic)) return
  activeTopic.value = topic
  activePhase.value = 'during'
}

onMounted(syncFromHash)
watch(() => route.hash, syncFromHash)

const onPhaseKeydown = async (event) => {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
  if (!step) return
  event.preventDefault()
  const phases = guide.value.phases
  const next = (phases.findIndex((item) => item.key === phase.value.key) + step + phases.length) % phases.length
  activePhase.value = phases[next].key
  await nextTick()
  phaseButtons.value[next]?.focus()
}
</script>

<style scoped>
.guide-desktop {
  --guide-signal: #f4c542;
  --guide-signal-ink: #2b2000;
  max-width: 82rem;
  padding: 2rem 2.5rem 4rem;
  box-sizing: border-box;
}

/* ===== ส่วนบน: ชื่อหน้า + เบอร์ฉุกเฉิน ===== */
.guide-desktop__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 2rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid var(--gs-line);
}

.guide-desktop__intro h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.guide-desktop__intro p {
  max-width: 46ch;
  margin: 0.5rem 0 0;
  color: var(--gs-muted);
  font-size: 1rem;
  line-height: 1.6;
}

.guide-desktop__numbers {
  display: grid;
  grid-template-columns: repeat(4, minmax(7.5rem, auto));
  border-radius: var(--gs-radius);
  background: var(--gs-ink);
  overflow: hidden;
}

.guide-desktop__number {
  display: grid;
  gap: 0.1rem;
  padding: 0.75rem 1.1rem;
  color: #fff;
  text-decoration: none;
  transition: background-color 160ms ease;
}

.guide-desktop__number + .guide-desktop__number {
  border-left: 1px solid rgb(255 255 255 / 14%);
}

.guide-desktop__number:hover {
  background: rgb(255 255 255 / 8%);
}

.guide-desktop__number:focus-visible {
  outline: 3px solid var(--guide-signal);
  outline-offset: -3px;
}

.guide-desktop__number strong {
  color: var(--guide-signal);
  font-size: 1.6rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.guide-desktop__number span {
  color: rgb(255 255 255 / 80%);
  font-size: 0.8rem;
  line-height: 1.35;
  white-space: nowrap;
}

.guide-desktop__phase:focus-visible {
  outline: none;
  box-shadow: var(--gs-focus);
}

/* ===== คู่มือของเหตุที่เลือก ===== */
.guide-desktop__guide {
  padding-top: 1.5rem;
  border-top: 1px solid var(--gs-line);
}

.guide-desktop__phases {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.guide-desktop__phase {
  display: grid;
  align-content: start;
  gap: 0.3rem;
  min-height: 5.5rem;
  padding: 0.9rem 1.15rem;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius-sm);
  background: var(--gs-surface-sunken);
  color: var(--gs-ink-2);
  text-align: left;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.guide-desktop__phase:hover {
  border-color: var(--gs-line-strong);
  background: var(--gs-surface);
}

.guide-desktop__phase-name {
  color: var(--gs-muted);
  font-size: 0.85rem;
  font-weight: 700;
}

.guide-desktop__phase-command {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.3;
  text-wrap: balance;
}

.guide-desktop__command-word {
  white-space: nowrap;
}

.guide-desktop__phase[aria-selected='true'] {
  border-color: var(--guide-signal);
  background: var(--guide-signal);
  color: var(--guide-signal-ink);
}

.guide-desktop__phase[aria-selected='true'] .guide-desktop__phase-name {
  color: var(--guide-signal-ink);
}

.guide-desktop__phase[aria-selected='true'] .guide-desktop__phase-command {
  font-size: 1.45rem;
  font-weight: 800;
}

/* ===== เนื้อหาของช่วง: ขั้นตอนซ้าย ข้อห้าม/ข้อควรรู้ขวา ===== */
.guide-desktop__main {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 3rem;
  padding-top: 2rem;
}

.guide-desktop__col {
  display: grid;
  align-content: start;
  gap: 2rem;
}

.guide-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
  color: var(--gs-ink);
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.35;
}

.guide-steps {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
}

.guide-steps li {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  padding: 0.95rem 0;
  border-top: 1px solid var(--gs-line);
  counter-increment: step;
}

.guide-steps li::before {
  grid-row: 1 / 3;
  content: counter(step);
  color: var(--gs-ink);
  font-size: 2rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.guide-steps strong {
  color: var(--gs-ink);
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.4;
}

.guide-steps span {
  margin-top: 0.15rem;
  color: var(--gs-muted);
  font-size: 0.95rem;
  line-height: 1.55;
}

.guide-points {
  display: grid;
  gap: 0.15rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.guide-points li {
  position: relative;
  padding: 0.5rem 0 0.5rem 1.2rem;
  color: var(--gs-ink-2);
  font-size: 0.98rem;
  line-height: 1.6;
}

.guide-points li::before {
  position: absolute;
  top: 1.1em;
  left: 0.2rem;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 1px;
  background: var(--gs-ink-2);
  content: '';
}

.guide-points strong {
  color: var(--gs-ink);
  font-weight: 700;
}

/* ห้ามทำ: แดงใช้เฉพาะส่วนนี้ */
.guide-section--dont {
  padding: 1.1rem 1.25rem 0.75rem;
  border-radius: var(--gs-radius);
  background: var(--gs-danger-tint);
}

.guide-section--dont h3 {
  color: var(--gs-danger);
}

.guide-section--dont h3 svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 2.2;
}

.guide-section--dont .guide-points li {
  padding-left: 1.6rem;
  color: var(--gs-ink);
  font-weight: 500;
}

.guide-section--dont .guide-points li::before {
  top: 0.95em;
  left: 0.1rem;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 0;
  background: var(--gs-danger);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3.2' stroke-linecap='round'%3E%3Cpath d='m6 6 12 12M18 6 6 18'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3.2' stroke-linecap='round'%3E%3Cpath d='m6 6 12 12M18 6 6 18'/%3E%3C/svg%3E") center / contain no-repeat;
}

/* ===== สถานการณ์เฉพาะ: เรียงเป็นคอลัมน์ ให้กวาดตาหาเรื่องที่ตรงกับตัวเองได้เร็ว ===== */
.guide-desktop__scenarios {
  margin-top: 3rem;
}

.guide-desktop__scenarios-title {
  margin: 0 0 1rem;
  color: var(--gs-ink);
  font-size: 1.15rem;
  font-weight: 800;
}

.guide-desktop__scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.5rem 2rem;
}

.guide-scenario {
  padding-top: 0.85rem;
  border-top: 3px solid var(--gs-ink);
}

.guide-scenario h4 {
  margin: 0 0 0.25rem;
  color: var(--gs-ink);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.35;
}

.guide-steps--compact li {
  grid-template-columns: 1.75rem minmax(0, 1fr);
  padding: 0.6rem 0;
}

.guide-steps--compact li:first-child {
  border-top: 0;
}

.guide-steps--compact li::before {
  font-size: 1.15rem;
  line-height: 1.3;
}

.guide-steps--compact strong {
  font-size: 0.98rem;
}

.guide-steps--compact span {
  font-size: 0.88rem;
}

.guide-desktop__references {
  max-width: 75ch;
  margin: 3rem 0 0;
  padding-top: 1rem;
  border-top: 1px solid var(--gs-line);
  color: var(--gs-muted);
  font-size: 0.85rem;
  line-height: 1.6;
}

.guide-desktop__draft {
  padding: 2.5rem 0;
  border-top: 1px solid var(--gs-line);
}

.guide-desktop__draft p {
  max-width: 55ch;
  margin: 0.5rem 0 0;
  color: var(--gs-muted);
  line-height: 1.6;
}

/* จอคอมขนาดเล็ก: เบอร์ฉุกเฉินลงไปอยู่ใต้ชื่อ และเนื้อหาเหลือคอลัมน์เดียว */
@media (max-width: 72rem) {
  .guide-desktop__top {
    grid-template-columns: minmax(0, 1fr);
  }

  .guide-desktop__numbers {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 60rem) {
  .guide-desktop {
    padding: 1.5rem;
  }

  .guide-desktop__main {
    grid-template-columns: minmax(0, 1fr);
    gap: 2rem;
  }

  .guide-desktop__intro h2 {
    font-size: 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .guide-desktop__number,
  .guide-desktop__phase {
    transition: none;
  }
}
</style>
