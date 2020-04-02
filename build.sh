#!/bin/bash

cd ~/NAS/STACK/Coding/Hummingbird/

echo "Building..."
node node_modules/rollup/dist/bin/rollup src/index.js --file dist/hummingbird.js --format iife --output.name HB

echo "Minifying..."
echo "dist/hummingbird.js → dist/hummingbird.min.js..."
minify dist/hummingbird.js -o dist/hummingbird.min.js

echo "Done!"