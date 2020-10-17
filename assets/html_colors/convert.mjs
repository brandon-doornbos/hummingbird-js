//https://www.w3schools.com/colors/colors_names.asp
import { readFileSync, writeFileSync } from 'fs';

const hex = {
	'0': 0,
	'1': 1,
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	'A': 10,
	'B': 11,
	'C': 12,
	'D': 13,
	'E': 14,
	'F': 15
}

function main() {
	let colors = readFileSync('colors.txt', {'encoding': 'UTF-8'});

	colors = colors.split('\r\n');
	if(colors[0] === '') colors.splice(0, 1);

	const colorCombinations = [];
	for(let i = 0; i < colors.length; i += 2) {
		colorCombinations[i*0.5] = {name: colors[i], value: colors[i+1]};
	}
	colors = colorCombinations.slice();

	for(let i = 0; i < colors.length; i++) {
		const color = colors[i];
		color.value = color.value.split('#')[1];
		color.value = {
			x: parseFloat(((hex[color.value[0]]*16+hex[color.value[1]])/255).toFixed(2)),
			y: parseFloat(((hex[color.value[2]]*16+hex[color.value[3]])/255).toFixed(2)),
			z: parseFloat(((hex[color.value[4]]*16+hex[color.value[5]])/255).toFixed(2)),
			w: 1
		}
		colors[i] = {};
		colors[i][color.name] = color.value;
	}

	colors = JSON.stringify(colors);
	colors = colors.replace(/["\[\]]/g, '');
	colors = colors.replace(/}}/g, '}');
	colors = colors.replace(/,{/g, ',\n');

	writeFileSync('colors_converted.json', colors);

	console.log(colors);
}

main();