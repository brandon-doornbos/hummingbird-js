import { gl } from './common.js';
import { shader } from './shader.js';
import { VertexLayout } from './vertex_layout.js';

export class VertexBuffer {
	static type;
	static data;
	static id;

	static init(maxVertexCount) {
		this.type = gl.ARRAY_BUFFER;
		this.data = new Float32Array(maxVertexCount * VertexArray.layout.stride);
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

export class VertexArray {
	static ext;
	static id;
	static layout;

	static init(maxVertexCount, maxIndexCount) {
		this.ext = gl.getExtension('OES_vertex_array_object');
		this.id = this.ext.createVertexArrayOES();
		this.ext.bindVertexArrayOES(this.id);

		this.layout = new VertexLayout();
		this.layout.add(shader, 'aVertexPosition', gl.FLOAT, 2);
		this.layout.add(shader, 'aVertexColor', gl.FLOAT, 4);
		this.layout.add(shader, 'aTexturePosition', gl.FLOAT, 2);
		this.layout.add(shader, 'aTextureId', gl.FLOAT, 1);
		this.layout.add(shader, 'aTextRange', gl.FLOAT, 1);

		VertexBuffer.init(maxVertexCount);
		this.layout.enable();

		IndexBuffer.init(maxIndexCount);
	}

	static delete() {
		this.ext.bindVertexArrayOES(null);
		this.layout.disable();
		this.ext.deleteVertexArrayOES(this.id);
	}
}
