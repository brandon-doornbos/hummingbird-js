class Renderer{
	constructor() {
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		this.shader = new Shader();
		this.shader.bind();

		this.vertexArray = new VertexArray(this);

		const vertices = [
			100, 100, 0, 0, 0, 1, 1, 0, 0, 1,
			200, 100, 0, 0, 0, 1, 1, 1, 0, 1,
			200, 200, 0, 0, 0, 1, 1, 1, 1, 1,
			100, 200, 0, 0, 0, 1, 1, 0, 1, 1,
		];
		this.vertexBuffer = new VertexBuffer(vertices);
		this.vertexArray.layout.add('aVertexPosition', gl.FLOAT, 3);
		this.vertexArray.layout.add('aVertexColor', gl.FLOAT, 4);
		this.vertexArray.layout.add('aTexturePosition', gl.FLOAT, 2);
		this.vertexArray.layout.add('aTextureId', gl.FLOAT, 1);
		this.vertexArray.addBuffer(this.vertexBuffer);

		const indices = [
			0, 1, 2,  2, 3, 0,
		];
		this.indexBuffer = new IndexBuffer(indices);

		{ // set a blank texture on slot 0
			const blankTexture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, blankTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
		}

		this.projectionMatrix = Mat4.orthographic(0, HummingbirdCanvas.width, 0, HummingbirdCanvas.height, -100, 100);
		// projectionMatrix = Mat4.perspective(c.width/c.height, 60*(Math.PI/180), 1, 100);
		// projectionMatrix = Mat4.perspective(0, c.width, 0, c.height, 1, 100);
		// projectionMatrix = [0.2, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, -0.02020, -1.02020, 0, 0, 0, 1];
		// projectionMatrix = Mat4.perspective(60*(Math.PI/180), c.width/c.height, -1, -100);
		// console.log(projectionMatrix);
		this.viewMatrix = Mat4.identity();//Mat4.translate(Mat4.identity(), Vec3.new(0, 0, 0));
		this.modelMatrix = Mat4.identity();//Mat4.translate(Mat4.identity(), Vec3.new(0, 0, 0));
	}

	clear() { gl.clear(gl.COLOR_BUFFER_BIT); }

	draw(shader, vertexArray, indexCount) {
		shader.bind();
		vertexArray.bind();

		shader.setUniform('i', 'uTextureId', [1]);
		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
	}

	delete() {
		this.shader.delete();
		this.vertexArray.delete();
		this.vertexBuffer.delete();
		this.indexBuffer.delete();
	}
}