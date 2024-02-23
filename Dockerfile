# Use the official Node.js 20 image as a base
FROM node:21.6-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Build your TypeScript project
RUN npm run build

# Add a shell script to decide between normal start and backfill
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set the entrypoint script to run when starting the container
CMD ["docker-entrypoint.sh"]
