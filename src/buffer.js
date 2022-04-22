import { gl } from './common.js';

export class VertexBuffer {
	static type;
	static data;
	static id;

	static init(maxFloatCount) {
		this.type = gl.ARRAY_BUFFER;
		this.data = new Float32Array(maxFloatCount);
		this.id = gl.createBuffer();
		gl.bindBuffer(this.type, this.id);
		gl.bufferData(this.type, this.data, gl.DYNAMIC_DRAW);
	}

	static write(length) { gl.bufferSubData(this.type, 0, this.data, 0, length); }

	static delete() {
		gl.bindBuffer(this.type, null);
		gl.deleteBuffer(this.id);
	}
}

export class IndexBuffer {
	static type;
	static data;
	static id;

	static init(maxIndexCount) {
		this.type = gl.ELEMENT_ARRAY_BUFFER;
		this.data = new Uint16Array(maxIndexCount);
		this.id = gl.createBuffer();
		gl.bindBuffer(this.type, this.id);
		gl.bufferData(this.type, this.data, gl.DYNAMIC_DRAW);
	}

	static write(length) { gl.bufferSubData(this.type, 0, this.data, 0, length); }

	static delete() {
		gl.bindBuffer(this.type, null);
		gl.deleteBuffer(this.id);
	}
}
