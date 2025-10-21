import { health, scrape, compareCities, forecastMulti, agentPlan, agentExecute } from '../api'

export function useApi() {
  return { health, scrape, compareCities, forecastMulti, agentPlan, agentExecute }
}


