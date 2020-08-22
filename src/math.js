// import { canvas } from './common.js';

function initMathObjects() {
	Vec2.init();
	Vec3.init();
	Vec4.init();
}

class HBMath{
	static radians(degrees) { // convert degrees to radians
		return degrees*(Math.PI/180);
	}
	static degrees(radians) { // convert radians to degrees
		return radians*(180/Math.PI);
	}
	static dist(x1, y1, x2, y2) { // gets distance between 2 x+y pairs
		return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
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
		return Math.floor(this.random(low, high));
	}
	static seededRandom = class{ // randomizer that's seeded with a random integer (mulberry32 by Tommy Ettinger, under public domain)
		constructor(seed) { this.t = seed + 0x6D2B79F; }

		value(low, high) {
			this.t = Math.imul(this.t ^ this.t >>> 15, this.t | 1);
			this.t ^= this.t + Math.imul(this.t ^ this.t >>> 7, this.t | 61);
			const res = ((this.t ^ this.t >>> 14) >>> 0) / 4294967296;
			if(high !== undefined) return res * (high-low) + low; else if(low !== undefined) return res * low;
			return res;
		}
	}
	static Noise = class{ // Perlin Noise class, create 1 instance and get values via noise.value(x); function, stole this a while ago and don't know who it's from
		constructor(amp_ = 1, scl_ = 0.05) {
			this.vertices = 256, this.amp = amp_, this.scl = scl_, this.r = [];
			for(let i = 0; i < this.vertices; i++) this.r.push(Math.random());
		}

		value(x) {
			const sclX = x*this.scl, floorX = Math.floor(sclX), t = sclX-floorX;
			const xMin = floorX & this.vertices-1, xMax = (xMin + 1) & this.vertices-1;
			return HBMath.lerp(this.r[xMin], this.r[xMax], t*t*(3-2*t)) * this.amp;
		}
	}
	static lerp(start, end, amt) { // linear interpolation
		return start+amt*(end-start);
	}
	static constrain(value, min, max) { // constrain a value
		if(value > max) {
			return max;
		} else if(value < min) {
			return min;
		} else {
			return value;
		}
	}
	static wrap(value, min, max) { // wrap a value if it is too high or low
		if(value > max) {
			return min;
		} else if(value < min) {
			return max;
		} else {
			return value;
		}
	}
	static rectRectCollision(vectorA, sizeA, vectorB, sizeB) { // check for AABB collision between two rectangles
		return (
			Math.abs((vectorA.x+sizeA.x/2)-(vectorB.x+sizeB.x/2))*2 < (sizeA.x+sizeB.x)
		) && (
			Math.abs((vectorA.y+sizeA.y/2)-(vectorB.y+sizeB.y/2))*2 < (sizeA.y+sizeB.y)
		);
	}
	static rectCircleCollision(rectPos, rectSize, circleCenter, circleRadius) { // check for collision between a rectangle and a circle
		const dx = circleCenter.x-Math.max(rectPos.x, Math.min(circleCenter.x, rectPos.x+rectSize.x));
		const dy = circleCenter.y-Math.max(rectPos.y, Math.min(circleCenter.y, rectPos.y+rectSize.y));
		return (dx*dx + dy*dy) < circleRadius*circleRadius;
	}
}

class Vec2{
	static init() {
		Vec2.zero = {x: 0, y: 0};
		Vec2.one = {x: 1, y: 1};
	}

