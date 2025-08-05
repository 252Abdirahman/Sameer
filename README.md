# Protocol Employees System

A modern, full-stack employee management system with AI chat capabilities built with React, Node.js, Express, MongoDB, and OpenAI integration.

## 🚀 Features

### Core Features
- **Employee Management**: Complete CRUD operations for employee data
- **User Authentication**: Secure JWT-based authentication with role-based access
- **AI Chat Assistant**: Integrated OpenAI-powered chat for HR assistance
- **Dashboard Analytics**: Real-time statistics and data visualization
- **Modern UI/UX**: Beautiful, responsive design with Material-UI
- **Real-time Updates**: Live chat and data synchronization

### AI Chat Capabilities
- Employee statistics and queries
- Department information
- HR policy assistance
- Company data insights
- Natural language processing for HR tasks

### User Roles
- **Admin**: Full system access and user management
- **HR**: Employee management and reporting
- **Manager**: Team management and employee viewing
- **Employee**: Profile access and AI chat

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **OpenAI API** - AI chat functionality
- **Socket.io** - Real-time communication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **React Query** - State management and caching
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- OpenAI API key (optional, for AI features)

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd protocol-employees-system
```

2. Install root dependencies:
```bash
npm install
```

3. Install server dependencies:
```bash
cd server
npm install
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/protocol-employees
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key-here
```

### Frontend Setup

1. Install client dependencies:
```bash
cd client
npm install
```

### Database Setup

1. Start MongoDB service on your machine
2. The application will automatically create the required collections

## 🏃‍♂️ Running the Application

### Development Mode

1. Start both server and client concurrently (from root directory):
```bash
npm run dev
```

Or start them separately:

2. Start the backend server:
```bash
npm run server
```

3. Start the frontend client:
```bash
npm run client
```

### Production Mode

1. Build the client:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 🔐 Default Login Credentials

For testing purposes, you can use these credentials or create a new account:

```
Email: admin@protocol.com
Password: admin123
Role: Admin
```

## 📱 Usage

### Employee Management
1. **Dashboard**: View system overview and statistics
2. **Employees**: Manage employee records with full CRUD operations
3. **Search & Filter**: Find employees by department, status, or search terms
4. **Employee Details**: View comprehensive employee information

### AI Chat Assistant
1. **Natural Language Queries**: Ask questions about employees, departments, or HR policies
2. **Quick Suggestions**: Use pre-defined questions for common tasks
3. **Real-time Responses**: Get instant AI-powered assistance
4. **Context Awareness**: AI understands your company data and context

### User Management
1. **Registration**: Create new user accounts with role assignment
2. **Authentication**: Secure login with JWT tokens
3. **Profile Management**: View and manage user profiles
4. **Role-based Access**: Different permissions based on user roles

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/protocol-employees` |
| `JWT_SECRET` | JWT signing secret | Required |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Optional |

### MongoDB Collections

The system creates the following collections:
- `users` - User accounts and authentication
- `employees` - Employee records and information
- `chatmessages` - AI chat history and messages

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build the React app: `npm run build`
2. Serve static files via nginx or CDN
3. Update API endpoints for production

### Database
- Use MongoDB Atlas for cloud hosting
- Configure proper indexing for performance
- Set up backup strategies

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Employee Endpoints
- `GET /api/employees` - Get employees with pagination
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats/overview` - Get employee statistics

### Chat Endpoints
- `POST /api/chat/ai-chat` - Send message to AI
- `GET /api/chat/history/:room` - Get chat history
- `GET /api/chat/employee-search` - Search employees for AI context

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- Role-based access control

## 📈 Performance Optimizations

- MongoDB indexing for fast queries
- React Query for efficient data caching
- Pagination for large datasets
- Image optimization and lazy loading
- Code splitting and bundle optimization
- Gzip compression

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **OpenAI API Issues**
   - Verify API key is valid
   - Check quota limits
   - Ensure proper environment variable setup

3. **CORS Errors**
   - Check `CLIENT_URL` in server `.env`
   - Verify frontend/backend URLs match

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting guide

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Material-UI team for the component library
- MongoDB for the database solution
- React and Node.js communities

---

Built with ❤️ by the Protocol Team 
