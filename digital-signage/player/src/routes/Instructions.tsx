export default function Instructions() {
  return (
    <div style={{ padding: '2rem', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <h1>Digital Signage Player</h1>
      <p>Launch a screen at route <code>/player/:screenId</code>.</p>
      <h2>Kiosk Mode (Chromium/Chrome)</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: '1rem' }}>
--kiosk --kiosk-printing --disable-infobars --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required --noerrdialogs --disable-translate --disable-features=TranslateUI --app=http://localhost:5173/player/screen-1
      </pre>
      <p>On Windows, create a shortcut with the above flags targeting your player URL.</p>
    </div>
  )
}


