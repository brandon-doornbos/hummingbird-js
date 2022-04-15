//https://www.w3schools.com/colors/colors_names.asp
import { readFileSync, writeFileSync } from 'fs';

export default function parseColors() {
	return {
		name: 'parse-colors',
		buildStart: async () => {
			const hex_lut = {
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

			const colors_str = readFileSync('colors.txt', { 'encoding': 'UTF-8' });

			let colors_split = colors_str.split('\r\n');
			if (colors_split[0] === '') colors_split.splice(0, 1);

			let colors_combi = [];
			for (let i = 0; i < colors_split.length; i += 2) {
				colors_combi[i * 0.5] = { name: colors_split[i], value: colors_split[i + 1] };
			}

			let colors = {};
			for (let i = 0; i < colors_combi.length - 1; i++) {
				const color = colors_combi[i];
				const hex = color.value.slice(1);
				const value = [
					parseFloat(((hex_lut[hex[0]] * 16 + hex_lut[hex[1]]) / 255).toFixed(2)),
					parseFloat(((hex_lut[hex[2]] * 16 + hex_lut[hex[3]]) / 255).toFixed(2)),
					parseFloat(((hex_lut[hex[4]] * 16 + hex_lut[hex[5]]) / 255).toFixed(2)),
					1
				];
				colors[color.name] = value;
			}

			const colors_json = JSON.stringify(colors);
			writeFileSync('src/colors.json', colors_json);
		}
	};
}
