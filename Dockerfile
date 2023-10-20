# Use a base image with Node.js pre-installed
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm ci --production

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which your NestJS application will run
EXPOSE 3000

# Run the NestJS application
CMD ["node", "dist/main"]