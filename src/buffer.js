import { gl } from './common.js';
import { shader } from './shader.js';
import { VertexLayout } from './vertex_layout.js';

/**
 * (DO NOT USE) Variable to keep track of the vertex array object.
 * @readonly
 * @type {WebGLVertexArrayObject}
 * @memberof HB
 */
let vertexArray = undefined;
/**
 * (DO NOT USE) Variable to keep track of the vertex buffer.
 * @readonly
 * @type {WebGLBuffer}
 * @memberof HB
 */
let vertexBuffer = undefined;
/**
 * (DO NOT USE) Variable with all current vertices, before submitting to the buffer.
 * @readonly
 * @type {Float32Array}
 * @memberof HB
 */
let vertices = undefined;
/**
 * (DO NOT USE) Variable to keep track of the index buffer.
 * @readonly
 * @type {WebGLBuffer}
 * @memberof HB
 */
let indexBuffer = undefined;
/**
 * (DO NOT USE) Variable with all current indices, before submitting to the buffer.
 * @readonly
 * @type {Float32Array}
 * @memberof HB
 */
let indices = undefined;

/**
 * (DO NOT USE) Class with all of the initialization and methods for a vertex buffer.
 * @readonly
 * @memberof HB
 */
class VertexBuffer {
	/**
	 * (DO NOT USE) Internal use by Hummingbird only.
	 * @constructor
	 * @readonly
	 * @param {Float32Array} data - Data to initialize the buffer with, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData}.
	 * @memberof HB
	 */
	constructor(data) {
		this.type = gl.ARRAY_BUFFER;
		this.id = gl.createBuffer();
		this.bind();
		gl.bufferData(this.type, data, gl.DYNAMIC_DRAW);
	}

	/**
	 * (DO NOT USE) Internal method for creating the {@link HB.vertices} and {@link HB.vertexBuffer} instances.
	 * @param {number} maxVertexCount=4000 - Amount of vertices to make space for.
	 * @readonly
	 */
	static init(maxVertexCount = 4000) {
		vertices = new Float32Array(maxVertexCount * vertexArray.layout.stride);
		vertexBuffer = new VertexBuffer(vertices);
	}

	/**
	 * (DO NOT USE) Write the entire vertex buffer with data.
	 * @param {Float32Array} data - Data for writing.
	 * @readonly
	 */
	write(data) { gl.bufferSubData(this.type, 0, data); }
	/**
	 * (DO NOT USE) Write to a part of the vertex buffer with data.
	 * @param {Float32Array} data - Data for writing.
	 * @param {number} length - Amount of array elements to write.
	 * @readonly
	 */
	partialWrite(data, length) { gl.bufferSubData(this.type, 0, data, 0, length); }

	/**
	 * (DO NOT USE) Method to bind this vertex array (set it as active).
	 * @readonly
	 */
	bind() { gl.bindBuffer(this.type, this.id); }
	/**
	 * (DO NOT USE) Method to bind an empty buffer (set this one as inactive).
	 * @readonly
	 */
	unbind() { gl.bindBuffer(this.type, null); }
	/**
	 * (DO NOT USE) Method to unbind and then delete this vertex buffer, is called from {@link HB.Renderer#delete}.
	 * @readonly
	 */
	delete() {
		this.unbind();
		gl.deleteBuffer(this.id);
	}
}

/**
 * (DO NOT USE) Class with all of the initialization and methods for an index buffer.
 * @readonly
 * @memberof HB
 */
class IndexBuffer {
	/**
	 * (DO NOT USE) Internal use by Hummingbird only.
	 * @constructor
	 * @readonly
	 * @param {Float32Array} data - Data to initialize the buffer with, see [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData}.
	 * @memberof HB
	 */
	constructor(data) {
		this.type = gl.ELEMENT_ARRAY_BUFFER;
		this.id = gl.createBuffer();
		this.bind();
		gl.bufferData(this.type, data, gl.DYNAMIC_DRAW);
	}

	/**
	 * (DO NOT USE) Internal method for creating the {@link HB.indices} and {@link HB.indexBuffer} instances.
	 * @param {number} maxIndexCount=6000 - Amount of indices to make space for.
	 * @readonly
	 */
	static init(maxIndexCount = 6000) {
		indices = new Uint16Array(maxIndexCount);
		indexBuffer = new IndexBuffer(indices);
	}

