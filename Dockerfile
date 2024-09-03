# Base image
FROM node:21.6.1

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npx prisma generate
RUN npm run build

# Start the server using the production build
CMD bash start.sh
