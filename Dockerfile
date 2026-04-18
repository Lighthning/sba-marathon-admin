# Simple static file server
FROM node:20-slim

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy pre-built dist folder
COPY dist ./dist

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the app with PORT from environment
CMD sh -c "serve dist -l ${PORT:-3000} --single"
