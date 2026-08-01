import { formatTime } from '../hooks/useMqtt'

export default function LampCard({
  lamp,
  autoEnabled,
  onToggle,
  onOpenSchedule,
  flash,
}) {
  const isOn = lamp.state === 'ON'
  const scheduleActive = autoEnabled && lamp.schedule.enabled

  return (
    <article className={`lamp-card ${isOn ? 'is-on' : 'is-off'} ${flash ? 'flash' : ''}`}>
      <button
        type="button"
        className="lamp-toggle"
        onClick={() => onToggle(lamp.id)}
        aria-pressed={isOn}
        aria-label={`${lamp.name} ${isOn ? 'matikan' : 'nyalakan'}`}
      >
        <span className="lamp-glow" aria-hidden="true" />
        <svg className="lamp-icon" viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M32 6c-9.4 0-17 7.6-17 17 0 7.1 4.1 13.3 10 16.1V46h14V39.1c5.9-2.8 10-9 10-16.1 0-9.4-7.6-17-17-17z"
            fill="currentColor"
          />
          <rect x="23" y="48" width="18" height="4" rx="1.5" fill="currentColor" opacity="0.7" />
          <rect x="25" y="54" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.45" />
        </svg>
        <span className="lamp-status">{isOn ? 'Nyala' : 'Mati'}</span>
      </button>

      <div className="lamp-meta">
        <h2 className="lamp-name">{lamp.name}</h2>
        <p className="lamp-id">Relay {lamp.id}</p>

        <div className="lamp-schedule-preview">
          <span className={`schedule-chip ${scheduleActive ? 'active' : ''}`}>
            {scheduleActive ? 'Jadwal aktif' : 'Jadwal off'}
          </span>
          <span className="schedule-times">
            {formatTime(lamp.schedule.onH, lamp.schedule.onM)} –{' '}
            {formatTime(lamp.schedule.offH, lamp.schedule.offM)}
          </span>
        </div>

        <button type="button" className="btn-schedule" onClick={() => onOpenSchedule(lamp)}>
          Atur jadwal
        </button>
      </div>
    </article>
  )
}
