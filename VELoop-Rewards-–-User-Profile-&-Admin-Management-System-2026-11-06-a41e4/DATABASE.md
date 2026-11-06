# VELoop Rewards – Database Architecture & Data Models

This document details the database architecture, schema designs, relationships, indexes, and data ownership principles implemented using **MongoDB** and **Mongoose**.

---

## 1. Design Principles & Data Integrity

1. **Single Source of Truth**:
   - The `Wallet` collection is the sole authority on asset balances (`veBalance`, `sveBalance`, `gemsBalance`, `tokensBalance`, `xpBalance`).
   - Balances are never duplicated or computed on the frontend.
2. **Immutable Transaction & Audit Logging**:
   - Any balance modification (earnings, redemptions, admin adjustments) generates an immutable record in `WalletTransaction` or `AdminAuditLog`.
3. **Progression Separation**:
   - `XP` is strictly a progression metric used for level calculations; it is never redeemable as cash or convertible to wallet currency.

---

## 2. Entity Relationship Diagram (ASCII)

```text
       ┌──────────────┐
       │     User     │
       └──────┬───────┘
              │ 1:1
              ├───────────────────┐
              │ 1:N               ▼
       ┌──────┴───────┐    ┌──────────────┐
       │    Wallet    │    │   Referral   │
       └──────┬───────┘    └──────────────┘
              │ 1:N
       ┌──────┴───────────────┐
       │  WalletTransaction   │
       └──────────────────────┘
              ▲
              │ 1:N
       ┌──────┴───────────────┐
       │      Withdrawal      │
       └──────────────────────┘
              ▲
              │ 1:N
       ┌──────┴───────────────┐
       │   UserAchievement    │
       └──────────────────────┘
              ▲
              │ N:1
       ┌──────┴───────────────┐
       │     Achievement      │
       └──────────────────────┘
```

---

## 3. Schema Definitions

### 3.1 User (`users`)
Stores platform member account details and authentication hash.

| Field | Type | Validation / Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated Primary Key | Unique user identifier |
| `username` | String | Required, trimmed | Display name |
| `email` | String | Required, unique, lowercase, trimmed | Authentication email |
| `passwordHash` | String | Required | bcrypt-hashed password |
| `referralCode` | String | Required, unique | Shareable referral code |
| `referredBy` | String | Optional | Referral code used at signup |
| `status` | String | Enum: `['active', 'suspended']`, default: `'active'` | Account standing |
| `emailVerified` | Boolean | Default: `true` | Email verification status |
| `createdAt` | Date | Timestamp | Account creation date |
| `updatedAt` | Date | Timestamp | Profile update date |

### 3.2 Wallet (`wallets`)
Holds the authoritative balance of all five platform currencies for a user.

| Field | Type | Default | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | Unique wallet identifier |
| `userId` | ObjectId | Ref: `'User'`, unique | Associated user reference |
| `veBalance` | Number | `0` | VEs (VELoop Earnings) |
| `sveBalance` | Number | `0` | SVEs (Silver Vault Earnings) |
| `gemsBalance` | Number | `0` | Utility Gems |
| `tokensBalance`| Number | `0` | Platform Tokens |
| `xpBalance` | Number | `0` | Cumulative Experience Points |
| `currentLevel` | Number | `1` | Current progression tier |
| `updatedAt` | Date | Timestamp | Last balance modification |

### 3.3 WalletTransaction (`wallettransactions`)
Maintains an immutable ledger of all balance credits, debits, and adjustments.

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId (Indexed) | Associated user reference |
| `assetType` | String (Enum: `['VE', 'SVE', 'Gems', 'Tokens', 'XP']`) | Target reward asset |
| `amount` | Number | Positive for credit, negative for debit |
| `type` | String (Enum: `['earn', 'spend', 'adjust', 'withdrawal']`) | Transaction class |
| `referenceId`| String (Optional) | Related withdrawal or challenge ID |
| `description`| String | Human-readable audit narrative |
| `createdAt` | Date | Timestamp |

### 3.4 LevelConfig (`levelconfigs`)
Configurable level progression milestones and requirements.

| Field | Type | Description |
|---|---|---|
| `levelNumber` | Number (Unique) | Level order index (1, 2, 3...) |
| `levelName` | String | Level title (e.g. "Reward Explorer") |
| `xpThreshold` | Number | Minimum XP required to attain level |
| `badgeUrl` | String | Asset reference for level badge |
| `isActive` | Boolean | Enabled status |

### 3.5 Achievement (`achievements`) & UserAchievement (`userachievements`)
- `Achievement`: Master catalogue of milestones (XP rewards, criteria type, and target values).
- `UserAchievement`: Join collection storing which users have unlocked which achievements and when.

### 3.6 Withdrawal (`withdrawals`)
Tracks conversion and payout requests.

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId (Indexed) | User requesting payout |
| `assetType` | String | Asset being withdrawn (`VE`, `Tokens`) |
| `amount` | Number | Quantity to withdraw |
| `status` | String (Enum: `['pending', 'approved', 'rejected', 'failed']`) | State machine status |
| `payoutDetails` | String | Destination address/account |
| `rejectionReason`| String (Optional) | Policy justification if rejected |
| `processedBy` | ObjectId (Ref: `'AdminUser'`) | Reviewing administrator |

### 3.7 AdminUser (`adminusers`) & AdminAuditLog (`adminauditlogs`)
- `AdminUser`: Administrative credentials with roles (`'super_admin'`, `'moderator'`).
- `AdminAuditLog`: Records administrator ID, action, target record, and change summary.
