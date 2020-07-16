#!/bin/bash

echo "Building..."
node node_modules/rollup/dist/bin/rollup src/index.js --file dist/hummingbird.js --format iife --output.name HB

echo "Minifying..."
echo "dist/hummingbird.js → dist/hummingbird.min.js..."
node node_modules/terser/bin/terser dist/hummingbird.js --compress --mangle -o dist/hummingbird.min.js

echo "Done!"