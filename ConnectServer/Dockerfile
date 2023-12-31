FROM node:18-alpine

WORKDIR /app

# Copy all files into the container
COPY . .

# Install all dependencies
RUN yarn install

# Build the server
RUN yarn build

# Expose the necessary ports
EXPOSE 44405
EXPOSE 55557

# Set the default command to run the ConnectServer
CMD ["yarn", "start"]
