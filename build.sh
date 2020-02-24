#!/bin/bash

rm ./dist/hummingbird.js
touch ./dist/hummingbird.js

echo '"use strict";' >> ./dist/hummingbird.js
echo '' >> ./dist/hummingbird.js
for file in ./src/*.js
do
	cat "$file" >> ./dist/hummingbird.js
	echo '' >> ./dist/hummingbird.js
	echo '' >> ./dist/hummingbird.js
done

minify ./dist/hummingbird.js -o ./dist/hummingbird.min.js