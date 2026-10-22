<script setup>
const notice = useState('adminNotice', () => '')

const cards = [
  ['รายงานเหตุการณ์', '128', '12%', 'red', '/icons/Warning-Error.svg', 'up'], ['คำขอความช่วยเหลือ', '56', '8%', 'blue', '/icons/Help.svg', 'up'],
  ['ยืนยันแล้ว', '42', '20%', 'green', '/icons/Selected.svg', 'up'], ['รอตรวจสอบ', '18', '15%', 'yellow', '/icons/Alert.svg', 'down'],
  ['ผู้ใช้ทั้งหมด', '12,482', '5%', 'purple', '/icons/Users.svg', 'up'], ['คะแนนความน่าเชื่อถือ', '8.3/10', '0.4', 'green', '/icons/Selected.svg', 'up'],
]
const incidents = [
  ['ไฟป่าใกล้ดอยสุเทพ', 'สุเทพ, เชียงใหม่', 'อัคคีภัย', '/icons/Fire.svg', 'สูง', 'รอตรวจสอบ', '28 นาทีที่แล้ว', 'red'],
  ['ฝนหนักทำให้น้ำท่วมขัง', 'ช้างเผือก, เชียงใหม่', 'น้ำท่วม', '/icons/Flood.svg', 'ปานกลาง', 'ยืนยันแล้ว', '1 ชั่วโมงที่แล้ว', 'blue'],
  ['ต้นไม้ล้มกีดขวางถนน', 'สันทราย, เชียงใหม่', 'อุบัติเหตุ', '/icons/Roadblock.svg', 'ปานกลาง', 'รอตรวจสอบ', '2 ชั่วโมงที่แล้ว', 'orange'],
  ['ดินสไลด์หลังฝนตกหนัก', 'แม่ริม, เชียงใหม่', 'ดินถล่ม', '/icons/Landslide-mudslide.svg', 'สูง', 'ยืนยันแล้ว', '3 ชั่วโมงที่แล้ว', 'yellow'],
  ['รถชนบนถนนซูเปอร์ไฮเวย์', 'เมืองเชียงใหม่', 'ฉุกเฉิน', '/icons/Health.svg', 'สูง', 'รอตรวจสอบ', '5 ชั่วโมงที่แล้ว', 'red'],
]
const helpRequests = [
  ['ต้องการอพยพ', 'ช้างคลาน', 4, 'เปิดอยู่', '35 นาทีที่แล้ว', '/icons/Building.svg'], ['ตามหาหน้ากากอนามัย', 'สุเทพ', 2, 'กำลังรับเรื่อง', '1 ชั่วโมงที่แล้ว', '/icons/Health.svg'],
  ['ต้องการน้ำและอาหาร', 'สันทราย', 3, 'เปิดอยู่', '2 ชั่วโมงที่แล้ว', '/icons/Water-source.svg'], ['ขอความช่วยเหลือทางการแพทย์', 'แม่ริม', 1, 'กำลังดำเนินการ', '4 ชั่วโมงที่แล้ว', '/icons/Health.svg'],
  ['ขอความช่วยเหลือด้านการเดินทาง', 'หางดง', 2, 'เปิดอยู่', '6 ชั่วโมงที่แล้ว', '/icons/Car.svg'],
]
const types = [
  ['น้ำท่วม', 38, 30, '/icons/Flood.svg'], ['อัคคีภัย', 28, 22, '/icons/Fire.svg'], ['อุบัติเหตุบนถนน', 18, 14, '/icons/Roadblock.svg'],
  ['ดินถล่ม', 16, 13, '/icons/Landslide-mudslide.svg'], ['ฉุกเฉินทางการแพทย์', 14, 11, '/icons/Health.svg'], ['อื่น ๆ', 14, 11, '/icons/Alert.svg'],
]
const services = [['บริการแผนที่', '/icons/Map.svg'], ['ฐานข้อมูล', '/icons/Data.svg'], ['บริการแจ้งเตือน', '/icons/Notification.svg'], ['พื้นที่เก็บสื่อ', '/icons/Folder.svg']]
const mapMarkers = [
  ['ไฟไหม้', '/icons/Fire.svg', 'red', 'one'], ['น้ำท่วม', '/icons/Flood.svg', 'blue', 'two'], ['อุบัติเหตุ', '/icons/Roadblock.svg', 'orange', 'three'],
  ['ฉุกเฉินทางการแพทย์', '/icons/Health.svg', 'red', 'four'], ['ดินถล่ม', '/icons/Landslide-mudslide.svg', 'orange', 'five'], ['พื้นที่ปลอดภัย', '/icons/Environment.svg', 'green', 'six'],
]
const chart = [[43, 29, 16, 7, '21 ก.ย.'], [56, 31, 19, 8, '22 ก.ย.'], [56, 39, 18, 8, '23 ก.ย.'], [68, 37, 20, 8, '24 ก.ย.'], [88, 53, 25, 9, '25 ก.ย.'], [62, 29, 18, 7, '26 ก.ย.'], [72, 35, 21, 8, 'วันนี้']]
const quickAction = (label) => { label === 'ตรวจสอบเหตุการณ์' ? navigateTo('/admin/incidents') : notice.value = `“${label}” เป็นเมนูโครงร่างที่ยังอยู่ระหว่างพัฒนา` }
</script>

