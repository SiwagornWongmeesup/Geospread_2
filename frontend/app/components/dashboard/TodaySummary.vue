<template>
  <section class="today-summary" aria-labelledby="today-summary-heading">
    <header>
      <h2 id="today-summary-heading">{{ title || t('summary.title') }}</h2>
      <NuxtLink to="/incidents">{{ t('common.viewDetails') }}</NuxtLink>
    </header>
    <dl class="today-summary__stats">
      <div>
        <dt>{{ t('summary.reportedToday') }}</dt>
        <dd>{{ summary.reportedToday }}</dd>
      </div>
      <div>
        <dt>{{ t('summary.verified') }}</dt>
        <dd class="today-summary__value--verified">{{ summary.verified }}</dd>
      </div>
      <div>
        <dt>{{ t('status.pending') }}</dt>
        <dd class="today-summary__value--pending">{{ summary.pending }}</dd>
      </div>
      <div>
        <dt>{{ t('summary.openHelp') }}</dt>
        <dd class="today-summary__value--help">{{ summary.helpRequests }}</dd>
      </div>
    </dl>
    <p class="today-summary__freshness">
      {{ summary.updatedLabel ? t('summary.updated', { time: summary.updatedLabel }) : t('summary.loading') }}
    </p>
  </section>
</template>

<script setup>
defineProps({ title: { type: String, default: '' } })

const { todaySummary: summary } = useHomeDashboard()
const { t } = useLocale()
</script>

<style scoped>
.today-summary {
  padding: 1.1rem 0 0;
}

.today-summary header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.today-summary h2 {
  margin: 0;
  color: var(--gs-ink);
  font-size: 1rem;
  font-weight: 700;
}

.today-summary a {
  color: var(--gs-action);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--gs-line-strong);
  text-underline-offset: 0.2em;
}

.today-summary a:hover {
  text-decoration-color: currentColor;
}

.today-summary__stats {
  margin: 0.5rem 0 0;
}

.today-summary__stats > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
}

.today-summary__stats > div + div {
  border-top: 1px solid var(--gs-line);
}

.today-summary dt {
  color: var(--gs-ink-2);
  font-size: 0.875rem;
}

.today-summary dd {
  margin: 0;
  color: var(--gs-ink);
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.today-summary dd.today-summary__value--verified {
  color: var(--gs-verified);
}

.today-summary dd.today-summary__value--pending {
  color: var(--gs-pending);
}

.today-summary dd.today-summary__value--help {
  color: var(--gs-help);
}

.today-summary__freshness {
  margin: 0.35rem 0 0;
  color: var(--gs-muted);
  font-size: 0.78rem;
}
</style>
