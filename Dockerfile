FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm install instead of npm ci to resolve dependency issues
# Also disabled husky in .npmrc to prevent husky install errors
# Removed prepare script from package.json to completely eliminate husky install errors
RUN npm install --omit=dev --legacy-peer-deps

# Install NestJS CLI globally for build process
RUN npm install -g @nestjs/cli

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
