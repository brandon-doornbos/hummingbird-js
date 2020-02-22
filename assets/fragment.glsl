const fragmentShaderSource = `
	precision mediump float;
	varying vec4 vVertexColor;
	varying vec2 vTexturePosition;

	uniform sampler2D uTexture;

	void main() {
		//gl_FragColor = vVertexColor;
		gl_FragColor = texture2D(uTexture, vTexturePosition);
	}
`;