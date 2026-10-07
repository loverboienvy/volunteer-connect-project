# Volunteer Connect (React + Laravel)

Folder layout: `frontend/` (React + Vite) and `backend/` (Laravel files to copy into a fresh Laravel project).

## 1. Backend (Laravel 11 or 12, PHP 8.2+)
```bash
composer create-project laravel/laravel volunteer-connect-api
cd volunteer-connect-api
php artisan install:api          # installs Sanctum + routes/api.php
```
Copy the contents of `backend/` into `volunteer-connect-api/`, overwriting:
`app/Models/*`, `app/Http/Controllers/*`, `routes/api.php`, `database/migrations/*`, `database/seeders/DatabaseSeeder.php`, and `Dockerfile`.

Edit `.env` (SQLite is the easiest locally; the default `DB_CONNECTION=sqlite` already works), then:
```bash
php artisan migrate --seed
php artisan serve                # http://localhost:8000
```
Demo logins (password `password123`): `org@demo.com` and `volunteer@demo.com`.
Test an endpoint: `GET http://localhost:8000/api/opportunities` (use Postman or Thunder Client in VS Code).

## 2. Frontend
```bash
cd frontend
copy .env.example .env           # (macOS/Linux: cp)
npm install
npm run dev                      # http://localhost:5173
```

## 3. Deploy
**Backend on Render** (Docker web service + free PostgreSQL):
1. Push the Laravel project to GitHub (it must include the `Dockerfile`).
2. Render: New > PostgreSQL, then New > Web Service > connect repo > Runtime: Docker.
3. Environment variables: `APP_KEY` (run `php artisan key:generate --show` locally), `APP_ENV=production`, `APP_DEBUG=false`, `DB_CONNECTION=pgsql`, `DB_URL` = the database's Internal URL.
4. After the first deploy, open the service Shell and run `php artisan db:seed --force` (optional demo data).

**Frontend on Netlify**: connect the repo, base directory `frontend`, build `npm run build`, publish `dist`, and set `VITE_API_URL=https://YOUR-SERVICE.onrender.com/api`. `public/_redirects` makes React Router work on refresh.

Tokens are sent as `Authorization: Bearer` headers, so no cookie or CORS-credentials setup is needed. Render's free tier sleeps, so the first request can be slow.

## UI notes
- Design tokens live at the top of `frontend/src/index.css` (colors, radius, shadows). Change `--pri` / `--acc` to re-theme the whole app.
- Light/dark mode follows the system and can be toggled from the header (saved in `localStorage`).
- Category colors and icons are defined once in `components/OppCard.jsx` (`CAT`).
- The "Try a demo account" buttons on the login page use the seeded demo logins; delete that block in `pages/Auth.jsx` before a real launch.
