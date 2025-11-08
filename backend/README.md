# Wellness Pal Pro - Backend

This is the backend API for the Wellness Pal Pro healthcare companion application.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Profile Management**: Comprehensive user profile with personal, health, and lifestyle information
- **Medication Tracking**: Add, update, and delete medication records
- **Data Validation**: Input validation using express-validator
- **Security**: Password hashing, rate limiting, CORS protection
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** for cross-origin requests
- **Helmet** for security headers

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/wellness-pal-pro
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/preferences` - Update user preferences
- `PUT /api/auth/change-password` - Change password

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update entire profile
- `PUT /api/profile/personal` - Update personal information
- `PUT /api/profile/health` - Update health information
- `PUT /api/profile/lifestyle` - Update lifestyle information
- `GET /api/profile/completion` - Get profile completion status

### Medication Management
- `POST /api/profile/medications` - Add new medication
- `PUT /api/profile/medications/:id` - Update medication
- `DELETE /api/profile/medications/:id` - Delete medication

### User Management (Admin)
- `GET /api/user` - Get all users (admin only)
- `GET /api/user/:id` - Get user by ID (admin only)
- `PUT /api/user/:id/status` - Update user status (admin only)
- `DELETE /api/user/:id` - Delete user (admin only)

## Database Models

### User Model
- Basic user information (name, email, password)
- Role-based access control
- User preferences
- Account status and verification

### Profile Model
- Personal information (name, DOB, contact details)
- Health information (blood type, height, weight, allergies)
- Lifestyle information (activity level, diet, smoking, alcohol)
- Medication records
- Profile completion tracking

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: Prevents abuse with 100 requests per 15 minutes
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Comprehensive validation rules
- **Error Handling**: Secure error responses

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Project Structure
```
backend/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── server.js       # Main server file
└── package.json    # Dependencies
```

## Frontend Integration

The backend is designed to work with the React frontend. Make sure to:

1. Set `VITE_API_URL=http://localhost:5000/api` in your frontend `.env`
2. Include the JWT token in API requests using the `Authorization: Bearer <token>` header
3. Handle authentication state properly in the frontend

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a secure JWT secret
3. Configure MongoDB connection string for production
4. Set up proper CORS origins
5. Use a process manager like PM2
6. Set up reverse proxy with nginx

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation

## License

MIT License - see LICENSE file for details
