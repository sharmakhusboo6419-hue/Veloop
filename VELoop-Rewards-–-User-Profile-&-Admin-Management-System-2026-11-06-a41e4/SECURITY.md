# VELoop Rewards – Security Architecture & Controls

This document details the security model, cryptographic controls, authentication flows, and data protection strategies implemented across the application.

---

## 1. Authentication & Token Management

- **Password Hashing**:
  - All user and administrator passwords are encrypted using `bcryptjs` with 10 salt rounds before persistence. Plaintext passwords are never logged or stored.
- **JSON Web Tokens (JWT)**:
  - Tokens are signed with a 256-bit cryptographically secure secret (`JWT_SECRET`).
  - Standard user tokens expire in 7 days; administrative sessions expire in 12 hours.
- **Client Transmission**:
  - Tokens are transmitted via the standard `Authorization: Bearer <token>` header on all protected API invocations.

---

## 2. Authorization & Role-Based Access Control (RBAC)

Two middleware layers enforce access boundaries:

1. **`verifyUserToken`**:
   - Decodes the JWT and binds the authenticated user payload (`req.user`) to the request context.
   - Rejects unauthenticated callers with `401 Unauthorized`.
   - Blocks suspended users from mutating application state.
2. **`verifyAdminToken`**:
   - Strictly enforces that `req.user.isAdmin === true` or role is `super_admin` / `moderator`.
   - Never trusts a client-supplied role claim or editable email address.
   - Non-administrators receive `403 Forbidden`.

---

## 3. Server-Side Data Integrity & Anti-Tampering

- **Zero Client Trust for Balances**:
  - Balances for VEs, SVEs, Gems, Tokens, and XP cannot be set or overwritten via client API payloads.
  - All balance changes are executed via backend controller logic with state validation (e.g. checking sufficient balance prior to withdrawal).
- **Mandatory Audit Logging**:
  - Administrative balance adjustments cannot occur silently. Each adjustment requires `userId`, `assetType`, `amount`, and `reason`, generating both a `WalletTransaction` and an `AdminAuditLog` record.

---

## 4. Sensitive Data Sanitization

- Password hashes (`passwordHash`) are excluded from queries using Mongoose `.select('-passwordHash')` before sending user records in API responses.
- Private tokens, keys, and database passwords are never committed to version control; they are loaded via `.env` with a sanitized template in `.env.example`.
