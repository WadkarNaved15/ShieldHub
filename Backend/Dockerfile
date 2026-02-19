# Use a lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your Node code
COPY . .

# Expose the port your Node server runs on
EXPOSE 3000

# Start the Node server (Change 'server.js' if your entry file is different)
CMD ["node", "server.js"]