<template>
  <section class="admin-content">
        <section class="intro">
          <div>
            <h1>สวัสดี, ผู้ดูแลระบบ</h1>
            <p>ภาพรวมสถานการณ์ GeoSpread และความปลอดภัยของชุมชนวันนี้</p>
          </div><em>“เพื่อวันพรุ่งนี้ที่ปลอดภัยและรู้เท่าทันกว่าเดิม”</em>
        </section>

        <p class="sample-banner"><img src="/icons/Alert.svg" alt="">ข้อมูลบนแดชบอร์ดนี้เป็นข้อมูลตัวอย่างสำหรับการออกแบบ
          ยังไม่ใช่สถานการณ์ปัจจุบัน</p>

        <section class="summary" aria-label="สรุปสถานะระบบ">
          <article v-for="card in cards" :key="card[0]" :class="`card card--${card[3]}`"><span class="card-icon"><img
                :src="card[4]" alt=""></span>
            <div><strong>{{ card[1] }}</strong><span>{{ card[0] }}</span><small :class="`trend-${card[5]}`">{{ card[5]
              === 'up' ? '↑' : '↓' }} {{ card[2] }}<i>จากสัปดาห์ก่อน</i></small></div>
          </article>
        </section>

        <p v-if="notice" class="notice" role="status">{{ notice }}<button type="button" aria-label="ปิดข้อความ"
            @click="notice = ''">×</button></p>

        <section class="dashboard-mode">
          <section class="main-grid">
            <article class="panel map-panel">
              <header>
                <h2><img src="/icons/Map.svg" alt="">เหตุการณ์ล่าสุดบนแผนที่</h2><button type="button"
                  @click="quickAction('เหตุการณ์ทั้งหมด')">ดูทั้งหมด</button>
              </header>
              <div class="map" aria-label="แผนที่ภาพรวมเชียงใหม่ พร้อมตำแหน่งเหตุการณ์ตัวอย่าง">
                <i class="hill hill-a" /><i class="hill hill-b" /><i class="river" /><i class="road road-a" /><i
                  class="road road-b" /><i class="road road-c" />
                <span class="place place-a">แม่ริม</span><span class="place place-b">เชียงใหม่</span><span
                  class="place place-c">สันทราย</span><span class="place place-d">สารภี</span>
                <button v-for="marker in mapMarkers" :key="marker[0]" type="button"
                  :class="`marker marker--${marker[2]} marker--${marker[3]}`" :aria-label="marker[0]"
                  @click="notice = `เลือกเหตุการณ์: ${marker[0]}`"><img :src="marker[1]" alt=""></button>
                <aside class="legend"><strong>ชั้นข้อมูลตัวอย่าง</strong><span><i
                      class="you" />ตำแหน่งตัวอย่าง</span><span><img src="/icons/Fire.svg" alt="">อัคคีภัย</span><span><img
                      src="/icons/Flood.svg" alt="">น้ำท่วม</span><span><img src="/icons/Roadblock.svg" alt="">อุบัติเหตุ</span>
                </aside>
                <small class="scale"><i />0&nbsp;&nbsp;&nbsp;&nbsp; 5 กม.</small>
              </div>
            </article>

            <div class="side-stack">
              <article class="panel chart-panel">
                <header>
                  <h2><img src="/icons/Chart.svg" alt="">สถิติเหตุการณ์</h2><button class="period" type="button">7
                    วันที่ผ่านมา
                    ⌄</button>
                </header>
                <div class="chart" aria-label="กราฟเหตุการณ์ 7 วันล่าสุด">
                  <div v-for="item in chart" :key="item[4]">
                    <section><i class="total" :style="{ height: `${item[0]}%` }" /><i class="verified"
                        :style="{ height: `${item[1]}%` }" /><i class="pending" :style="{ height: `${item[2]}%` }" /><i
                        class="rejected" :style="{ height: `${item[3]}%` }" /></section><small>{{ item[4] }}</small>
                  </div>
                </div>
                <p class="chart-key"><span><i class="total" />ทั้งหมด</span><span><i
                      class="verified" />ยืนยันแล้ว</span><span><i class="pending" />รอตรวจ</span><span><i
                      class="rejected" />ไม่ผ่าน</span></p>
              </article>
              <article class="panel types">
                <h2>ประเภทเหตุการณ์</h2>
                <div>
                  <section class="donut" aria-label="128 เหตุการณ์ทั้งหมด"><strong>128<small>ทั้งหมด</small></strong>
                  </section>
                  <ul>
                    <li v-for="type in types" :key="type[0]"><img :src="type[3]" alt=""><span>{{ type[0] }}</span><b>{{
                      type[1]
                    }}</b><small>({{ type[2] }}%)</small></li>
                  </ul>
                </div>
              </article>
            </div>

            <aside class="right-rail">
              <article class="panel system">
                <h2><i />สถานะระบบ</h2>
                <ul>
                  <li v-for="service in services" :key="service[0]"><img :src="service[1]" alt=""><span>{{ service[0]
                  }}</span><b>ออนไลน์</b></li>
                </ul>
              </article>
              <article class="panel quick">
                <h2><img src="/icons/Help.svg" alt="">งานด่วน</h2><button
                  v-for="action in ['ตรวจสอบเหตุการณ์', 'จัดการคำขอความช่วยเหลือ', 'ติดตามผู้ใช้งาน', 'จัดการกิจกรรม', 'แก้ไขคู่มือความปลอดภัย']"
                  :key="action" type="button" @click="quickAction(action)">{{ action }}</button>
              </article>
            </aside>
          </section>

          <section class="tables">
            <article class="panel data">
              <header>
                <h2><img src="/icons/Report.svg" alt="">เหตุการณ์ล่าสุด</h2><button type="button"
                  @click="quickAction('เหตุการณ์ทั้งหมด')">ดูทั้งหมด</button>
              </header>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>เหตุการณ์</th>
                      <th>พื้นที่</th>
                      <th>ประเภท</th>
                      <th>ระดับ</th>
                      <th>สถานะ</th>
                      <th>เวลา</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(incident, index) in incidents" :key="incident[0]">
                      <td>{{ index + 1 }}</td>
                      <td>{{ incident[0] }}</td>
                      <td>{{ incident[1] }}</td>
                      <td><img :src="incident[3]" alt="">{{ incident[2] }}</td>
                      <td><b class="severity" :class="incident[4] === 'สูง' ? 'high' : 'medium'">{{ incident[4] }}</b>
                      </td>
                      <td><b class="status" :class="{ verified: incident[5] === 'ยืนยันแล้ว' }">{{ incident[5] }}</b>
                      </td>
                      <td>{{ incident[6] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
            <article class="panel data">
              <header>
                <h2><img src="/icons/Help.svg" alt="">คำขอความช่วยเหลือล่าสุด</h2><button type="button"
                  @click="quickAction('คำขอความช่วยเหลือทั้งหมด')">ดูทั้งหมด</button>
              </header>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>คำขอ</th>
                      <th>พื้นที่</th>
                      <th>จำนวน</th>
                      <th>สถานะ</th>
                      <th>เวลา</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(request, index) in helpRequests" :key="request[0]">
                      <td>{{ index + 1 }}</td>
                      <td><img :src="request[5]" alt="">{{ request[0] }}</td>
                      <td>{{ request[1] }}</td>
                      <td>{{ request[2] }}</td>
                      <td><b class="status open">{{ request[3] }}</b></td>
                      <td>{{ request[4] }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
            <article class="panel community">
              <header>
                <h2><img src="/icons/Users.svg" alt="">ภาพรวมชุมชน</h2><button type="button"
                  @click="quickAction('ภาพรวมชุมชน')">รายละเอียด</button>
              </header>
              <section>
                <div><img src="/icons/Users.svg" alt=""><strong>12,482</strong><span>ผู้ใช้ทั้งหมด</span></div>
                <div><img src="/icons/Selected.svg" alt=""><strong>8,320</strong><span>ผู้ใช้ที่เชื่อถือได้</span></div>
                <div><img src="/icons/Users.svg" alt=""><strong>1,420</strong><span>กำลังติดตาม</span></div>
                <div><img src="/icons/Warning-Error.svg" alt=""><strong>320</strong><span>ความเสี่ยงสูง</span></div>
              </section>
            </article>
          </section>
        </section>
  </section>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box
}

:global(body) {
  margin: 0;
  background: #f5f9ff;
  color: #102968;
  font-family: "Noto Sans Thai", Tahoma, sans-serif
}

:global(button),
:global(input) {
  font: inherit
}

.admin-dashboard {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 14.2rem minmax(0, 1fr);
  background: #f7fbff
}

.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  height: 100vh;
  flex-direction: column;
  padding: 1rem .85rem;
  border-right: 1px solid #dce8f5;
  background: #fff;
  overflow-y: auto
}

.brand {
  display: flex;
  align-items: center;
  gap: .55rem;
  margin: 0 0 1.25rem;
  padding: .1rem .25rem;
  color: #102968;
  text-decoration: none
}

.brand img {
  width: 3.05rem;
  height: 3.05rem;
  object-fit: contain
}

.brand span {
  display: grid;
  font-size: 1.36rem;
  font-weight: 850;
  letter-spacing: -.06em;
  line-height: 1
}

.brand small {
  margin-top: .28rem;
  color: #587096;
  font-size: .54rem;
  font-weight: 600;
  letter-spacing: -.01em
}

.admin-label {
  display: flex;
  align-items: center;
  gap: .6rem;
  margin: 0 0 .65rem;
  padding: .7rem;
  border-radius: .5rem;
  background: #e8f2ff;
  color: #176bd0;
  font-size: .78rem;
  font-weight: 800
}

.admin-label img {
  width: 1.15rem;
  height: 1.15rem
}

.sidebar nav {
  display: grid;
  gap: .2rem
}

.sidebar nav button {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  gap: .8rem;
  min-height: 2.55rem;
  padding: 0 .72rem;
  border: 0;
  border-radius: .5rem;
  background: transparent;
  color: #18347b;
  font-size: .84rem;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: .18s
}

.sidebar nav button img {
  width: 18px;
  height: 18px;
  opacity: .78
}

.sidebar nav button:hover {
  background: #eef6ff;
  color: #086ce4
}

.sidebar nav button.active {
  background: #1479ef;
  color: #fff;
  box-shadow: 0 8px 18px rgb(20 121 239 / 22%)
}

.sidebar nav button.active img {
  filter: brightness(0) invert(1);
  opacity: 1
}

.sidebar nav b {
  display: grid;
  min-width: 1.28rem;
  height: 1.28rem;
  place-items: center;
  margin-left: auto;
  border-radius: 999px;
  background: #e91f28;
  color: #fff;
  font-size: .66rem
}

.workspace {
  min-width: 0
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  min-height: 4rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: .65rem 1.2rem;
  border-bottom: 1px solid #ddeaf8;
  background: rgb(255 255 255 / 94%);
  backdrop-filter: blur(12px)
}

.search {
  display: flex;
  width: min(100%, 47rem);
  align-items: center;
  gap: .75rem;
  min-height: 2.55rem;
  padding: 0 .85rem;
  border-radius: .48rem;
  background: #f1f6fe;
  color: #163581
}

.search img {
  width: 1.25rem;
  height: 1.25rem
}

.search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #102968;
  font-size: .86rem
}

