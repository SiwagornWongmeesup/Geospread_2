const emptyQueue = () => ({
  report_candidates: [],
  candidate_groups: [],
  pending_reports: [],
})

const messageFromError = (error, fallback) => error?.data?.message ?? fallback

export const useAdminReview = () => {
  const queue = useState('admin-review-queue', emptyQueue)
  const incidentTypes = useState('admin-incident-types', () => [])
  const isLoading = useState('admin-review-loading', () => false)
  const activeAction = useState('admin-review-active-action', () => '')
  const error = useState('admin-review-error', () => '')
  const notice = useState('admin-review-notice', () => '')

  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  const authorizedFetch = (path, options = {}) => {
    const token = getToken()
    if (!token) throw new Error('ไม่พบเซสชันผู้ดูแลระบบ')

    return $fetch(`${config.public.apiBase}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  }

  const load = async () => {
    isLoading.value = true
    error.value = ''

    try {
      const [queueResponse, catalogResponse] = await Promise.all([
        authorizedFetch('/incidents/admin/review-queue'),
        $fetch(`${config.public.apiBase}/incidents/catalog`),
      ])

      queue.value = { ...emptyQueue(), ...(queueResponse.data ?? {}) }
      incidentTypes.value = (catalogResponse.data ?? [])
        .flatMap((category) => category.types ?? [])
        .sort((left, right) => left.type_name.localeCompare(right.type_name, 'th'))
    } catch (caughtError) {
      error.value = messageFromError(caughtError, 'โหลดคิวตรวจสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      isLoading.value = false
    }
  }

  const submit = async ({ key, path, method, body, successMessage }) => {
    activeAction.value = key
    error.value = ''
    notice.value = ''

    try {
      const response = await authorizedFetch(path, { method, body })
      notice.value = response.message ?? successMessage
      await load()
      return true
    } catch (caughtError) {
      error.value = messageFromError(caughtError, 'บันทึกการตรวจสอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      return false
    } finally {
      activeAction.value = ''
    }
  }

  const reviewCandidate = ({ candidateId, action }) => submit({
    key: `candidate-${candidateId}-${action}`,
    path: `/incidents/admin/report-candidates/${candidateId}`,
    method: 'PATCH',
    body: { action },
    successMessage: 'บันทึกการตรวจสอบรายงานแล้ว',
  })

  const reviewCandidateGroup = ({ candidateGroupId, action, typeId }) => submit({
    key: `group-${candidateGroupId}-${action}`,
    path: `/incidents/admin/candidate-groups/${candidateGroupId}`,
    method: 'PATCH',
    body: { action, ...(action === 'accept' ? { type_id: Number(typeId) } : {}) },
    successMessage: 'บันทึกการตรวจสอบกลุ่มรายงานแล้ว',
  })

  const createFromPendingReport = ({ reportId, typeId }) => submit({
    key: `pending-${reportId}-confirm`,
    path: `/incidents/admin/pending-reports/${reportId}/confirm-type`,
    method: 'POST',
    body: { type_id: Number(typeId) },
    successMessage: 'ยืนยันประเภทและจัดการเหตุการณ์แล้ว',
  })

  const rejectPendingReport = ({ reportId }) => submit({
    key: `pending-${reportId}-reject`,
    path: `/incidents/admin/pending-reports/${reportId}/reject`,
    method: 'PATCH',
    body: {},
    successMessage: 'ปฏิเสธรายงานแล้ว',
  })

  const totalPending = computed(() => (
    queue.value.report_candidates.length
    + queue.value.candidate_groups.length
    + queue.value.pending_reports.length
  ))

  return {
    queue,
    incidentTypes,
    isLoading,
    activeAction,
    error,
    notice,
    totalPending,
    load,
    reviewCandidate,
    reviewCandidateGroup,
    createFromPendingReport,
    rejectPendingReport,
  }
}
