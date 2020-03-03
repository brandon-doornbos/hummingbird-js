class Renderer{
	constructor() {
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.clearColor(0, 0, 0, 1);

		shader = new Shader();
		shader.bind();

		this.textures = [];
		// const textureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
		const textureSamplers = [];
		for(let i = 0; i < 16; i++) { textureSamplers[i] = i; }
		shader.setUniformArray('i', 'uTextureIds', textureSamplers);

		{ // set a blank texture on texture slot 0
			const blankTexture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, blankTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
		}

		batch = new Batch(2000, 3000);

		this.vertexArray = new VertexArray();

		this.vertices = new Float32Array(batch.maxVertexCount*10);
		this.vertexBuffer = new VertexBuffer(this.vertices);
		this.vertexArray.layout.add('aVertexPosition', gl.FLOAT, 3);
		this.vertexArray.layout.add('aVertexColor', gl.FLOAT, 4);
		this.vertexArray.layout.add('aTexturePosition', gl.FLOAT, 2);
		this.vertexArray.layout.add('aTextureId', gl.FLOAT, 1);
		this.vertexArray.addBuffer(this.vertexBuffer);

		this.indices = new Uint32Array(batch.maxIndexCount);
		this.indexBuffer = new IndexBuffer(this.indices);

		camera = new Camera();
	}

	clear() { gl.clear(gl.COLOR_BUFFER_BIT); }

	draw(indexCount) {
		shader.bind();
		this.vertexArray.bind();

		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
	}

	delete() {
		this.textures.forEach((texture) => { texture.delete(); });
		shader.delete();
		this.vertexArray.delete();
		this.vertexBuffer.delete();
		this.indexBuffer.delete();
	}
}