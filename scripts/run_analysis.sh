#!/bin/bash

DIRECTORY="$1"

# check if argument is provided
if [ -z "$DIRECTORY" ]; then
  echo "Shapshot directory argument is missing. Please provide a path to your snapshot directory."
  exit 1
fi

# check if directory exists
if [ ! -d "$DIRECTORY" ]; then
  echo "Directory '$DIRECTORY' does not exist."
  exit 1
fi

# Loop through all files in the directory and run the command on each one
for file in "$DIRECTORY"/*
do
  if [ -f "$file" ]; then
    echo "Generating reports from snapshot file: $file"
    node generate_reports.js "$file"
  fi
done