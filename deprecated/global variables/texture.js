class Texture{
	constructor(filePath) {
		this.id = gl.createTexture();
		this.createTexture(filePath);
		this.textureIndex;
		renderer.textures.push(this);
	}

	setErrorTexture() {
		const errorTexture = new Uint8Array([255, 255, 255, 255, 191, 191, 191, 255, 191, 191, 191, 255, 255, 255, 255, 255]);
		this.setTextureParameters(gl.NEAREST, gl.REPEAT);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, errorTexture);
	}

	createTexture(filePath) {
		this.bind();
		this.setErrorTexture();

		if(filePath === undefined) return;

		const image = new Image();
		image.onload = () => {
			this.bind();
			this.setTextureParameters(gl.LINEAR, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
			// this.unbind();
			this.textureIndex = undefined;
		}
		image.src = filePath;
		this.textureIndex = undefined;
	}

	setTextureParameters(filter, wrap) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
	}

	bind(slot = 1) {
		this.textureIndex = slot;
		gl.activeTexture(gl['TEXTURE' + slot]);
		gl.bindTexture(gl.TEXTURE_2D, this.id);
	}
	unbind() { gl.bindTexture(gl.TEXTURE_2D, null); }
	delete() {
		this.unbind();
		gl.deleteTexture(this.id);
	}
}