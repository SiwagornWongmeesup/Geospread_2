/**
 * Shared presentation state for the desktop home dashboard.
 * This remains local mock state until the incident API is connected.
 */
export const useHomeDashboard = () => {
  const selectedIncident = useState('home-selected-incident', () => null)

  const selectIncident = (incident) => {
    selectedIncident.value = incident
  }

  const clearSelectedIncident = () => {
    selectedIncident.value = null
  }

  return {
    selectedIncident,
    selectIncident,
    clearSelectedIncident,
  }
}
