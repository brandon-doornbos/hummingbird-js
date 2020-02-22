class Texture{
	constructor(filePath) {
		this.id = 0;
		this.createTexture(filePath);
	}

	setErrorTexture() {
		this.bind();
		const errorTexture = new Uint8Array([255, 255, 255, 255, 191, 191, 191, 255, 191, 191, 191, 255, 255, 255, 255, 255]);
		this.setTextureParameters(gl.NEAREST, gl.REPEAT);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, errorTexture);
		this.unbind();
	}

	createTexture(filePath) {
		this.id = gl.createTexture();

		this.setErrorTexture();

		const image = new Image();
		image.onload = () => {
			// const canvas = document.createElement('canvas');
			// canvas.width = image.width, canvas.height = image.height;
			// const canvasContext = canvas.getContext('2d');
			// canvasContext.drawImage(image, 0, 0);
			// const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
			// const flippedImageData = new ImageData(imageData.width, imageData.height);
			// for(let i = 0; i < imageData.data.length; i += 4) {
			// 	flippedImageData.data[imageData.data.length-i-4] = imageData.data[i+0];
			// 	flippedImageData.data[imageData.data.length-i-3] = imageData.data[i+1];
			// 	flippedImageData.data[imageData.data.length-i-2] = imageData.data[i+2];
			// 	flippedImageData.data[imageData.data.length-i-1] = imageData.data[i+3];
			// }
			// // canvasContext.putImageData(newData, 0, 0);
			// // document.documentElement.appendChild(canvas);
			// canvas.remove();

			this.bind();
			this.setTextureParameters(gl.LINEAR, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
			// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
			// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, flippedImageData);
			this.unbind();
		}
		image.src = filePath;
	}

	setTextureParameters(filter, wrap) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
	}

	bind(slot = 0) {
		gl.activeTexture(gl['TEXTURE' + slot]);
		gl.bindTexture(gl.TEXTURE_2D, this.id);
	}
	unbind() { gl.bindTexture(gl.TEXTURE_2D, null); }
	delete() {
		this.unbind();
		gl.deleteTexture(this.id);
	}
}