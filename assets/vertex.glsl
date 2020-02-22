const vertexShaderSource = `
	attribute vec4 aVertexPosition;
	attribute vec4 aVertexColor;
	attribute vec2 aTexturePosition;
	attribute float aTextureId;

	varying vec4 vVertexColor;
	varying vec2 vTexturePosition;

	uniform mat4 uMVP;

	void main() {
		gl_Position = uMVP * aVertexPosition;
		vVertexColor = aVertexColor;
		vTexturePosition = aTexturePosition;
	}
`;