.search input::placeholder {
  color: #647aa5
}

.top-actions,
.location,
.account {
  display: flex;
  align-items: center
}

.top-actions {
  gap: .75rem
}

.location {
  gap: .46rem;
  min-height: 2.55rem;
  padding: 0 .7rem;
  border: 0;
  border-radius: .48rem;
  background: #f1f6fe;
  color: #183277;
  font-size: .78rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer
}

.location img {
  width: 1.15rem;
  height: 1.15rem
}

.location span {
  font-size: 1rem
}

.bell {
  position: relative;
  display: grid;
  width: 2.45rem;
  height: 2.45rem;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer
}

.bell img {
  width: 1.4rem;
  height: 1.4rem
}

.bell b {
  position: absolute;
  top: .1rem;
  right: .05rem;
  display: grid;
  width: 1.1rem;
  height: 1.1rem;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #ec1520;
  color: #fff;
  font-size: .57rem
}

.account {
  gap: .55rem
}

.avatar {
  display: grid;
  width: 2.45rem;
  height: 2.45rem;
  place-items: center;
  border-radius: 50%;
  background: #dce7f7;
  color: #35527d;
  font-size: 1rem;
  font-weight: 800
}

.account strong {
  max-width: 7rem;
  overflow: hidden;
  color: #12296b;
  font-size: .8rem;
  text-overflow: ellipsis;
  white-space: nowrap
}

