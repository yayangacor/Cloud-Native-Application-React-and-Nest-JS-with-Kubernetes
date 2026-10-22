# Use Node.js image to build the React app
FROM node:24-alpine AS build-stage

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Vite bakes the API URL into the build. "/api" makes the browser call the same host,
# so the Ingress (AKS) or nginx (local) can route it to the backend.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build the React app
RUN npm run build

# Use Nginx to serve the build files
FROM nginx:alpine

# Copy the built files from the previous step
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
