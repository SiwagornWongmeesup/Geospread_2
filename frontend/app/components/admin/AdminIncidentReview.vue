<script setup>
import { onMounted, ref } from "vue";

const {
  queue,
  incidentTypes: reviewTypes,
  isLoading: isReviewLoading,
  activeAction,
  error: reviewError,
  notice: reviewNotice,
  totalPending,
  load: loadReview,
  reviewCandidate,
  reviewCandidateGroup,
  createFromPendingReport,
  rejectPendingReport,
} = useAdminReview();
const { t, locale } = useLocale();

const groupTypeSelections = ref({});
const pendingTypeSelections = ref({});
const isSaving = (key) => activeAction.value === key;
const groupSelection = (group) =>
  groupTypeSelections.value[group.candidate_group_id] ?? "";
const pendingSelection = (report) =>
  pendingTypeSelections.value[report.report_id] ?? "";
const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(locale.value === "en" ? "en-GB" : "th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : t("review.noTime");
const submitGroup = (group) => {
  const typeId = groupSelection(group);
  if (!typeId) {
    reviewError.value = t("review.chooseTypeGroup");
    return;
  }
  void reviewCandidateGroup({
    candidateGroupId: group.candidate_group_id,
    action: "accept",
    typeId,
  });
};
const submitPending = (report) => {
  const typeId = pendingSelection(report);
  if (!typeId) {
    reviewError.value = t("review.chooseTypeReport");
    return;
  }
  void createFromPendingReport({ reportId: report.report_id, typeId });
};

onMounted(() => {
  void loadReview();
});
</script>

<template>
  <section class="review-page" aria-labelledby="review-title">
    <header class="review-page__heading">
      <div>
        <h1 id="review-title">{{ t("review.title") }}</h1>
        <p>{{ t("review.subtitle") }}</p>
      </div>
      <div class="review-page__count">
        <strong>{{ totalPending }}</strong
        ><span>{{ t("review.pendingCount") }}</span
        ><button type="button" @click="navigateTo('/admin')">
          {{ t("review.backToDashboard") }}
        </button>
      </div>
    </header>
    <p v-if="reviewError" class="feedback feedback--error" role="alert">
      {{ reviewError }}
      <button type="button" @click="loadReview">{{ t("review.retry") }}</button>
    </p>
    <p v-if="reviewNotice" class="feedback feedback--success" role="status">
      {{ reviewNotice }}
    </p>
    <p v-if="isReviewLoading" class="loading">{{ t("review.loading") }}</p>
    <template v-else>
      <p v-if="!totalPending" class="empty">
        {{ t("review.empty") }}
        <button type="button" @click="loadReview">{{ t("review.refresh") }}</button>
      </p>
      <section v-if="queue.report_candidates.length" class="review-group">
        <h2>{{ t("review.duplicateHeading") }}</h2>
        <article
          v-for="item in queue.report_candidates"
          :key="item.candidate_id"
        >
          <div>
            <b>{{ t("review.reportNumber", { id: item.report_id }) }}</b
            ><strong>{{ item.description }}</strong
            ><span
              >{{ t("review.targetIncident") }}
              {{ item.target_title || `#${item.target_incident_id}` }} ·
              {{ t("review.distance", { value: Math.round(item.distance_m) }) }}</span
            >
          </div>
          <footer>
            <button
              type="button"
              :disabled="isSaving(`candidate-${item.candidate_id}-reject`)"
              @click="
                reviewCandidate({
                  candidateId: item.candidate_id,
                  action: 'reject',
                })
              "
            >
              {{ t("review.dontMerge") }}</button
            ><button
              class="primary"
              type="button"
              :disabled="isSaving(`candidate-${item.candidate_id}-accept`)"
              @click="
                reviewCandidate({
                  candidateId: item.candidate_id,
                  action: 'accept',
                })
              "
            >
              {{ t("review.confirmMerge") }}
            </button>
          </footer>
        </article>
      </section>
      <section v-if="queue.candidate_groups.length" class="review-group">
        <h2>{{ t("review.groupHeading") }}</h2>
        <article
          v-for="group in queue.candidate_groups"
          :key="group.candidate_group_id"
        >
          <div>
            <b
              >{{ t("review.groupNumber", { id: group.candidate_group_id }) }} ·
              {{ t("units.reports", { count: group.reports.length }) }}</b
            ><strong>{{
              group.reports[0]?.description || t("review.noDescription")
            }}</strong
            ><span>{{ t("review.createdAt", { time: formatDate(group.created_at) }) }}</span>
          </div>
          <footer>
            <select
              v-model="groupTypeSelections[group.candidate_group_id]"
              :aria-label="t('review.typeLabel')"
            >
              <option value="">{{ t("review.chooseType") }}</option>
              <option
                v-for="type in reviewTypes"
                :key="type.type_id"
                :value="String(type.type_id)"
              >
                {{ type.type_name }}
              </option></select
            ><button
              type="button"
              :disabled="isSaving(`group-${group.candidate_group_id}-reject`)"
              @click="
                reviewCandidateGroup({
                  candidateGroupId: group.candidate_group_id,
                  action: 'reject',
                })
              "
            >
              {{ t("review.rejectGroup") }}</button
            ><button
              class="primary"
              type="button"
              :disabled="isSaving(`group-${group.candidate_group_id}-accept`)"
              @click="submitGroup(group)"
            >
              {{ t("review.confirmGroup") }}
            </button>
          </footer>
        </article>
      </section>
      <section v-if="queue.pending_reports.length" class="review-group">
        <h2>{{ t("review.pendingHeading") }}</h2>
        <article
          v-for="report in queue.pending_reports"
          :key="report.report_id"
        >
          <div>
            <b>{{ t("review.reportNumber", { id: report.report_id }) }}</b
            ><strong>{{ report.description }}</strong
            ><span>{{ t("review.sentAt", { time: formatDate(report.created_at) }) }}</span>
          </div>
          <footer>
            <select
              v-model="pendingTypeSelections[report.report_id]"
              :aria-label="t('review.typeLabel')"
            >
              <option value="">{{ t("review.chooseType") }}</option>
              <option
                v-for="type in reviewTypes"
                :key="type.type_id"
                :value="String(type.type_id)"
              >
                {{ type.type_name }}
              </option></select
            ><button
              type="button"
              :disabled="isSaving(`pending-${report.report_id}-reject`)"
              @click="rejectPendingReport({ reportId: report.report_id })"
            >
              {{ t("review.rejectReport") }}</button
            ><button
              class="primary"
              type="button"
              :disabled="isSaving(`pending-${report.report_id}-confirm`)"
              @click="submitPending(report)"
            >
              {{ t("review.confirmType") }}
            </button>
          </footer>
        </article>
      </section>
    </template>
  </section>
</template>

<style scoped>
.review-page {
  border: 1px solid #dceafa;
  border-radius: 0.65rem;
  background: #fff;
  box-shadow: 0 0.5rem 1.25rem rgb(24 73 132 / 5%);
  color: #173a68;
}
.review-page__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e4eef9;
}
.review-page h1 {
  margin: 0 0 0.22rem;
  color: #12236e;
  font-size: 1.28rem;
}
.review-page h2 {
  margin: 0 0 0.5rem;
  color: #173a68;
  font-size: 0.92rem;
}
.review-page p {
  margin: 0;
  color: #58719d;
  font-size: 0.78rem;
}
.review-page__count {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.review-page__count strong {
  color: #0e61c6;
  font-size: 1.15rem;
}
.review-page__count span {
  color: #6077a1;
  font-size: 0.68rem;
}
.review-page button,
.review-page select {
  min-height: 2rem;
  padding: 0.32rem 0.55rem;
  border: 1px solid #cfe0f3;
  border-radius: 0.35rem;
  background: #fff;
  color: #31537e;
  font: inherit;
  font-size: 0.7rem;
  font-weight: 750;
  cursor: pointer;
}
.review-page button.primary {
  border-color: #1479ef;
  background: #1479ef;
  color: #fff;
}
.review-page button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.feedback {
  margin: 0.75rem 1rem !important;
  padding: 0.65rem;
  border-radius: 0.4rem;
  font-weight: 700;
}
.feedback--error {
  background: #fff0f1;
  color: #b72635 !important;
}
.feedback--success {
  background: #eaf9ef;
  color: #177244 !important;
}
.feedback button {
  float: right;
  border: 0;
  background: transparent;
  color: inherit;
  text-decoration: underline;
}
.loading,
.empty {
  margin: 1rem !important;
  padding: 1.1rem;
  border-radius: 0.45rem;
  background: #f5f9fe;
  text-align: center;
}
.empty button {
  margin-left: 0.5rem;
}
.review-group {
  padding: 1rem;
  border-top: 1px solid #e9f0f9;
}
.review-group:first-of-type {
  border-top: 0;
}
.review-group article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e1ebf7;
  border-radius: 0.45rem;
}
.review-group article + article {
  margin-top: 0.45rem;
}
.review-group article > div {
  display: grid;
  gap: 0.22rem;
}
.review-group article b {
  color: #1769cc;
  font-size: 0.68rem;
}
.review-group article strong {
  color: #203a70;
  font-size: 0.8rem;
}
.review-group article span {
  color: #6980a6;
  font-size: 0.68rem;
}
.review-group footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  flex-wrap: wrap;
}
@media (max-width: 47rem) {
  .review-page__heading,
  .review-group article {
    align-items: flex-start;
    flex-direction: column;
  }
  .review-page__count {
    flex-wrap: wrap;
  }
  .review-group footer {
    justify-content: flex-start;
  }
  .review-page button,
  .review-page select {
    width: 100%;
  }
}
</style>
