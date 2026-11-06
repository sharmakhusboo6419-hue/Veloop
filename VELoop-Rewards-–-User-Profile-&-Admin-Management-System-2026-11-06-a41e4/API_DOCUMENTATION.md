# VELoop Rewards – REST API Documentation

This document describes all RESTful API endpoints available in the VELoop Rewards system, including authentication requirements, request/response payloads, and status codes.

---

## Base URL
- Local Dev Server: `http://localhost:3000/api`
- Standalone Backend: `http://localhost:5000/api`

---

## Authentication Mechanism
All protected endpoints require a JWT token passed in the `Authorization` header:
```text
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication APIs

### 1.1 Register Member
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "Alex Vance",
    "email": "alex@veloop.io",
    "password": "password123",
    "referralCode": "OPTIONAL_REFERRAL_CODE"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Registration successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "673f1a2b...",
      "username": "Alex Vance",
      "email": "alex@veloop.io",
      "referralCode": "ALEX9482",
      "status": "active"
    }
  }
  ```

### 1.2 Login Member
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "alex@veloop.io",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "673f1a2b...",
      "username": "Alex Vance",
      "email": "alex@veloop.io",
      "referralCode": "ALEX2026",
      "status": "active"
    }
  }
  ```

### 1.3 Verify Current User Session
- **Endpoint**: `GET /api/auth/me`
- **Access**: Protected (User Token)
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "_id": "673f1a2b...",
      "username": "Alex Vance",
      "email": "alex@veloop.io",
      "referralCode": "ALEX2026",
      "status": "active",
      "createdAt": "2026-11-06T00:00:00.000Z"
    }
  }
  ```

### 1.4 Admin Login
- **Endpoint**: `POST /api/auth/admin/login` or `POST /api/admin/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@veloop.io",
    "password": "Admin@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Admin login successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "admin": {
      "id": "673f1a99...",
      "username": "SuperAdmin",
      "email": "admin@veloop.io",
      "role": "super_admin"
    }
  }
  ```

---

## 2. User Profile APIs

### 2.1 Get Current User Profile & Wallet
- **Endpoint**: `GET /api/profile/me`
- **Access**: Protected (User Token)
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "_id": "673f1a2b...",
      "username": "Alex Vance",
      "email": "alex@veloop.io",
      "referralCode": "ALEX2026",
      "status": "active"
    },
    "wallet": {
      "veBalance": 2450,
      "sveBalance": 480,
      "gemsBalance": 125,
      "tokensBalance": 890,
      "xpBalance": 6420,
      "currentLevel": 4
    }
  }
  ```

### 2.2 Update Profile
- **Endpoint**: `PATCH /api/profile/me`
- **Access**: Protected (User Token)
- **Request Body**:
  ```json
  {
    "username": "Alex Vance Jr."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Profile updated successfully",
    "user": { "username": "Alex Vance Jr." }
  }
  ```

### 2.3 Get Reward Assets & Transaction History
- **Endpoint**: `GET /api/profile/rewards`
- **Access**: Protected (User Token)
- **Response (200 OK)**:
  ```json
  {
    "wallet": {
      "veBalance": 2450,
      "sveBalance": 480,
      "gemsBalance": 125,
      "tokensBalance": 890,
      "xpBalance": 6420
    },
    "transactions": [
      {
        "assetType": "VE",
        "amount": 500,
        "type": "earn",
        "description": "Daily login bonus",
        "createdAt": "2026-11-06T00:00:00.000Z"
      }
    ]
  }
  ```

### 2.4 Get Level Progression
- **Endpoint**: `GET /api/profile/level-progress`
- **Access**: Protected (User Token)
- **Response (200 OK)**:
  ```json
  {
    "currentLevel": 4,
    "levelName": "Reward Explorer",
    "currentXp": 6420,
    "requiredXp": 8000,
    "remainingXp": 1580,
    "progressPercent": 80,
    "nextLevelName": "Elite Vanguard"
  }
  ```

### 2.5 Submit Withdrawal Request
- **Endpoint**: `POST /api/profile/withdraw`
- **Access**: Protected (User Token)
- **Request Body**:
  ```json
  {
    "assetType": "VE",
    "amount": 100,
    "payoutDetails": "0x71C...392A"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Withdrawal request submitted successfully",
    "withdrawal": {
      "_id": "673f...",
      "assetType": "VE",
      "amount": 100,
      "status": "pending",
      "payoutDetails": "0x71C...392A",
      "createdAt": "2026-11-06T00:00:00.000Z"
    }
  }
  ```

---

## 3. Administrative APIs

### 3.1 Get Platform Stats
- **Endpoint**: `GET /api/admin/stats`
- **Access**: Protected (Admin Token)
- **Response (200 OK)**:
  ```json
  {
    "totalUsers": 25,
    "activeUsers": 24,
    "suspendedUsers": 1,
    "totalVe": 54200,
    "totalSve": 12000,
    "totalGems": 3500,
    "totalTokens": 18200,
    "totalWithdrawals": 12,
    "pendingWithdrawals": 3,
    "approvedWithdrawals": 9
  }
  ```

### 3.2 List Users
- **Endpoint**: `GET /api/admin/users?search=alex&status=active`
- **Access**: Protected (Admin Token)

### 3.3 Update User Account Status
- **Endpoint**: `PATCH /api/admin/users/:id/status`
- **Access**: Protected (Admin Token)
- **Request Body**:
  ```json
  {
    "status": "suspended"
  }
  ```

### 3.4 Adjust Wallet Balance (Audited)
- **Endpoint**: `POST /api/admin/rewards/adjust`
- **Access**: Protected (Admin Token)
- **Request Body**:
  ```json
  {
    "userId": "673f1a2b...",
    "assetType": "VE",
    "amount": 100,
    "reason": "Challenge victory bonus compensation"
  }
  ```

### 3.5 Approve or Reject Withdrawal
- **Endpoint**: `PATCH /api/admin/withdrawals/:id/status`
- **Access**: Protected (Admin Token)
- **Request Body**:
  ```json
  {
    "status": "approved"
  }
  ```

---

## 4. HTTP Status Code Conventions
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or insufficient balance.
- `401 Unauthorized`: Missing, invalid, or expired authentication token.
- `403 Forbidden`: Insufficient role permissions or suspended account.
- `404 Not Found`: Requested resource not found.
- `500 Internal Server Error`: Unhandled server exception.