.account button {
  padding: .36rem .5rem;
  border: 0;
  border-radius: .38rem;
  background: transparent;
  color: #526e99;
  font-size: .7rem;
  font-weight: 750;
  cursor: pointer
}

.account button:hover {
  background: #fff2f2;
  color: #ce2430
}

.content {
  width: min(100% - 2.4rem, 100rem);
  margin: 0 auto;
  padding: 1rem 0 2rem
}

.intro {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin: .1rem 0 .85rem
}

.intro h1 {
  margin: 0 0 .2rem;
  color: #0d1e67;
  font-size: clamp(1.55rem, 2.7vw, 2.2rem);
  letter-spacing: -.05em;
  line-height: 1.1
}

.intro p {
  margin: 0;
  color: #5b70a3;
  font-size: .84rem
}

.intro em {
  max-width: 15rem;
  color: #4f6098;
  font-size: .77rem;
  text-align: right
}

.summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: .48rem
}

.card {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: .6rem;
  min-height: 6.9rem;
  padding: .8rem .68rem;
  border: 1px solid #dceafa;
  border-radius: .58rem;
  background: #fff;
  box-shadow: 0 7px 16px rgb(28 78 138 / 4%)
}

.card-icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.85rem;
  height: 2.85rem;
  place-items: center;
  border-radius: 50%
}

.card-icon img {
  width: 1.6rem;
  height: 1.6rem
}

.card strong,
.card span,
.card small {
  display: block
}

.card strong {
  color: #0c1968;
  font-size: 1.4rem;
  line-height: 1;
  letter-spacing: -.05em
}

