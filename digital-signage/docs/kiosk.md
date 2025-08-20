### Digital Signage Player – Kiosk Mode Guide

This guide shows how to run the player fullscreen in kiosk mode on common devices. Replace the sample URL with your actual player URL, for example:

- Development: `http://localhost:5173/player/screen-1`
- Docker (default compose): `http://localhost:8080/player/screen-1`

### Raspberry Pi (Chromium)

1) Install Chromium (Raspberry Pi OS usually includes it):
```bash
sudo apt update && sudo apt install -y chromium-browser
```

2) Launch Chromium in kiosk mode with recommended flags:
```bash
chromium-browser \
  --kiosk \
  --start-fullscreen \
  --incognito \
  --noerrdialogs \
  --disable-infobars \
  --disable-translate \
  --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required \
  --check-for-update-interval=31536000 \
  --overscroll-history-navigation=0 \
  --test-type \
  --app=http://localhost:8080/player/screen-1
```

3) Optional: Auto start on boot via systemd (user service):
```bash
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/kiosk.service <<'UNIT'
[Unit]
Description=Chromium Kiosk
After=graphical-session.target network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/chromium-browser --kiosk --start-fullscreen --incognito --noerrdialogs --disable-infobars --disable-translate --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required --check-for-update-interval=31536000 --overscroll-history-navigation=0 --test-type --app=http://localhost:8080/player/screen-1
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
UNIT
systemctl --user enable --now kiosk.service
```

4) Disable screen blanking on Raspberry Pi (console):
```bash
sudo raspi-config  # Display Options -> Screen Blanking -> Disable
```

### Ubuntu 24.04/25 (GNOME/Wayland)

1) Disable screen blank/lock (GNOME):
```bash
gsettings set org.gnome.desktop.session idle-delay 0
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-battery-type 'nothing'
```

2) Launch Chromium in kiosk mode. Add `?cursor=none` to your player URL (or set `hideCursor: true` in the screen config) to pre-hide the cursor at page load:
```bash
chromium \
  --kiosk \
  --start-fullscreen \
  --no-first-run \
  --no-default-browser-check \
  --noerrdialogs \
  --disable-infobars \
  --disable-translate \
  --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required \
  --ozone-platform-hint=auto \
  --app=http://localhost:8080/player/screen-1?cursor=none
```

3) Hide cursor without moving it (Wayland/Xorg): Invisible cursor theme

Avoid synthesizing mouse movement. Create an "Invisible" cursor theme and select it as the system default so the pointer is hidden from login.

```bash
# Tools (Ubuntu 25: xcursorgen is in x11-apps)
sudo apt update
sudo apt install -y x11-apps imagemagick

# Create theme skeleton
sudo mkdir -p /usr/share/icons/Invisible/cursors
sudo nano /usr/share/icons/Invisible/index.theme
# Paste:
[Icon Theme]
Name=Invisible
Comment=Invisible cursor theme to hide pointer
Inherits=Adwaita

# Create a 1x1 transparent PNG (use whichever is available)
cd /usr/share/icons/Invisible/cursors
sudo convert -size 1x1 xc:none transparent.png || sudo magick -size 1x1 xc:none transparent.png || \
  (printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=' | sudo base64 -d > transparent.png)

# Build an invisible left_ptr
sudo nano /usr/share/icons/Invisible/cursors/left_ptr.cursor.cfg
# Paste:
32 1 1 transparent.png
sudo xcursorgen /usr/share/icons/Invisible/cursors/left_ptr.cursor.cfg /usr/share/icons/Invisible/cursors/left_ptr

# Symlink common cursor aliases
for n in default arrow hand2 pointer text xterm ibeam crosshair watch wait move grabbing grab \
col-resize row-resize n-resize s-resize e-resize w-resize ne-resize nw-resize se-resize sw-resize \
not-allowed context-menu; do
  sudo ln -sf left_ptr "/usr/share/icons/Invisible/cursors/$n"
done

# Set as system default (no D-Bus session needed)
sudo update-alternatives --install /usr/share/icons/default/index.theme x-cursor-theme /usr/share/icons/Invisible/index.theme 100
sudo update-alternatives --set x-cursor-theme /usr/share/icons/Invisible/index.theme

# Reboot to apply everywhere
sudo reboot
```

Revert to the normal cursor later:

```bash
sudo update-alternatives --install /usr/share/icons/default/index.theme x-cursor-theme /usr/share/icons/Adwaita/index.theme 50
sudo update-alternatives --set x-cursor-theme /usr/share/icons/Adwaita/index.theme
```

### Android TV

Use a kiosk browser app that autostarts and keeps the screen awake. Two common options:

- Fully Kiosk Browser (recommended)
  - Install from Play Store (or sideload on Android TV if needed).
  - Set Start URL: `http://your-host:8080/player/screen-1`
  - Enable: Autostart on Boot, Keep Screen On, Immersive/Fullscreen, JavaScript enabled.
  - Optionally whitelist your domain; disable gestures and address bar.

- SureFox / KioWare / other kiosk apps
  - Configure to launch the same URL on boot and keep the device awake.

Tip: In Android Developer options, enable “Stay awake” while charging to prevent sleep.

### ChromeOS / Chromebox

Two typical approaches depending on management:

- Managed Single-App Kiosk (Google Admin Console)
  - Create a Single-App Kiosk policy and set the player URL as the startup page (via a kiosk web app or Managed Guest Session with startup URL).
  - Enable auto-launch and keep awake settings per policy.

- Local Kiosk (non-managed)
  - On the sign-in screen, press Ctrl+Alt+K to enable kiosk mode (if available).
  - In chrome, go to `chrome://extensions`, enable Developer mode, click “Manage kiosk applications”, add a kiosk web app, and set it to auto-launch with your URL.
  - Note: Options vary by ChromeOS version; managed deployments are recommended for reliability.

### Kiosk Checklist

- Disable screensaver/screen blanking and power saving that turns off the display.
- Keep device awake (prevent sleep). Enable “stay awake” or equivalent settings.
- Configure auto-start on boot and auto-restart on crash.
- Ensure device restarts automatically on power failure (BIOS/firmware “Restore on AC Power Loss” or vendor equivalent).
- Lock down updates and schedule maintenance outside business hours.
- Use wired Ethernet where possible for stability; otherwise configure Wi-Fi to auto-reconnect.


