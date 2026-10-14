# Store

A shop UI and an API that only partly meet. The page is React in `frontend/`. The API is Express in `backend/`.

Sign up with a name, an email, and a password of at least six characters. Login uses that email and password. Passwords are bcrypt-hashed. Both responses set httpOnly cookies: `accessToken` for 15 minutes and `refreshToken` for 7 days. The refresh token is also stored in Redis for 7 days. `/api/auth/refresh-token` will issue a new access token, and the page never calls it, so after 15 minutes the session check fails until the next login. Cookies are marked secure when `NODE_ENV` is `production`.

A new account has role `customer`. Nothing in this repo changes that role. The dashboard link and `/secret-dashboard` require `admin`, which means setting the field in MongoDB. Signup and login return `{ user, message }`, and the page stores that whole object as the current user, so `role` is one level down until the next load. On load, `/api/auth/profile` returns the account itself.

The home page is seven category tiles: jeans, t-shirts, shoes, glasses, jackets, suits, and bags. `App.jsx` registers `/`, `/signup`, `/login`, and `/secret-dashboard`. The tile paths and `/cart` are not among them. The cart badge is the number 3.

`/secret-dashboard` is an admin screen with three tabs. Create Product reads an image file as base64 and the API uploads it to Cloudinary under `products`. Products lists what an admin can fetch and delete. Analytics shows user count, product count, order count, revenue, and daily sales for the last seven days.

Public product reads are `/api/products/featured` (cached in Redis), `/api/products/category/:category`, and `/api/products/recommendations` (three random products). Creating, deleting, listing every product, and toggling `isFeatured` require an admin.

Cart, coupons, and Stripe checkout live on the API. Cart routes are mounted on `/api/products` after the product routes, so `GET /api/products` and `POST /api/products` are handled as product routes. The cart handlers also look up `item.id`, while the user schema stores `cartItems` as `{ quantity, product }`. Checkout creates a Stripe session in USD. A paid total of $200 or more saves a 10% coupon, code `GIFT` plus six random characters, expiring in 30 days, and replaces any coupon that user already has. Stripe's success and cancel URLs are `CLIENT_URL` plus `/purchase-success` and `/purchase-cancel`. Those paths are not routes in the page.

## Run

From the repo root, the API reads `.env` in that directory:

```
PORT=5000
MONGO_URI=...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
NODE_ENV=development
CLIENT_URL=...

UPSTASH_REDIS_URL=...
STRIPE_SECRET_KEY=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

`PORT` falls back to 5000. The Redis client is created when the server loads, so a missing `UPSTASH_REDIS_URL` stops startup.

```bash
npm install
npm run dev
```

`npm start` runs the same API without nodemon. The API does not serve a frontend build.

The page's own `package.json` depends on React only. Router, axios, Zustand, and the other UI packages are listed on the root `package.json`, and Vite finds them from the root `node_modules` after the install above. In `frontend/`:

```bash
npm install
npm run dev
```

Requests use `/api`. That base URL is chosen because `import.meta.mode` is unset, so the development check never matches. The Vite dev server proxies `/api` to port 5000.
