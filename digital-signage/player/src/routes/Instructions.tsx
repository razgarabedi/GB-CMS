export default function Instructions() {
  return (
    <div style={{ padding: '2rem', color: '#fff', background: '#000', height: '100vh', overflowY: 'auto' }}>
      <h1>Digital Signage Player</h1>
      <p>Launch a screen at <code>/player/:screenId</code>. Example: <code>/player/screen-1</code></p>

      <h2>Quick links</h2>
      <ul>
        <li><a href="http://localhost:3000/admin-advanced" style={{ color: '#4ade80', fontWeight: 'bold' }}>🚀 Advanced Admin Interface (Server)</a></li>
        <li><a href="http://localhost:3000/admin" style={{ color: '#60a5fa' }}>📊 Basic Admin Interface (Server)</a></li>
        <li><a href="/preview">Preview Mode</a></li>
        <li><a href="/editor">Layout Editor</a></li>
        <li><a href="#win">Windows kiosk</a></li>
        <li><a href="#ubuntu">Ubuntu kiosk (24.04/25 GNOME/Wayland)</a></li>
        <li><a href="#autologin">Auto‑login (Ubuntu)</a></li>
        <li><a href="#systemd">Auto‑start service (systemd user)</a></li>
        <li><a href="#cursor">Hide cursor (Invisible theme)</a></li>
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
      
      <h2 id="cursor">Hide cursor without moving it (Invisible theme, Wayland/Xorg)</h2>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', padding: '1rem' }}>
        <code>{`# Goal: hide the pointer globally without synthesizing mouse events.
# Works on GNOME/Wayland and Xorg by using an invisible cursor theme.

# 1) Install tools (xcursorgen is in x11-apps on Ubuntu 25)
sudo apt update
sudo apt install -y x11-apps imagemagick

# 2) Create the theme files
sudo mkdir -p /usr/share/icons/Invisible/cursors
sudo nano /usr/share/icons/Invisible/index.theme
# Paste:
[Icon Theme]
Name=Invisible
Comment=Invisible cursor theme to hide pointer
Inherits=Adwaita

# 3) Create a 1x1 transparent image (choose one method)
cd /usr/share/icons/Invisible/cursors
sudo convert -size 1x1 xc:none transparent.png || sudo magick -size 1x1 xc:none transparent.png || \
  (printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=' | sudo base64 -d > transparent.png)

# 4) Build an invisible left_ptr cursor
sudo nano /usr/share/icons/Invisible/cursors/left_ptr.cursor.cfg
# Paste:
32 1 1 transparent.png
sudo xcursorgen /usr/share/icons/Invisible/cursors/left_ptr.cursor.cfg /usr/share/icons/Invisible/cursors/left_ptr

# 5) Symlink common cursor names to the invisible one
for n in default arrow hand2 pointer text xterm ibeam crosshair watch wait move grabbing grab \
col-resize row-resize n-resize s-resize e-resize w-resize ne-resize nw-resize se-resize sw-resize \
not-allowed context-menu; do
  sudo ln -sf left_ptr "/usr/share/icons/Invisible/cursors/$n"
done

# 6) Make it the system default (no D-Bus session needed)
sudo update-alternatives --install /usr/share/icons/default/index.theme x-cursor-theme /usr/share/icons/Invisible/index.theme 100
sudo update-alternatives --set x-cursor-theme /usr/share/icons/Invisible/index.theme

# 7) Reboot to apply everywhere
sudo reboot

# Revert: restore the normal cursor later
# Option A (system-wide):
sudo update-alternatives --install /usr/share/icons/default/index.theme x-cursor-theme /usr/share/icons/Adwaita/index.theme 50
sudo update-alternatives --set x-cursor-theme /usr/share/icons/Adwaita/index.theme

# Option B (per-user, from inside the desktop session):
gsettings set org.gnome.desktop.interface cursor-theme 'Adwaita'`}</code>
      </pre>
      
    </div>
  )
}


