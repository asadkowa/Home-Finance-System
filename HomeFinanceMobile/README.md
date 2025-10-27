# Home Finance Mobile App

A React Native mobile application for the Home Finance System, built with Expo.

## Features

- 🏦 Income tracking
- 💰 Expense management
- 📊 Budget planning
- 🧾 Bill tracking
- 🎯 Savings goals
- 💳 Debt management
- 📈 Dashboard overview

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (iOS/Android)
- Home Finance Backend running on port 5000

## Installation

1. **Navigate to the project directory**
   ```bash
   cd HomeFinanceMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server** (in a separate terminal)
   ```bash
   cd ../home-finance-app/backend
   npm run dev
   ```

4. **Start the mobile app**
   ```bash
   npm start
   ```

## Running the App

### On Physical Device

1. Install **Expo Go** from the App Store (iOS) or Google Play Store (Android)
2. Scan the QR code displayed in the terminal
3. The app will load on your device

### On Emulator/Simulator

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## API Configuration

The app connects to `http://localhost:5000/api` by default.

**For Android physical device**, update `src/config/api.js`:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000/api'  // Android emulator
  : 'https://your-production-api.com/api';
```

**For iOS simulator**, use `http://localhost:5000/api`.

**For physical devices on the same network**, use your computer's local IP:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:5000/api'  // Replace with your local IP
  : 'https://your-production-api.com/api';
```

To find your local IP:
- Windows: `ipconfig`
- macOS/Linux: `ifconfig` or `ip addr`

## Usage

### 1. Login/Register
- Create a new account or sign in
- Your credentials are stored securely

### 2. Dashboard
- View your financial overview
- See income, expenses, balance, and savings rate
- Access quick actions

### 3. Quick Actions (Coming Soon)
- Add Income
- Add Expense
- Set Budget
- Create Goals

## Project Structure

```
HomeFinanceMobile/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── DashboardScreen.js
│   ├── services/         # API services
│   │   └── authService.js
│   ├── config/           # Configuration files
│   │   └── api.js        # Axios configuration
│   └── utils/            # Utility functions
├── App.js                # Main app entry point
└── package.json
```

## Development

### Adding New Features

1. **Create API service** in `src/services/`
2. **Create screen component** in `src/screens/`
3. **Add route** in `App.js`
4. **Test on device**

### Example API Service Pattern

```javascript
import api from '../config/api';

export const myService = {
  getAll: async () => {
    const response = await api.get('/endpoint');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/endpoint', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/endpoint/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/endpoint/${id}`);
    return response.data;
  },
};
```

## Troubleshooting

### Network Connection Issues

**Problem**: Can't connect to backend
**Solution**: 
1. Ensure backend is running on port 5000
2. Check your local IP address
3. Update `API_BASE_URL` in `src/config/api.js`
4. Ensure phone and computer are on the same network

### Module Not Found Errors

```bash
# Clear cache and reinstall
npm start -- --reset-cache
```

### Backend Port Already in Use

**Problem**: Port 5000 already in use
**Solution**: 
1. Find and kill the process: `netstat -ano | findstr :5000`
2. Or change backend port in `home-finance-app/backend/.env`

### Android Network Error

**Problem**: Network request failed on Android
**Solution**: Use `10.0.2.2` for Android emulator or your local IP for physical device

## Next Steps

- [ ] Add Income/Expense screens
- [ ] Add Budget management screen
- [ ] Add Bill tracking screen
- [ ] Add Goals management screen
- [ ] Add Debts management screen
- [ ] Add Settings screen
- [ ] Add Reports screen
- [ ] Implement bottom tab navigation
- [ ] Add data visualization charts
- [ ] Add push notifications
- [ ] Add offline support

## Support

For issues or questions:
- Check the [API Documentation](../API_DOCUMENTATION.md)
- See the [Mobile App Guide](../MOBILE_APP_GUIDE.md)
- Review [Backend README](../home-finance-app/README.md)

## License

MIT License
