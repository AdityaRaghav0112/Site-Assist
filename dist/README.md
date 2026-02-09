# Dist folder for Chrome (unpacked) ✅

To load this extension in Chrome (Developer mode):

1. Make sure your server is running: `node server/server.js` from the project root. Ensure `MONGODB_URI` in `server/.env` is set and Atlas allows your IP.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select this `dist/` folder.
5. Click the extension icon and use **Fetch** — if it shows "Error fetching data" check the server and CORS.

Notes:
- This `manifest.json` includes `host_permissions` for `http://localhost:3000/*` so the popup can fetch your local API.
- If you change the API origin, update `manifest.json` accordingly.
