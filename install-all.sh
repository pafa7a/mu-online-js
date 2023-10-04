#!/bin/bash

# Directories to install dependencies in
directories=("Client" "ConnectServer" "GameServer" "JoinServer" "libs/mu-db" "libs/mu-logger" "libs/mu-packet-manager" "WebServer/mu-socket-server" "WebServer/mu-web-admin")

# Install dependencies in each directory
for dir in "${directories[@]}"; do
  echo "Installing dependencies in $dir..."
  rm -rf "${dir}/node_modules";
  yarn --cwd "$dir" install
done

# Install dependencies in the root directory
echo "Installing dependencies in the root directory..."
yarn install

echo "All dependencies have been installed."
