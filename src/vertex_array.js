import { gl } from "./common.js";
import { VertexBuffer, IndexBuffer } from "./buffer.js";
import { shader } from "./shader.js";
import { bytes } from "./utility.js";

class VertexLayout {
	constructor() {
		this.elements = [];
		this.memoryStride = 0;
		this.stride = 0;
	}

	add(shader, name, type, count, normalized = false) {
		this.stride += count;
		this.memoryStride += count * bytes(type);

		const index = shader.getAttribLocation(name);
		if (index !== -1) {
			this.elements.push({
				index: index,
				type: type,
				count: count,
				normalized: normalized
			});
		}

		return index;
	}

	enable() {
		let offset = 0;
		for (let element of this.elements) {
			gl.enableVertexAttribArray(element.index);
			gl.vertexAttribPointer(element.index, element.count, element.type, element.normalized, this.memoryStride, offset);
			offset += element.count * bytes(element.type);
		}
	}

	disable() {
		for (let element of this.elements)
			gl.disableVertexAttribArray(element.index);
	}
}

export class VertexArray {
	static ext;
	static id;
	static layout;

	static init(maxVertexCount, maxIndexCount) {
		this.ext = gl.getExtension("OES_vertex_array_object");
		this.id = this.ext.createVertexArrayOES();
		this.ext.bindVertexArrayOES(this.id);

		this.layout = new VertexLayout();
		this.layout.add(shader, "aVertexPosition", gl.FLOAT, 2);
		this.layout.add(shader, "aVertexColor", gl.FLOAT, 4);
		this.layout.add(shader, "aTexturePosition", gl.FLOAT, 2);
		this.layout.add(shader, "aTextureId", gl.FLOAT, 1);
		this.layout.add(shader, "aTextRange", gl.FLOAT, 1);

		VertexBuffer.init(maxVertexCount * this.layout.stride);
		this.layout.enable();

		IndexBuffer.init(maxIndexCount);
	}

	static delete() {
		this.ext.bindVertexArrayOES(null);
		this.layout.disable();
		this.ext.deleteVertexArrayOES(this.id);
	}
}
