FROM node:18-alpine

WORKDIR /app

# Copy the package.json file into the container
COPY package.json yarn.lock ./

# Copy the rest of the application files into the container
COPY . .

# Install all prod dependencies
RUN yarn install --prod

# Expose the necessary port
EXPOSE 55970

# Set the default command to run the ConnectServer
CMD ["yarn", "start"]
