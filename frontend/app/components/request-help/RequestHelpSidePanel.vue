<template>
    <aside class="side">
        <section class="map">
            <h2>ตำแหน่งของคุณ</h2><button type="button" @click="used = true">ใช้ตำแหน่งปัจจุบัน</button>
            <div class="map__canvas"><span>ตำแหน่งตัวอย่าง</span><i :class="{ active: used }" /></div>
            <p>{{ used ? 'เลือกตำแหน่งปัจจุบันแล้ว (ตัวอย่าง)' : 'กดปุ่มเพื่อเลือกตำแหน่งปัจจุบัน' }}</p>
        </section>
        <section class="guide">
            <h2>คู่มือความปลอดภัยที่เกี่ยวข้อง</h2>
            <p>หากต้องอพยพ ให้พกเอกสารสำคัญ ยาประจำตัว และติดตามประกาศจากหน่วยงานในพื้นที่</p>
            <NuxtLink to="/safety-guide">ดูคู่มือฉบับเต็ม</NuxtLink>
        </section>
    </aside>
</template>
<script setup>import { ref } from 'vue'; const used = ref(false)</script>
<style
    scoped>
    .side {
        display: grid;
        align-content: start;
        gap: 1rem;
        padding: 1rem;
    }

    .side section {
        padding: 1rem;
        border-radius: .9rem;
        background: #fff;
        box-shadow: 0 4px 16px rgb(31 72 125 / 8%);
    }

    .side h2 {
        margin: 0 0 .7rem;
        color: #102968;
        font-size: .95rem;
    }

    .map button,
    .guide a {
        display: block;
        width: 100%;
        padding: .65rem;
        border: 0;
        border-radius: .55rem;
        background: #1479ef;
        color: #fff;
        font: inherit;
        font-size: .8rem;
        font-weight: 800;
        text-align: center;
        text-decoration: none;
    }

    .map__canvas {
        position: relative;
        height: 13rem;
        margin-top: .8rem;
        overflow: hidden;
        border-radius: .65rem;
        background: linear-gradient(130deg, #d9f1e2, #e4f3fb 60%, #d5e6f5);
    }

    .map__canvas::before {
        position: absolute;
        inset: 0;
        content: '';
        background: linear-gradient(70deg, transparent 48%, #90bee2 49% 51%, transparent 52%), linear-gradient(8deg, transparent 45%, #a7d7b6 46% 48%, transparent 49%);
    }

    .map__canvas span {
        position: absolute;
        top: 1rem;
        left: 1rem;
        color: #355477;
        font-size: .72rem;
    }

    .map__canvas i {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 1rem;
        height: 1rem;
        border: 4px solid #fff;
        border-radius: 50%;
        background: #1479ef;
        box-shadow: 0 0 0 8px rgb(20 121 239 / .2);
        transform: translate(-50%, -50%);
    }

    .map__canvas i.active {
        box-shadow: 0 0 0 12px rgb(20 121 239 / .25);
    }

    .side p {
        color: #60718c;
        font-size: .78rem;
        line-height: 1.5;
    }

    .guide a {
        margin-top: .8rem;
    }
</style>
