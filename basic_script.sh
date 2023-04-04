#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 filename"
    exit 1
fi

filename=$1

while read line; do
    axe $line --dir ./axe-results/ --save $line.json --tags wcag2a  --chromedriver-path="/Users/liamesparraguera/a11ystudy/webdrivers"
done < $filename