.card>div>span {
  margin-top: .25rem;
  color: #4e6295;
  font-size: .68rem;
  line-height: 1.1
}

.card small {
  margin-top: .5rem;
  font-size: .67rem;
  font-weight: 800;
  white-space: nowrap
}

.card small i {
  display: block;
  margin: .15rem 0 0 .6rem;
  color: #6074a3;
  font-size: .62rem;
  font-style: normal;
  font-weight: 600
}

.card--red .card-icon {
  background: #ffe5e8
}

.card--blue .card-icon {
  background: #e2efff
}

.card--green .card-icon {
  background: #def8e7
}

.card--yellow .card-icon {
  background: #fff5d9
}

.card--purple .card-icon {
  background: #eee6ff
}

.trend-up {
  color: #0aa456
}

.trend-down {
  color: #e42a37
}

.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: .75rem 0 0;
  padding: .68rem .85rem;
  border: 1px solid #b9d9ff;
  border-radius: .5rem;
  background: #eef7ff;
  color: #1760ad;
  font-size: .78rem;
  font-weight: 700
}

.notice button {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 1.15rem;
  cursor: pointer
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(30rem, 1.45fr) minmax(21rem, .93fr) minmax(13.5rem, .52fr);
  gap: .55rem;
  margin-top: .75rem
}

.panel {
  overflow: hidden;
  border: 1px solid #dceafa;
  border-radius: .58rem;
  background: #fff;
  box-shadow: 0 8px 20px rgb(24 73 132 / 4%)
}

.panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  min-height: 2.85rem;
  padding: .65rem .8rem;
  border-bottom: 1px solid #e4eef9
}

.panel h2 {
  display: flex;
  align-items: center;
  gap: .48rem;
  margin: 0;
  color: #12236e;
  font-size: .91rem;
  letter-spacing: -.02em
}

.panel h2>img,
.panel header h2>img {
  width: 1.25rem;
  height: 1.25rem
}

.panel header button {
  border: 0;
  background: transparent;
  color: #066be6;
  font-size: .72rem;
  font-weight: 800;
  cursor: pointer
}

.map {
  position: relative;
  min-height: 23.1rem;
  overflow: hidden;
  background: #d9eed6;
  isolation: isolate
}

