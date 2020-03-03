class Buffer{
	constructor(type, usage, data) {
		this.type = type;
		this.id = gl.createBuffer();
		this.bind();
		gl.bufferData(this.type, data, usage);
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

class VertexBuffer extends Buffer{
	constructor(data) {
		super(gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW, data);
	}

	write(data) {	super.write(data); }
	partialWrite(data, length) { super.partialWrite(data, length); }
}

class IndexBuffer extends Buffer{
	constructor(data/*, count*/) {
		super(gl.ELEMENT_ARRAY_BUFFER, gl.DYNAMIC_DRAW, data);
		// this.count = count;
	}

	write(data) {	super.write(data); }
	partialWrite(data, length) { super.partialWrite(data, length); }
}

class VertexArray{
	constructor() {
		this.id = gl.createVertexArray();
		gl.bindVertexArray(this.id);

		class Layout{
			constructor() {
				this.elements = [];
				this.stride = 0;
			}

			add(name, type, count, normalized = false) {
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

	bind() { gl.bindVertexArray(this.id); };
	unbind() { gl.bindVertexArray(null); };
	delete() {
		this.unbind();
		vertexArray.layout.elements.forEach((element) => gl.disableVertexAttribArray(element.index));
		gl.deleteVertexArray(this.id);
	}
}