	/**
	 * (DO NOT USE) Write the entire index buffer with data.
	 * @param {Float32Array} data - Data for writing.
	 * @readonly
	 */
	write(data) { gl.bufferSubData(this.type, 0, data); }
	/**
	 * (DO NOT USE) Write to a part of the index buffer with data.
	 * @param {Float32Array} data - Data for writing.
	 * @param {number} length - Amount of array elements to write.
	 * @readonly
	 */
	partialWrite(data, length) { gl.bufferSubData(this.type, 0, data, 0, length); }

	/**
	 * (DO NOT USE) Method to bind this index array (set it as active).
	 * @readonly
	 */
	bind() { gl.bindBuffer(this.type, this.id); }
	/**
	 * (DO NOT USE) Method to bind an empty buffer (set this one as inactive).
	 * @readonly
	 */
	unbind() { gl.bindBuffer(this.type, null); }
	/**
	 * (DO NOT USE) Method to unbind and then delete this index buffer, is called from {@link HB.Renderer#delete}.
	 * @readonly
	 */
	delete() {
		this.unbind();
		gl.deleteBuffer(this.id);
	}
}

/**
 * (DO NOT USE) Class with all of the initialization and methods for a vertex array object, containing a vertex- and indexBuffer to reduce WebGL calls.
 * @readonly
 * @memberof HB
 */
class VertexArray {
	/**
	 * (DO NOT USE) Internal use by Hummingbird only.
	 * @constructor
	 * @readonly
	 * @memberof HB
	 */
	constructor() {
		/**
		 * (DO NOT USE) Internal variable in which the WebGL 1 vertex array extension is stored, for compatibility.
		 * @type {OES_vertex_array_object}
		 * @readonly
		 */
		this.ext = gl.getExtension('OES_vertex_array_object');
		/**
		 * (DO NOT USE) Internal variable in which the actual vertex array is stored.
		 * @type {WebGLVertexArrayObjectOES}
		 * @readonly
		 */
		this.id = this.ext.createVertexArrayOES();
		this.bind();

		/**
		 * (DO NOT USE) The vertex layout of the active vertex buffer.
		 * @readonly
		 * @type {HB.VertexLayout}
		 */
		this.layout = new VertexLayout();
	}

	/**
	 * (DO NOT USE) Internal method for creating the {@link HB.vertexArray} instance and initializing {@link HB.VertexBuffer} and {@link HB.IndexBuffer}.
	 * @param {number} maxIndexCount=6000 - Amount of indices to make space for.
	 * @readonly
	 */
	static init(maxVertexCount, maxIndexCount) {
		vertexArray = new VertexArray();
		vertexArray.layout.add(shader, 'aVertexPosition', gl.FLOAT, 2);
		vertexArray.layout.add(shader, 'aVertexColor', gl.FLOAT, 4);
		vertexArray.layout.add(shader, 'aTexturePosition', gl.FLOAT, 2);
		vertexArray.layout.add(shader, 'aTextureId', gl.FLOAT, 1);
		vertexArray.layout.add(shader, 'aTextRange', gl.FLOAT, 1);

		VertexBuffer.init(maxVertexCount);
		vertexArray.addBuffer(vertexBuffer);

		IndexBuffer.init(maxIndexCount);
	}

	/**
	 * (DO NOT USE) Method to bind a vertex buffer to this vertex array object and enable its attributes.
	 * @param {HB.VertexBuffer} vertexBuffer - The vertex buffer to bind.
	 * @readonly
	 */
	addBuffer(vertexBuffer) {
		this.bind();
		vertexBuffer.bind();
		this.layout.enable();
	}

	/**
	 * (DO NOT USE) Method to bind this vertex array object (set it as active).
	 * @readonly
	 */
	bind() { this.ext.bindVertexArrayOES(this.id); }
	/**
	* (DO NOT USE) Method to bind an empty vertex array object (set this one as inactive).
	* @readonly
	*/
	unbind() { this.ext.bindVertexArrayOES(null); }
	/**
	* (DO NOT USE) Method to unbind, disable attributes and then delete this vertex array object, is called from {@link HB.Renderer#delete}.
	* @readonly
	*/
	delete() {
		this.unbind();
		this.layout.disable();
		this.ext.deleteVertexArrayOES(this.id);
	}
}

export {
	VertexArray,
	vertexArray,
	VertexBuffer,
	vertexBuffer,
	vertices,
	IndexBuffer,
	indexBuffer,
	indices
};
