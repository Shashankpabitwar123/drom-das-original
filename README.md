# DormDash App (Vite + React + Tailwind)

Implements:
- Splash truck animation (2.8s), then **Auth** screen if not logged-in.
- Auth screen with **Log in / Create account** (big font, same colors).
- **Home** page matching the provided screenshot (Inter font, brand indigo, card layout).
- **Manage Account** accordion **closed by default**; expands on click.

## Run
```bash
npm i
npm run dev
```
Open the printed local URL.

To reset auth and re-show the login, clear `localStorage` key `dormdash_authed`.
