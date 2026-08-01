import { useEffect, useState } from 'react'
import { formatTime, parseTime } from '../hooks/useMqtt'

export default function ScheduleModal({ lamp, onClose, onSave }) {
  const [onTime, setOnTime] = useState(formatTime(lamp.schedule.onH, lamp.schedule.onM))
  const [offTime, setOffTime] = useState(formatTime(lamp.schedule.offH, lamp.schedule.offM))
  const [enabled, setEnabled] = useState(lamp.schedule.enabled)

  useEffect(() => {
    setOnTime(formatTime(lamp.schedule.onH, lamp.schedule.onM))
    setOffTime(formatTime(lamp.schedule.offH, lamp.schedule.offM))
    setEnabled(lamp.schedule.enabled)
  }, [lamp])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = (e) => {
    e.preventDefault()
    const on = parseTime(onTime)
    const off = parseTime(offTime)
    onSave(lamp.id, {
      onH: on.h,
      onM: on.m,
      offH: off.h,
      offM: off.m,
      enabled,
    })
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="modal-eyebrow">Jadwal lampu</p>
            <h3 id="schedule-title">{lamp.name}</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </header>

        <form className="schedule-form" onSubmit={handleSave}>
          <label className="toggle-row">
            <span>
              <strong>Aktifkan jadwal</strong>
              <small>Hanya lampu ini yang dijadwalkan</small>
            </span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </label>

          <div className="time-grid">
            <label>
              Jam nyala
              <input
                type="time"
                value={onTime}
                onChange={(e) => setOnTime(e.target.value)}
                required
              />
            </label>
            <label>
              Jam mati
              <input
                type="time"
                value={offTime}
                onChange={(e) => setOffTime(e.target.value)}
                required
              />
            </label>
          </div>

          <p className="schedule-hint">
            Jadwal mengikuti waktu WIB di perangkat ESP32. Manual button dan toggle dashboard tetap
            bisa dipakai kapan saja.
          </p>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan jadwal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
