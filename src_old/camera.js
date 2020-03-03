class Camera{
	constructor() {
		gl.viewport(0, 0, HBCanvas.width, HBCanvas.height);

		this.projectionMatrix = Mat4.new(1);
		Mat4.orthographic(this.projectionMatrix, 0, HBCanvas.width, 0, HBCanvas.height, -1, 1);
		// this.projectionMatrix = Mat4.perspective(60*(Math.PI/180), HBCanvas.width/HBCanvas.height, -1, -100);
		// this.projectionMatrix = Mat4.perspective(0, c.width, 0, c.height, 1, 100);
		// this.projectionMatrix = [0.2, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, -0.0202, -1.0202, 0, 0, 0, 1];
		// console.log(this.projectionMatrix);
		this.viewMatrix = Mat4.new(1);//Mat4.translate(Mat4.new(1), Vec3.new(0, 0, 0));
		this.modelMatrix = Mat4.new(1);//Mat4.translate(Mat4.new(1), Vec3.new(0, 0, 0));
	}

	setMVP(mvp = undefined) {
		if(mvp === undefined) {
			const modelView = Mat4.new(1);
			Mat4.multMat4(modelView, this.modelMatrix, this.viewMatrix);
			mvp = Mat4.new(1);
			Mat4.multMat4(mvp, modelView, this.projectionMatrix);
		}
		shader.bind();
		shader.setUniformMatrix('f', 'uMVP', mvp);
	}

	move(vector) { Mat4.translate(this.viewMatrix, this.viewMatrix, vector); }
}