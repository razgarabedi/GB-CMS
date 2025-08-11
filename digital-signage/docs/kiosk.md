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


