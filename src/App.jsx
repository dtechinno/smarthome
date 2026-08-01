import { useEffect, useState } from 'react'
import LampCard from './components/LampCard'
import ScheduleModal from './components/ScheduleModal'
import { useMqtt } from './hooks/useMqtt'
import './App.css'

export default function App() {
  const {
    connected,
    deviceOnline,
    autoEnabled,
    lamps,
    lastEvent,
    toggleLamp,
    setSchedule,
    setAutoMode,
    requestSync,
  } = useMqtt()

  const [editingLamp, setEditingLamp] = useState(null)
  const [flashRelay, setFlashRelay] = useState(null)

  useEffect(() => {
    if (!lastEvent || lastEvent.type !== 'relay') return
    setFlashRelay(lastEvent.relay)
    const t = setTimeout(() => setFlashRelay(null), 500)
    return () => clearTimeout(t)
  }, [lastEvent])

  const onCount = lamps.filter((l) => l.state === 'ON').length

  return (
    <div className="app-shell">
      <div className="bg-atmosphere" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-block">
          <p className="brand">Smart Rumah Berkah</p>
          <h1>Kontrol Lampu</h1>
          <p className="lede">
            Kendalikan 4 relay dari mana saja. Tombol manual di perangkat tetap berfungsi, dan status
            tersinkron realtime ke semua dashboard.
          </p>
        </div>

        <div className="status-panel">
          <div className={`pill ${connected ? 'ok' : 'bad'}`}>
            <span className="dot" />
            Broker {connected ? 'terhubung' : 'terputus'}
          </div>
          <div className={`pill ${deviceOnline ? 'ok' : 'warn'}`}>
            <span className="dot" />
            ESP32 {deviceOnline ? 'online' : 'offline'}
          </div>
          <button type="button" className="btn-ghost sync-btn" onClick={requestSync}>
            Sync ulang
          </button>
        </div>
      </header>

      <section className="master-bar" aria-label="Pengaturan master">
        <div className="master-copy">
          <h2>Scheduling master</h2>
          <p>
            {autoEnabled
              ? 'Jadwal per-lampu akan dijalankan otomatis.'
              : 'Semua jadwal di-pause. Kontrol manual tetap aktif.'}
          </p>
        </div>

        <div className="master-controls">
          <label className="master-switch">
            <span>{autoEnabled ? 'Aktif' : 'Pause'}</span>
            <input
              type="checkbox"
              checked={autoEnabled}
              onChange={(e) => setAutoMode(e.target.checked)}
            />
          </label>

          <div className="live-summary" aria-live="polite">
            <strong>{onCount}</strong>
            <span>lampu nyala</span>
          </div>
        </div>
      </section>

      <main className="lamp-grid">
        {lamps.map((lamp) => (
          <LampCard
            key={lamp.id}
            lamp={lamp}
            autoEnabled={autoEnabled}
            onToggle={toggleLamp}
            onOpenSchedule={setEditingLamp}
            flash={flashRelay === lamp.id}
          />
        ))}
      </main>

      {editingLamp && (
        <ScheduleModal
          lamp={editingLamp}
          onClose={() => setEditingLamp(null)}
          onSave={setSchedule}
        />
      )}

      <footer className="footer-note">
        Perubahan dari dashboard, perangkat lain, atau tombol fisik ESP32 langsung muncul di sini.
      </footer>
    </div>
  )
}
