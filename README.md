# VELoop Rewards – User Profile & Admin Management System

A production-ready full-stack MERN (MongoDB, Express, React, Node.js) web application designed for a premier gamified rewards platform. It features a complete User Profile Dashboard and a protected Administrative Control Panel with robust role-based access control (RBAC).

## Netlify deployment

The repository root contains the Netlify configuration, while the application is in the nested project directory. Deploying with that configuration builds the React app and exposes the Express API through a Netlify Function, so `VITE_API_URL` should remain empty for a same-site deployment.

Set `JWT_SECRET` and, for persistent data, `MONGO_URI` in the Netlify site environment variables before deploying. Only set `VITE_API_URL` when the API is hosted on a separate service.

---

## 🌟 Key Features

### User Profile Application (`/user-profile`)
- **Profile Hero**: User display name, profile initials avatar, copyable User ID, verified email, account status, current tier, and dynamic XP progress bar.
- **Your Rewards Assets**: Distinct visual representation for all five platform reward assets:
  - **VEs (VELoop Earnings)**: Primary convertible reward currency.
  - **SVEs (Silver Vault Earnings)**: Secured vault earnings.
  - **Gems**: Utility gems for boosts and redemptions.
  - **Tokens**: Ecosystem and governance liquidity tokens.
  - **XP**: Progression metric for account level advancement (non-withdrawable).
- **Level Progression**: Real-time XP tracking, current title, next level preview, and dynamic progress bar computed strictly on the backend.
- **Achievements & Badges**: Unlocked and locked badges, milestone criteria, and unlock progress.
- **Withdrawal Overview**: Summary of total, pending, approved, and rejected requests, plus an interactive withdrawal request modal with balance validation.
