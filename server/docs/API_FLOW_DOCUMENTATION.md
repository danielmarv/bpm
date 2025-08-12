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

### JWT Token-Based Authentication with Refresh Token Rotation

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
```

### Authentication Endpoints Flow

**Registration Flow:**
```
POST /api/auth/register
├── Input Validation (email, password, role)
├── Check if user exists
├── Hash password with bcrypt
├── Create user in database
├── Generate JWT tokens
└── Return user data + tokens
```

**Login Flow:**
```
POST /api/auth/login
├── Input Validation (email, password)
├── Find user by email
├── Compare password with bcrypt
├── Generate JWT tokens
├── Save refresh token to database
└── Return user data + tokens
```

## Blood Pressure Management Flow

### Blood Pressure Reading Lifecycle

```mermaid
flowchart TD
    A[Patient Records BP Reading] --> B[POST /api/blood-pressure]
    B --> C{Validate Input}
    C -->|Invalid| D[Return 400 Error]
    C -->|Valid| E[Save to Database]
    E --> F[Check Against Thresholds]
    F --> G{BP Abnormal?}
    G -->|Yes| H[Flag as Abnormal]
    G -->|No| I[Mark as Normal]
    H --> J[Trigger Alert System]
    I --> K[Save Reading]
    J --> K
    K --> L[Return Success Response]
    
    M[Provider Views Readings] --> N[GET /api/blood-pressure/user/:userId]
    N --> O[Apply Filters & Pagination]
    O --> P[Return Filtered Results]
    
    Q[Generate Statistics] --> R[GET /api/blood-pressure/stats]
    R --> S[MongoDB Aggregation Pipeline]
    S --> T[Calculate Averages & Trends]
    T --> U[Return Analytics Data]
```

### Blood Pressure API Endpoints

**Create Reading:**
```javascript
POST /api/blood-pressure
Headers: { Authorization: "Bearer <access_token>" }
Body: {
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "notes": "Morning reading after exercise"
}

Response: {
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "timestamp": "2024-01-15T08:30:00Z",
    "isAbnormal": false
  }
}
```

**Get User Readings with Filters:**
```javascript
GET /api/blood-pressure?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10

Response: {
  "success": true,
  "data": {
    "readings": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalReadings": 47
    }
  }
}
```

## Medication Management Flow

### Medication Lifecycle Management

```mermaid
stateDiagram-v2
    [*] --> Created: Add Medication
    Created --> Active: Start Taking
    Active --> Logged: Take Dose
    Logged --> Active: Continue Schedule
    Active --> Paused: Temporarily Stop
    Paused --> Active: Resume
    Active --> Completed: End Date Reached
    Active --> Discontinued: Stop Early
    Completed --> [*]
    Discontinued --> [*]
    
    note right of Logged
        Each dose logged with:
        - Timestamp
        - Dosage taken
        - Notes
    end note
```

### Medication API Flow

**Add Medication:**
```javascript
POST /api/medications
Body: {
  "name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "once_daily",
  "startDate": "2024-01-15",
  "reminderSchedule": {
    "times": ["08:00"],
    "enabled": true
  }
}
```

**Log Medication Dose:**
```javascript
POST /api/medications/:id/log
Body: {
  "dosageTaken": "10mg",
  "takenAt": "2024-01-15T08:15:00Z",
  "notes": "Taken with breakfast"
}
```

## Provider-Patient Communication Flow

### Secure Messaging System

```mermaid
sequenceDiagram
    participant Patient
    participant API
    participant DB
    participant Provider
    participant NotificationService

    Patient->>API: POST /api/messages (send message)
    API->>API: Validate sender/receiver roles
    API->>DB: Save message
    API->>NotificationService: Queue notification
    NotificationService->>Provider: Send notification
    API-->>Patient: Message sent confirmation

    Provider->>API: GET /api/messages (fetch messages)
    API->>DB: Query messages for provider
    API-->>Provider: Return message list

    Provider->>API: POST /api/messages (reply)
    API->>DB: Save reply
    API->>NotificationService: Queue notification
    NotificationService->>Patient: Send notification
    API-->>Provider: Reply sent confirmation

    Patient->>API: PATCH /api/messages/:id/read
    API->>DB: Mark message as read
    API-->>Patient: Success response
