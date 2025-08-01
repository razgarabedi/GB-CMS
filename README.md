# GB-CMS (PERN Stack Content Management System)

A modern, full-stack content management system built with the PERN stack (PostgreSQL, Express.js, React, Node.js) and TypeScript.

## 🚀 Features

### Frontend (React + TypeScript)
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Client-side Routing**: React Router for seamless navigation
- **Authentication System**: Protected routes with token-based authentication
- **Content Management**: Full CRUD operations for content
- **Real-time Updates**: Immediate UI updates after API operations

### Backend (Express + TypeScript)
- **RESTful API**: Complete CRUD endpoints for content management
- **Database ORM**: Sequelize for PostgreSQL database operations
- **TypeScript**: Full type safety across the application
- **CORS Support**: Cross-origin resource sharing enabled
- **Environment Configuration**: Secure configuration management

### Database (PostgreSQL)
- **Content Model**: Structured data with title, body, and image URL
- **Automatic Migrations**: Sequelize handles database schema
- **Data Persistence**: Reliable data storage and retrieval

## 🛠 Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and development server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Sequelize** - Database ORM
- **PostgreSQL** - Database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools
- **Nodemon** - Server auto-restart
- **ts-node** - TypeScript execution
- **Concurrently** - Run multiple commands

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v12 or higher)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GB-CMS
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
npm install
```

This will automatically install dependencies for both the client and server.

### 3. Database Setup

1. **Create a PostgreSQL database**:
   ```sql
   CREATE DATABASE gb_cms;
   ```

2. **Create a `.env` file** in the `server` directory:
   ```env
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=gb_cms
   DB_HOST=localhost
   DB_DIALECT=postgres
   PORT=3000
   ```

### 4. Run the Application

#### Development Mode (Recommended)

Run both client and server simultaneously:

```bash
npm run dev
```

This will start:
- **Server**: http://localhost:3000
- **Client**: http://localhost:5173

#### Production Build

```bash
npm run build
```

## 📁 Project Structure

```
GB-CMS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # App entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   ├── models/             # Sequelize models
│   ├── migrations/         # Database migrations
│   ├── config/             # Sequelize configuration
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔐 Authentication

The application includes a simple authentication system:

- **Demo Credentials**: 
  - Username: `admin`
  - Password: `password`
- **Protected Routes**: Admin dashboard requires authentication
- **Token Storage**: JWT tokens stored in localStorage
- **Auto-logout**: Session management with token validation

## 📡 API Endpoints

### Content Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | Get all content |
| GET | `/api/content/:id` | Get single content by ID |
| POST | `/api/content` | Create new content |
| PUT | `/api/content/:id` | Update existing content |
| DELETE | `/api/content/:id` | Delete content |

### Request/Response Format

**Create/Update Content:**
```json
{
  "title": "Content Title",
  "body": "Content body text...",
  "imageUrl": "https://example.com/image.jpg"
}
```

## 🎨 UI Components

### Pages
- **Home Page**: Displays all content in a responsive grid
- **Detail Page**: Shows individual content with full details
- **Admin Dashboard**: Protected route for content management
- **Login Page**: Authentication interface

### Features
- **Responsive Grid Layout**: Adapts to different screen sizes
- **Image Support**: Optional image URLs for content
- **Form Validation**: Client-side validation for all forms
- **Loading States**: User feedback during operations
- **Error Handling**: Comprehensive error messages

## 🔧 Development

### Running Individual Services

**Server only:**
```bash
cd server
npm run dev
```

**Client only:**
```bash
cd client
npm run dev
```

### Database Operations

**Run migrations:**
```bash
cd server
npx sequelize-cli db:migrate
```

**Seed database:**
```bash
cd server
npx sequelize-cli db:seed:all
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check `.env` file configuration
   - Ensure database exists

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing processes on the port

3. **TypeScript Errors**
   - Run `npm install` in both client and server directories
   - Check TypeScript configuration files

### Environment Variables

Make sure your `.env` file in the server directory contains:

```env
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=your_database_name
DB_HOST=localhost
DB_DIALECT=postgres
PORT=3000
```

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.
