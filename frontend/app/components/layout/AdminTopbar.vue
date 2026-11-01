<script setup>
import { computed } from 'vue'

const { getUser, logout } = useAuth()
const notice = useState('adminNotice', () => '')
const { t } = useLocale()

const userDisplayName = computed(() => {
  const user = getUser()?.user ?? getUser()
  return user?.name || user?.email || t('admin.topbar.fallbackName')
})
</script>

<template>
  <header class="topbar">
    <label class="search">
      <img src="/icons/Search.svg" alt="">
      <input type="search" :placeholder="t('admin.topbar.searchPlaceholder')">
    </label>
    <div class="top-actions">
      <button class="location" type="button"><img src="/icons/Location.svg" alt="">{{ t('admin.topbar.sampleLocation') }}<span>⌄</span></button>
      <button class="bell" type="button" :aria-label="t('admin.topbar.notificationsLabel', { count: 3 })"
        @click="notice = t('admin.topbar.notificationsNotice', { count: 3 })"><img src="/icons/Notification.svg" alt=""><b>3</b></button>
      <div class="account"><span class="avatar">{{ userDisplayName.charAt(0) }}</span><strong>{{ userDisplayName
          }}</strong><button type="button" @click="logout">{{ t('header.logout') }}</button></div>
    </div>
  </header>
</template>

<style scoped>
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

button:focus-visible,
input:focus-visible {
  outline: 3px solid rgb(20 121 239 / 30%);
  outline-offset: 2px
}

@media(max-width:68rem) {
  .account strong {
    display: none
  }
}

@media(max-width:47rem) {
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

  .search {
    min-width: 0
  }

  .search input {
    font-size: .72rem
  }
}
</style>