```

### Message Priority System

```javascript
// Message priorities and routing
const messagePriorities = {
  'urgent': {
    level: 1,
    responseTime: '1 hour',
    notificationMethod: ['push', 'email', 'sms']
  },
  'high': {
    level: 2,
    responseTime: '4 hours',
    notificationMethod: ['push', 'email']
  },
  'normal': {
    level: 3,
    responseTime: '24 hours',
    notificationMethod: ['push']
  },
  'low': {
    level: 4,
    responseTime: '72 hours',
    notificationMethod: ['push']
  }
};
```

## Lifestyle Tracking Flow

### Activity Logging System

```mermaid
flowchart LR
    A[User Input] --> B{Activity Type}
    B -->|Exercise| C[POST /api/activities/exercise]
    B -->|Diet| D[POST /api/activities/diet]
    B -->|Weight| E[POST /api/activities/weight]
    B -->|Stress| F[POST /api/activities/stress]
    
    C --> G[Validate Exercise Data]
    D --> H[Validate Diet Data]
    E --> I[Validate Weight Data]
    F --> J[Validate Stress Data]
    
    G --> K[Calculate Calories Burned]
    H --> L[Calculate Nutritional Values]
    I --> M[Track Weight Trends]
    J --> N[Assess Stress Levels]
    
    K --> O[Save to Database]
    L --> O
    M --> O
    N --> O
    
    O --> P[Update User Analytics]
    P --> Q[Return Success Response]
```

### Activity Data Structure

```javascript
// Exercise Activity
{
  "type": "exercise",
  "activity": "running",
  "duration": 30,
  "intensity": "moderate",
  "caloriesBurned": 300,
  "notes": "Morning jog in the park"
}

// Diet Activity
{
  "type": "diet",
  "meal": "breakfast",
  "foods": [
    {
      "name": "oatmeal",
      "quantity": "1 cup",
      "calories": 150
    }
  ],
  "totalCalories": 150,
  "sodium": 5
}

// Weight Tracking
{
  "type": "weight",
  "weight": 75.5,
  "unit": "kg",
  "bodyFat": 15.2,
  "notes": "After morning workout"
}
```

## Data Flow Architecture

### Request Processing Pipeline

```mermaid
flowchart TD
    A[Client Request] --> B[Rate Limiting Middleware]
    B --> C[CORS Middleware]
    C --> D[Body Parser Middleware]
    D --> E[Authentication Middleware]
    E --> F[Validation Middleware]
    F --> G[Route Handler]
    G --> H[Controller Logic]
    H --> I[Service Layer]
    I --> J[Database Operations]
    J --> K[Response Formatting]
    K --> L[Error Handling]
    L --> M[Client Response]
    
    N[Error Occurs] --> O[Error Middleware]
    O --> P[Log Error]
    P --> Q[Format Error Response]
    Q --> M
```

### Database Aggregation Pipeline Example

```javascript
// Blood Pressure Statistics Aggregation
const statsAggregation = [
  {
    $match: {
      userId: new mongoose.Types.ObjectId(userId),
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    }
  },
  {
    $group: {
      _id: null,
      avgSystolic: { $avg: "$systolic" },
      avgDiastolic: { $avg: "$diastolic" },
      avgPulse: { $avg: "$pulse" },
      minSystolic: { $min: "$systolic" },
      maxSystolic: { $max: "$systolic" },
      totalReadings: { $sum: 1 },
      abnormalReadings: {
        $sum: {
          $cond: [
            {
              $or: [
                { $gte: ["$systolic", 140] },
                { $gte: ["$diastolic", 90] }
              ]
            },
            1,
            0
          ]
        }
      }
    }
  }
];
```

## Error Handling Flow

### Centralized Error Management

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type}
    B -->|Validation Error| C[400 Bad Request]
    B -->|Authentication Error| D[401 Unauthorized]
    B -->|Authorization Error| E[403 Forbidden]
    B -->|Not Found Error| F[404 Not Found]
    B -->|Database Error| G[500 Internal Server Error]
    B -->|Unknown Error| H[500 Internal Server Error]
    
    C --> I[Format Validation Messages]
    D --> J[Clear Auth Instructions]
    E --> K[Permission Denied Message]
    F --> L[Resource Not Found Message]
    G --> M[Log Error & Generic Message]
    H --> N[Log Error & Generic Message]
    
    I --> O[Send Error Response]
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O
    
    O --> P[Client Receives Error]
```

### Error Response Format

```javascript
// Standardized Error Response
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "systolic",
        "message": "Systolic pressure must be between 70 and 250"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## API Rate Limiting & Security Flow

### Security Middleware Stack

```mermaid
flowchart LR
    A[Request] --> B[Helmet Security Headers]
    B --> C[CORS Policy]
    C --> D[Rate Limiting]
    D --> E[Request Size Limiting]
    E --> F[Input Sanitization]
    F --> G[JWT Validation]
    G --> H[Role-Based Access Control]
    H --> I[Route Handler]
```

### Rate Limiting Configuration

```javascript
const rateLimitConfig = {
  // General API rate limiting
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  },
  
  // Authentication endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts'
  },
  
  // Blood pressure readings (moderate)
  bloodPressure: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit to 10 BP readings per minute
    message: 'Too many blood pressure readings'
  }
};
```

This comprehensive flow documentation covers all major aspects of the Blood Pressure Management API, including authentication, data management, communication systems, and security measures. Each flow includes detailed diagrams, code examples, and error handling patterns to guide implementation and integration.
