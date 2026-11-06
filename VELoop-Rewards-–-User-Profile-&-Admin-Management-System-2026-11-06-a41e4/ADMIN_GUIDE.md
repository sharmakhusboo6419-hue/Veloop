# VELoop Rewards – Administrator User Guide

This guide describes how to operate the administrative management console (`/admin/dashboard`).

---

## 1. Accessing the Admin Console

1. Navigate to `/admin/login` in your browser.
2. In the demo environment, click the **"Load Demo Admin Credentials"** button (or enter `admin@veloop.io` / `Admin@123`).
3. Click **"Sign In as Admin"**. Upon successful verification, you will be directed to the **Admin Control Center**.

---

## 2. Platform Overview Dashboard

The **Platform Overview** tab provides high-level system telemetry:
- **Total Users**: Overall registered member count and active user ratio.
- **Total VEs Distributed**: Total VE liability across all user wallets.
- **Platform Tokens**: Circulating platform liquidity tokens.
- **Pending Withdrawals**: Number of pending withdrawal requests awaiting administrative review.

---

## 3. User Management

Under the **User Management** tab:
- **Search Users**: Enter a full name or email address into the real-time search field.
- **Inspect Balances**: View current VE balances, Token holdings, and progression tiers for each user.
- **Account Suspension & Restoration**:
  - Click **Suspend** on an active account to immediately block further reward actions and withdrawals.
  - Click **Restore** on a suspended account to re-enable full platform participation.
- **Adjust Wallet Balances**:
  - Click **Adjust** next to a user.
  - Select the target asset (`VE`, `SVE`, `Gems`, `Tokens`, or `XP`).
  - Enter the amount (positive for bonus credit, negative for deductions).
  - Enter an administrative justification (e.g. "Bonus for hackathon participation").
  - Click **Confirm Balance Adjustment**. The transaction and audit log are recorded simultaneously.

---

## 4. Withdrawal Queue Management

Under the **Withdrawal Approvals** tab:
- Review pending payout requests with target asset, quantity, and destination wallet addresses.
- Click **Approve** to mark the withdrawal complete.
- Click **Reject** to decline the request with an automated policy rejection notice.

---

## 5. System Audit Trail

Under the **Audit Logs** tab:
- Review chronologically ordered administrative activities.
- Each record displays the action name, target entity, detailed explanation, and precise timestamp.