	static new(x = 0, y = 0) { return { x: x, y: y }; }
	static fromVec2(vector) { return { x: vector.x, y: vector.y }; }
	static fromAngle(angle, radius = 1) { return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }; }
	static copy(out, vector) { out.x = vector.x, out.y = vector.y; }
	static set(out, x, y) { out.x = x, out.y = y; }

	static add(out, x, y) { out.x += x, out.y += y; }
	static addVec2(out, vector) { out.x += vector.x, out.y += vector.y; }
	static addScalar(out, scalar) { out.x += scalar, out.y += scalar; }

	static subtract(out, x, y) { out.x -= x, out.y -= y; }
	static subtractVec2(out, vector) { out.x -= vector.x, out.y -= vector.y; }
	static subtractScalar(out, scalar) { out.x -= scalar, out.y -= scalar; }

	static multiply(out, x, y) { out.x *= x, out.y *= y; }
	static multiplyVec2(out, vector) { out.x *= vector.x, out.y *= vector.y; }
	static multiplyScalar(out, scalar) { out.x *= scalar, out.y *= scalar; }

	static divide(out, x, y) { out.x /= x, out.y /= y; }
	static divideVec2(out, vector) { out.x /= vector.x, out.y /= vector.y; }
	static divideScalar(out, scalar) { out.x /= scalar, out.y /= scalar; }

	static constrain(out, lowX, hiX, lowY, hiY) {
		out.x = HBMath.constrain(out.x, lowX, hiX);
		out.y = HBMath.constrain(out.y, lowY, hiY);
	}

	static angleBetweenVec2(vectorA, vectorB) {
		return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
	}

	static distBetweenVec2(vectorA, vectorB) {
		return Math.sqrt((vectorB.x-vectorA.x)*(vectorB.x-vectorA.x) + (vectorB.y-vectorA.y)*(vectorB.y-vectorA.y));
	}

	static collidesRect(vector, rectPos, rectSize) {
		return ((
			vector.x < rectPos.x+rectSize.x
		) && (
			vector.x > rectPos.x
		) && (
			vector.y < rectPos.y+rectSize.y
		) && (
			vector.y > rectPos.y
		));
	}
}

class Vec3{
	static init() {
		Vec3.zero = { x: 0, y: 0, z: 0 };
		Vec3.one = { x: 1, y: 1, z: 1 };
	}

	static new(x = 0, y = 0, z = 0) { return { x: x, y: y, z: z }; }
}

class Vec4{
	static init() {
		Vec4.zero = { x: 0, y: 0, z: 0, w: 0 };
		Vec4.one = { x: 1, y: 1, z: 1, w: 1 };

		Vec4.colors = {};
		Vec4.colors.white = { x: 1, y: 1, z: 1, w: 1 };
		Vec4.colors.black = { x: 0, y: 0, z: 0, w: 1 };
		Vec4.colors.red = { x: 1, y: 0, z: 0, w: 1 };
		Vec4.colors.green = { x: 0, y: 1, z: 0, w: 1 };
		Vec4.colors.blue = { x: 0, y: 0, z: 1, w: 1 };
		Vec4.colors.yellow = { x: 1, y: 1, z: 0, w: 1 };
		Vec4.colors.cyan = { x: 0, y: 1, z: 1, w: 1 };
		Vec4.colors.magenta = { x: 1, y: 0, z: 1, w: 1 };
	}

	static new(x = 0, y = 0, z = 0, w = 0) { return { x: x, y: y, z: z, w: w }; }
	static set(out, x, y, z, w) { out.x = x, out.y = y, out.z = z, out.w = w; }

	static multMat4(out, vector, matrix) {
		out.x = (vector.x * matrix.aa) + (vector.y * matrix.ba) + (vector.z * matrix.ca) + (vector.w * matrix.da);
		out.y = (vector.x * matrix.ab) + (vector.y * matrix.bb) + (vector.z * matrix.cb) + (vector.w * matrix.db);
		out.z = (vector.x * matrix.ac) + (vector.y * matrix.bc) + (vector.z * matrix.cc) + (vector.w * matrix.dc);
		out.w = (vector.x * matrix.ad) + (vector.y * matrix.bd) + (vector.z * matrix.cd) + (vector.w * matrix.dd);

		return out;
	}
}

class Mat4{
	static new(identity = 0) {
		return {
			aa: identity, ab: 0, ac: 0, ad: 0,
			ba: 0, bb: identity, bc: 0, bd: 0,
			ca: 0, cb: 0, cc: identity, cd: 0,
			da: 0, db: 0, dc: 0, dd: identity
		};
	}
	static copy(out, matrix) {
		out.aa = matrix.aa, out.ab = matrix.ab, out.ac = matrix.ac, out.ad = matrix.ad;
		out.ba = matrix.ba, out.bb = matrix.bb, out.bc = matrix.bc, out.bd = matrix.bd;
		out.ca = matrix.ca, out.cb = matrix.cb, out.cc = matrix.cc, out.cd = matrix.cd;
		out.da = matrix.da, out.db = matrix.db, out.dc = matrix.dc, out.dd = matrix.dd;

		return out;
	}
	static fromMat4(matrix) {
		return {
			aa: matrix.aa, ab: matrix.ab, ac: matrix.ac, ad: matrix.ad,
			ba: matrix.ba, bb: matrix.bb, bc: matrix.bc, bd: matrix.bd,
			ca: matrix.ca, cb: matrix.cb, cc: matrix.cc, cd: matrix.cd,
			da: matrix.da, db: matrix.db, dc: matrix.dc, dd: matrix.dd
		};
	}

