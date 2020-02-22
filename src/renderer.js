class Renderer{
	constructor() {
		this.deltaTime = 0, this.prevTime = 0;

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
	}

	clear() { gl.clear(gl.COLOR_BUFFER_BIT); }

	draw(shader, vertexArray, indexCount) {
		shader.bind();
		vertexArray.bind();

		texture.bind();
		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
	}

	getDeltaTime(now) {
		this.deltaTime = now-this.prevTime;
		this.prevTime = now;
		return this.deltaTime;
	}
}