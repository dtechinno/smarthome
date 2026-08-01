export const MQTT_URL = import.meta.env.VITE_MQTT_URL || 'ws://emqx.dtek.co.id:8083/mqtt'
export const MQTT_USER = import.meta.env.VITE_MQTT_USER || 'home'
export const MQTT_PASS = import.meta.env.VITE_MQTT_PASS || 'home'
export const BASE_TOPIC = import.meta.env.VITE_MQTT_BASE || 'home/lamp/'
export const RELAY_COUNT = Number(import.meta.env.VITE_RELAY_COUNT || 4)

export const TOPICS = {
  stateRelay: `${BASE_TOPIC}state/relay/#`,
  stateSchedule: `${BASE_TOPIC}state/schedule/#`,
  stateAuto: `${BASE_TOPIC}state/auto`,
  stateDevice: `${BASE_TOPIC}state/device`,
  cmdToggle: `${BASE_TOPIC}cmd/toggle`,
  cmdSchedule: `${BASE_TOPIC}cmd/schedule`,
  cmdAuto: `${BASE_TOPIC}cmd/auto`,
  cmdSync: `${BASE_TOPIC}cmd/sync`,
}

export const LAMP_LABELS = [
  'Luar Paralel',
  'Teras',
  'Ruang Tengah Low',
  'Ruang Tengah High',
]
