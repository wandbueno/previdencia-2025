#!/bin/bash

# Set environment variable for production
export NODE_ENV=production

# Run migrations first to ensure database structure is correct
echo "Running database migrations..."
npm run migrate

# Run seed script to create super admin if not exists
echo "Running database seed..."
npm run seed

# Start the application
echo "Starting application..."
npm start