.map::before {
  position: absolute;
  inset: 0;
  z-index: -3;
  background: linear-gradient(18deg, transparent 22%, rgb(255 255 255 / 44%) 23% 25%, transparent 26% 61%, rgb(255 255 255 / 42%) 62% 64%, transparent 65%), linear-gradient(103deg, transparent 26%, rgb(117 155 86 / 24%) 27% 29%, transparent 30% 69%, rgb(117 155 86 / 18%) 70% 72%, transparent 73%), linear-gradient(55deg, #d4ead2 0%, #b5ddaf 46%, #d2e9c6 100%);
  content: ''
}

.hill {
  position: absolute;
  z-index: -2;
  border: .15rem solid rgb(91 137 73 / 18%);
  border-radius: 48% 52% 46% 54%;
  background: rgb(151 191 106 / 19%)
}

.hill-a {
  top: -5rem;
  left: -3rem;
  width: 16rem;
  height: 13rem;
  transform: rotate(-22deg)
}

.hill-b {
  right: -4rem;
  bottom: -4rem;
  width: 17rem;
  height: 15rem;
  transform: rotate(28deg)
}

.river {
  position: absolute;
  z-index: -1;
  top: -2rem;
  left: 56%;
  width: 1rem;
  height: 30rem;
  border-radius: 50%;
  background: #84c8ee;
  opacity: .7;
  transform: rotate(14deg)
}

.road {
  position: absolute;
  z-index: -1;
  height: .28rem;
  border-radius: 99px;
  background: #fff7e2;
  box-shadow: 0 0 0 1px rgb(161 130 89 / 20%)
}

.road-a {
  top: 46%;
  left: -4%;
  width: 110%;
  transform: rotate(-11deg)
}

.road-b {
  top: 62%;
  left: 11%;
  width: 75%;
  transform: rotate(38deg)
}

.road-c {
  top: 25%;
  left: 38%;
  width: 56%;
  transform: rotate(75deg)
}

.place {
  position: absolute;
  z-index: 1;
  color: #314773;
  font-size: .65rem;
  font-weight: 800;
  text-shadow: 0 1px #fff
}

.place-a {
  top: 9%;
  left: 45%
}

.place-b {
  top: 53%;
  left: 43%;
  font-size: 1rem
}

.place-c {
  top: 25%;
  right: 10%
}

.place-d {
  right: 16%;
  bottom: 10%
}

.marker {
  position: absolute;
  z-index: 2;
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  padding: .28rem;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 5px 12px rgb(17 53 95 / 23%);
  cursor: pointer;
  transition: transform .18s
}

.marker:hover {
  transform: translateY(-.22rem) scale(1.08)
}

.marker img {
  width: 1.15rem;
  height: 1.15rem;
  filter: brightness(0) invert(1)
}

.marker--red {
  background: #ec2435
}

.marker--blue {
  background: #087cf0
}

.marker--orange {
  background: #fa6a18
}

.marker--green {
  background: #1aa85e
}

.marker--one {
  top: 22%;
  left: 52%
}

.marker--two {
  top: 36%;
  left: 32%
}

.marker--three {
  top: 58%;
  left: 67%
}

.marker--four {
  top: 67%;
  left: 46%
}

.marker--five {
  right: 19%;
  bottom: 18%
}

.marker--six {
  top: 25%;
  right: 31%
}

.legend {
  position: absolute;
  z-index: 3;
  bottom: .75rem;
  left: .75rem;
  display: grid;
  gap: .35rem;
  width: 9rem;
  padding: .6rem;
  border: 1px solid rgb(255 255 255 / 75%);
  border-radius: .45rem;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 6px 13px rgb(30 77 123 / 13%);
  color: #36527d;
  font-size: .6rem
}

.legend strong {
  color: #1d3973;
  font-size: .68rem
}

.legend span {
  display: flex;
  align-items: center;
  gap: .36rem
}

.legend img {
  width: .92rem;
  height: .92rem
}

.you {
  width: .7rem;
  height: .7rem;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #087cf0;
  box-shadow: 0 0 0 1px rgb(0 72 166 / 16%)
}

.scale {
  position: absolute;
  right: .7rem;
  bottom: .75rem;
  color: #173e70;
  font-size: .6rem;
  font-weight: 700
}

.scale i {
  display: block;
  width: 5.2rem;
  margin-bottom: .22rem;
  border-top: 2px solid #173e70
}

.side-stack {
  display: grid;
  gap: .55rem;
  min-width: 0
}

.chart-panel {
  min-height: 16.1rem
}

.period {
  padding: .35rem .5rem !important;
  border: 1px solid #d8e6f7 !important;
  border-radius: .35rem !important;
  color: #294576 !important;
  font-size: .64rem !important
}

.chart {
  display: flex;
  height: 9.4rem;
  align-items: end;
  justify-content: space-between;
  gap: .4rem;
  padding: .55rem .8rem 0;
  border-bottom: 1px solid #e4eef9;
  background: repeating-linear-gradient(to bottom, transparent 0, transparent 1.82rem, #edf3fb 1.88rem, #edf3fb 1.94rem)
}

.chart>div {
  display: grid;
  flex: 1;
  height: 100%;
  align-items: end;
  gap: .38rem;
  text-align: center
}

.chart section {
  display: flex;
  height: 100%;
  align-items: end;
  justify-content: center;
  gap: .12rem
}

.chart section i {
  display: block;
  width: min(.48rem, 22%);
  border-radius: .2rem .2rem 0 0
}

.total {
  background: #137cf1
}

.verified {
  background: #15ab5b
}

.pending {
  background: #f6af11
}

.rejected {
  background: #eb2635
}

.chart>div small {
  color: #6980a9;
  font-size: .52rem;
  white-space: nowrap
}

.chart-key {
  display: flex;
  flex-wrap: wrap;
  gap: .7rem;
  margin: 0;
  padding: .65rem .8rem;
  color: #405a88;
  font-size: .59rem
}

.chart-key span {
  display: flex;
  align-items: center;
  gap: .28rem
}

.chart-key i {
  width: .55rem;
  height: .55rem;
  border-radius: 50%
}

.types {
  min-height: 11.7rem;
  padding: .72rem .8rem
}

.types>h2 {
  margin-bottom: .55rem
}

.types>div {
  display: flex;
  align-items: center;
  gap: .8rem
}

.donut {
  display: grid;
  flex: 0 0 auto;
  width: 8.4rem;
  height: 8.4rem;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#1479ef 0 30%, #ef3340 30% 52%, #ff9d16 52% 66%, #f4c517 66% 79%, #0aae60 79% 90%, #71829f 90%)
}

.donut::before {
  position: absolute;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: #fff;
  content: ''
}

.donut strong {
  position: relative;
  z-index: 1;
  color: #13276d;
  font-size: 1.15rem;
  text-align: center
}

.donut small {
  display: block;
  color: #61749d;
  font-size: .55rem
}

.types ul {
  display: grid;
  flex: 1;
  gap: .33rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none
}

.types li {
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr) 1.5rem 2.2rem;
  align-items: center;
  gap: .28rem;
  color: #3b5582;
  font-size: .6rem
}

.types li img {
  width: .9rem;
  height: .9rem
}

.types li b {
  color: #18336e;
  font-size: .62rem
}

.types li small {
  color: #6880a9;
  font-size: .57rem
}

.right-rail {
  display: grid;
  align-content: start;
  gap: .55rem
}

.system,
.quick {
  padding: .72rem
}

.system h2,
.quick h2 {
  margin-bottom: .65rem
}

.system h2>i {
  width: .8rem;
  height: .8rem;
  border-radius: 50%;
  background: #11ad5c;
  box-shadow: 0 0 0 3px #e0f8e9
}

.system ul {
  display: grid;
  gap: .32rem;
  margin: 0;
  padding: 0;
  list-style: none
}

.system li {
  display: flex;
  align-items: center;
  gap: .46rem;
  min-height: 1.8rem;
  padding: .28rem .35rem;
  border: 1px solid #edf2fa;
  border-radius: .35rem;
  color: #294674;
  font-size: .62rem
}

.system li img {
  width: .9rem;
  height: .9rem
}

.system li b {
  margin-left: auto;
  padding: .18rem .34rem;
  border-radius: .25rem;
  background: #ddf8e8;
  color: #119754;
  font-size: .55rem
}

.quick {
  display: grid;
  gap: .4rem
}

.quick h2 {
  margin-bottom: .2rem
}

.quick button {
  min-height: 2rem;
  padding: .35rem .5rem;
  border: 0;
  border-radius: .35rem;
  background: #eaf3ff;
  color: #0d55bc;
  font-size: .65rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  transition: .16s
}

.quick button:first-of-type {
  background: #1479ef;
  color: #fff
}

.quick button:hover {
  background: #d5e8ff;
  transform: translateX(.12rem)
}

.quick button:first-of-type:hover {
  background: #0f68d1
}

.tables {
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(0, .88fr) minmax(12rem, .42fr);
  gap: .55rem;
  margin-top: .55rem
}

.data {
  min-width: 0
}

.data>div {
  overflow-x: auto
}

.data table {
  width: 100%;
  min-width: 33rem;
  border-collapse: collapse;
  color: #37517f;
  font-size: .59rem
}

.data th {
  padding: .45rem .5rem;
  background: #f6f9fe;
  color: #59709b;
  font-size: .55rem;
  font-weight: 800;
  text-align: left;
  white-space: nowrap
}

.data td {
  padding: .43rem .5rem;
  border-top: 1px solid #edf2fa;
  white-space: nowrap
}

.data td:nth-child(2) {
  color: #1b3474;
  font-weight: 700
}

.data td img {
  width: .85rem;
  height: .85rem;
  margin-right: .18rem;
  vertical-align: middle
}

.severity,
.status {
  display: inline-block;
  padding: .15rem .32rem;
  border-radius: .23rem;
  font-size: .53rem;
  font-weight: 800
}

.high {
  background: #ffe1e4;
  color: #e02232
}

.medium {
  background: #fff0cf;
  color: #b87508
}

.status {
  background: #fff1d3;
  color: #b57605
}

.status.verified {
  background: #daf7e5;
  color: #108a4c
}

.status.open {
  background: #dcebff;
  color: #0964cf
}

.community {
  min-width: 0
}

.community>section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .45rem;
  padding: .6rem
}

