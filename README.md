# AA Designs and Development

## Structure
- `backend/` — Express + MySQL (Sequelize) API, serves uploaded images from `public/uploads`
- `frontend/` — Vite + React site with loading screen, toggle menu, and persistent centered brand name

## Local setup

**Backend**
```
cd backend
cp .env.example .env   # fill in your local MySQL credentials
npm install
npm run dev
```

**Frontend**
```
cd frontend
npm install
npm run dev
```

## Creating the first admin user

There's no public signup route on purpose — this is a single-admin dashboard.
Once the DB is synced, insert the first user directly:

```js
// run once, e.g. in a scratch script or node REPL
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
(async () => {
  await User.create({
    email: 'you@yourdomain.com',
    passwordHash: await bcrypt.hash('yourpassword', 10),
    name: 'Admin',
  });
})();
```

## Deploying to Namecheap Stellar

1. **Database:** cPanel → MySQL Databases → create a DB and a user, add the user to the DB with **All Privileges**. Note the full prefixed names (e.g. `youraccount_aadesigns`).
2. **Node app:** cPanel → Setup Node.js App → point it at `backend/`, set the entry point to `src/app.js`, and set environment variables there (not just `.env` — cPanel's Node App Manager sets its own env into the process).
3. **Frontend:** run `npm run build` locally in `frontend/`, then upload the contents of `frontend/dist/` to `public_html` (or a subdomain document root like `app.aadesigns.com` if you're keeping it separate, same pattern as StoryLoom's `app.banorinc.com` setup).
4. **Uploads folder:** make sure `backend/public/uploads` is writable (755) and that its path is reachable at the `UPLOADS_BASE_URL` you set in env — this is what the `/uploads` static route serves.
5. **SSL:** use the same DNS-based DCV validation flow you used for StoryLoom to get the cert on the API subdomain.

No outbound R2/S3 connection is needed anywhere in this stack, so the EPROTO/OpenSSL issue you hit on StoryLoom's Namecheap box shouldn't come up here — images never leave the shared server.
