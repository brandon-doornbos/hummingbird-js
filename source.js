window.HB = (function() {
	"use strict";
	return {
		//#region variables
		version: "v0.3.20",
		noUpdate: false,
		frames: 0,
		prevTime: 0,
		mousePos: [0, 0],
		mouseIsPressed: false,
		keysPressed: {},

		canvas: undefined,
		// mode: 'webgl2',
		gl: undefined,
		renderer: undefined,
		vertexArray: undefined,
		maxVertexCount: 2000,
		vertexStride: undefined,
		vertices: undefined,
		vertexBuffer: undefined,
		maxIndexCount: 3000,
		indices: undefined,
		indexBuffer: undefined,
		textures: {},
		batch:undefined,
		camera: undefined,
		shader: undefined,

		fontData: undefined,
		font: undefined,
		//#endregion

		//#region common
		setup: function() {
			console.log("Hummingbird "+HB.version+" by SantaClausNL. https://www.santaclausnl.ga/");
			const loading = document.createElement('p');
			loading.innerText = "LOADING...";
			loading.style = "margin: 0; position: absolute; top: 50%; left: 50%; font-size: 7em; transform: translate(-50%, -50%); font-family: Arial, Helvetica, sans-serif;";
			document.body.appendChild(loading);

			new HB.Math();
			if(typeof setup === 'function') setup();

			HB.loadFile("https://projects.santaclausnl.ga/Hummingbird/assets/arial.json", 'json', (data) => {
				HB.fontData = data;
				loading.remove();
				if(typeof update === 'function' && HB.noUpdate !== true) requestAnimationFrame(HB.update);
			});
			const webp = new Image();
			webp.onload = webp.onerror = () => HB.font = new HB.Texture('Hummingbird_Font-Atlas', "https://projects.santaclausnl.ga/Hummingbird/assets/arial."+(webp.height === 2 ? 'webp' : 'png'), null);
			webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
		},

		init: function(width, height, options) {
			if(options === undefined) options = {};
			if(options["noUpdate"] === true) HB.noUpdate = true;
			if(options["canvas"] === undefined) {
				HB.canvas = document.createElement("CANVAS"), HB.gl = HB.canvas.getContext('webgl2');
				if(options["parent"] === undefined) document.body.appendChild(HB.canvas); else options["parent"].appendChild(HB.canvas);
			} else HB.canvas = options["canvas"], gl = HB.canvas.getContext('webgl2');

			// if(HB.gl === null) {
			// 	HB.canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
			// 	HB.mode = 'webgl';
			// }

			// if(HB.gl === null) {
			// 	HB.canvas.getContext('webgl');
			// 	HB.mode = 'webgl';
			// }

			if(HB.gl === null) {
				HB.canvas.parentNode.removeChild(HB.canvas);
				const p = document.createElement('p');
				p.innerText = 'WebGL2 is not supported on your browser or machine.';
				if(options["parent"] === undefined) document.body.appendChild(p); else options["parent"].appendChild(p);
			} else {
				HB.canvas.width = width || 100, HB.canvas.height = height || 100;
				HB.canvas.size = HB.Vec2.new(HB.canvas.width, HB.canvas.height);
				HB.canvas.id = (options["id"] === undefined) ? "HummingbirdCanvas" : options["id"];

				HB.renderer = new HB.Renderer();
			}

			window.addEventListener('keydown', (event) => {
				HB.keysPressed[event.keyCode] = true;
				if(typeof keyPressed === 'function') keyPressed(event);
			});
			window.addEventListener('keyup', (event) => {
				HB.keysPressed[event.keyCode] = false;
				if(typeof keyReleased === 'function') keyReleased(event);
			});
			window.addEventListener('mousemove', (event) => {
				HB.mousePos = HB.getMousePos(event);
				if(typeof mouseMoved === 'function') mouseMoved(event);
			});
			window.addEventListener('mousedown', (event) => {
				HB.mouseIsPressed = true;
				if(typeof mousePressed === 'function') mousePressed(event);
			});
			window.addEventListener('mouseup', (event) => {
				HB.mouseIsPressed = false;
				if(typeof mouseReleased === 'function') mouseReleased(event);
			});
			if(typeof windowResized === 'function') {
				window.addEventListener('resize', (event) => {
					windowResized(event);
				});
			}
			window.addEventListener('beforeunload', () => {
				HB.renderer.delete();
				delete HB.gl;
				HB.canvas.remove();
			});
		},

		resizeCanvas: function(width, height) {
			HB.canvas.width = width || 100, HB.canvas.height = height || 100;
			HB.Vec2.set(HB.canvas.size, HB.canvas.width, HB.canvas.height);
			HB.gl.viewport(0, 0, HB.canvas.width, HB.canvas.height);
			HB.Mat4.orthographic(HB.camera.projectionMatrix, 0, HB.canvas.width, 0, HB.canvas.height);
		},

		update: function(now) {
			const deltaTime = now-HB.prevTime;
			HB.prevTime = now;
			HB.camera.setMVP();
			HB.batch.begin();
			update(deltaTime);
			HB.batch.end();
			HB.frames++;
			requestAnimationFrame(HB.update);
		},
		//#endregion

		//#region renderer
		Renderer: class{
			constructor() {
				HB.gl.blendFunc(HB.gl.SRC_ALPHA, HB.gl.ONE_MINUS_SRC_ALPHA);
				HB.gl.enable(HB.gl.BLEND);
				HB.gl.cullFace(HB.gl.FRONT);
				HB.gl.enable(HB.gl.CULL_FACE);

				HB.shader = new HB.Shader();
				HB.shader.bind();

				// const textureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
				const textureSamplers = [];
				for(let i = 0; i < 16; i++) { textureSamplers[i] = i; }
				HB.shader.setUniformArray('i', 'uTextureIds', textureSamplers);

				{ // set a blank texture on texture slot 0
					const blankTexture = HB.gl.createTexture();
					HB.gl.activeTexture(HB.gl.TEXTURE0);
					HB.gl.bindTexture(HB.gl.TEXTURE_2D, blankTexture);
					HB.gl.texParameteri(HB.gl.TEXTURE_2D, HB.gl.TEXTURE_MIN_FILTER, HB.gl.NEAREST);
					HB.gl.texParameteri(HB.gl.TEXTURE_2D, HB.gl.TEXTURE_MAG_FILTER, HB.gl.NEAREST);
					HB.gl.texParameteri(HB.gl.TEXTURE_2D, HB.gl.TEXTURE_WRAP_S, HB.gl.REPEAT);
					HB.gl.texParameteri(HB.gl.TEXTURE_2D, HB.gl.TEXTURE_WRAP_T, HB.gl.REPEAT);
					HB.gl.texImage2D(HB.gl.TEXTURE_2D, 0, HB.gl.RGBA8, 1, 1, 0, HB.gl.RGBA, HB.gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
				}

				HB.batch = new HB.Batch();

				HB.vertexArray = new HB.VertexArray();
				HB.vertexArray.layout.add('aVertexPosition', HB.gl.FLOAT, 3);
				HB.vertexArray.layout.add('aVertexColor', HB.gl.FLOAT, 4);
				HB.vertexArray.layout.add('aTexturePosition', HB.gl.FLOAT, 2);
				HB.vertexArray.layout.add('aTextureId', HB.gl.FLOAT, 1);
				HB.vertexArray.layout.add('aTextSize', HB.gl.FLOAT, 1);

				HB.vertices = new Float32Array(HB.maxVertexCount*HB.vertexStride);
				HB.vertexBuffer = new HB.VertexBuffer(HB.vertices);
				HB.vertexArray.addBuffer(HB.vertexBuffer);

				HB.indices = new Uint32Array(HB.maxIndexCount);
				HB.indexBuffer = new HB.IndexBuffer(HB.indices);

				HB.camera = new HB.Camera();
			}

			clear(color) {
				HB.gl.clearColor(color[0], color[1], color[2], color[3]);
				HB.gl.clear(HB.gl.COLOR_BUFFER_BIT);
			}

			draw(indexCount) {
				HB.shader.bind();
				HB.vertexArray.bind();

				HB.gl.drawElements(HB.gl.TRIANGLES, indexCount, HB.gl.UNSIGNED_INT, 0);
			}

			delete() {
				Object.values(HB.textures).forEach((texture) => { texture.delete(); });
				HB.shader.delete();
				HB.vertexArray.delete();
				HB.vertexBuffer.delete();
				HB.indexBuffer.delete();
			}
		},
		//#endregion

		//#region camera
		Camera: class{
			constructor() {
				HB.gl.viewport(0, 0, HB.canvas.width, HB.canvas.height);

				this.projectionMatrix = HB.Mat4.new(1);
				HB.Mat4.orthographic(this.projectionMatrix, 0, HB.canvas.width, 0, HB.canvas.height, -1, 1);
				// HB.Mat4.perspective(this.projectionMatrix, HB.Math.radians(60));
				this.viewMatrix = HB.Mat4.new(1);
				// HB.Mat4.translate(this.viewMatrix, this.viewMatrix, HB.Vec3.new(0, 0, -400));
				this.modelMatrix = HB.Mat4.new(1);
				// Mat4.translate(Mat4.new(1), Vec3.new(0, 0, 0));
			}

			setMVP(mvp = undefined) {
				if(mvp === undefined) {
					const modelView = HB.Mat4.new(1);
					HB.Mat4.multMat4(modelView, this.modelMatrix, this.viewMatrix);
					mvp = HB.Mat4.new(1);
					HB.Mat4.multMat4(mvp, modelView, this.projectionMatrix);
				}
				HB.shader.bind();
				HB.shader.setUniformMatrix('f', 'uMVP', mvp);
				// HB.shader.setUniformMatrix('f', 'uMVP', this.projectionMatrix);
			}

			translate(vector3) { HB.Mat4.translate(this.viewMatrix, this.viewMatrix, vector3); }
		},
		//#endregion

		//#region batch
		Batch: class{
			constructor() {
				this.vertexCount = 0;
				this.indexCount = 0;
				this.textureIndex = 1;
				this.textureCache = {};
			}

			begin() { this.reset(); }
			end() { this.flush(); }

			reset() {
				this.vertexCount = 0;
				this.indexCount = 0;
				this.textureIndex = 1;
				this.textureCache = {};
			}

			drawColoredRect(pos, size, color) {
				if((this.vertexCount + 4) >= HB.maxVertexCount || (this.indexCount + 6) >= HB.maxIndexCount) this.flush();

				const start = this.vertexCount*HB.vertexStride;
				HB.vertices[start   ] = pos[0];
				HB.vertices[start+1 ] = pos[1];
				HB.vertices[start+2 ] = 0;
				HB.vertices[start+3 ] = color[0];
				HB.vertices[start+4 ] = color[1];
				HB.vertices[start+5 ] = color[2];
				HB.vertices[start+6 ] = color[3];
				HB.vertices[start+7 ] = 0;
				HB.vertices[start+8 ] = 0;
				HB.vertices[start+9 ] = 0;
				HB.vertices[start+10] = 0;
				HB.vertices[start+11] = pos[0]+size[0];
				HB.vertices[start+12] = pos[1];
				HB.vertices[start+13] = 0;
				HB.vertices[start+14] = color[0];
				HB.vertices[start+15] = color[1];
				HB.vertices[start+16] = color[2];
				HB.vertices[start+17] = color[3];
				HB.vertices[start+18] = 1;
				HB.vertices[start+19] = 0;
				HB.vertices[start+20] = 0;
				HB.vertices[start+21] = 0;
				HB.vertices[start+22] = pos[0]+size[0];
				HB.vertices[start+23] = pos[1]+size[1];
				HB.vertices[start+24] = 0;
				HB.vertices[start+25] = color[0];
				HB.vertices[start+26] = color[1];
				HB.vertices[start+27] = color[2];
				HB.vertices[start+28] = color[3];
				HB.vertices[start+29] = 1;
				HB.vertices[start+30] = 1;
				HB.vertices[start+31] = 0;
				HB.vertices[start+32] = 0;
				HB.vertices[start+33] = pos[0];
				HB.vertices[start+34] = pos[1]+size[1];
				HB.vertices[start+35] = 0;
				HB.vertices[start+36] = color[0];
				HB.vertices[start+37] = color[1];
				HB.vertices[start+38] = color[2];
				HB.vertices[start+39] = color[3];
				HB.vertices[start+40] = 0;
				HB.vertices[start+41] = 1;
				HB.vertices[start+42] = 0;
				HB.vertices[start+43] = 0;

				HB.indices[this.indexCount  ] = this.vertexCount;
				HB.indices[this.indexCount+1] = this.vertexCount+1;
				HB.indices[this.indexCount+2] = this.vertexCount+2;
				HB.indices[this.indexCount+3] = this.vertexCount+2;
				HB.indices[this.indexCount+4] = this.vertexCount+3;
				HB.indices[this.indexCount+5] = this.vertexCount;

				this.vertexCount += 4, this.indexCount += 6;
			}

			drawTexturedRect(pos, size, texture) {
				if((this.vertexCount + 4) >= HB.maxVertexCount || (this.indexCount + 6) >= HB.maxIndexCount) this.flush();

				let textureIndex = this.textureCache[texture.name];
				if(textureIndex === undefined) {
					if((this.textureIndex + 1) >= 16) this.flush();
					this.textureCache[texture.name] = textureIndex = this.textureIndex;
					texture.bind(this.textureIndex++);
				}

				const start = this.vertexCount*HB.vertexStride;
				HB.vertices[start   ] = pos[0];
				HB.vertices[start+1 ] = pos[1];
				HB.vertices[start+2 ] = 0;
				HB.vertices[start+3 ] = 1;
				HB.vertices[start+4 ] = 1;
				HB.vertices[start+5 ] = 1;
				HB.vertices[start+6 ] = 1;
				HB.vertices[start+7 ] = 0;
				HB.vertices[start+8 ] = 0;
				HB.vertices[start+9 ] = textureIndex;
				HB.vertices[start+10] = 0;
				HB.vertices[start+11] = pos[0]+size[0];
				HB.vertices[start+12] = pos[1];
				HB.vertices[start+13] = 0;
				HB.vertices[start+14] = 1;
				HB.vertices[start+15] = 1;
				HB.vertices[start+16] = 1;
				HB.vertices[start+17] = 1;
				HB.vertices[start+18] = 1;
				HB.vertices[start+19] = 0;
				HB.vertices[start+20] = textureIndex;
				HB.vertices[start+21] = 0;
				HB.vertices[start+22] = pos[0]+size[0];
				HB.vertices[start+23] = pos[1]+size[1];
				HB.vertices[start+24] = 0;
				HB.vertices[start+25] = 1;
				HB.vertices[start+26] = 1;
				HB.vertices[start+27] = 1;
				HB.vertices[start+28] = 1;
				HB.vertices[start+29] = 1;
				HB.vertices[start+30] = 1;
				HB.vertices[start+31] = textureIndex;
				HB.vertices[start+32] = 0;
				HB.vertices[start+33] = pos[0];
				HB.vertices[start+34] = pos[1]+size[1];
				HB.vertices[start+35] = 0;
				HB.vertices[start+36] = 1;
				HB.vertices[start+37] = 1;
				HB.vertices[start+38] = 1;
				HB.vertices[start+39] = 1;
				HB.vertices[start+40] = 0;
				HB.vertices[start+41] = 1;
				HB.vertices[start+42] = textureIndex;
				HB.vertices[start+43] = 0;

				HB.indices[this.indexCount  ] = this.vertexCount;
				HB.indices[this.indexCount+1] = this.vertexCount+1;
				HB.indices[this.indexCount+2] = this.vertexCount+2;
				HB.indices[this.indexCount+3] = this.vertexCount+2;
				HB.indices[this.indexCount+4] = this.vertexCount+3;
				HB.indices[this.indexCount+5] = this.vertexCount;

				this.vertexCount += 4, this.indexCount += 6;
			}

			drawColoredLine(vectorA, vectorB, thickness, color) {
				if((this.vertexCount + 4) >= HB.maxVertexCount || (this.indexCount + 6) >= HB.maxIndexCount) this.flush();

				const angle0 = HB.Vec2.angleBetweenVec2(vectorA, vectorB);
				const angleA = HB.Vec2.fromAngle(angle0-Math.PI/2, thickness/2);
				const angleB = HB.Vec2.fromAngle(angle0+Math.PI/2, thickness/2);

				const start = this.vertexCount*HB.vertexStride;
				HB.vertices[start   ] = vectorA[0]-angleA[0];
				HB.vertices[start+1 ] = vectorA[1]-angleA[1];
				HB.vertices[start+2 ] = 0;
				HB.vertices[start+3 ] = color[0];
				HB.vertices[start+4 ] = color[1];
				HB.vertices[start+5 ] = color[2];
				HB.vertices[start+6 ] = color[3];
				HB.vertices[start+7 ] = 0;
				HB.vertices[start+8 ] = 0;
				HB.vertices[start+9 ] = 0;
				HB.vertices[start+10] = 0;
				HB.vertices[start+11] = vectorA[0]+angleA[0];
				HB.vertices[start+12] = vectorA[1]+angleA[1];
				HB.vertices[start+13] = 0;
				HB.vertices[start+14] = color[0];
				HB.vertices[start+15] = color[1];
				HB.vertices[start+16] = color[2];
				HB.vertices[start+17] = color[3];
				HB.vertices[start+18] = 1;
				HB.vertices[start+19] = 0;
				HB.vertices[start+20] = 0;
				HB.vertices[start+21] = 0;
				HB.vertices[start+22] = vectorB[0]-angleB[0];
				HB.vertices[start+23] = vectorB[1]-angleB[1];
				HB.vertices[start+24] = 0;
				HB.vertices[start+25] = color[0];
				HB.vertices[start+26] = color[1];
				HB.vertices[start+27] = color[2];
				HB.vertices[start+28] = color[3];
				HB.vertices[start+29] = 1;
				HB.vertices[start+30] = 1;
				HB.vertices[start+31] = 0;
				HB.vertices[start+32] = 0;
				HB.vertices[start+33] = vectorB[0]+angleB[0];
				HB.vertices[start+34] = vectorB[1]+angleB[1];
				HB.vertices[start+35] = 0;
				HB.vertices[start+36] = color[0];
				HB.vertices[start+37] = color[1];
				HB.vertices[start+38] = color[2];
				HB.vertices[start+39] = color[3];
				HB.vertices[start+40] = 0;
				HB.vertices[start+41] = 1;
				HB.vertices[start+42] = 0;
				HB.vertices[start+43] = 0;

				HB.indices[this.indexCount  ] = this.vertexCount;
				HB.indices[this.indexCount+1] = this.vertexCount+1;
				HB.indices[this.indexCount+2] = this.vertexCount+2;
				HB.indices[this.indexCount+3] = this.vertexCount+2;
				HB.indices[this.indexCount+4] = this.vertexCount+3;
				HB.indices[this.indexCount+5] = this.vertexCount;

				this.vertexCount += 4, this.indexCount += 6;
			}

			drawColoredText(string, pos, size = 12, align = 'start-start', color) {
				let textureIndex = this.textureCache[HB.font.name];
				if(textureIndex === undefined) {
					if((this.textureIndex + 1) >= 16) this.flush();
					this.textureCache[HB.font.name] = textureIndex = this.textureIndex;
					HB.font.bind(this.textureIndex++);
				}

				const glyphs = [], kernings = {};
				size = size/HB.fontData.info.size;
				let width = 0;
				const height = HB.fontData.info.size*size;

				let prevGlyphId;
				for(const char of string) {
					for(const glyph of Object.values(HB.fontData.chars)) {
						if(glyph.char === char) {
							if(prevGlyphId !== undefined) {
								for(const kerning of Object.values(HB.fontData.kernings)) {
									if(kerning[0] === prevGlyphId && kerning[1] === glyph.id) {
										width += kerning.amt*size;
										kernings[glyph.id] = kerning;
										break;
									}
								}
							}
							prevGlyphId = glyph.id;
							glyphs.push(glyph);
							width += glyph.xadv*size;
							break;
						}
					}
				}

				let offsetx = 0, offsety = 0;
				align = align.split('-');
				switch(align[0]) {
					case 'start': break;
					case 'center': offsetx = -width/2; break;
					case 'end': offsetx = -width; break;
				}
				switch(align[1]) {
					case 'start': break;
					case 'center': offsety = -height/2; break;
					case 'end': offsety = -height; break;
				}

				glyphs.forEach((glyph) => {
					if((this.vertexCount + 4) >= HB.maxVertexCount || (this.indexCount + 6) >= HB.maxIndexCount) this.flush();

					if(kernings[glyph.id] !== undefined) pos[0] += kernings[glyph.id].amt*size;

					const start = this.vertexCount*HB.vertexStride;
					HB.vertices[start   ] = pos[0]+glyph.xoff*size+offsetx;
					HB.vertices[start+1 ] = pos[1]+glyph.yoff*size+offsety;
					HB.vertices[start+2 ] = 0;
					HB.vertices[start+3 ] = color[0];
					HB.vertices[start+4 ] = color[1];
					HB.vertices[start+5 ] = color[2];
					HB.vertices[start+6 ] = color[3];
					HB.vertices[start+7 ] = glyph.x/HB.fontData.common.scaleW;
					HB.vertices[start+8 ] = glyph.y/HB.fontData.common.scaleH;
					HB.vertices[start+9 ] = textureIndex;
					HB.vertices[start+10] = size;
					HB.vertices[start+11] = pos[0]+(glyph.w+glyph.xoff)*size+offsetx;
					HB.vertices[start+12] = pos[1]+glyph.yoff*size+offsety;
					HB.vertices[start+13] = 0;
					HB.vertices[start+14] = color[0];
					HB.vertices[start+15] = color[1];
					HB.vertices[start+16] = color[2];
					HB.vertices[start+17] = color[3];
					HB.vertices[start+18] = (glyph.x+glyph.w)/HB.fontData.common.scaleW;
					HB.vertices[start+19] = glyph.y/HB.fontData.common.scaleH;
					HB.vertices[start+20] = textureIndex;
					HB.vertices[start+21] = size;
					HB.vertices[start+22] = pos[0]+(glyph.w+glyph.xoff)*size+offsetx;
					HB.vertices[start+23] = pos[1]+(glyph.h+glyph.yoff)*size+offsety;
					HB.vertices[start+24] = 0;
					HB.vertices[start+25] = color[0];
					HB.vertices[start+26] = color[1];
					HB.vertices[start+27] = color[2];
					HB.vertices[start+28] = color[3];
					HB.vertices[start+29] = (glyph.x+glyph.w)/HB.fontData.common.scaleW;
					HB.vertices[start+30] = (glyph.y+glyph.h)/HB.fontData.common.scaleH;
					HB.vertices[start+31] = textureIndex;
					HB.vertices[start+32] = size;
					HB.vertices[start+33] = pos[0]+glyph.xoff*size+offsetx;
					HB.vertices[start+34] = pos[1]+(glyph.h+glyph.yoff)*size+offsety;
					HB.vertices[start+35] = 0;
					HB.vertices[start+36] = color[0];
					HB.vertices[start+37] = color[1];
					HB.vertices[start+38] = color[2];
					HB.vertices[start+39] = color[3];
					HB.vertices[start+40] = glyph.x/HB.fontData.common.scaleW;
					HB.vertices[start+41] = (glyph.y+glyph.h)/HB.fontData.common.scaleH;
					HB.vertices[start+42] = textureIndex;
					HB.vertices[start+43] = size;

					HB.indices[this.indexCount  ] = this.vertexCount;
					HB.indices[this.indexCount+1] = this.vertexCount+1;
					HB.indices[this.indexCount+2] = this.vertexCount+2;
					HB.indices[this.indexCount+3] = this.vertexCount+2;
					HB.indices[this.indexCount+4] = this.vertexCount+3;
					HB.indices[this.indexCount+5] = this.vertexCount;

					this.vertexCount += 4, this.indexCount += 6;

					pos[0] += glyph.xadv*size;
				});
			}

			flush() {
				HB.vertexBuffer.partialWrite(HB.vertices, this.vertexCount*HB.vertexStride);
				HB.indexBuffer.partialWrite(HB.indices, this.indexCount);
				HB.renderer.draw(this.indexCount);
				this.reset();
			}
		},
		//#endregion

		//#region shader
		Shader: class{
			constructor(vertexShaderSource, fragmentShaderSource) {
				this.vertexShaderSource = vertexShaderSource || `#version 300 es
					in vec4 aVertexPosition;
					in vec4 aVertexColor;
					in vec2 aTexturePosition;
					in float aTextureId;
					in float aTextSize;

					out vec4 vVertexColor;
					out vec2 vTexturePosition;
					out float vTextureId;
					out float vTextSize;

					uniform mat4 uMVP;

					void main() {
						gl_Position = uMVP * aVertexPosition;
						vVertexColor = aVertexColor;
						vTexturePosition = aTexturePosition;
						vTextureId = aTextureId;
						vTextSize = aTextSize;
					}
				`, this.fragmentShaderSource = fragmentShaderSource || `#version 300 es
					precision mediump float;
					in vec4 vVertexColor;
					in vec2 vTexturePosition;
					in float vTextureId;
					in float vTextSize;

					uniform sampler2D uTextureIds[16];

					out vec4 pixelColor;

					void main() {
						vec4 texSample;
						switch(int(vTextureId)) {
							case 0: texSample = texture(uTextureIds[0], vTexturePosition); break;
							case 1: texSample = texture(uTextureIds[1], vTexturePosition); break;
							case 2: texSample = texture(uTextureIds[2], vTexturePosition); break;
							case 3: texSample = texture(uTextureIds[3], vTexturePosition); break;
							case 4: texSample = texture(uTextureIds[4], vTexturePosition); break;
							case 5: texSample = texture(uTextureIds[5], vTexturePosition); break;
							case 6: texSample = texture(uTextureIds[6], vTexturePosition); break;
							case 7: texSample = texture(uTextureIds[7], vTexturePosition); break;
							case 8: texSample = texture(uTextureIds[8], vTexturePosition); break;
							case 9: texSample = texture(uTextureIds[9], vTexturePosition); break;
							case 10: texSample = texture(uTextureIds[10], vTexturePosition); break;
							case 11: texSample = texture(uTextureIds[11], vTexturePosition); break;
							case 12: texSample = texture(uTextureIds[12], vTexturePosition); break;
							case 13: texSample = texture(uTextureIds[13], vTexturePosition); break;
							case 14: texSample = texture(uTextureIds[14], vTexturePosition); break;
							case 15: texSample = texture(uTextureIds[15], vTexturePosition); break;
						}
						if(vTextSize <= 0.0) {
							pixelColor = texSample * vVertexColor;
						} else {
							float sigDist = max(min(texSample.r, texSample.g), min(max(texSample.r, texSample.g), texSample.b)) - 0.5;
							float alpha = clamp(sigDist/fwidth(sigDist) + 0.4, 0.0, 1.0);
							pixelColor = vec4(vVertexColor.rgb, alpha * vVertexColor.a);
						}
					}
				`;

				this.id = this.createProgram(this.vertexShaderSource, this.fragmentShaderSource);
				this.attribLocationCache = {};
				this.uniformLocationCache = {};
			}

			createProgram(vertexShaderSource, fragmentShaderSource) {
				const program = HB.gl.createProgram();
				const vertexShader = this.compileShader(HB.gl.VERTEX_SHADER, vertexShaderSource);
				const fragmentShader = this.compileShader(HB.gl.FRAGMENT_SHADER, fragmentShaderSource);
			
				HB.gl.attachShader(program, vertexShader);
				HB.gl.attachShader(program, fragmentShader);
				HB.gl.linkProgram(program);
				HB.gl.validateProgram(program);
			
				HB.gl.deleteShader(vertexShader);
				HB.gl.deleteShader(fragmentShader);

				return program;
			}

			compileShader(type, source) {
				const shader = HB.gl.createShader(type);
				HB.gl.shaderSource(shader, source);
				HB.gl.compileShader(shader);

				if(HB.gl.getShaderParameter(shader, HB.gl.COMPILE_STATUS) === false) {
					console.error(HB.gl.getShaderInfoLog(shader));
					HB.gl.deleteShader(shader);
					return null;
				}

				return shader;
			}

			getAttribLocation(name) {
				if(this.attribLocationCache[name] === undefined) this.attribLocationCache[name] = HB.gl.getAttribLocation(this.id, name);
				return this.attribLocationCache[name];
			}
			getUniformLocation(name) {
				if(this.uniformLocationCache[name] === undefined) this.uniformLocationCache[name] = HB.gl.getUniformLocation(this.id, name);
				return this.uniformLocationCache[name];
			}
			setUniform(type, name, values) { HB.gl['uniform'+values.length+type](this.getUniformLocation(name), values[0], values[1], values[2], values[3]); }
			setUniformArray(type, name, array, elementAmount = 1) { HB.gl['uniform'+elementAmount+type+'v'](this.getUniformLocation(name), array); }
			setUniformMatrix(type, name, matrix) { HB.gl['uniformMatrix'+Math.sqrt(matrix.length)+type+'v'](this.getUniformLocation(name), true, matrix); }

			bind() { HB.gl.useProgram(this.id); }
			unbind() { HB.gl.useProgram(null); }
			delete() {
				this.unbind();
				HB.gl.deleteProgram(this.id);
			}
		},
		//#endregion

		//#region buffer
		VertexBuffer: class{
			constructor(data) {
				this.type = HB.gl.ARRAY_BUFFER;
				this.id = HB.gl.createBuffer();
				this.bind();
				HB.gl.bufferData(this.type, data, HB.gl.DYNAMIC_DRAW);
			}

			write(data) { HB.gl.bufferSubData(this.type, 0, data); }
			partialWrite(data, length) { HB.gl.bufferSubData(this.type, 0, data, 0, length); }

			bind() { HB.gl.bindBuffer(this.type, this.id); }
			unbind() { HB.gl.bindBuffer(this.type, null); }
			delete() {
				this.unbind();
				HB.gl.deleteBuffer(this.id);
			}
		},

		IndexBuffer: class{
			constructor(data) {
				this.type = HB.gl.ELEMENT_ARRAY_BUFFER;
				this.id = HB.gl.createBuffer();
				this.bind();
				HB.gl.bufferData(this.type, data, HB.gl.DYNAMIC_DRAW);
			}

			write(data) { HB.gl.bufferSubData(this.type, 0, data); }
			partialWrite(data, length) { HB.gl.bufferSubData(this.type, 0, data, 0, length); }

			bind() { HB.gl.bindBuffer(this.type, this.id); }
			unbind() { HB.gl.bindBuffer(this.type, null); }
			delete() {
				this.unbind();
				HB.gl.deleteBuffer(this.id);
			}
		},

		VertexArray: class{
			constructor() {
				this.id = HB.gl.createVertexArray();
				HB.gl.bindVertexArray(this.id);

				class Layout{
					constructor() {
						this.elements = [];
						this.stride = 0;
						HB.vertexStride = 0;
					}

					add(name, type, count, normalized = false) {
						HB.vertexStride += count;
						const index = HB.shader.getAttribLocation(name);
						if(index !== -1) this.elements.push({ index: index, type: type, count: count, normalized: normalized });
						this.stride += count*HB.bytes(type);
						return index;
					}

					clear() {
						this.elements = [];
						this.stride = 0;
					}
				}
				this.layout = new Layout();
			}

			addBuffer(vertexBuffer) {
				this.bind();
				vertexBuffer.bind();

				let offset = 0;
				this.layout.elements.forEach((element) => {
					HB.gl.enableVertexAttribArray(element.index);
					HB.gl.vertexAttribPointer(element.index, element.count, element.type, element.normalized, this.layout.stride, offset);
					offset += element.count*HB.bytes(element.type);
				});
			}

			bind() { HB.gl.bindVertexArray(this.id); };
			unbind() { HB.gl.bindVertexArray(null); };
			delete() {
				this.unbind();
				HB.vertexArray.layout.elements.forEach((element) => HB.gl.disableVertexAttribArray(element.index));
				HB.gl.deleteVertexArray(this.id);
			}
		},
		//#endregion

		//#region texture
		Texture: class{
			constructor(name, path, out = HB.textures, callback = function() { console.log("Texture loaded: "+this.name); }) {
				this.id = HB.gl.createTexture();
				this.createTexture(path);
				this.name = name;

				if(out === undefined) {
					HB.textures[this.name] = this;
				} else if(Array.isArray(out)) {
					out.push(this);
				} else if(out instanceof Object) {
					out[this.name] = this;
				}

				this.onLoadCallback = callback;
			}

			setErrorTexture() {
				const errorTexture = new Uint8Array([255, 255, 255, 255, 191, 191, 191, 255, 191, 191, 191, 255, 255, 255, 255, 255]);
				this.setTextureParameters(HB.gl.NEAREST, HB.gl.REPEAT);
				HB.gl.texImage2D(HB.gl.TEXTURE_2D, 0, HB.gl.RGBA8, 2, 2, 0, HB.gl.RGBA, HB.gl.UNSIGNED_BYTE, errorTexture);
			}

			createTexture(path) {
				this.bind();
				this.setErrorTexture();

				if(path === undefined) return;

				const image = new Image();
				image.onload = () => {
					this.bind();
					this.setTextureParameters(HB.gl.LINEAR, HB.gl.CLAMP_TO_EDGE);
					HB.gl.texImage2D(HB.gl.TEXTURE_2D, 0, HB.gl.RGBA8, HB.gl.RGBA, HB.gl.UNSIGNED_BYTE, image);
					this.onLoadCallback();
					// this.unbind();
				}
				image.src = path;
			}

			setTextureParameters(filter, wrap) {
				HB.gl.texParameteri(HB.gl.TEXTURE_2D, HB.gl.TEXTURE_MIN_FILTER, filter);
				HB.gl.texParameteri(HB.gl.TEXTURE_2D, HB.gl.TEXTURE_MAG_FILTER, filter);
				HB.gl.texParameteri(HB.gl.TEXTURE_2D, HB.gl.TEXTURE_WRAP_S, wrap);
				HB.gl.texParameteri(HB.gl.TEXTURE_2D, HB.gl.TEXTURE_WRAP_T, wrap);
			}

			bind(slot = 1) {
				HB.gl.activeTexture(HB.gl['TEXTURE' + slot]);
				HB.gl.bindTexture(HB.gl.TEXTURE_2D, this.id);
			}
			unbind() { HB.gl.bindTexture(HB.gl.TEXTURE_2D, null); }
			delete() {
				this.unbind();
				HB.gl.deleteTexture(this.id);
			}
		},
		//#endregion

		//#region utility
		// gives byte amount of different WebGL types
		bytes: function(type) {
			switch(type) {
				case HB.gl.FLOAT: case HB.gl.UNSIGNED_INT: return 4;
				case HB.gl.BYTE: return 1;
			}
		},
		// get the mouse position in the form of a Vec2
		getMousePos: function(e) {
			const rect = HB.canvas.getBoundingClientRect(), root = document.body;
			return [e.clientX-rect.left-root.scrollLeft, e.clientY-rect.top-root.scrollTop];
		},
		// load a file, give type(from link below) and supply callback that takes 1 i.e. data argument loadFile('path_to.file', (data) => console.log(data));
		// https://developer.mozilla.org/en-US/docs/Web/API/Body#Methods
		loadFile: function(path, type, callback) {
			let returnValue = {data: "", path};

			const options = {method: 'GET'};
			fetch(path, options).then((res) => {
				return res[type]();
			}).then((data) => {
				callback(data);
			}).catch();

			return returnValue;
		},
		//#endregion

		//#region math
		Math: class{
			constructor() {
				new HB.Vec2();
				new HB.Vec3();
				new HB.Vec4();
			}

			static radians(degrees) { // convert degrees to radians
				return degrees*(Math.PI/180);
			}
			static degrees(radians) { // convert radians to degrees
				return radians*(180/Math.PI);
			}
			static map(value, valLow, valHigh, resLow, resHigh) { // map a number to another range
				return resLow + (resHigh - resLow) * (value - valLow) / (valHigh - valLow);
			}
			static random(low, high) { // a random float between 2 numbers
				if(high !== undefined) {
					return Math.random() * (high-low) + low;
				} else if(low !== undefined) {
					return Math.random() * low;
				} else {
					return Math.random();
				}
			}
			static randomInt(low, high) { // a random integer between 2 numbers
				return Math.floor(HB.Math.random(low, high));
			}
			static lerp(start, end, amt) { // linear interpolation
				return start+amt*(end-start);
			}
			static constrain(val, minVal, maxVal) { // constrain a value
				if(val > maxVal) {
					return maxVal;
				} else if(val < minVal) {
					return minVal;
				} else {
					return val;
				}
			}
			static rectRectCollision(vectorA, sizeA, vectorB, sizeB) {
				return (Math.abs((vectorA[0]+sizeA[0]/2) - (vectorB[0]+sizeB[0]/2)) * 2 < (sizeA[0] + sizeB[0]))
						&& (Math.abs((vectorA[1]+sizeA[1]/2) - (vectorB[1]+sizeB[1]/2)) * 2 < (sizeA[1] + sizeB[1]));
			}
		},

		// Perlin Noise class, create 1 instance and get values via noise.value(x); function
		Noise: class{
			constructor(amp_ = 1, scl_ = 0.05) {
				this.vertices = 256, this.amp = amp_, this.scl = scl_, this.r = [];
				for(let i = 0; i < this.vertices; i++) this.r.push(Math.random());
			}

			value(x) {
				const sclX = x*this.scl, floorX = Math.floor(sclX), t = sclX-floorX;
				const xMin = floorX & this.vertices-1, xMax = (xMin + 1) & this.vertices-1;
				return HB.Math.lerp(this.r[xMin], this.r[xMax], t*t*(3-2*t)) * this.amp;
			}
		},

		Mat4: class{
			static new(identity = 0) { return [identity, 0, 0, 0, 0, identity, 0, 0, 0, 0, identity, 0, 0, 0, 0, identity]; }

			static orthographic(out, left, right, top, bottom, near = -1, far = 1) {
				const rl = right-left, tb = top-bottom, fn = far-near;

				out[0 ] = 2/rl, out[1 ] =    0, out[2 ] =     0, out[3 ] = -(right+left)/rl;
				out[4 ] =    0, out[5 ] = 2/tb, out[6 ] =     0, out[7 ] = -(top+bottom)/tb;
				out[8 ] =    0, out[9 ] =    0, out[10] = -2/fn, out[11] =   -(far+near)/fn;
				out[12] =    0, out[13] =    0, out[14] =     0, out[15] =                1;
			}

			// static perspective(out, FOV, near = 0.01, far = 1000) {
			// 	const f = Math.tan(Math.PI * 0.5 - 0.5 * FOV);
			// 	const invRange = 1.0 / (near - far);
			// 	const aspect = HB.canvas.width/HB.canvas.height;

			// 	out[0] = f/aspect, out[4] = 0, out[ 8] =                   0, out[12] =  0;
			// 	out[1] =        0, out[5] = f, out[ 9] =                   0, out[13] =  0;
			// 	out[2] =        0, out[6] = 0, out[10] = (near+far)*invRange, out[14] = -1;
			// 	out[3] =        0, out[7] = 0, out[11] = near*far*invRange*2, out[15] =  0;
			// }

			static multMat4(out, matrixA, matrixB) {
				const row0 = HB.Vec4.multMat4([matrixB[ 0], matrixB[ 1], matrixB[ 2], matrixB[ 3]], matrixA);
				const row1 = HB.Vec4.multMat4([matrixB[ 4], matrixB[ 5], matrixB[ 6], matrixB[ 7]], matrixA);
				const row2 = HB.Vec4.multMat4([matrixB[ 8], matrixB[ 9], matrixB[10], matrixB[11]], matrixA);
				const row3 = HB.Vec4.multMat4([matrixB[12], matrixB[13], matrixB[14], matrixB[15]], matrixA);

				out[0 ] = row0[0], out[1 ] = row0[1], out[2 ] = row0[2], out[3 ] = row0[3];
				out[4 ] = row1[0], out[5 ] = row1[1], out[6 ] = row1[2], out[7 ] = row1[3];
				out[8 ] = row2[0], out[9 ] = row2[1], out[10] = row2[2], out[11] = row2[3];
				out[12] = row3[0], out[13] = row3[1], out[14] = row3[2], out[15] = row3[3];
			}

			static scale(out, matrix, scale) { HB.Mat4.multMat4(out, matrix, [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1]); }
			static translate(out, matrix, vector3) { HB.Mat4.multMat4(out, matrix, [1, 0, 0, vector3[0], 0, 1, 0, vector3[1], 0, 0, 1, vector3[2], 0, 0, 0, 1]); }
			static rotateX(out, matrix, angle) { HB.Mat4.multMat4(out, matrix, [1, 0, 0, 0, 0, Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1]); }
			static rotateY(out, matrix, angle) { HB.Mat4.multMat4(out, matrix, [Math.cos(-angle), 0, Math.sin(-angle), 0, 0, 1, 0, 0, Math.sin(angle), 0, Math.cos(-angle), 0, 0, 0, 0, 1]); }
			static rotateZ(out, matrix, angle) { HB.Mat4.multMat4(out, matrix, [Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
		},

		Vec2: class{
			constructor() {
				HB.Vec2.zero = [0, 0];
				HB.Vec2.one = [1, 1];
			}

			static new(x = 0, y = 0) { return [x, y]; }
			static fromVec2(vector) { return [vector[0], vector[1]]; }
			static copy(out, vector) { return out[0] = vector[0], out[1] = vector[1]; }

			static fromAngle(angle, radius = 1) {
				return HB.Vec2.new(Math.cos(angle) * radius, Math.sin(angle) * radius);
			}

			static set(out, x, y = undefined) {
				if(y !== undefined) {
					out[0] = x, out[1] = y;
				} else {
					out[0] = x[0], out[1] = x[1];
				}
			}

			static add(out, x, y = undefined) {
				if(y !== undefined) {
					out[0] += x;
					out[1] += y;
				} else {
					out[0] += x[0];
					out[1] += x[1];
				}
			}

			static mult(out, x, y) {
				if(y === undefined) {
					if(Array.isArray(x)) {
						out[0] *= x[0];
						out[1] *= x[1];
					} else {
						out[0] *= x;
						out[1] *= x;
					}
				} else {
					out[0] *= x;
					out[1] *= y;
				}
			}

			static div(out, x, y) {
				if(y === undefined) {
					if(Array.isArray(x)) {
						out[0] /= x[0];
						out[1] /= x[1];
					} else {
						out[0] /= x;
						out[1] /= x;
					}
				} else {
					out[0] /= x;
					out[1] /= y;
				}
			}

			static constrain(out, lowX, hiX, lowY, hiY) {
				out[0] = HB.Math.constrain(out[0], lowX, hiX);
				out[1] = HB.Math.constrain(out[1], lowY, hiY);
			}

			static angleBetweenVec2(vectorA, vectorB) {
				return Math.atan2(vectorB[1] - vectorA[1], vectorB[0] - vectorA[0]);
			}

			static distBetweenVec2(vectorA, vectorB) {
				return Math.sqrt((vectorB[0]-vectorA[0])*(vectorB[0]-vectorA[0]) + (vectorB[1]-vectorA[1])*(vectorB[1]-vectorA[1]));
			}

			static collidesRect(vector, rectPos, rectSize) {
				return (
					   vector[0] < rectPos[0]+rectSize[0]
					&& vector[0] > rectPos[0]
					&& vector[1] < rectPos[1]+rectSize[1]
					&& vector[1] > rectPos[1]
				);
			}
		},

		Vec3: class{
			constructor() {
				HB.Vec3.zero = [0, 0, 0];
				HB.Vec3.one = [1, 1, 1];
			}

			static new(x = 0, y = 0, z = 0) { return [x, y, z]; }
		},

		Vec4: class{
			constructor() {
				HB.Vec4.zero = [0, 0, 0, 0];
				HB.Vec4.one = [1, 1, 1, 1];

				HB.Vec4.colors = {};
				HB.Vec4.colors['white'] = [1, 1, 1, 1];
				HB.Vec4.colors['black'] = [0, 0, 0, 1];
				HB.Vec4.colors['red'] = [1, 0, 0, 1];
				HB.Vec4.colors['green'] = [0, 1, 0, 1];
				HB.Vec4.colors['blue'] = [0, 0, 1, 1];
				HB.Vec4.colors['yellow'] = [1, 1, 0, 1];
				HB.Vec4.colors['cyan'] = [0, 1, 1, 1];
				HB.Vec4.colors['magenta'] = [1, 0, 1, 1];
			}

			static new(x = 0, y = 0, z = 0, w = 0) { return [x, y, z, w]; }

			static multVec4(vectorA, vectorB) { return [vectorA[0] * vectorB[0], vectorA[1] * vectorB[1], vectorA[2] * vectorB[2], vectorA[3] * vectorB[3]]; }

			static multMat4(vector, matrix) {
				return [
					(vector[0] * matrix[ 0]) + (vector[1] * matrix[ 4]) + (vector[2] * matrix[ 8]) + (vector[3] * matrix[12]),
					(vector[0] * matrix[ 1]) + (vector[1] * matrix[ 5]) + (vector[2] * matrix[ 9]) + (vector[3] * matrix[13]),
					(vector[0] * matrix[ 2]) + (vector[1] * matrix[ 6]) + (vector[2] * matrix[10]) + (vector[3] * matrix[14]),
					(vector[0] * matrix[ 3]) + (vector[1] * matrix[ 7]) + (vector[2] * matrix[11]) + (vector[3] * matrix[15])
				];
			}
		}
	//#endregion
	};
})();
window.addEventListener("load", HB.setup);