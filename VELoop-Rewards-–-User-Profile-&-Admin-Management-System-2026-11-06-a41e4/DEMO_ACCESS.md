# VELoop Rewards – Demo Access & Credentials

This document provides credentials and instructions to review and evaluate the **VELoop Rewards – User Profile & Admin Management System**.

---

## 🔐 Credentials Overview

### 1. Member / User Demo Account
* **Role**: Platform Member (Full Profile Dashboard access)
* **Email**: `alex@veloop.io`
* **Password**: `password123`
* **Referral Code**: `ALEX2026`
* **Direct Login URL**: `/login`
* **Quick Fill Button**: The user login screen features a 1-click **"Load Demo Credentials"** button for instant evaluation without typing.

### 2. Super Administrator Demo Account
* **Role**: Super Admin (Full Control Center & Audit access)
* **Email**: `admin@veloop.io`
* **Password**: `Admin@123`
* **Direct Admin Login URL**: `/admin/login`
* **Quick Fill Button**: The admin login screen features a 1-click **"Load Demo Admin Credentials"** button for fast evaluation.

---

## 🧭 Testing Walkthrough

### Scenario A: Member Profile & Reward Assets
1. Navigate to `/login`.
2. Click **"Load Demo Credentials"** (or enter `alex@veloop.io` / `password123`) and click **Sign In**.
3. You will be redirected to `/user-profile`.
4. Review the **Profile Hero**, copy the User ID (success toast appears).
5. Inspect the **Your Reward Assets** cards:
   - **VEs**: Convertible reward currency
   - **SVEs**: Silver vault earnings
   - **Gems**: Rare utility gems
   - **Tokens**: Ecosystem liquidity
   - **XP**: Progression-only metric
6. Test **"Request Withdrawal"** modal:
   - Enter an amount (e.g. `100`) and a payout address.
   - Click **Submit**. The withdrawal record will be created and displayed in the table below.
7. Test the **Referral Snapshot** copy link button.

### Scenario B: Admin Management & Approvals
1. Click **Admin Logout** or navigate to `/admin/login`.
2. Click **"Load Demo Admin Credentials"** and sign in.
3. You will be redirected to `/admin/dashboard`.
4. Switch to the **User Management** tab:
   - Search for `Alex`.
   - Click **Adjust** on a user to credit/debit balances with an administrative reason.
   - Click **Suspend** or **Restore** to toggle account access.
5. Switch to the **Withdrawal Approvals** tab:
   - Locate the pending withdrawal.
   - Click **Approve** or **Reject**.
6. Switch to the **Audit Logs** tab:
   - Observe the immutable record of all administrative logins, adjustments, and status changes with timestamps.
