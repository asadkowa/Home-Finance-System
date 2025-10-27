# Home Finance System

A comprehensive personal finance management application built with React and Node.js. Manage your income, expenses, budgets, bills, savings goals, and debts all in one place.

![Home Finance System](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen.svg)

## 🌟 Features

### 💰 Income Management
- Track multiple income sources
- Categorize income (Salary, Freelance, Investment, etc.)
- Add descriptions and dates
- View total income summary
- Automatic currency conversion

### 💸 Expense Tracking
- Record daily expenses with categories
- 14 predefined expense categories
- Add descriptions and track dates
- View expense breakdown
- Calculate total spending

### 📊 Budget Planning
- Create monthly budgets for categories
- Track spending against budgets
- Visual progress bars
- Over-budget warnings
- Budget status indicators (On Track, Warning, Critical, Exceeded)

### 🧾 Bill Management
- Add recurring bills (monthly/yearly)
- Track due dates with calendar picker
- Mark bills as paid/unpaid
- Set auto-pay reminders
- View upcoming bills on dashboard
- Bill status tracking (Overdue, Due Soon, Upcoming)

### 🎯 Savings Goals
- Set financial goals with target amounts
- Track progress with visual indicators
- Add contributions manually
- Set target dates
- Monthly contribution planning
- Progress percentage display

### 💳 Debt Management
- Track multiple debts (Credit Card, Loan, Mortgage, etc.)
- Monitor current balance vs. original amount
- Calculate estimated payoff time
- Track interest rates
- Record debt payments
- Visual payoff progress

### 📈 Dashboard Overview
- Financial summary at a glance
- Total income and expenses
- Balance calculation
- Savings rate percentage
- Upcoming bills alert
- Active savings goals
- Recent transactions
- Debt analysis
- Expense breakdown by category (charts)
- Date range filtering (This Week, Month, Year, All Time)

### 📋 Reports & Analytics
- Comprehensive payment logs
- Filter by transaction type (Income, Expense, Bill Payment, Debt Payment)
- Date range filtering
- Export to CSV
- Summary cards with totals
- Sort transactions by date

### 🌍 Multi-Currency Support
- Support for 10 currencies (USD, EUR, GBP, SAR, AED, EGP, INR, JPY, CNY, PKR)
- Currency selection in settings
- Real-time exchange rate conversion
- Automatic currency symbol display
- Amounts stored in USD, displayed in selected currency

### 🌐 Internationalization (i18n)
- English and Arabic language support
- Right-to-Left (RTL) layout support
- UI translation editor
- Dynamic language switching
- Save custom translations

### 🎨 Modern UI/UX
- Sky blue themed design
- Dark and light mode
- Responsive layout
- Material-UI components
- Smooth animations
- Card-based design
- Gradient backgrounds

### ⚙️ Settings & Preferences
- Theme customization (Light/Dark)
- Language selection
- RTL/LTR toggle
- Currency preference
- Category management
- Account management
- Change password
- Delete account

### 🔐 User Authentication
- Secure JWT-based authentication
- User registration
- Login/Logout
- Protected routes
- Session management

## 🚀 Tech Stack

### Frontend
- **React** - UI library
- **Material-UI (MUI)** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Recharts** - Data visualization
- **i18next** - Internationalization
- **date-fns** - Date manipulation
- **dayjs** - Date picker integration

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd home-finance-system
   ```

2. **Backend Setup**
   ```bash
   cd home-finance-app/backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/home-finance
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running locally or update MONGODB_URI
   ```

5. **Run Backend**
   ```bash
   npm run dev
   # Server will run on http://localhost:5000
   ```

6. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

7. **Run Frontend**
   ```bash
   npm start
   # App will open at http://localhost:3000
   ```

## 🎯 Usage Guide

### Getting Started

1. **Visit the Landing Page**
   - Navigate to `http://localhost:3000`
   - You'll see a modern landing page with features overview

