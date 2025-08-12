# API Endpoints Reference

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "securePassword123",
  "role": "patient",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "phone": "+1234567890"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "patient@example.com",
      "role": "patient",
      "profile": { ... }
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### POST /auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "securePassword123"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/logout
Invalidate refresh token and logout.

**Headers:**
```
Authorization: Bearer <access_token>
```

## Blood Pressure Endpoints

### POST /blood-pressure
Record a new blood pressure reading.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "notes": "Morning reading after light exercise"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "reading_id",
    "userId": "user_id",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "timestamp": "2024-01-15T08:30:00Z",
    "isAbnormal": false,
    "notes": "Morning reading after light exercise"
  }
}
```

### GET /blood-pressure
Get user's blood pressure readings with filtering.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `abnormalOnly` (optional): Boolean to filter abnormal readings

**Example:**
```
GET /blood-pressure?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20
```

### GET /blood-pressure/stats
Get blood pressure statistics and analytics.

**Query Parameters:**
- `period` (optional): 'week', 'month', 'quarter', 'year' (default: 'month')

**Response:**
```json
{
  "success": true,
  "data": {
    "averages": {
      "systolic": 125.5,
      "diastolic": 82.3,
      "pulse": 74.2
    },
    "ranges": {
      "systolic": { "min": 110, "max": 145 },
      "diastolic": { "min": 70, "max": 95 }
    },
    "totalReadings": 47,
    "abnormalReadings": 8,
    "trends": {
      "systolic": "stable",
      "diastolic": "improving"
    }
  }
}
```

## Medication Endpoints

### POST /medications
Add a new medication to user's regimen.

**Request Body:**
```json
{
  "name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "once_daily",
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "reminderSchedule": {
    "times": ["08:00"],
    "enabled": true
  },
  "instructions": "Take with food",
  "prescribedBy": "Dr. Smith"
}
```

### GET /medications
Get user's medications list.

**Query Parameters:**
- `active` (optional): Boolean to filter active medications
- `page`, `limit`: Pagination

### POST /medications/:id/log
Log a medication dose.

**Request Body:**
```json
{
  "dosageTaken": "10mg",
  "takenAt": "2024-01-15T08:15:00Z",
  "notes": "Taken with breakfast"
}
```

### GET /medications/:id/adherence
Get medication adherence statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "medicationId": "med_id",
    "adherenceRate": 85.5,
    "totalDoses": 30,
    "takenDoses": 26,
    "missedDoses": 4,
    "period": "last_30_days"
  }
}
```

## Messaging Endpoints

### POST /messages
Send a message to healthcare provider or patient.

**Request Body:**
```json
{
  "receiverId": "provider_user_id",
  "subject": "Blood pressure concerns",
  "body": "I've been experiencing higher readings lately...",
  "priority": "high"
}
```

### GET /messages
Get user's messages with filtering.

**Query Parameters:**
- `type`: 'sent', 'received', 'all' (default: 'all')
- `unreadOnly`: Boolean
- `priority`: 'urgent', 'high', 'normal', 'low'
- `page`, `limit`: Pagination

### PATCH /messages/:id/read
Mark a message as read.

### POST /messages/:id/reply
Reply to a message.

## Activity Tracking Endpoints

### POST /activities/exercise
Log exercise activity.

**Request Body:**
```json
{
  "activity": "running",
  "duration": 30,
  "intensity": "moderate",
  "caloriesBurned": 300,
  "notes": "Morning jog in the park"
}
```

### POST /activities/diet
Log dietary intake.

**Request Body:**
```json
{
  "meal": "breakfast",
  "foods": [
    {
      "name": "oatmeal",
      "quantity": "1 cup",
      "calories": 150,
      "sodium": 5
    }
  ],
  "totalCalories": 150,
  "totalSodium": 5
}
```

### POST /activities/weight
Log weight measurement.

**Request Body:**
```json
{
  "weight": 75.5,
  "unit": "kg",
  "bodyFat": 15.2,
  "notes": "After morning workout"
}
```

### GET /activities/summary
Get activity summary and analytics.

**Query Parameters:**
- `period`: 'week', 'month', 'quarter'
- `type`: 'exercise', 'diet', 'weight', 'all'

## User Management Endpoints

### GET /users/profile
Get current user's profile.

### PATCH /users/profile
Update user profile.

### PATCH /users/bp-thresholds
Update blood pressure alert thresholds.

**Request Body:**
```json
{
  "systolicHigh": 140,
  "systolicLow": 90,
  "diastolicHigh": 90,
  "diastolicLow": 60
}
```

### PATCH /users/change-password
Change user password.

## Educational Resources Endpoints

### GET /resources
Get educational resources.

**Query Parameters:**
- `category`: 'blood_pressure', 'medication', 'lifestyle', 'diet'
- `type`: 'article', 'video', 'infographic'

### GET /resources/:id
Get specific resource details.

## Error Response Format

All endpoints return errors in this standardized format:

```json
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

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
