#!/bin/bash

# HOF Image Processing Workflow Setup Script
echo "🚀 Setting up HOF Image Processing Workflow..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "IMAGE_PROCESSING_WORKFLOW.md" ]; then
    print_error "Please run this script from the hof-web directory"
    exit 1
fi

# 1. Setup Python Service
print_status "Setting up Python Image Processing Service..."
cd ../hof-python-env

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Make start script executable
chmod +x start.sh

print_status "Python service setup complete ✅"

# 2. Setup Backend Service
print_status "Setting up NestJS Backend..."
cd ../hof-web-app-backend

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

print_status "Backend setup complete ✅"

# 3. Setup Frontend
print_status "Setting up Next.js Frontend..."
cd ../hof-web

# Install frontend dependencies (if needed)
print_status "Installing frontend dependencies..."
npm install

print_status "Frontend setup complete ✅"

# 4. Create environment file for backend
print_status "Creating environment configuration..."
cd ../hof-web-app-backend

if [ ! -f ".env" ]; then
    cat > .env << EOF
# Python Service Configuration
PYTHON_SERVICE_URL=http://localhost:8001

# Database Configuration (update with your values)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
EOF
    print_status "Created .env file - please update with your actual values"
else
    print_warning ".env file already exists - please ensure PYTHON_SERVICE_URL is set to http://localhost:8001"
fi

# 5. Final instructions
print_status "🎉 Setup complete! To start the services:"
echo ""
echo "1. Start Python Service:"
echo "   cd hof-python-env && ./start.sh"
echo ""
echo "2. Start Backend Service:"
echo "   cd hof-web-app-backend && npm run start:dev"
echo ""
echo "3. Start Frontend:"
echo "   cd hof-web && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
print_status "For detailed documentation, see IMAGE_PROCESSING_WORKFLOW.md"

# 6. Optional: Start services automatically
read -p "Would you like to start all services now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting all services..."
    
    # Start Python service in background
    cd ../hof-python-env
    ./start.sh &
    PYTHON_PID=$!
    
    # Wait a bit for Python service to start
    sleep 5
    
    # Start backend in background
    cd ../hof-web-app-backend
    npm run start:dev &
    BACKEND_PID=$!
    
    # Wait a bit for backend to start
    sleep 5
    
    # Start frontend
    cd ../hof-web
    print_status "Starting frontend... (Press Ctrl+C to stop all services)"
    npm run dev
    
    # Cleanup background processes when script exits
    trap "kill $PYTHON_PID $BACKEND_PID 2>/dev/null" EXIT
else
    print_status "Services not started. Use the commands above to start them manually."
fi 