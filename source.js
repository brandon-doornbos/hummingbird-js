window.HB = (function() {
	"use strict";
	const HB = {
		//#region variables
		version: "v0.2.1",
		noUpdate: false,
		toLoad: 0,
		loadTimeout: 5000,
		frames: 0,
		prevTime: 0,
		mousePos: [0, 0],
		mouseIsPressed: false,
		keysPressed: {},

		canvas: undefined,
		gl: undefined,
		renderer: undefined,
		vertexArray: undefined,
		maxVertexCount: 2000,
		vertices: undefined,
		vertexBuffer: undefined,
		maxIndexCount: 3000,
		indices: undefined,
		indexBuffer: undefined,
		textures: {},
		batch:undefined,
		camera: undefined,
		shader: undefined,
		//#endregion

		//#region common
		setup: function() {
			console.log("Hummingbird "+HB.version+" by SantaClausNL. https://www.santaclausnl.ga/");

			if(typeof preload === 'function') {
				preload();
				const loading = document.createTextNode("LOADING...");
				document.body.appendChild(loading);
				if(HB.toLoad <= 0) Continue(); else {
					let elapsedLoading = 0;
					const loadingLoop = setInterval(() => {
						if(HB.toLoad <= 0 || elapsedLoading >= HB.loadTimeout) {
							if(elapsedLoading >= HB.loadTimeout) console.warn("Failed to load assets.");
							clearInterval(loadingLoop);
							loading.remove();
							Continue();
						} else elapsedLoading += 25;
					}, 25);
				}
			} else Continue();

			function Continue() {
				if(typeof setup === 'function') setup();
				if(typeof update === 'function' && HB.noUpdate !== true) requestAnimationFrame(HB.update);
			}
		},

		init: function(width_, height_, options) {
			if(options === undefined) options = {};
			if(options["noUpdate"] === true) HB.noUpdate = true;
			if(options["canvas"] === undefined) {
				HB.canvas = document.createElement("CANVAS"), HB.gl = HB.canvas.getContext('webgl2');
				if(options["parent"] === undefined) document.body.appendChild(HB.canvas); else options["parent"].appendChild(HB.canvas);
			} else HB.canvas = options["canvas"], gl = HB.canvas.getContext('webgl2');

			if(HB.gl === null) {
				HB.canvas.parentNode.removeChild(HB.canvas);
				const p = document.createElement('p');
				p.innerText = 'WebGL2 is not supported on your browser or machine.';
				if(options["parent"] === undefined) document.body.appendChild(p); else options["parent"].appendChild(p);
			} else {
				HB.canvas.width = width_ || 100, HB.canvas.height = height_ || 100;
				HB.canvas.id = (options["id"] === undefined) ? "HummingbirdCanvas" : options["id"];

				HB.renderer = new HB.Renderer();
			}

			window.addEventListener('keydown', (e) => {
				HB.keysPressed[e.keyCode] = true;
				if(typeof keyPressed === 'function') keyPressed(e);
			});
			window.addEventListener('keyup', (e) => {
				HB.keysPressed[e.keyCode] = false;
				if(typeof keyReleased === 'function') keyReleased(e);
			});
			window.addEventListener('mousemove', (e) => {
				HB.mousePos = HB.getMousePos(e);
				if(typeof mouseMoved === 'function') mouseMoved(e);
			});
			window.addEventListener('mousedown', (e) => {
				HB.mouseIsPressed = true;
				if(typeof mousePressed === 'function') mousePressed(e);
			});
			window.addEventListener('mouseup', (e) => {
				HB.mouseIsPressed = false;
				if(typeof mouseReleased === 'function') mouseReleased(e);
			});
			window.addEventListener('beforeunload', () => {
				HB.renderer.delete();
			});
		},

		resizeWindow: function(width_, height_) {
			HB.canvas.width = width_ || 100, HB.canvas.height = height_ || 100;
			HB.gl.viewport(0, 0, HB.canvas.width, HB.canvas.height);
			camera.projectionMatrix = Mat4.orthographic(0, HB.canvas.width, 0, HB.canvas.height, -1, 1);
		},

		update: function(now) {
			const deltaTime = now-HB.prevTime;
			HB.prevTime = now;
			HB.camera.setMVP();
			update(deltaTime);
			HB.frames++;
			requestAnimationFrame(HB.update);
		},
		//#endregion

		//#region renderer
		Renderer: class{
			constructor() {
				HB.gl.enable(HB.gl.BLEND);
				HB.gl.blendFunc(HB.gl.SRC_ALPHA, HB.gl.ONE_MINUS_SRC_ALPHA);
				HB.gl.clearColor(0, 0, 0, 1);

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

				HB.vertices = new Float32Array(HB.maxVertexCount*10);
				HB.vertexBuffer = new HB.VertexBuffer(HB.vertices);
				HB.vertexArray.layout.add('aVertexPosition', HB.gl.FLOAT, 3);
				HB.vertexArray.layout.add('aVertexColor', HB.gl.FLOAT, 4);
				HB.vertexArray.layout.add('aTexturePosition', HB.gl.FLOAT, 2);
				HB.vertexArray.layout.add('aTextureId', HB.gl.FLOAT, 1);
				HB.vertexArray.addBuffer(HB.vertexBuffer);

				HB.indices = new Uint32Array(HB.maxIndexCount);
				HB.indexBuffer = new HB.IndexBuffer(HB.indices);

				HB.camera = new HB.Camera();
			}

			clear() { HB.gl.clear(HB.gl.COLOR_BUFFER_BIT); }

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
				// this.projectionMatrix = Mat4.perspective(60*(Math.PI/180), canvas.width/canvas.height, -1, -100);
				// this.projectionMatrix = Mat4.perspective(0, c.width, 0, c.height, 1, 100);
				// this.projectionMatrix = [0.2, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, -0.0202, -1.0202, 0, 0, 0, 1];
				// console.log(this.projectionMatrix);
				this.viewMatrix = HB.Mat4.new(1);//Mat4.translate(Mat4.new(1), Vec3.new(0, 0, 0));
				this.modelMatrix = HB.Mat4.new(1);//Mat4.translate(Mat4.new(1), Vec3.new(0, 0, 0));
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

			drawColoredRect(x, y, w, h, color) {
				if((this.vertexCount + 4) >= HB.maxVertexCount || (this.indexCount + 6) >= HB.maxIndexCount) this.flush();

				const start = this.vertexCount*10;
				HB.vertices[start   ] = x;
				HB.vertices[start+1 ] = y;
				HB.vertices[start+2 ] = 0;
				HB.vertices[start+3 ] = color[0];
				HB.vertices[start+4 ] = color[1];
				HB.vertices[start+5 ] = color[2];
				HB.vertices[start+6 ] = color[3];
				HB.vertices[start+7 ] = 0;
				HB.vertices[start+8 ] = 0;
				HB.vertices[start+9 ] = 0;
				HB.vertices[start+10] = x+w;
				HB.vertices[start+11] = y;
				HB.vertices[start+12] = 0;
				HB.vertices[start+13] = color[0];
				HB.vertices[start+14] = color[1];
				HB.vertices[start+15] = color[2];
				HB.vertices[start+16] = color[3];
				HB.vertices[start+17] = 1;
				HB.vertices[start+18] = 0;
				HB.vertices[start+19] = 0;
				HB.vertices[start+20] = x+w;
				HB.vertices[start+21] = y+h;
				HB.vertices[start+22] = 0;
				HB.vertices[start+23] = color[0];
				HB.vertices[start+24] = color[1];
				HB.vertices[start+25] = color[2];
				HB.vertices[start+26] = color[3];
				HB.vertices[start+27] = 1;
				HB.vertices[start+28] = 1;
				HB.vertices[start+29] = 0;
				HB.vertices[start+30] = x;
				HB.vertices[start+31] = y+h;
				HB.vertices[start+32] = 0;
				HB.vertices[start+33] = color[0];
				HB.vertices[start+34] = color[1];
				HB.vertices[start+35] = color[2];
				HB.vertices[start+36] = color[3];
				HB.vertices[start+37] = 0;
				HB.vertices[start+38] = 1;
				HB.vertices[start+39] = 0;

				HB.indices[this.indexCount  ] = this.vertexCount;
				HB.indices[this.indexCount+1] = this.vertexCount+1;
				HB.indices[this.indexCount+2] = this.vertexCount+2;
				HB.indices[this.indexCount+3] = this.vertexCount+2;
				HB.indices[this.indexCount+4] = this.vertexCount+3;
				HB.indices[this.indexCount+5] = this.vertexCount;

				this.vertexCount += 4, this.indexCount += 6;
			}

			drawTexturedRect(x, y, w, h, texture) {
				if((this.vertexCount + 4) >= HB.maxVertexCount || (this.indexCount + 6) >= HB.maxIndexCount) this.flush();

				let textureIndex = this.textureCache[texture.name];
				if(textureIndex === undefined) {
					if((this.textureIndex + 1) >= 16) this.flush();
					this.textureCache[texture.name] = textureIndex = this.textureIndex;
					texture.bind(this.textureIndex++);
				}

				const start = this.vertexCount*10;
				HB.vertices[start   ] = x;
				HB.vertices[start+1 ] = y;
				HB.vertices[start+2 ] = 0;
				HB.vertices[start+3 ] = 1;
				HB.vertices[start+4 ] = 1;
				HB.vertices[start+5 ] = 1;
				HB.vertices[start+6 ] = 1;
				HB.vertices[start+7 ] = 0;
				HB.vertices[start+8 ] = 0;
				HB.vertices[start+9 ] = textureIndex;
				HB.vertices[start+10] = x+w;
				HB.vertices[start+11] = y;
				HB.vertices[start+12] = 0;
				HB.vertices[start+13] = 1;
				HB.vertices[start+14] = 1;
				HB.vertices[start+15] = 1;
				HB.vertices[start+16] = 1;
				HB.vertices[start+17] = 1;
				HB.vertices[start+18] = 0;
				HB.vertices[start+19] = textureIndex;
				HB.vertices[start+20] = x+w;
				HB.vertices[start+21] = y+h;
				HB.vertices[start+22] = 0;
				HB.vertices[start+23] = 1;
				HB.vertices[start+24] = 1;
				HB.vertices[start+25] = 1;
				HB.vertices[start+26] = 1;
				HB.vertices[start+27] = 1;
				HB.vertices[start+28] = 1;
				HB.vertices[start+29] = textureIndex;
				HB.vertices[start+30] = x;
				HB.vertices[start+31] = y+h;
				HB.vertices[start+32] = 0;
				HB.vertices[start+33] = 1;
				HB.vertices[start+34] = 1;
				HB.vertices[start+35] = 1;
				HB.vertices[start+36] = 1;
				HB.vertices[start+37] = 0;
				HB.vertices[start+38] = 1;
				HB.vertices[start+39] = textureIndex;

				HB.indices[this.indexCount  ] = this.vertexCount;
				HB.indices[this.indexCount+1] = this.vertexCount+1;
				HB.indices[this.indexCount+2] = this.vertexCount+2;
				HB.indices[this.indexCount+3] = this.vertexCount+2;
				HB.indices[this.indexCount+4] = this.vertexCount+3;
				HB.indices[this.indexCount+5] = this.vertexCount;

				this.vertexCount += 4, this.indexCount += 6;
			}

			flush() {
				HB.vertexBuffer.partialWrite(HB.vertices, this.vertexCount*10);
				HB.indexBuffer.partialWrite(HB.indices, this.indexCount);
				HB.renderer.draw(this.indexCount);
				this.reset();
			}
		},
		//#endregion

		//#region shader
		Shader: class{
			constructor(vertexShaderSource, fragmentShaderSource) {
				this.vertexShaderSource = vertexShaderSource || `
					attribute vec4 aVertexPosition;
					attribute vec4 aVertexColor;
					attribute vec2 aTexturePosition;
					attribute float aTextureId;

					varying vec4 vVertexColor;
					varying vec2 vTexturePosition;
					varying float vTextureId;

					uniform mat4 uMVP;

					void main() {
						gl_Position = uMVP * aVertexPosition;
						vVertexColor = aVertexColor;
						vTexturePosition = aTexturePosition;
						vTextureId = aTextureId;
					}
				`, this.fragmentShaderSource = fragmentShaderSource || `
					precision mediump float;
					varying vec4 vVertexColor;
					varying vec2 vTexturePosition;
					varying float vTextureId;

					uniform sampler2D uTextureIds[16];

					void main() {
						for(int i = 0; i < 16; i++) {
							if(i == int(vTextureId)) {
								gl_FragColor = texture2D(uTextureIds[i], vTexturePosition) * vVertexColor;
								break;
							}
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
					}

					add(name, type, count, normalized = false) {
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
			constructor(name, path) {
				this.id = HB.gl.createTexture();
				this.createTexture(path);
				this.name = name;
				HB.textures[this.name] = this;
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
					// this.unbind();
					this.textureIndex = undefined;
				}
				image.src = path;
				this.textureIndex = undefined;
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
		//#endregion

		//#region math
		Meth: class{
			static radians(degrees) { return degrees*(Math.PI/180); }
			static degrees(radians) { return radians*(180/Math.PI); }
			static map(value, valLow, valHigh, resLow, resHigh) { return resLow + (resHigh - resLow) * (value - valLow) / (valHigh - valLow); }
			static random(low, high) { if(high !== undefined) return Math.random() * (high-low) + low; else if(low !== undefined) return Math.random() * low; else return Math.random(); }
			static randomInt(low, high) { return Math.floor(random(low, high)); }
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

			// static perspective(aspectRatio, fieldOfView, near = 1, far = 100) {
			// 	return [
			// 		1/(aspectRatio*Math.tan(fieldOfView/2)),                         0,                        0,                          0,
			// 		                                      0, 1/Math.tan(fieldOfView/2),                        0,                          0,
			// 		                                      0,                         0, -((far+near)/(far-near)), -((2*far*near)/(far-near)),
			// 		                                      0,                         0,                       -1,                          0,
			// 	];
			// }
			// static perspective(left, right, top, bottom, near, far) {
			// 	return [
			// 		(2*near)/(right-left), 0, (right+left)/(right-left), 0,
			// 		0, (2*near)/(top-bottom), (top+bottom)/(top-bottom), 0,
			// 		0, 0, -(far+near)/(far-near), -(2*far*near)/(far-near),
			// 		0, 0, -1, 0,
			// 	];
			// }
			static perspective(fovy, aspect, near, far) {
				let f = 1/Math.tan(fovy/2), nf =  1/(near-far);
				return [f/aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far+near)*nf, -1, 0, 0, 2*far*near*nf, 0];
			}

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
			static new(x, y) { return [x, y]; }
		},

		Vec3: class{
			static new(x, y, z) { return [x, y, z]; }
		},

		Vec4: class{
			static new(x, y, z, w) { return [x, y, z, w]; }

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
	return HB;
})();
window.addEventListener("load", HB.setup);