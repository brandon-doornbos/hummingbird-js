let objects = [], circle, polygon, textures = ['oof', 'birb', 'piet', 'dickbutt', 'cat1', 'cat2', 'cat3', 'cat4'];

HB.mousePressed = function () {
	for (let i = 0; i < 100; i++) {
		objects.push(new Bouncer(textures[HB.Math.randomInt(textures.length - 1)]));
		// const colors = Object.values(HB.Colors);
		// objects.push(new Bouncer(colors[HB.Math.randomInt(colors.length - 1)]));
	}
}

HB.setup = function () {
	HB.init(1280, 720);

	new HB.Texture('oof', './assets/oof.png');
	new HB.Texture('birb', '../../assets/logo.svg');
	new HB.Texture('piet', './assets/piet-piraat.jpg');
	new HB.Texture('dickbutt', './assets/dickbutt.jpg');
	new HB.Texture('cat1', './assets/cat1.jpg');
	new HB.Texture('cat2', './assets/cat2.png');
	new HB.Texture('cat3', './assets/cat3.png');
	new HB.Texture('cat4', './assets/cat4.jpg');

	polygon = new Bouncer(HB.Colors.Yellow);
	polygon.size = HB.vec2.fromValues(200, 200);

	circle = new Bouncer(HB.Colors.Lime);
}

class Bouncer {
	constructor(texture) {
		this.pos = HB.vec2.create();
		this.size = HB.vec2.fromValues(100, 100);
		this.vel = HB.vec2.fromValues(HB.Math.random(-5, 5), HB.Math.random(-5, 5));
		this.texture = texture;
	}

	update() {
		HB.vec2.add(this.pos, this.pos, this.vel);

		if (this.pos[0] > HB.canvas.width - this.size[0]) {
			this.vel[0] *= -1;
			this.pos[0] = HB.canvas.width - this.size[0];
		} else if (this.pos[0] < 0) {
			this.vel[0] *= -1;
			this.pos[0] = 0;
		}
		if (this.pos[1] > HB.canvas.height - this.size[1]) {
			this.vel[1] *= -1;
			this.pos[1] = HB.canvas.height - this.size[1];
		} else if (this.pos[1] < 0) {
			this.vel[1] *= -1;
			this.pos[1] = 0;
		}
	}
}

let angle = 0, cameraSpeed = 20;
let avg = [];

HB.update = function () {
	HB.renderer.clear(HB.Colors.Black);
	avg.push(HB.deltaTime);
	while (avg.length > 50) avg.shift();

	const pos = HB.vec2.create(), size = HB.vec2.fromValues(5, 5), color = HB.Colors.Aqua.slice();
	for (let x = 0; x < HB.canvas.width; x += 6) {
		color[0] += 0.005, color[1] -= 0.005;
		for (let y = 0; y < HB.canvas.height; y += 6) {
			HB.vec2.set(pos, x, y);
			HB.renderer.colorRectangle(pos, size, color);
			// HB.renderer.textureRectangle(pos, size, HB.textures['oof']);
		}
	}

	HB.renderer.rotatedColorRectangle(HB.vec2.create(), HB.vec2.fromValues(150, 150), 180 - angle, HB.Colors.White);
	HB.renderer.rotatedTextureRectangle(HB.vec2.create(), HB.vec2.fromValues(150, 150), angle++, HB.textures.birb);

	HB.renderer.colorLine(HB.vec2.create(), HB.mousePosition, 5, HB.Colors.White);
	HB.renderer.colorLine(HB.vec2.fromValues(HB.canvas.width, 0), HB.mousePosition, 5, HB.Colors.White);
	HB.renderer.colorLine(HB.canvas.size, HB.mousePosition, 5, HB.Colors.White);
	HB.renderer.colorLine(HB.vec2.fromValues(0, HB.canvas.height), HB.mousePosition, 5, HB.Colors.White);

	// const points = [
	// 	[100, 100],
	// 	[150, 100],
	// 	[150, 150],
	// 	[100, 150],
	// 	[125, 125]
	// ]; // concave
	// points = [
	// 	[150, 100],
	// 	[200, 200],
	// 	[100, 200],
	// ]; // triangle
	const points = [];
	for (let i = 0; i < 360; i += 36) {
		let point = HB.vec2.fromValues(100, 0);
		HB.vec2.rotate(point, point, HB.vec2.create(), HB.Math.radians(i));
		HB.vec2.add(point, point, polygon.pos);
		HB.vec2.add(point, point, HB.vec2.fromValues(polygon.size[0] * 0.5, polygon.size[1] * 0.5));
		points.push(point);
	}
	HB.renderer.colorPolygon(points, HB.Colors.Yellow);

	objects.forEach((object) => {
		HB.renderer.textureRectangle(object.pos, object.size, HB.textures[object.texture]);
		// HB.renderer.colorRectangle(object.pos, object.size, object.texture);
	});

	HB.renderer.colorEllipse(circle.pos, circle.size, circle.texture);

	HB.renderer.colorText('Click! ', HB.mousePosition, 42, 'start-start', HB.Colors.White);
	HB.renderer.colorText(4 + objects.length + ' objects', HB.vec2.fromValues(HB.mousePosition[0], HB.mousePosition[1] + 42), 42, 'start-start', HB.Colors.White);
	let average = 0;
	for (let deltaTime of avg) average += deltaTime;
	HB.renderer.colorText((average /= avg.length).toFixed(2) + ' ms, ' + (1000 / average).toFixed(2) + ' FPS', HB.vec2.fromValues(HB.mousePosition[0], HB.mousePosition[1] + 84), 42, 'start-start', HB.Colors.White);

	HB.renderer.colorPoint(HB.mousePosition, 5, HB.Colors.Yellow);
}

HB.fixedUpdate = function () {
	if (HB.keysPressed['w']) HB.camera.translate(HB.vec3.fromValues(0, cameraSpeed, 0));
	if (HB.keysPressed['a']) HB.camera.translate(HB.vec3.fromValues(cameraSpeed, 0, 0));
	if (HB.keysPressed['s']) HB.camera.translate(HB.vec3.fromValues(0, -cameraSpeed, 0));
	if (HB.keysPressed['d']) HB.camera.translate(HB.vec3.fromValues(-cameraSpeed, 0, 0));

	if (HB.keysPressed['e']) HB.camera.zoom(0.05);
	if (HB.keysPressed['q']) HB.camera.zoom(-0.05);

	// if (HB.keysPressed['e']) HB.camera.translate(HB.vec3.fromValues(0, 0, 0.1));
	// if (HB.keysPressed['q']) HB.camera.translate(HB.vec3.fromValues(0, 0, -0.1));

	// if (HB.keysPressed['e']) HB.camera.rotate(HB.Math.radians(1));
	// if (HB.keysPressed['q']) HB.camera.rotate(HB.Math.radians(-1));

	polygon.update();

	circle.update();

	objects.forEach((object) => {
		object.update();
	});
}
