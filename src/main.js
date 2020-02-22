let c = document.getElementById('canvas'), gl = c.getContext('webgl2');
let renderer, shader, texture;
let vertexArray, vertexBuffer, indexBuffer;
let projectionMatrix, viewMatrix, modelMatrix;

window.addEventListener('load', () => {
	if(gl === null) {
		// gl = c.getContext('webgl');
		c.parentNode.removeChild(c);
		const p = document.createElement('p');
		p.innerText = 'WebGL2 is not supported on your browser or machine.';
		document.documentElement.appendChild(p);
	} else {
		renderer = new Renderer();

		shader = new Shader(vertexShaderSource, fragmentShaderSource);
		shader.bind();

		projectionMatrix = Mat4.orthographic(0, c.width, c.height, 0);
		// const projectionMatrix = Mat4.perspective(c.width/c.height, 60*(Math.PI/180));
		viewMatrix = Mat4.translate(Mat4.identity(), -100, 0, 0);
		modelMatrix = Mat4.translate(Mat4.identity(), 200, 200, 0);

		// const mat1 = Mat4.new(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
		// const mat2 = Mat4.new(30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0);
		// const vec1 = Vec4.new(0, 1, 2, 3);
		// const testResult = Vec4.multMat4(vec1, mat1);
		// console.log(testResult);
		// console.log(Mat4.multMat4(projectionMatrix, projectionMatrix));

		vertexArray = new VertexArray();

		const vertices = [
			100, 100, 0, 0, 0, 1, 1, 0, 0, 0,
			200, 100, 0, 0, 0, 1, 1, 1, 0, 0,
			200, 200, 0, 0, 0, 1, 1, 1, 1, 0,
			100, 200, 0, 0, 0, 1, 1, 0, 1, 0,

			300, 200, 0, 0, 0, 1, 1, 0, 0, 0,
			400, 200, 0, 0, 0, 1, 1, 1, 0, 0,
			400, 300, 0, 0, 0, 1, 1, 1, 1, 0,
			300, 300, 0, 0, 0, 1, 1, 0, 1, 0,
		];
		vertexBuffer = new VertexBuffer(vertices);
		vertexArray.layout.add('aVertexPosition', gl.FLOAT, 3);
		vertexArray.layout.add('aVertexColor', gl.FLOAT, 4);
		vertexArray.layout.add('aTexturePosition', gl.FLOAT, 2);
		vertexArray.layout.add('aTextureId', gl.FLOAT, 1);
		vertexArray.addBuffer(vertexArray);

		const indices = [
			0, 1, 2,
			2, 3, 0,

			4, 5, 6,
			6, 7, 4,
		];
		indexBuffer = new IndexBuffer(indices);

		texture = new Texture('assets/oof.png');
		shader.setUniform('i', 'uTexture', [0]);

		vertexArray.unbind();
		shader.unbind();
		vertexBuffer.unbind();
		indexBuffer.unbind();

		requestAnimationFrame(update);
	}
});

function update(now) {
	const deltaTime = renderer.getDeltaTime(now);


	renderer.clear();

	const modelView = Mat4.multMat4(modelMatrix, viewMatrix);
	const MVP = Mat4.multMat4(modelView, projectionMatrix);
	shader.setUniformMatrix('f', 'uMVP', MVP);

	renderer.draw(shader, vertexArray, 12);


	requestAnimationFrame(update);
}

window.addEventListener('beforeunload', () => {
	texture.delete();
	shader.delete();
	vertexArray.delete();
	vertexBuffer.delete();
	indexBuffer.delete();
});