import { renderer } from './renderer.js';
import { shader } from './shader.js';

/**
 * Source and initialization for shaders.
 * @memberof HB
 */
const shaders = {
	colored: {
		vertex: () => {
			return `
			attribute vec4 aVertexPosition;
			attribute vec4 aVertexColor;
			attribute vec2 aTexturePosition;
			attribute float aTextureId;
			attribute float aTextRange;

			varying vec4 vScreenPosition;
			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;
			varying float vTextureId;
			varying float vTextRange;

			uniform mat4 uMVP;

			void main() {
				vScreenPosition = uMVP * aVertexPosition;
				gl_Position = vScreenPosition;
				vVertexColor = aVertexColor;
				vTexturePosition = aTexturePosition;
				vTextureId = aTextureId;
				vTextRange = aTextRange;
			}
		`}, fragment: () => {
			return `
			precision mediump float;

			varying vec4 vScreenPosition;
			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;
			varying float vTextureId;
			varying float vTextRange;

			uniform sampler2D uTextureIds[${renderer.textureUnits}];

			void main() {
				vec4 texSample;
				int textureId = int(vTextureId);
				for(int i = 0; i < ${renderer.textureUnits}; i++) {
					if(i == textureId) {
						texSample = texture2D(uTextureIds[i], vTexturePosition); break;
					}
				}

				if(vTextRange <= 0.0) {
					// float dist = distance(vec4(0.0, 0.0, 0.0, 1.0), vScreenPosition);
					// vec4 color = texSample * vVertexColor;
					// pixelColor = vec4(color.rgb, smoothstep(0.75, 0.5, dist)*color.a);
					gl_FragColor = vVertexColor * texSample;
				} else {
					float sigDist = max(min(texSample.r, texSample.g), min(max(texSample.r, texSample.g), texSample.b));
					float screenPxDistance = vTextRange * (sigDist - 0.5);
					float alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);
					gl_FragColor = vec4(vVertexColor.rgb, alpha * vVertexColor.a);
				}
			}
		`}, init: () => {
			const textureSamplers = [];
			for (let i = 0; i < renderer.textureUnits; i++) { textureSamplers[i] = i; }
			shader.setUniformArray('i', 'uTextureIds', textureSamplers);
		}
	}
}

export { shaders };
