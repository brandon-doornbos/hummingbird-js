import { gl, noUpdate, update } from './common.js';
import { shader } from './shader.js';
import { loadFile } from './utility.js';
import { Math } from './math.js';

const textures = {};
let fontData = undefined;
let font = undefined;

class Texture{
	constructor(name, path, out = textures, callback = function() { console.log("Texture loaded: "+this.name); }, filter = gl.LINEAR, wrap = gl.CLAMP_TO_EDGE) {
		this.id = gl.createTexture();
		this.createTexture(path, filter, wrap);
		this.name = name;

		if(out === undefined) {
			textures[this.name] = this;
		} else if(Array.isArray(out)) {
			out.push(this);
		} else if(out instanceof Object) {
			out[this.name] = this;
		}

		this.onLoadCallback = callback;
	}

	static init(loadElement) {
		loadFile("https://projects.santaclausnl.ga/Hummingbird/assets/arial.json", 'json', (data) => {
			fontData = data;
			loadElement.remove();
			if(noUpdate === false) requestAnimationFrame(update);
		});
		font = new Texture('Hummingbird_Font-Atlas', 'https://projects.santaclausnl.ga/Hummingbird/assets/arial.png');

		const circleSize = 1000;
		const circle = new Uint8Array(circleSize*circleSize*4);
		for(let x = 0; x < circleSize; x++) {
			for(let y = 0; y < circleSize; y++) {
				const index = (x*circleSize+y)*4;

				if(Math.dist(x, y, circleSize/2, circleSize/2) < circleSize/2) {
					circle[index  ] = 255;
					circle[index+1] = 255;
					circle[index+2] = 255;
					circle[index+3] = 255;
				} else {
					circle[index  ] = 0;
					circle[index+1] = 0;
					circle[index+2] = 0;
					circle[index+3] = 0;
				}
			}
		}
		new Texture('Hummingbird_Circle');
		textures.Hummingbird_Circle.bind();
		this.setTextureParameters(gl.LINEAR, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, circleSize, circleSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, circle);
		textures.Hummingbird_Circle.onLoadCallback();

		// const textureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
		const textureSamplers = [];
		for(let i = 0; i < 16; i++) { textureSamplers[i] = i; }
		shader.setUniformArray('i', 'uTextureIds', textureSamplers);

		{ // set a blank texture on texture slot 0
			const blankTexture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, blankTexture);
			this.setTextureParameters(gl.NEAREST, gl.REPEAT);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
		}
	}

	setErrorTexture() {
		const errorTexture = new Uint8Array([255, 255, 255, 255, 191, 191, 191, 255, 191, 191, 191, 255, 255, 255, 255, 255]);
		Texture.setTextureParameters(gl.NEAREST, gl.REPEAT);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, errorTexture);
	}

	createTexture(path, filter, wrap) {
		this.bind();
		this.setErrorTexture();

		if(path === undefined) return;

		const image = new Image();
		image.onload = () => {
			this.bind();
			Texture.setTextureParameters(filter, wrap);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			this.onLoadCallback();
		}
		image.src = path;
	}

	static setTextureParameters(filter, wrap) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
	}

	bind(slot = 1) {
		gl.activeTexture(gl['TEXTURE' + slot]);
		gl.bindTexture(gl.TEXTURE_2D, this.id);
	}
	unbind() { gl.bindTexture(gl.TEXTURE_2D, null); }
	delete() {
		this.unbind();
		gl.deleteTexture(this.id);
	}
}

export { Texture, textures, fontData, font };