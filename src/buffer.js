import { gl } from './common.js';
import { shader } from './shader.js';
import { bytes } from './utility.js';

let vertexArray = undefined;
let vertexStride = undefined;
let vertexBuffer = undefined;
let vertices = undefined;
let indexBuffer = undefined;
let indices = undefined;

class VertexBuffer{
	constructor(data) {
		this.type = gl.ARRAY_BUFFER;
		this.id = gl.createBuffer();
		this.bind();
		gl.bufferData(this.type, data, gl.DYNAMIC_DRAW);
	}

	static init(maxVertexCount = 4000) {
		vertices = new Float32Array(maxVertexCount*vertexStride);
		vertexBuffer = new VertexBuffer(vertices);
	}

	write(data) { gl.bufferSubData(this.type, 0, data); }
	partialWrite(data, length) { gl.bufferSubData(this.type, 0, data, 0, length); }

	bind() { gl.bindBuffer(this.type, this.id); }
	unbind() { gl.bindBuffer(this.type, null); }
	delete() {
		this.unbind();
		gl.deleteBuffer(this.id);
	}
}

class IndexBuffer{
	constructor(data) {
		this.type = gl.ELEMENT_ARRAY_BUFFER;
		this.id = gl.createBuffer();
		this.bind();
		gl.bufferData(this.type, data, gl.DYNAMIC_DRAW);
	}

	static init(maxIndexCount = 6000) {
		indices = new Uint16Array(maxIndexCount);
		indexBuffer = new IndexBuffer(indices);
	}

	write(data) { gl.bufferSubData(this.type, 0, data); }
	partialWrite(data, length) { gl.bufferSubData(this.type, 0, data, 0, length); }

	bind() { gl.bindBuffer(this.type, this.id); }
	unbind() { gl.bindBuffer(this.type, null); }
	delete() {
		this.unbind();
		gl.deleteBuffer(this.id);
	}
}

class VertexArray{
	constructor() {
		this.ext = gl.getExtension('OES_vertex_array_object');
		this.id = this.ext.createVertexArrayOES();
		this.bind();

		class Layout{
			constructor() {
				this.elements = [];
				this.stride = 0;
				vertexStride = 0;
			}

			add(name, type, count, normalized = false) {
				vertexStride += count;
				const index = shader.getAttribLocation(name);
				if(index !== -1) this.elements.push({ index: index, type: type, count: count, normalized: normalized });
				this.stride += count*bytes(type);
				return index;
			}

			clear() {
				this.elements = [];
				this.stride = 0;
			}
		}
		this.layout = new Layout();
	}

	static init(maxVertexCount, maxIndexCount) {
		vertexArray = new VertexArray();
		vertexArray.layout.add('aVertexPosition', gl.FLOAT, 2);
		vertexArray.layout.add('aVertexColor', gl.FLOAT, 4);
		vertexArray.layout.add('aTexturePosition', gl.FLOAT, 2);
		vertexArray.layout.add('aTextureId', gl.FLOAT, 1);
		vertexArray.layout.add('aTextSize', gl.FLOAT, 1);

		VertexBuffer.init(maxVertexCount);
		vertexArray.addBuffer(vertexBuffer);

		IndexBuffer.init(maxIndexCount);
	}

	addBuffer(vertexBuffer) {
		this.bind();
		vertexBuffer.bind();

		let offset = 0;
		this.layout.elements.forEach((element) => {
			gl.enableVertexAttribArray(element.index);
			gl.vertexAttribPointer(element.index, element.count, element.type, element.normalized, this.layout.stride, offset);
			offset += element.count*bytes(element.type);
		});
	}

	bind() { this.ext.bindVertexArrayOES(this.id); }
	unbind() { this.ext.bindVertexArrayOES(null); }
	delete() {
		this.unbind();
		vertexArray.layout.elements.forEach((element) => gl.disableVertexAttribArray(element.index));
		gl.deleteVertexArray(this.id);
	}
}

export { VertexArray, vertexArray, vertexStride, VertexBuffer, vertexBuffer, vertices, IndexBuffer, indexBuffer, indices };