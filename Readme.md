# E-commerce Website Backend

A modern Node.js Express backend for an e-commerce platform with user authentication, product management, and secure API endpoints.

## 📋 Project Overview

This is a RESTful API backend built with **Express.js** and **MongoDB**, designed to support a full-featured e-commerce application. It includes user authentication with JWT, password encryption with bcrypt, image upload functionality via Cloudinary, and pagination support.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.2.1
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Security**: Bcrypt 6.0.0 for password hashing
- **File Upload**: Multer 2.0.2 + Cloudinary 2.9.0
- **HTTP Client**: Axios 1.14.0
- **Middleware**: CORS, Cookie Parser
- **Development**: Nodemon 3.1.14, Prettier 3.8.1

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/basantbansal/Ecommerce_website_backend.git
   cd Ecommerce_website_backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

## 🚀 Getting Started

### Development Mode
Run the server with hot-reload using Nodemon:
```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 8000).

### Project Structure

```
src/
├── index.js              # Entry point - initializes server & DB connection
├── app.js               # Express app configuration & middleware setup
├── constants.js         # Application constants
├── controllers/         # Route handlers & business logic
├── models/              # Mongoose schemas & models
├── routes/              # API route definitions
├── middlewares/         # Custom middleware (auth, validation, etc.)
├── db/                  # Database connection logic
└── utils/               # Helper functions & utilities
public/                  # Static files
```

## 🔌 API Endpoints

### Products
- `GET /products` - Fetch all products from external DummyJSON API

### Users
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/profile` - Get user profile (protected)

## 🔐 Key Features

✅ **User Authentication** - JWT-based authentication with secure token management  
✅ **Password Security** - Bcrypt hashing for secure password storage  
✅ **CORS Enabled** - Configured for frontend integration  
✅ **File Upload** - Multer integration with Cloudinary for image storage  
✅ **Pagination** - MongoDB aggregation pipeline with pagination support  
✅ **Environment Configuration** - Dotenv for secure credential management  
✅ **API Request Handling** - Axios for external API calls  
✅ **Error Handling** - Comprehensive error management across routes  

## 🔄 CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (local development)
- `https://e-commerce-website-ten-dusky.vercel.app` (production frontend)

## 📝 Development Guidelines

- **Code Formatting**: Uses Prettier for consistent code style
- **Hot Reload**: Nodemon automatically restarts server on file changes
- **Request Size Limit**: 16KB for JSON and URL-encoded payloads

## 📚 Dependencies Overview

- **bcrypt**: Password hashing and comparison
- **cloudinary**: Cloud image storage and CDN
- **cookie-parser**: Parse and set cookies
- **cors**: Enable cross-origin requests
- **dotenv**: Environment variable management
- **express**: Web framework
- **jsonwebtoken**: JWT authentication token creation & verification
- **mongoose**: MongoDB object modeling
- **mongoose-aggregate-paginate-v2**: Pagination for aggregation pipelines
- **multer**: Middleware for file uploads
- **axios**: HTTP client for API requests

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes with clear commit messages
3. Push to your branch and submit a pull request

## 📄 License

ISC

## 👤 Author

**Basant Bansal**

---

**Happy Coding!** 🚀