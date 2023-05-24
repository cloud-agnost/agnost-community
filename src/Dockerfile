# Base image
FROM node:14-alpine

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY /src .

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
