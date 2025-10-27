# Home Finance System

A comprehensive web-based home budgeting and expense tracking system built with React and Node.js.

## Features

- ✅ User Authentication (Login/Register)
- ✅ Dashboard with financial overview
- ✅ Income Tracking
- ✅ Expense Tracking with categories
- ✅ Budget Management
- ✅ Bill Tracking and Reminders
- ✅ Savings Goals
- ✅ Debt Management
- ✅ Beautiful Material-UI interface
- ✅ Responsive design

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- Axios
- Recharts
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd "home-finance-app"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Setup Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/home-finance

JWT_SECRET=your-secret-key-here
PORT=5000
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:
- Windows: MongoDB service should be running automatically
- Mac/Linux: `sudo systemctl start mongod` or `brew services start mongodb-community`

### 6. Run the Application

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

The backend server will run on http://localhost:5000

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at http://localhost:3000

## Usage

### 1. Register a New Account
- Click on "Register" on the login page
- Fill in your name, email, and password
- Click "Register"

### 2. Login
- Enter your email and password
- Click "Login"

### 3. Dashboard
- View your financial overview
- See total income, expenses, and balance
- View expense breakdown by category

### 4. Managing Finances
- Navigate through Income, Expenses, Budgets, Bills, Goals, and Debts using the sidebar
- Add, edit, and delete transactions as needed

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Income
- `GET /api/income` - Get all income
- `POST /api/income` - Create income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary

Similar endpoints exist for Budgets, Bills, Goals, and Debts.

## Project Structure

```
home-finance-app/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── server.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── App.js       # Main app component
│   └── public/
└── README.md
```

## Future Enhancements

- [ ] Bank account integration
- [ ] Receipt scanning with OCR
- [ ] Export to Excel/PDF
- [ ] Mobile app
- [ ] Recurring transactions automation
- [ ] Advanced analytics and reports
- [ ] Multi-user/family accounts
- [ ] Bill reminders via email/SMS

## Contributing

This is a personal finance management system. Feel free to fork and customize for your needs.

## License

MIT License

## Support

For issues or questions, please open an issue on the repository.

## Author

Built as part of the Home Finance System project.
