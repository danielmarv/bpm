# Blood Pressure Management API - Flow Documentation

## Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Blood Pressure Management Flow](#blood-pressure-management-flow)
3. [Medication Management Flow](#medication-management-flow)
4. [Provider-Patient Communication Flow](#provider-patient-communication-flow)
5. [Lifestyle Tracking Flow](#lifestyle-tracking-flow)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Error Handling Flow](#error-handling-flow)

## Authentication Flow

\
### JWT Token-Based Authentication
with Refresh Token
Rotation

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    participant TokenService

    Note over Client,TokenService: User Registration/Login
    Client->>API: POST /api/auth/register or /api/auth/login
    API->>API: Validate input (email, password)
    API->>DB: Check user exists/Create user
    API->>API: Hash password (bcrypt)
    API->>TokenService: Generate access + refresh tokens
    TokenService-->>API: Return tokens
    API-->>Client: Return tokens + user data

    Note over Client,TokenService: Protected Route Access
    Client->>API: GET /api/users/profile (with access token)
    API->>API: Verify access token
    alt Token valid
        API->>DB: Fetch user data
        API-->>Client: Return protected data
    else Token expired
        API-->>Client: 401 Unauthorized
        Client->>API: POST /api/auth/refresh (with refresh token)
        API->>TokenService: Validate refresh token
        TokenService->>DB: Check token in database
        TokenService-->>API: Generate new tokens
        API-->>Client: Return new tokens
    end

    Note over Client,TokenService: Logout
    Client->>API: POST /api/auth/logout
    API->>DB: Invalidate refresh token
    API-->>Client: Success response
