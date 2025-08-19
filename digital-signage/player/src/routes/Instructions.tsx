export default function Instructions() {
  return (
    <div style={{ padding: '2rem', color: '#fff', background: '#000', height: '100vh', overflowY: 'auto' }}>
      <h1>Digital Signage Player</h1>
      <p>Launch a screen at <code>/player/:screenId</code>. Example: <code>/player/screen-1</code></p>

      <h2>Quick links</h2>
      <ul>
        <li><a href="#win">Windows kiosk</a></li>
        <li><a href="#ubuntu">Ubuntu kiosk (24.04/25 GNOME/Wayland)</a></li>
        <li><a href="#autologin">Auto‑login (Ubuntu)</a></li>
        <li><a href="#systemd">Auto‑start service (systemd user)</a></li>
        <li><a href="#mouse">Move mouse to corner (Wayland)</a></li>
      </ul>

      <h2 id="win">Windows kiosk (Chromium/Chrome)</h2>
      <pre style={{ whiteSpace: 'pre', background: '#111', padding: '1rem', overflowX: 'auto' }}>
        <code>{`--kiosk --kiosk-printing --disable-infobars --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required --noerrdialogs --disable-translate --disable-features=TranslateUI --app=http://localhost:5173/player/screen-1`}</code>
      </pre>
      <p>Create a shortcut with the above flags, replacing the URL with your player.</p>

      <h2 id="ubuntu">Ubuntu kiosk (24.04/25, GNOME/Wayland)</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: '1rem' }}>
        <code>{`# Disable screen blank/lock (GNOME)
gsettings set org.gnome.desktop.session idle-delay 0
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type 'nothing'

# Launch Chromium (use :5173 dev, :8080 docker, or your Nginx URL)
# To hide the cursor, add ?cursor=none to the URL
chromium --kiosk --start-fullscreen \
  --no-first-run --no-default-browser-check --noerrdialogs \
  --disable-infobars --disable-session-crashed-bubble \
  --disable-translate --autoplay-policy=no-user-gesture-required \
  --ozone-platform-hint=auto \
  --app=http://localhost:5173/player/screen-1?cursor=none

# Example for docker player:
# chromium --kiosk --start-fullscreen --ozone-platform-hint=auto --app=http://localhost:8080/player/screen-1?cursor=none`}</code>
      </pre>
      <p>Tip: If Chromium isn&rsquo;t installed, use the Snap (`sudo snap install chromium`) or your distro package. Adjust the URL and flags as needed.</p>

      <h2 id="systemd">Auto‑start service (systemd user)</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: '1rem' }}>
        <code>{`sudo -u signage mkdir -p /home/signage/.config/systemd/user
sudo -u signage nano /home/signage/.config/systemd/user/player-kiosk.service

# 
[Unit]
Description=Digital Signage Kiosk
Wants=graphical-session.target
After=graphical-session.target
PartOf=graphical-session.target

[Service]
Type=simple
ExecStart=/snap/bin/chromium --kiosk --start-fullscreen --no-first-run --no-default-browser-check ->
Restart=always
RestartSec=3

[Install]
WantedBy=graphical-session.target

# Ensure ownership and permissions
sudo chown signage:signage /home/signage/.config/systemd/user/player-kiosk.service
sudo chmod 644 /home/signage/.config/systemd/user/player-kiosk.service

# Reload and enable (try both machine selectors depending on systemd version)
sudo systemctl --user --machine=signage@.host daemon-reload || true
sudo systemctl --user --machine=signage@ daemon-reload || true
sudo systemctl --user --machine=signage@.host enable --now player-kiosk.service || \
  sudo systemctl --user --machine=signage@ enable --now player-kiosk.service

# Verify it is visible to systemd
sudo systemctl --user --machine=signage@.host list-unit-files | grep -i kiosk || \
  sudo systemctl --user --machine=signage@ list-unit-files | grep -i kiosk`}</code>
      </pre>

      <h2 id="autologin">Auto‑login (Ubuntu)</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: '1rem' }}>
        <code>{`# 1) Create a dedicated user (example: signage)
sudo adduser signage

# 2) Enable auto‑login (GDM3, default on Ubuntu GNOME)
sudo nano /etc/gdm3/custom.conf
# Under [daemon] add or uncomment:
# AutomaticLoginEnable = true
# AutomaticLogin = signage

# 2b) If you use LightDM instead:
sudo nano /etc/lightdm/lightdm.conf
# Add:
# [Seat:*]
# autologin-user=signage
# autologin-user-timeout=0

# 3) Allow the user session to manage services reliably
sudo loginctl enable-linger signage

# 4) Enable the kiosk service for the signage user
su - signage -c 'systemctl --user daemon-reload && systemctl --user enable --now player-kiosk.service'

# 5) Reboot to test (wait for desktop to appear; Chromium should start automatically)
sudo reboot`}</code>
      </pre>
      
      <h2 id="mouse">Move mouse to bottom‑right on login (Wayland)</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: '1rem' }}>
        <code>{`# Goal: when the 'signage' user logs in (Wayland), move the cursor to the
# bottom‑right so it stays out of the way. Use ydotool (input emulation).

# 1) Install ydotool
sudo apt install -y ydotool

# 2) Create a small script that moves the cursor far to the bottom‑right
sudo -u signage mkdir -p /home/signage/bin
sudo -u signage nano /home/signage/bin/move-cursor-bottom-right.sh

# Paste the following, save and exit:
# ---8<--- /home/signage/bin/move-cursor-bottom-right.sh
#!/usr/bin/env bash
set -euo pipefail

# Wait for the Wayland session/runtime to be ready
sleep 4

# Start ydotoold if it's not already running (no error if already running)
if ! pgrep -u "$UID" -x ydotoold >/dev/null 2>&1; then
  (ydotoold >/dev/null 2>&1 &) || true
  sleep 0.5
fi

# Move a very large relative delta so the pointer lands at bottom‑right
# (works regardless of resolution or multi‑monitor bounds)
ydotool mousemove 100000 100000 || true
# ---8<---
sudo -u signage chmod +x /home/signage/bin/move-cursor-bottom-right.sh

# 3) Create a systemd user service to run the script at login
sudo -u signage mkdir -p /home/signage/.config/systemd/user
sudo -u signage nano /home/signage/.config/systemd/user/cursor-bottom-right.service

# Paste the following, save and exit:
# ---8<--- /home/signage/.config/systemd/user/cursor-bottom-right.service
[Unit]
Description=Move mouse to bottom-right after login (Wayland)
Wants=graphical-session.target
After=graphical-session.target
PartOf=graphical-session.target

[Service]
Type=oneshot
ExecStart=/home/signage/bin/move-cursor-bottom-right.sh
RemainAfterExit=no

[Install]
WantedBy=graphical-session.target
# ---8<---

# 4) Enable the service for the signage user
sudo systemctl --user --machine=signage@.host daemon-reload || true
sudo systemctl --user --machine=signage@ daemon-reload || true
sudo systemctl --user --machine=signage@.host enable --now cursor-bottom-right.service || \
  sudo systemctl --user --machine=signage@ enable --now cursor-bottom-right.service
su - signage -c 'systemctl --user daemon-reload && systemctl --user enable --now cursor-bottom-right.service'

# Notes:
# - This approach uses a large relative move; it’s compositor‑agnostic and
#   avoids needing to know the screen resolution.
# - If your distro ships a user unit for ydotoold, you can also enable it with:
#   su - signage -c "systemctl --user enable --now ydotoold.service"`}</code>
      </pre>
      
    </div>
  )
}


