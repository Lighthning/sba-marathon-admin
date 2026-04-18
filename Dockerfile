# Simple static file server
FROM node:20-slim

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy pre-built dist folder
COPY dist ./dist

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "dist", "-l", "3000", "--single"]
