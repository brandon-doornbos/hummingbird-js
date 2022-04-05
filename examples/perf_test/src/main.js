let objects = [], circle, polygon, textures = ['oof', 'birb', 'piet', 'dickbutt', 'cat1', 'cat2', 'cat3', 'cat4'];

HB.mousePressed = function () {
	for (let i = 0; i < 100; i++) {
		objects.push(new Bouncer(textures[HB.Math.randomInt(textures.length - 1)]));
		// const colors = Object.values(HB.Vec4.colors);
		// objects.push(new Bouncer(colors[HB.Math.randomInt(colors.length-1)]));
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

	polygon = new Bouncer(HB.Vec4.colors.Yellow);
	polygon.size = HB.Vec2.new(200, 200);

	circle = new Bouncer(HB.Vec4.colors.Lime);
}

class Bouncer {
	constructor(texture) {
		this.pos = HB.Vec2.new();
		this.size = HB.Vec2.new(100, 100);
		this.vel = HB.Vec2.new(HB.Math.random(-5, 5), HB.Math.random(-5, 5));
		this.texture = texture;
	}

	update() {
		HB.Vec2.addVec2(this.pos, this.vel);

		if (this.pos.x > HB.canvas.width - this.size.x) {
			this.vel.x *= -1;
			this.pos.x = HB.canvas.width - this.size.x;
		} else if (this.pos.x < 0) {
			this.vel.x *= -1;
			this.pos.x = 0;
		}
		if (this.pos.y > HB.canvas.height - this.size.y) {
			this.vel.y *= -1;
			this.pos.y = HB.canvas.height - this.size.y;
		} else if (this.pos.y < 0) {
			this.vel.y *= -1;
			this.pos.y = 0;
		}
	}
}

let angle = 0, cameraSpeed = 20;
let avg = [];

HB.update = function () {
	HB.renderer.clear(HB.Vec4.colors.Black);
	avg.push(HB.deltaTime);
	while (avg.length > 50) avg.shift();

	const pos = HB.Vec2.new(), size = HB.Vec2.new(5, 5), color = HB.Vec4.new(0, 1, 1, 1);
	for (let x = 0, r = 0, g = 1; x < HB.canvas.width; x += 6) {
		color.x += 0.005, color.y -= 0.005;
		for (let y = 0; y < HB.canvas.height; y += 6) {
			HB.Vec2.set(pos, x, y);
			HB.renderer.colorRectangle(pos, size, color);
			// HB.renderer.textureRectangle(pos, size, HB.textures['oof']);
		}
	}

	HB.renderer.rotatedColorRectangle(HB.Vec2.new(), HB.Vec2.new(150, 150), 180 - angle, HB.Vec4.colors.White);
	HB.renderer.rotatedTextureRectangle(HB.Vec2.new(), HB.Vec2.new(150, 150), angle++, HB.textures.birb);

	HB.renderer.colorLine(HB.Vec2.new(), HB.mousePosition, 5, HB.Vec4.colors.White);
	HB.renderer.colorLine(HB.Vec2.new(HB.canvas.width, 0), HB.mousePosition, 5, HB.Vec4.colors.White);
	HB.renderer.colorLine(HB.canvas.size, HB.mousePosition, 5, HB.Vec4.colors.White);
	HB.renderer.colorLine(HB.Vec2.new(0, HB.canvas.height), HB.mousePosition, 5, HB.Vec4.colors.White);

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
		const point = HB.Vec2.fromAngle(HB.Math.radians(i), polygon.size.x / 2);
		HB.Vec2.addVec2(point, polygon.pos);
		HB.Vec2.add(point, polygon.size.x / 2, polygon.size.y / 2);
		points.push(point);
	}
	HB.renderer.colorPolygon(points, HB.Vec4.colors.Yellow);

	objects.forEach((object) => {
		HB.renderer.textureRectangle(object.pos, object.size, HB.textures[object.texture]);
		// HB.renderer.colorRectangle(object.pos, object.size, object.texture);
	});

	HB.renderer.colorEllipse(circle.pos, circle.size, circle.texture);

	HB.renderer.colorText('Click! ', HB.mousePosition, 42, 'start-start', HB.Vec4.colors.White);
	HB.renderer.colorText(4 + objects.length + ' objects', HB.Vec2.new(HB.mousePosition.x, HB.mousePosition.y + 42), 42, 'start-start', HB.Vec4.colors.White);
	let average = 0;
	for (let deltaTime of avg) average += deltaTime;
	HB.renderer.colorText((average /= avg.length).toFixed(2) + ' ms, ' + (1000 / average).toFixed(2) + ' FPS', HB.Vec2.new(HB.mousePosition.x, HB.mousePosition.y + 84), 42, 'start-start', HB.Vec4.colors.White);

	HB.renderer.colorPoint(HB.mousePosition, 5, HB.Vec4.colors.Yellow);
}

HB.fixedUpdate = function () {
	if (HB.keysPressed['w']) HB.camera.translate(HB.Vec3.new(0, cameraSpeed, 0));
	if (HB.keysPressed['a']) HB.camera.translate(HB.Vec3.new(cameraSpeed, 0, 0));
	if (HB.keysPressed['s']) HB.camera.translate(HB.Vec3.new(0, -cameraSpeed, 0));
	if (HB.keysPressed['d']) HB.camera.translate(HB.Vec3.new(-cameraSpeed, 0, 0));

	if (HB.keysPressed['e']) HB.camera.zoom(0.05);
	if (HB.keysPressed['q']) HB.camera.zoom(-0.05);

	// if(HB.keysPressed['e']) HB.camera.translate(HB.Vec3.new(0, 0, 0.1));
	// if(HB.keysPressed['q']) HB.camera.translate(HB.Vec3.new(0, 0, -0.1));

	// if(HB.keysPressed['e']) HB.camera.rotate(HB.Math.radians(1));
	// if(HB.keysPressed['q']) HB.camera.rotate(HB.Math.radians(-1));

	polygon.update();

	circle.update();

	objects.forEach((object) => {
		object.update();
	});
}