.community>section>div {
  display: grid;
  grid-template-columns: 1.7rem 1fr;
  column-gap: .38rem;
  align-items: center;
  min-height: 4rem;
  padding: .45rem;
  border: 1px solid #e6eef8;
  border-radius: .4rem
}

.community>section img {
  grid-row: span 2;
  width: 1.4rem;
  height: 1.4rem
}

.community strong {
  color: #14286c;
  font-size: .84rem
}

.community span {
  color: #6278a1;
  font-size: .53rem;
  line-height: 1.1
}

button:focus-visible,
input:focus-visible {
  outline: 3px solid rgb(20 121 239 / 30%);
  outline-offset: 2px
}

@media(max-width:88rem) {
  .summary {
    grid-template-columns: repeat(3, minmax(0, 1fr))
  }

  .main-grid {
    grid-template-columns: minmax(30rem, 1.3fr) minmax(21rem, .9fr)
  }

  .right-rail {
    grid-column: span 2;
    grid-template-columns: 1fr 1fr
  }

  .tables {
    grid-template-columns: 1fr 1fr
  }

  .community {
    grid-column: span 2
  }

  .community>section {
    grid-template-columns: repeat(4, minmax(0, 1fr))
  }
}

@media(max-width:68rem) {
  .admin-dashboard {
    grid-template-columns: 4.4rem minmax(0, 1fr)
  }

  .sidebar {
    padding: .85rem .55rem
  }

  .brand {
    justify-content: center
  }

  .brand span,
  .admin-label {
    display: none
  }

  .sidebar nav button {
    justify-content: center;
    padding: 0
  }

  .sidebar nav button span {
    display: none
  }

  .sidebar nav b {
    position: absolute;
    margin: -1.35rem 0 0 1.2rem
  }

  .main-grid {
    grid-template-columns: 1fr
  }

  .right-rail {
    grid-column: auto
  }

  .map {
    min-height: 22rem
  }

  .tables {
    grid-template-columns: 1fr
  }

  .community {
    grid-column: auto
  }

  .community>section {
    grid-template-columns: repeat(2, minmax(0, 1fr))
  }

  .account strong {
    display: none
  }
}

