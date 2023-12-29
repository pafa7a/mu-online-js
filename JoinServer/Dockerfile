FROM node:18-alpine

WORKDIR /app

# Copy all files into the container
COPY . .

# Install all dependencies
RUN yarn install

# Build the server
RUN yarn build

# Expose the necessary port
EXPOSE 55970

# Set the default command to run the JoinServer
CMD ["yarn", "start"]
