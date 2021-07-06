import { renderer } from './renderer.js';
import { shader } from './shader.js';

/**
 * Source and initialization for shaders.
 * @memberof HB
 */
const shaders = {
	colored: {
		vertex: () => { return `
			attribute vec4 aVertexPosition;
			attribute vec4 aVertexColor;
			attribute vec2 aTexturePosition;
			attribute float aTextureId;
			attribute float aTextSize;

			varying vec4 vScreenPosition;
			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;
			varying float vTextureId;
			varying float vTextSize;

			uniform mat4 uMVP;

			void main() {
				vScreenPosition = uMVP * aVertexPosition;
				gl_Position = vScreenPosition;
				vVertexColor = aVertexColor;
				vTexturePosition = aTexturePosition;
				vTextureId = aTextureId;
				vTextSize = aTextSize;
			}
		`}, fragment: () => { return `
			#extension GL_OES_standard_derivatives : enable

			precision mediump float;
			varying vec4 vScreenPosition;
			varying vec4 vVertexColor;
			varying vec2 vTexturePosition;
			varying float vTextureId;
			varying float vTextSize;

			uniform sampler2D uTextureIds[${renderer.textureUnits}];

			void main() {
				vec4 texSample;
				int textureId = int(vTextureId);
				for(int i = 0; i < ${renderer.textureUnits}; i++) {
					if(i == textureId) {
						texSample = texture2D(uTextureIds[i], vTexturePosition); break;
					}
				}
				if(vTextSize <= 0.0) {
					// float dist = distance(vec4(0.0, 0.0, 0.0, 1.0), vScreenPosition);
					// vec4 color = texSample * vVertexColor;
					// pixelColor = vec4(color.rgb, smoothstep(0.75, 0.5, dist)*color.a);
					gl_FragColor = vVertexColor * texSample;
				} else {
					float sigDist = max(min(texSample.r, texSample.g), min(max(texSample.r, texSample.g), texSample.b)) - 0.5;
					float alpha = clamp(sigDist/fwidth(sigDist) + 0.4, 0.0, 1.0);
					gl_FragColor = vec4(vVertexColor.rgb, alpha * vVertexColor.a);
				}
			}
		`}, init: () => {
			const textureSamplers = [];
			for(let i = 0; i < renderer.textureUnits; i++) { textureSamplers[i] = i; }
			shader.setUniformArray('i', 'uTextureIds', textureSamplers);
		}
	}
}

export { shaders };