@media(max-width:47rem) {
  .admin-dashboard {
    display: block
  }

  .sidebar {
    position: static;
    width: auto;
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: .45rem .65rem;
    overflow-x: auto;
    overflow-y: hidden
  }

  .brand {
    margin: 0 .55rem 0 0
  }

  .brand img {
    width: 2.35rem;
    height: 2.35rem
  }

  .sidebar nav {
    display: flex;
    gap: .25rem
  }

  .sidebar nav button {
    flex: 0 0 2.3rem;
    min-height: 2.3rem
  }

  .topbar {
    position: static;
    padding: .55rem .75rem
  }

  .location,
  .account button {
    display: none
  }

  .top-actions {
    gap: .25rem
  }

  .content {
    width: min(100% - 1rem, 100rem);
    padding-top: .7rem
  }

  .intro {
    align-items: start;
    flex-direction: column
  }

  .intro em {
    text-align: left
  }

  .summary {
    grid-template-columns: repeat(2, minmax(0, 1fr))
  }

  .card {
    min-height: 5.7rem
  }

  .card strong {
    font-size: 1.18rem
  }

  .card-icon {
    width: 2.25rem;
    height: 2.25rem
  }

  .card-icon img {
    width: 1.3rem;
    height: 1.3rem
  }

  .card small i {
    display: none
  }

  .right-rail {
    grid-template-columns: 1fr
  }

  .types>div {
    align-items: start
  }

  .donut {
    width: 6.5rem;
    height: 6.5rem
  }

  .donut::before {
    width: 3.8rem;
    height: 3.8rem
  }

  .search {
    min-width: 0
  }

  .search input {
    font-size: .72rem
  }

  .legend {
    display: none
  }
}

.sidebar nav button:disabled {
  cursor: not-allowed;
  opacity: .46
}

.sidebar nav button:disabled:hover {
  background: transparent;
  color: #18347b
}

.sample-banner {
  display: flex;
  align-items: center;
  gap: .45rem;
  margin: .55rem 0;
  padding: .45rem .65rem;
  border: 1px solid #f0dc9f;
  border-radius: .42rem;
  background: #fff9e7;
  color: #86641a;
  font-size: .66rem;
  font-weight: 700
}

.sample-banner img {
  width: .85rem;
  height: .85rem
}

.admin-dashboard--sidebar-collapsed {
  grid-template-columns: 4.65rem minmax(0, 1fr)
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .35rem;
  margin: 0 0 1.25rem
}

.sidebar-head .brand {
  margin: 0
}

.sidebar-toggle {
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: .5rem;
  background: transparent;
  cursor: pointer
}

.sidebar-toggle:hover {
  background: #eef6ff
}

.sidebar-toggle img {
  width: 1.1rem;
  height: 1.1rem;
  transition: transform .18s ease
}

.menu-group {
  display: grid;
  gap: .2rem
}

.menu-group+h2 {
  margin-top: .2rem
}

.menu-group+.menu-group {
  margin-top: .8rem;
  padding-top: .75rem;
  border-top: 1px solid #edf2f8
}

.menu-group h2 {
  margin: 0 0 .2rem;
  padding: 0 .72rem;
  color: #7288aa;
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .04em
}

.sidebar--collapsed {
  align-items: stretch;
  padding-right: .55rem;
  padding-left: .55rem
}

.sidebar--collapsed .sidebar-head {
  justify-content: center
}

.sidebar--collapsed .brand img {
  width: 2.4rem;
  height: 2.4rem
}

/* Removed absolute positioning for collapsed toggle to match user sidebar */

.sidebar--collapsed .sidebar-toggle img {
  transform: rotate(180deg)
}

.sidebar--collapsed nav {
  gap: .85rem
}

.sidebar--collapsed .menu-group {
  justify-items: center
}

.sidebar--collapsed .menu-group+.menu-group {
  width: 100%;
  margin-top: 0;
  padding-top: .7rem
}

.sidebar--collapsed nav button {
  justify-content: center;
  width: 2.65rem;
  padding: 0
}

.sidebar--collapsed nav b {
  position: absolute;
  top: .08rem;
  right: .05rem;
  margin: 0
}

.donut {
  position: relative
}

.sidebar-label {
  color: #334e80;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding-left: 0.25rem;
}

.sidebar-account {
  display: grid;
  gap: 0.25rem;
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px solid #dfe8f3;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.65rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  color: #183c75;
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.2;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
  transition: all 160ms ease;
  width: 100%;
}

.sidebar-link:hover {
  background: #edf5ff;
  color: #0876eb;
}

.sidebar-link img, .sidebar-link svg {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex: 0 0 auto;
}

.sidebar--collapsed .sidebar-account {
  justify-items: center;
}

.sidebar--collapsed .sidebar-link {
  justify-content: center;
  width: 2.65rem;
  padding: 0.5rem;
}
</style>
