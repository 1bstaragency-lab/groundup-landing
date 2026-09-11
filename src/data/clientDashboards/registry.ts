/**
 * Registry of every /client/:slug dashboard. Add a new client by
 * importing its data file here and adding it to the map — that's the
 * whole integration, the route (/client/:slug in App.tsx) is generic.
 */
import type { ClientDashboardData } from './types'
import { STAYBARII_BOUNCE } from './staybarii-bounce'

export const CLIENT_DASHBOARDS: Record<string, ClientDashboardData> = {
  'staybarii-bounce': STAYBARII_BOUNCE,
}