2. **Create an Account**
   - Click "Get Started Free" or "Create Free Account"
   - Fill in your name, email, and password
   - Click "Create Account"

3. **Log In**
   - Use your credentials to log in
   - You'll be redirected to the dashboard

### Managing Your Finances

#### Adding Income
1. Navigate to "Income" page
2. Click "Add Income"
3. Enter amount, source, category, and date
4. Save to record

#### Recording Expenses
1. Go to "Expenses" page
2. Click "Add Expense"
3. Enter details (amount, category, description)
4. Submit to track

#### Creating Budgets
1. Visit "Budgets" page
2. Click "Create Budget"
3. Select category and set amount
4. Set notification threshold
5. Monitor progress on dashboard

#### Managing Bills
1. Go to "Bills" page
2. Add bill with due date using calendar
3. Set as recurring (monthly/yearly)
4. Mark as paid when completed
5. View upcoming bills on dashboard

#### Setting Savings Goals
1. Navigate to "Goals" page
2. Click "Create Goal"
3. Set target amount and date
4. Add contributions as you save
5. Track progress visually

#### Tracking Debts
1. Go to "Debts" page
2. Add debt with balance and interest
3. Make payments to reduce balance
4. Monitor payoff progress
5. View estimates in reports

### Customization

#### Changing Currency
1. Go to Settings
2. Select your preferred currency
3. All amounts will convert automatically

#### Switching Language
1. Open Settings
2. Choose language (English/Arabic)
3. RTL will activate for Arabic

#### Theme Selection
1. In Settings, toggle theme
2. Choose Light or Dark mode
3. Changes apply immediately

#### Editing Translations
1. Go to Settings > Edit Translations
2. Select language
3. Modify translation values
4. Save to localStorage

## 📱 Pages

- **Landing Page** (`/landing`) - Welcome page with features
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user signup
- **Dashboard** (`/`) - Overview and summary
- **Income** (`/income`) - Income management
- **Expenses** (`/expenses`) - Expense tracking
- **Budgets** (`/budgets`) - Budget planning
- **Bills** (`/bills`) - Bill management
- **Goals** (`/goals`) - Savings goals
- **Debts** (`/debts`) - Debt tracking
- **Reports** (`/reports`) - Transaction logs
- **Settings** (`/settings`) - App preferences

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Secure session management
- Input validation
- XSS protection

## 📊 Data Management

### Currency Handling
- All amounts stored in USD in database
- Displayed in user's selected currency
- Automatic conversion using exchange rates
- Consistent across all pages

### Recurring Bills
- Monthly bills: Creates 12 months ahead
- Yearly bills: Creates 5 years ahead
- Automatic duplicate prevention
- Batch generation on creation

### Debt Payments
- Individual payment logging
- Balance updates automatically
- Payment history tracking
- Reports integration

## 🎨 Design Features

- Modern sky blue color scheme
- Gradient backgrounds
- Card-based layouts
- Smooth transitions
- Responsive grid system
- Icon integration
- Custom typography

## 🧪 Testing

```bash
# Backend (if tests are configured)
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `PUT /api/auth/currency` - Update user currency

### Income
- `GET /api/income` - Get all income
- `POST /api/income` - Add income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `PUT /api/budgets/:id` - Deactivate budget

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Debts
- `GET /api/debts` - Get all debts
- `POST /api/debts` - Add debt
- `PUT /api/debts/:id` - Update debt
- `DELETE /api/debts/:id` - Delete debt

### Debt Payments
- `GET /api/debt-payments` - Get all payments
- `POST /api/debt-payments` - Record payment
- `DELETE /api/debt-payments/:id` - Delete payment

### Currency
- `GET /api/currency/list` - Get supported currencies
- `POST /api/currency/convert` - Convert amount

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Home Finance System - Personal Finance Management

## 🙏 Acknowledgments

- Material-UI for the component library
- MongoDB for database services
- React team for the amazing framework

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Built with ❤️ for better financial management**
