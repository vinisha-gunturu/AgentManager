<<<<<<< HEAD
# AgentFlow
=======
# MERN Stack Agent Management System

A comprehensive web application built with the MERN stack for managing agents and distributing CSV/Excel lists among them.

## 📋 Features

### 🔐 Authentication System
- Admin user login with JWT tokens
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 👥 Agent Management
- Create, read, update, delete agents
- Agent information includes:
  - Name
  - Email address
  - Mobile number with country code
  - Password (hashed)
- Input validation and error handling

### 📊 CSV/Excel File Upload & Distribution
- Upload CSV, XLS, and XLSX files
- Automatic validation of file format and size (max 5MB)
- Parse files with columns: FirstName, Phone, Notes
- Automatically distribute items equally among active agents
- Handle remainder items by distributing sequentially
- View detailed distribution for each agent

### 📈 Dashboard
- Overview statistics (total agents, lists, items)
- Recent uploads display
- Real-time data updates

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **csv-parser** - CSV file parsing
- **xlsx** - Excel file parsing
- **express-validator** - Input validation

### Frontend
- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **CSS3** - Styling with responsive design

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd mern-agent-management
\`\`\`

### 2. Install Backend Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Install Frontend Dependencies
\`\`\`bash
cd client
npm install
cd ..
\`\`\`

### 4. Environment Configuration
Create a \`.env\` file in the root directory:
\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-agent-management
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=7d
\`\`\`

Create a \`.env\` file in the client directory:
\`\`\`env
REACT_APP_API_URL=http://localhost:5000
GENERATE_SOURCEMAP=false
\`\`\`

### 5. Start MongoDB
Make sure MongoDB is running on your system:
\`\`\`bash
# For local MongoDB installation
mongod

# Or use MongoDB service
sudo systemctl start mongod
\`\`\`

### 6. Run the Application

#### Development Mode (Both Frontend & Backend)
\`\`\`bash
npm run dev
\`\`\`

#### Or run separately:

**Backend only:**
\`\`\`bash
npm run server
\`\`\`

**Frontend only:**
\`\`\`bash
npm run client
\`\`\`

**Production Build:**
\`\`\`bash
npm run build
npm start
\`\`\`

## 🚀 Usage

### 1. Initial Setup
1. Open your browser and navigate to \`http://localhost:3000\`
2. Create an admin account by clicking "Create Account"
3. Use the admin credentials to login

### 2. Managing Agents
1. Navigate to the "Agents" section
2. Click "Add Agent" to create new agents
3. Fill in required information (name, email, mobile with country code, password)
4. Edit or delete agents as needed

### 3. Uploading and Distributing Lists
1. Go to the "Lists" section
2. Click "Choose CSV, XLS, or XLSX file" to select your file
3. Ensure your file has columns: FirstName, Phone, Notes
4. Click "Upload & Distribute" to process the file
5. View distribution details by clicking the eye icon on any list

### 4. File Format Requirements
Your CSV/Excel file should have the following columns:
- **FirstName** (required): Contact's first name
- **Phone** (required): Phone number
- **Notes** (optional): Additional notes

Example CSV format:
\`\`\`csv
FirstName,Phone,Notes
John,+1234567890,Important client
Jane,+1987654321,Follow up needed
\`\`\`

## 📁 Project Structure

\`\`\`
mern-agent-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── services/       # API services
│   └── public/
├── server/                 # Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── controllers/        # Route controllers
│   └── utils/              # Utility functions
├── uploads/                # File upload directory
└── README.md
\`\`\`

## 🔧 API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register admin user
- \`POST /api/auth/login\` - Login user
- \`GET /api/auth/me\` - Get current user

### Agents
- \`GET /api/agents\` - Get all agents
- \`GET /api/agents/:id\` - Get single agent
- \`POST /api/agents\` - Create agent
- \`PUT /api/agents/:id\` - Update agent
- \`DELETE /api/agents/:id\` - Delete agent (soft delete)

### Lists
- \`POST /api/lists/upload\` - Upload and distribute file
- \`GET /api/lists\` - Get all lists
- \`GET /api/lists/:id\` - Get list details
- \`GET /api/lists/agent/:agentId\` - Get agent-specific lists
- \`DELETE /api/lists/:id\` - Delete list

## 🧪 Testing

### Manual Testing
1. Test user registration and login
2. Create multiple agents
3. Upload a sample CSV file with test data
4. Verify equal distribution among agents
5. Test with different file formats (CSV, XLS, XLSX)
6. Test edge cases (empty files, invalid formats)

### Sample Test Data
Create a CSV file with this content:
\`\`\`csv
FirstName,Phone,Notes
John Smith,+1234567890,Priority client
Jane Doe,+1987654321,Follow up needed
Bob Johnson,+1122334455,New lead
Alice Brown,+1555666777,Potential sale
Charlie Wilson,+1888999000,Callback required
\`\`\`

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- File type and size validation
- Protected API routes
- Secure error handling

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in .env file
   - Verify database permissions

2. **File Upload Issues**
   - Check file format (CSV, XLS, XLSX only)
   - Ensure file size is under 5MB
   - Verify column names match requirements

3. **Build Errors**
   - Delete node_modules and package-lock.json
   - Run \`npm install\` again
   - Check Node.js version compatibility

4. **Port Conflicts**
   - Change PORT in .env file
   - Update REACT_APP_API_URL in client/.env

## 📝 Development Notes

### Code Quality
- Follow ESLint and Prettier configurations
- Use consistent naming conventions
- Include proper error handling
- Add comments for complex logic

### Performance Optimizations
- Implement pagination for large datasets
- Add caching for frequently accessed data
- Optimize database queries
- Compress images and assets

### Future Enhancements
- Add agent dashboard for viewing assigned items
- Implement email notifications
- Add export functionality
- Include audit logging
- Add user roles and permissions

## 📧 Support

For technical support or questions, please create an issue in the repository or contact the development team.

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

**Note**: This application is designed for demonstration purposes. For production use, implement additional security measures, error handling, and performance optimizations.
>>>>>>> origin/branch1