	static transpose(out, matrix) {
		const temp = this.fromMat4(matrix);

		out.aa = temp.aa, out.ab = temp.ba, out.ac = temp.ca, out.ad = temp.da;
		out.ba = temp.ab, out.bb = temp.bb, out.bc = temp.cb, out.bd = temp.db;
		out.ca = temp.ac, out.cb = temp.bc, out.cc = temp.cc, out.cd = temp.dc;
		out.da = temp.ad, out.db = temp.bd, out.dc = temp.cd, out.dd = temp.dd;

		return out;
	}
	static toArray(matrix) {
		return [
			matrix.aa, matrix.ab, matrix.ac, matrix.ad,
			matrix.ba, matrix.bb, matrix.bc, matrix.bd,
			matrix.ca, matrix.cb, matrix.cc, matrix.cd,
			matrix.da, matrix.db, matrix.dc, matrix.dd
		];
	}

	static orthographic(out, left, right, top, bottom, near = -1, far = 1) {
		const rl = right-left, tb = top-bottom, fn = far-near;

		out.aa = 2/rl, out.ab =    0, out.ac =     0, out.ad = -(right+left)/rl;
		out.ba =    0, out.bb = 2/tb, out.bc =     0, out.bd = -(top+bottom)/tb;
		out.ca =    0, out.cb =    0, out.cc = -2/fn, out.cd =   -(far+near)/fn;
		out.da =    0, out.db =    0, out.dc =     0, out.dd =                1;

		return out;
	}

	// static perspective(out, FoV = 60, aspect = canvas.width/canvas.height, near = 0.01, far = 1000) {
	// 	const f = Math.tan(Math.PI * 0.5 - 0.5 * HBMath.radians(FoV));
	// 	const invRange = 1.0 / (near - far);

	// 	out.aa = f/aspect, out.ab =    0, out.ac =                   0, out.ad =  0;
	// 	out.ba =        0, out.bb =    f, out.bc =                   0, out.bd =  0;
	// 	out.ca =        0, out.cb =    0, out.cc = (near+far)*invRange, out.cd = -1;
	// 	out.da =        0, out.db =    0, out.dc = near*far*invRange*2, out.dd =  0;
	// }

