import { gl } from './common.js';
import { Math } from './math.js';
import { font_b64, font_data } from './font.js';

/**
 * This Object has all textures indexed by name to be used in the texture draw methods.
 * @type {Object}
 * @memberof HB
 */
const textures = {};
/**
 * (DO NOT USE) Variable for the kernings, size, etc. of the included font.
 * @readonly
 * @memberof HB
 */
let fontData = undefined;
/**
 * (DO NOT USE) Texture with the included font.
 * @readonly
 * @type {HB.Texture}
 * @memberof HB
 */
let font = undefined;

/**
 * Class with all of the initialization and methods for a texture.
 * @memberof HB
 */
class Texture {
	/**
	 * Construct this for the texture to be added to the {@link HB.textures} Object, so you do not have to assign the instance to a value, it gets added to 'out' automatically.
	 * @constructor
	 * @param {string} name - Name of the texture, for indexing in the 'out' Object.
	 * @param {string} path - Path in the file system to the texture file, [supported formats]{@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#supported_image_formats}.
	 * @param {Object} out=HB.textures - The Object to add the texture to.
	 * @param {Function} callback - Is called when the texture has finished loading, logs the loaded textures to the browser console by default.
	 * @param {number} filter=gl.LINEAR - WebGL enum value for texture filtering, see gl.TEXTURE_MAG/MIN_FILTER on [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter#parameters}.
	 * @param {number} wrap=gl.CLAMP_TO_EDGE - WebGL enum value for texture wrapping, see gl.TEXTURE_WRAP_S/T on [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter#parameters}.
	 * @memberof HB
	 */
	constructor(name, path, out = textures, callback = function () { console.log("Texture loaded: " + this.name); }, filter = gl.LINEAR, wrap = gl.CLAMP_TO_EDGE) {
		this.id = gl.createTexture();
		this.createTexture(path, filter, wrap);
		this.name = name;

		if (out === undefined) {
			textures[this.name] = this;
		} else if (Array.isArray(out)) {
			out.push(this);
		} else if (out instanceof Object) {
			out[this.name] = this;
		}

		this.onLoadCallback = callback;
	}

	/**
	 * (DO NOT USE) Internal method for creating the font, circle, error texture and blank textures needed for drawing text, ellipses and colored shapes.
	 * @readonly
	 */
	static init() {
		fontData = JSON.parse(font_data);
		font = new Texture('Hummingbird_Font-Atlas', font_b64);

		new Texture('Hummingbird_Error');
		textures.Hummingbird_Error.onLoadCallback();

		const circleSize = 1000;
		const circle = new Uint8Array(circleSize * circleSize * 4);
		for (let x = 0; x < circleSize; x++) {
			for (let y = 0; y < circleSize; y++) {
				const index = (x * circleSize + y) * 4;

				if (Math.dist(x, y, circleSize / 2, circleSize / 2) < circleSize / 2) {
					circle[index] = 255;
					circle[index + 1] = 255;
					circle[index + 2] = 255;
					circle[index + 3] = 255;
				} else {
					circle[index] = 0;
					circle[index + 1] = 0;
					circle[index + 2] = 0;
					circle[index + 3] = 0;
				}
			}
		}
		new Texture('Hummingbird_Circle');
		textures.Hummingbird_Circle.bind();
		this.setTextureParameters(gl.LINEAR, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, circleSize, circleSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, circle);
		textures.Hummingbird_Circle.onLoadCallback();

		{ // set a blank texture on texture slot 0
			const blankTexture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, blankTexture);
			this.setTextureParameters(gl.NEAREST, gl.REPEAT);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
		}
	}

	/**
	 * (DO NOT USE) Method for setting an error texture in case of a texture failing to load etc.
	 * @readonly
	 */
	setErrorTexture() {
		const errorTexture = new Uint8Array([255, 255, 255, 255, 191, 191, 191, 255, 191, 191, 191, 255, 255, 255, 255, 255]);
		Texture.setTextureParameters(gl.NEAREST, gl.REPEAT);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, errorTexture);
	}

	/**
	 * (DO NOT USE) Internal method for actually creating a texture, is called by constructor.
	 * @param {string} path - Path of the texture.
	 * @param {number} filter - WebGL enum value for texture filtering, see gl.TEXTURE_MAG/MIN_FILTER on [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter#parameters}.
	 * @param {number} wrap - WebGL enum value for texture wrapping, see gl.TEXTURE_WRAP_S/T on [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter#parameters}.
	 * @readonly
	 */
	createTexture(path, filter, wrap) {
		this.bind();
		this.setErrorTexture();

		if (path === undefined) return;

		const image = new Image();
		image.onload = () => {
			this.bind();
			Texture.setTextureParameters(filter, wrap);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			this.onLoadCallback();
		}
		image.src = path;
	}

	/**
	 * (DO NOT USE) Internal method for setting the texure parameters, is called by {@link HB.Texture#createTexture}.
	 * @param {number} filter - WebGL enum value for texture filtering, see gl.TEXTURE_MAG/MIN_FILTER on [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter#parameters}.
	 * @param {number} wrap - WebGL enum value for texture wrapping, see gl.TEXTURE_WRAP_S/T on [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter#parameters}.
	 * @readonly
	 */
	static setTextureParameters(filter, wrap) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
	}

	/**
	 * (DO NOT USE) Internal method binding the texture to a specific slot.
	 * @param {number} slot - Which slot.
	 * @readonly
	 */
	bind(slot = 1) {
		gl.activeTexture(gl['TEXTURE' + slot]);
		gl.bindTexture(gl.TEXTURE_2D, this.id);
	}
	/**
	 * (DO NOT USE) Internal method for binding an empty texture, or unbinding this one.
	 * @readonly
	 */
	unbind() { gl.bindTexture(gl.TEXTURE_2D, null); }
	/**
	 * (DO NOT USE) Internal method for deleting this texture, is called on all textures by {@link HB.Renderer#delete}.
	 * @readonly
	 */
	delete() {
		this.unbind();
		gl.deleteTexture(this.id);
	}
}

export {
	Texture,
	textures,
	fontData,
	font
};
