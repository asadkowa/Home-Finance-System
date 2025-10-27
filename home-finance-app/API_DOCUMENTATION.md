# Home Finance System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "currency": "USD"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Update Currency
```http
PUT /auth/currency
```

**Request Body:**
```json
{
  "currency": "SAR"
}
```

---

## Income Endpoints

### Get All Income
```http
GET /income
```

### Create Income
```http
POST /income
```

**Request Body:**
```json
{
  "amount": 5000,
  "source": "Salary",
  "category": "Employment",
  "description": "Monthly salary",
  "date": "2024-01-15"
}
```

### Update Income
```http
PUT /income/:id
```

### Delete Income
```http
DELETE /income/:id
```

---

## Expense Endpoints

### Get All Expenses
```http
GET /expenses
```

### Create Expense
```http
POST /expenses
```

**Request Body:**
```json
{
  "amount": 150,
  "category": "Food",
  "description": "Groceries",
  "date": "2024-01-15"
}
```

### Update Expense
```http
PUT /expenses/:id
```

### Delete Expense
```http
DELETE /expenses/:id
```

---

## Budget Endpoints

### Get All Budgets
```http
GET /budgets
```

### Create Budget
```http
POST /budgets
```

**Request Body:**
```json
{
  "category": "Food",
  "amount": 500,
  "alertThreshold": 80
}
```

### Update Budget
```http
PUT /budgets/:id
```

### Deactivate Budget
```http
PUT /budgets/:id/deactivate
```

---

## Bill Endpoints

### Get All Bills
```http
GET /bills
```

### Create Bill
```http
POST /bills
```

**Request Body:**
```json
{
  "name": "Electricity Bill",
  "category": "Utilities",
  "amount": 120,
  "dueDate": "2024-01-28",
  "isRecurring": true,
  "recurrenceType": "monthly",
  "reminderDays": 3
}
```

### Update Bill
```http
PUT /bills/:id
```

### Delete Bill
```http
DELETE /bills/:id
```

---

## Goal Endpoints

### Get All Goals
```http
GET /goals
```

### Create Goal
```http
POST /goals
```

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "targetAmount": 10000,
  "targetDate": "2024-12-31",
  "monthlyContribution": 500,
  "currentAmount": 2000
}
```

### Update Goal
```http
PUT /goals/:id
```

### Delete Goal
```http
DELETE /goals/:id
```

---

## Debt Endpoints

### Get All Debts
```http
GET /debts
```

### Create Debt
```http
POST /debts
```

**Request Body:**
```json
{
  "name": "Credit Card",
  "type": "Credit Card",
  "totalAmount": 5000,
  "currentBalance": 3500,
  "interestRate": 18.5,
  "minimumPayment": 100
}
```

### Update Debt
```http
PUT /debts/:id
```

### Delete Debt
```http
DELETE /debts/:id
```

---

## Debt Payment Endpoints

### Get All Payments
```http
GET /debt-payments
```

### Record Payment
```http
POST /debt-payments
```

**Request Body:**
```json
{
  "debtId": "507f1f77bcf86cd799439011",
  "amount": 150,
  "description": "Extra payment"
}
```

### Delete Payment
```http
DELETE /debt-payments/:id
```

---

## Currency Endpoints

### Get Supported Currencies
```http
GET /currency/list
```

**Response:**
```json
{
  "currencies": [
    {"code": "USD", "name": "US Dollar", "symbol": "$", "rate": 1},
    {"code": "SAR", "name": "Saudi Riyal", "symbol": "﷼", "rate": 3.75},
    ...
  ]
}
```

### Convert Amount
```http
POST /currency/convert
```

**Request Body:**
```json
{
  "amount": 100,
  "from": "USD",
  "to": "SAR"
}
```

---

## Notification Endpoints

### Get All Notifications
```http
GET /notifications
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "type": "bill_reminder",
    "channel": "email",
    "title": "Bill Reminder: Electricity Bill",
    "message": "Your bill Electricity Bill is due on 2024-01-28",
    "read": false,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### Mark Notification as Read
```http
PUT /notifications/:id/read
```

### Mark All Notifications as Read
```http
PUT /notifications/read-all
```

### Delete Notification
```http
DELETE /notifications/:id
```

---

## Dashboard Endpoints

### Get Dashboard Summary
```http
GET /dashboard/summary
```

**Response:**
```json
{
  "totalIncome": 5000,
  "totalExpenses": 2500,
  "balance": 2500,
  "savingsRate": 50
}
```

### Get Upcoming Bills
```http
GET /dashboard/bills
```

### Get Active Goals
```http
GET /dashboard/goals
```

### Get Recent Transactions
```http
GET /dashboard/transactions
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid token"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Something went wrong"
}
```

---

## Notification Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Notification Types

1. **Bill Reminders** - Sent before bill due dates
2. **Budget Alerts** - Triggered when approaching budget limits
3. **Goal Achievements** - Sent when reaching savings goals
4. **Payment Confirmations** - Confirms successful payments

---

## Rate Limiting

- 100 requests per minute per IP
- Authentication endpoints: 5 requests per minute

---

## Webhooks (Future)

Future webhook endpoints for mobile app integration:
- `POST /webhooks/mobile-push` - Mobile push notification callback
- `POST /webhooks/payment-callback` - Payment gateway callback