	static multMat4(out, matrixA, matrixB) {
		out.aa = (matrixB.aa * matrixA.aa) + (matrixB.ab * matrixA.ba) + (matrixB.ac * matrixA.ca) + (matrixB.ad * matrixA.da);
		out.ab = (matrixB.aa * matrixA.ab) + (matrixB.ab * matrixA.bb) + (matrixB.ac * matrixA.cb) + (matrixB.ad * matrixA.db);
		out.ac = (matrixB.aa * matrixA.ac) + (matrixB.ab * matrixA.bc) + (matrixB.ac * matrixA.cc) + (matrixB.ad * matrixA.dc);
		out.ad = (matrixB.aa * matrixA.ad) + (matrixB.ab * matrixA.bd) + (matrixB.ac * matrixA.cd) + (matrixB.ad * matrixA.dd);

		out.ba = (matrixB.ba * matrixA.aa) + (matrixB.bb * matrixA.ba) + (matrixB.bc * matrixA.ca) + (matrixB.bd * matrixA.da);
		out.bb = (matrixB.ba * matrixA.ab) + (matrixB.bb * matrixA.bb) + (matrixB.bc * matrixA.cb) + (matrixB.bd * matrixA.db);
		out.bc = (matrixB.ba * matrixA.ac) + (matrixB.bb * matrixA.bc) + (matrixB.bc * matrixA.cc) + (matrixB.bd * matrixA.dc);
		out.bd = (matrixB.ba * matrixA.ad) + (matrixB.bb * matrixA.bd) + (matrixB.bc * matrixA.cd) + (matrixB.bd * matrixA.dd);

		out.ca = (matrixB.ca * matrixA.aa) + (matrixB.cb * matrixA.ba) + (matrixB.cc * matrixA.ca) + (matrixB.cd * matrixA.da);
		out.cb = (matrixB.ca * matrixA.ab) + (matrixB.cb * matrixA.bb) + (matrixB.cc * matrixA.cb) + (matrixB.cd * matrixA.db);
		out.cc = (matrixB.ca * matrixA.ac) + (matrixB.cb * matrixA.bc) + (matrixB.cc * matrixA.cc) + (matrixB.cd * matrixA.dc);
		out.cd = (matrixB.ca * matrixA.ad) + (matrixB.cb * matrixA.bd) + (matrixB.cc * matrixA.cd) + (matrixB.cd * matrixA.dd);

		out.da = (matrixB.da * matrixA.aa) + (matrixB.db * matrixA.ba) + (matrixB.dc * matrixA.ca) + (matrixB.dd * matrixA.da);
		out.db = (matrixB.da * matrixA.ab) + (matrixB.db * matrixA.bb) + (matrixB.dc * matrixA.cb) + (matrixB.dd * matrixA.db);
		out.dc = (matrixB.da * matrixA.ac) + (matrixB.db * matrixA.bc) + (matrixB.dc * matrixA.cc) + (matrixB.dd * matrixA.dc);
		out.dd = (matrixB.da * matrixA.ad) + (matrixB.db * matrixA.bd) + (matrixB.dc * matrixA.cd) + (matrixB.dd * matrixA.dd);

		return out;
	}

	static scale(out, matrix, scale) {
		return this.multMat4(out, matrix, {
			aa: scale, ab: 0, ac: 0, ad: 0,
			ba: 0, bb: scale, bc: 0, bd: 0,
			ca: 0, cb: 0, cc: scale, cd: 0,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
	static translate(out, matrix, vector3) {
		return this.multMat4(out, matrix, {
			aa: 1, ab: 0, ac: 0, ad: vector3.x,
			ba: 0, bb: 1, bc: 0, bd: vector3.y,
			ca: 0, cb: 0, cc: 1, cd: vector3.z,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
	static rotate(out, matrix, up, angle) {
		const sinAngle = Math.sin(angle/2);
		const x = up.x * sinAngle, y = up.y * sinAngle, z = up.z * sinAngle, w = Math.cos(angle/2);

		const x2 = x + x, y2 = y + y, z2 = z + z;

		const xx = x * x2;
		const yx = y * x2, yy = y * y2;
		const zx = z * x2, zy = z * y2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		return this.multMat4(out, matrix, {
			aa: 1-yy-zz, ab: yx+wz, ac: zx-wy, ad: 0,
			ba: yx-wz, bb: 1-xx-zz, bc: zy+wx, bd: 0,
			ca: zx+wy, cb: zy+wx, cc: 1-xx-yy, cd: 0,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
	static rotateX(out, matrix, angle) {
		return this.multMat4(out, matrix, {
			aa: 1, ab: 0, ac: 0, ad: 0,
			ba: 0, bb: Math.cos(-angle), bc: Math.sin(angle), bd: 0,
			ca: 0, cb: Math.sin(-angle), cc: Math.cos(-angle), cd: 0,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
	static rotateY(out, matrix, angle) {
		return this.multMat4(out, matrix, {
			aa: Math.cos(-angle), ab: 0, ac: Math.sin(-angle), ad: 0,
			ba: 0, bb: 1, bc: 0, bd: 0,
			ca: Math.sin(angle), cb: 0, cc: Math.cos(-angle), cd: 0,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
	static rotateZ(out, matrix, angle) {
		return this.multMat4(out, matrix, {
			aa: Math.cos(-angle), ab: Math.sin(angle), ac: 0, ad: 0,
			ba: Math.sin(-angle), bb: Math.cos(-angle), bc: 0, bd: 0,
			ca: 0, cb: 0, cc: 1, cd: 0,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
}

export { initMathObjects, HBMath as Math, Vec2, Vec3, Vec4, Mat4 };