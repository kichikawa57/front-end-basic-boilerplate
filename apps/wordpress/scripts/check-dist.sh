#!/bin/bash

# Check if the dist directory exists
if [ ! -d "./dist" ]; then
  echo "🛑 Error: The 'dist' folder does not exist. Please run the build process first."
  exit 1
else
  echo "✅ 'dist' folder exists."
  exit 0
fi