VELoop Rewards – User Profile & Admin Management System
A production-ready full-stack MERN (MongoDB, Express, React, Node.js) web application designed for a premier gamified rewards platform. It features a complete User Profile Dashboard and a protected Administrative Control Panel with robust role-based access control (RBAC).

🌟 Key Features
User Profile Application (/user-profile)
Profile Hero: User display name, profile initials avatar, copyable User ID, verified email, account status, current tier, and dynamic XP progress bar.
Your Rewards Assets: Distinct visual representation for all five platform reward assets:
VEs (VELoop Earnings): Primary convertible reward currency.
SVEs (Silver Vault Earnings): Secured vault earnings.
Gems: Utility gems for boosts and redemptions.
Tokens: Ecosystem and governance liquidity tokens.
XP: Progression metric for account level advancement (non-withdrawable).
Level Progression: Real-time XP tracking, current title, next level preview, and dynamic progress bar computed strictly on the backend.
Achievements & Badges: Unlocked and locked badges, milestone criteria, and unlock progress.
Withdrawal Overview: Summary of total, pending, approved, and rejected requests, plus an interactive withdrawal request modal with balance validation.
Referral Snapshot: Unique referral code generation, one-click link copying, total referrals, rewards accrued, and referred members list.
Recent Activity: Live audit feed of rewards earned, level ups, and withdrawal actions.
Gmail Notification Integration: Google OAuth integration allowing users to send level-up reward emails and read notifications from their mailbox.
Protected Admin Management Panel (/admin/dashboard)
Protected Access: Enforced by JWT admin authorization middleware; access restricted to authenticated administrators.
Platform Analytics: Total users, active/suspended ratios, platform-wide VE/Token distributions, and pending withdrawal queue counts.
User Management: Search users by name/email, view comprehensive user profiles, inspect wallet balances, and suspend or restore accounts.
Reward Balance Adjustment: Adjust any user's balance with mandatory administrator reason logging and transaction audit records.
Withdrawal Review & Approval: Review pending requests and approve or reject them with policy reason tracking.
Administrative Audit Logs: Immutable system-wide audit trail recording administrator ID, action, target entity, timestamp, and changes.
🛠️ Technology Stack
Frontend: React 19, Vite, Bootstrap 5, CSS Modules (.module.css), Lucide React, React Router DOM v7.
Backend: Node.js, Express.js (ES Modules), Mongoose.
Database: MongoDB (Atlas or local replica set) with in-memory fallback for hermetic preview safety.
Authentication: JSON Web Tokens (JWT), bcryptjs password hashing.
Integrations: Google Workspace Gmail API via OAuth 2.0.
🚀 Getting Started
Prerequisites
Node.js (v18 or higher)
npm or bun
MongoDB instance (MongoDB Atlas URI or local MongoDB)
Installation & Local Setup
Clone the repository:

git clone https://github.com/your-username/veloop-rewards.git
cd veloop-rewards
Install dependencies:

npm install
Configure Environment Variables: Copy the example environment template:

cp .env.example .env
Fill in your configuration details:

PORT=3000
MONGO_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/veloop_rewards?retryWrites=true&w=majority"
JWT_SECRET="veloop_super_secret_jwt_key_2026"
ADMIN_EMAIL="admin@veloop.io"
ADMIN_PASSWORD="Admin@123"
NODE_ENV="development"
Start the Application:

npm run dev
The unified server will start on http://localhost:3000.

Standalone Backend Mode (Optional):

cd backend
npm install
npm run dev
📁 Project Structure
veloop-rewards/
│
├── server.ts                       # Integrated Express API & Vite dev server
├── package.json                    # Root package configuration
├── .env.example                    # Environment variable template
│
├── server/                         # Unified backend TypeScript modules
│   ├── config/                     # Database configuration
│   ├── data/                       # In-memory store fallback for offline preview
│   ├── middleware/                 # Auth & role verification middleware
│   ├── models/                     # Mongoose schemas & TypeScript types
│   ├── routes/                     # Express API routes
│   └── seed.ts                     # Database seeder for demo accounts
│
├── backend/                        # Standalone Express.js Node backend
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed.js
│   │   └── server.js
│   └── package.json
│
├── src/                            # React Frontend
│   ├── components/                 # Bootstrap + CSS Module components
│   │   ├── ProfileHero/
│   │   ├── RewardAssets/
│   │   ├── LevelProgress/
│   │   ├── AchievementCard/
│   │   ├── WithdrawalOverview/
│   │   ├── ReferralSnapshot/
│   │   ├── RecentActivity/
│   │   ├── QuickActions/
│   │   ├── GmailIntegration/
│   │   └── Navbar.tsx
│   ├── context/                    # AuthContext for session management
│   ├── pages/                      # Page components (UserProfile, Login, AdminDashboard)
│   ├── utils/                      # Formatting & clipboard helpers
│   ├── App.tsx                     # React Router routes
│   └── main.tsx                    # React DOM entry
│
└── postman/                        # Postman API Collection
    └── veloop_rewards.postman_collection.json
🛡️ License
Distributed under the Apache-2.0 License.
