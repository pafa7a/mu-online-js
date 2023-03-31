FROM node:14-alpine

WORKDIR /app

# Copy the package.json file into the container
COPY package.json yarn.lock ./

# Copy the rest of the application files into the container
COPY . .

# Expose the necessary ports
EXPOSE 44405
EXPOSE 55557

# Set the default command to run the ConnectServer
CMD ["yarn", "start"]
