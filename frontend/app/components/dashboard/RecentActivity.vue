<template>
  <section class="recent-activity" aria-labelledby="recent-activity-heading">
    <header class="recent-activity__header">
      <h2 id="recent-activity-heading">{{ title || t('activity.title') }}</h2>
      <NuxtLink to="/notifications">{{ t('common.viewAll') }}</NuxtLink>
    </header>

    <p v-if="!activities.length" class="recent-activity__empty">
      {{ t('activity.empty') }}
    </p>

    <ol v-else class="recent-activity__list">
      <li v-for="activity in activities" :key="activity.id">
        <span class="recent-activity__marker" :class="`recent-activity__marker--${markerTone(activity)}`" aria-hidden="true" />
        <span class="recent-activity__text">
          <span class="recent-activity__kind">{{ kindLabel(activity) }}</span>
          {{ activity.title }}
        </span>
        <time :datetime="activity.occurredAt">{{ activity.time }}</time>
      </li>
    </ol>
  </section>
</template>

<script setup>
defineProps({ title: { type: String, default: '' } })
const { t } = useLocale()

const { recentActivity: activities } = useHomeDashboard()

const kindLabel = (activity) => {
  if (activity.kind === 'help_request') return `${t('help.category')}:`
  if (activity.kind === 'pending_report') return `${t('incident.newReport')}:`
  return `${activity.statusLabel}:`
}

const markerTone = (activity) => {
  if (activity.kind === 'help_request') return 'help'
  if (activity.statusTone === 'verified') return 'verified'
  if (activity.statusTone === 'ongoing') return 'ongoing'
  return 'pending'
}
</script>

<style scoped>
.recent-activity {
  padding: 1.1rem 1.25rem 1.25rem;
  border: 1px solid var(--gs-line);
  border-radius: var(--gs-radius);
  background: var(--gs-surface);
}

.recent-activity__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.recent-activity h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 1.05rem;
  font-weight: 700;
}

.recent-activity__header a {
  color: var(--gs-action);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--gs-line-strong);
  text-underline-offset: 0.2em;
}

.recent-activity__header a:hover {
  text-decoration-color: currentColor;
}

.recent-activity__list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.recent-activity__list li {
  display: grid;
  grid-template-columns: 0.5rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0;
}

.recent-activity__list li + li {
  border-top: 1px solid var(--gs-line);
}

.recent-activity__marker {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.recent-activity__marker--verified {
  background: var(--gs-verified);
}

.recent-activity__marker--ongoing {
  background: var(--gs-action);
}

.recent-activity__marker--pending {
  box-sizing: border-box;
  border: 1.5px solid var(--gs-pending);
}

.recent-activity__marker--help {
  background: var(--gs-help);
}

.recent-activity__kind {
  color: var(--gs-muted);
  font-weight: 600;
}

.recent-activity__empty {
  margin: 0.5rem 0 0;
  color: var(--gs-muted);
  font-size: 0.875rem;
}

.recent-activity__text {
  overflow: hidden;
  color: var(--gs-ink-2);
  font-size: 0.875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-activity time {
  color: var(--gs-muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}
</style>
