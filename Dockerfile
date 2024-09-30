# Use an official Node.js image.
FROM node:18-alpine

# Set the working directory.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install app dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build the TypeScript code (optional if your project needs building).
RUN npm run build

# Expose the port the app runs on.
EXPOSE 3000

# Define the command to start the server.
CMD ["npm", "start"]
