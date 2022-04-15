import { gl } from './common.js';
import { bytes } from './utility.js';

/**
 * (DO NOT USE) Class with the layout (vertex stride, etc.) of vertices.
 * @memberof HB
 */
class VertexLayout {
	/**
	 * (DO NOT USE) Internal use by Hummingbird only.
	 * @constructor
	 * @readonly
	 * @memberof HB
	 */
	constructor() {
		this.elements = [];
		this.memoryStride = 0;
		/**
		 * (DO NOT USE) Internal variable to keep track of the vertex stride, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#parameters}.
		 * @readonly
		 */
		this.stride = 0;
	}

	/**
	 * (DO NOT USE) Add a new attribute for rendering a vertex.
	 * @readonly
	 * @param {HB.Shader} shader - The shader to take the attributes from.
	 * @param {string} name - Name of attribute in the shader.
	 * @param {GLenum} type - Type of data, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#parameters}.
	 * @param {number} count - Amount of bytes for this attribute.
	 * @param {boolean} normalized=false - Whether integers should be normalized into a certain range when being cast to a float, [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#parameters}.
	 * @returns {number} Location of the attribute in the shader.
	 */
	add(shader, name, type, count, normalized = false) {
		this.stride += count;
		const index = shader.getAttribLocation(name);
		if (index !== -1) this.elements.push({ index: index, type: type, count: count, normalized: normalized });
		this.memoryStride += count * bytes(type);
		return index;
	}

	/**
	 * (DO NOT USE) Method to clear all elements and reset the byte stride of this class.
	 * @readonly
	 */
	clear() {
		this.elements = [];
		this.memoryStride = 0;
	}

	/**
	 * (DO NOT USE) Method to enable the vertex attributes.
	 * @readonly
	 */
	enable() {
		let offset = 0;
		for (let element of this.elements) {
			gl.enableVertexAttribArray(element.index);
			gl.vertexAttribPointer(element.index, element.count, element.type, element.normalized, this.memoryStride, offset);
			offset += element.count * bytes(element.type);
		}
	}

	/**
	 * (DO NOT USE) Method to disable the vertex attributes.
	 * @readonly
	 */
	disable() {
		for (let element of this.elements) {
			gl.disableVertexAttribArray(element.index);
		}
	}
}

export {
	VertexLayout
};
