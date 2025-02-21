#!/bin/bash

# Make sure we are in the right directory
if [ ! -f "./deploy.sh" ]; then
  echo "Please run this script from the root of the project."
  exit 1
fi

# Pull changes from the remote repository
git pull

# Build the Docker images
docker-compose up --build -d

# Log that the deployment was successful
echo "Deployment successful!"