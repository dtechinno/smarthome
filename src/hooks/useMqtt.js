import { useCallback, useEffect, useRef, useState } from 'react'
import mqtt from 'mqtt'
import {
  MQTT_URL,
  MQTT_USER,
  MQTT_PASS,
  RELAY_COUNT,
  TOPICS,
  LAMP_LABELS,
} from '../mqtt/config'

function createInitialLamps() {
  return Array.from({ length: RELAY_COUNT }, (_, i) => ({
    id: i + 1,
    name: LAMP_LABELS[i] || `Lampu ${i + 1}`,
    state: 'OFF',
    schedule: {
      onH: 18,
      onM: 0,
      offH: 6,
      offM: 0,
      enabled: true,
    },
  }))
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function formatTime(h, m) {
  return `${pad2(h)}:${pad2(m)}`
}

export function parseTime(value) {
  const [h, m] = value.split(':').map(Number)
  return { h: h || 0, m: m || 0 }
}

export function useMqtt() {
  const clientRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [deviceOnline, setDeviceOnline] = useState(false)
  const [autoEnabled, setAutoEnabled] = useState(true)
  const [lamps, setLamps] = useState(createInitialLamps)
  const [lastEvent, setLastEvent] = useState(null)

  const publish = useCallback((topic, payload) => {
    const client = clientRef.current
    if (!client?.connected) return
    client.publish(topic, JSON.stringify(payload), { qos: 0 })
  }, [])

  const setLampState = useCallback(
    (relay, state) => {
      // Optimistic UI: glow/animasi langsung update tanpa nunggu roundtrip MQTT
      setLamps((prev) =>
        prev.map((lamp) =>
          lamp.id === relay ? { ...lamp, state: state === 'ON' ? 'ON' : 'OFF' } : lamp,
        ),
      )
      setLastEvent({ type: 'relay', relay, state, at: Date.now() })
      publish(TOPICS.cmdToggle, { relay, state })
    },
    [publish],
  )

  const toggleLamp = useCallback(
    (relay) => {
      const lamp = lamps.find((l) => l.id === relay)
      if (!lamp) return
      setLampState(relay, lamp.state === 'ON' ? 'OFF' : 'ON')
    },
    [lamps, setLampState],
  )

  const setSchedule = useCallback(
    (relay, schedule) => {
      publish(TOPICS.cmdSchedule, {
        relay,
        onH: schedule.onH,
        onM: schedule.onM,
        offH: schedule.offH,
        offM: schedule.offM,
        enabled: schedule.enabled,
      })
    },
    [publish],
  )

  const setAutoMode = useCallback(
    (enabled) => {
      publish(TOPICS.cmdAuto, { auto: enabled })
    },
    [publish],
  )

  const requestSync = useCallback(() => {
    publish(TOPICS.cmdSync, { request: true })
  }, [publish])

  useEffect(() => {
    const client = mqtt.connect(MQTT_URL, {
      username: MQTT_USER,
      password: MQTT_PASS,
      clientId: `web-dashboard-${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 10000,
    })

    clientRef.current = client

    client.on('connect', () => {
      setConnected(true)
      client.subscribe([
        TOPICS.stateRelay,
        TOPICS.stateSchedule,
        TOPICS.stateAuto,
        TOPICS.stateDevice,
      ])
      client.publish(TOPICS.cmdSync, JSON.stringify({ request: true }))
    })

    client.on('reconnect', () => setConnected(false))
    client.on('close', () => setConnected(false))
    client.on('offline', () => setConnected(false))
    client.on('error', () => setConnected(false))

    client.on('message', (topic, payloadBuf) => {
      let data
      try {
        data = JSON.parse(payloadBuf.toString())
      } catch {
        return
      }

      if (topic === TOPICS.stateDevice) {
        setDeviceOnline(Boolean(data.online))
        return
      }

      if (topic === TOPICS.stateAuto) {
        setAutoEnabled(Boolean(data.auto))
        return
      }

      if (topic.startsWith(TOPICS.stateRelay.replace('#', '')) || topic.includes('/state/relay')) {
        const relay = Number(data.relay)
        if (!relay) return
        setLamps((prev) =>
          prev.map((lamp) =>
            lamp.id === relay ? { ...lamp, state: data.state === 'ON' ? 'ON' : 'OFF' } : lamp,
          ),
        )
        setLastEvent({ type: 'relay', relay, state: data.state, at: Date.now() })
        return
      }

      if (topic.includes('/state/schedule')) {
        const relay = Number(data.relay)
        if (!relay) return
        setLamps((prev) =>
          prev.map((lamp) =>
            lamp.id === relay
              ? {
                  ...lamp,
                  schedule: {
                    onH: data.onH ?? lamp.schedule.onH,
                    onM: data.onM ?? lamp.schedule.onM,
                    offH: data.offH ?? lamp.schedule.offH,
                    offM: data.offM ?? lamp.schedule.offM,
                    enabled: data.enabled ?? lamp.schedule.enabled,
                  },
                }
              : lamp,
          ),
        )
        setLastEvent({ type: 'schedule', relay, at: Date.now() })
      }
    })

    return () => {
      client.end(true)
      clientRef.current = null
    }
  }, [])

  return {
    connected,
    deviceOnline,
    autoEnabled,
    lamps,
    lastEvent,
    toggleLamp,
    setLampState,
    setSchedule,
    setAutoMode,
    requestSync,
  }
}
