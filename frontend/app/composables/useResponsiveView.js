/**
 * Shares one device state between route middleware, the resize plugin, and
 * page controllers. Page controllers use `isMobile` to select their view.
 */
export const useResponsiveView = (options = {}) => {
  const viewMode = useState('responsive-view', () => 'desktop')
  const isMobile = computed(() => viewMode.value === 'mobile')

  if (options.syncLayout) {
    watchEffect(() => {
      setPageLayout(isMobile.value ? 'mobile' : 'default')
    })
  }

  return {
    viewMode,
    isMobile
  }
}
