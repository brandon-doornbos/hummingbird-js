// import { canvas } from './common.js';

class seededRandom{ // randomizer that's seedable with a random integer (mulberry32 by Tommy Ettinger, under public domain)
	constructor(seed = new Date().getTime(), integer = false) {
		this.t = seed + 0x6D2B79F;
		this.integer = integer;
	}

	value(low, high, integer = this.integer) { // either choose if you want integers at initialization or override it here
		this.t = Math.imul(this.t ^ this.t >>> 15, this.t | 1);
		this.t ^= this.t + Math.imul(this.t ^ this.t >>> 7, this.t | 61);
		let res = ((this.t ^ this.t >>> 14) >>> 0);
		if(integer === false) {
			res /= 4294967296;
			if(high !== undefined) {
				return res * (high-low) + low;
			} else if(low !== undefined) {
				return res * low;
			}
		} else {
			if(high !== undefined) {
				return Math.floor(res/4294967296 * (high-low) + low);
			} else if(low !== undefined) {
				return Math.floor(res/4294967296 * low);
			}
		}
		return res;
	}
}

class Noise{ // Perlin Noise class, create 1 instance and get values via noise.value(x); function, stole this a while ago and don't know who it's from
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

function initMathObjects() {
	Vec2.init();
	Vec3.init();
	Vec4.init();
	HBMath.seededRandom = seededRandom;
	HBMath.Noise = Noise;
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
	static fromVec3(vector) { return { x: vector.x, y: vector.y, z: vector.z }; }
	static copy(out, vector) { out.x = vector.x, out.y = vector.y, out.z = vector.z; }
	static set(out, x, y, z) { out.x = x, out.y = y, out.z = z; }

	static add(out, x, y, z) { out.x += x, out.y += y, out.z += z; }
	static addVec3(out, vector) { out.x += vector.x, out.y += vector.y, out.z += vector.z; }
	static addScalar(out, scalar) { out.x += scalar, out.y += scalar, out.z += scalar; }

	static subtract(out, x, y, z) { out.x -= x, out.y -= y, out.z -= z; }
	static subtractVec3(out, vector) { out.x -= vector.x, out.y -= vector.y, out.z -= vector.z; }
	static subtractScalar(out, scalar) { out.x -= scalar, out.y -= scalar, out.z -= scalar; }

	static multiply(out, x, y, z) { out.x *= x, out.y *= y, out.z *= z; }
	static multiplyVec3(out, vector) { out.x *= vector.x, out.y *= vector.y, out.z *= vector.z; }
	static multiplyScalar(out, scalar) { out.x *= scalar, out.y *= scalar, out.z *= scalar; }

	static divide(out, x, y, z) { out.x /= x, out.y /= y, out.z /= z; }
	static divideVec3(out, vector) { out.x /= vector.x, out.y /= vector.y, out.z /= vector.z; }
	static divideScalar(out, scalar) { out.x /= scalar, out.y /= scalar, out.z /= scalar; }
}

class Vec4{
	static init() {
		Vec4.zero = { x: 0, y: 0, z: 0, w: 0 };
		Vec4.one = { x: 1, y: 1, z: 1, w: 1 };

		Vec4.colors = {
			AliceBlue:{x:0.94,y:0.97,z:1,w:1},
			AntiqueWhite:{x:0.98,y:0.92,z:0.84,w:1},
			Aqua:{x:0,y:1,z:1,w:1},
			Aquamarine:{x:0.5,y:1,z:0.83,w:1},
			Azure:{x:0.94,y:1,z:1,w:1},
			Beige:{x:0.96,y:0.96,z:0.86,w:1},
			Bisque:{x:1,y:0.89,z:0.77,w:1},
			Black:{x:0,y:0,z:0,w:1},
			BlanchedAlmond:{x:1,y:0.92,z:0.8,w:1},
			Blue:{x:0,y:0,z:1,w:1},
			BlueViolet:{x:0.54,y:0.17,z:0.89,w:1},
			Brown:{x:0.65,y:0.16,z:0.16,w:1},
			BurlyWood:{x:0.87,y:0.72,z:0.53,w:1},
			CadetBlue:{x:0.37,y:0.62,z:0.63,w:1},
			Chartreuse:{x:0.5,y:1,z:0,w:1},
			Chocolate:{x:0.82,y:0.41,z:0.12,w:1},
			Coral:{x:1,y:0.5,z:0.31,w:1},
			CornflowerBlue:{x:0.39,y:0.58,z:0.93,w:1},
			Cornsilk:{x:1,y:0.97,z:0.86,w:1},
			Crimson:{x:0.86,y:0.08,z:0.24,w:1},
			Cyan:{x:0,y:1,z:1,w:1},
			DarkBlue:{x:0,y:0,z:0.55,w:1},
			DarkCyan:{x:0,y:0.55,z:0.55,w:1},
			DarkGoldenRod:{x:0.72,y:0.53,z:0.04,w:1},
			DarkGray:{x:0.66,y:0.66,z:0.66,w:1},
			DarkGrey:{x:0.66,y:0.66,z:0.66,w:1},
			DarkGreen:{x:0,y:0.39,z:0,w:1},
			DarkKhaki:{x:0.74,y:0.72,z:0.42,w:1},
			DarkMagenta:{x:0.55,y:0,z:0.55,w:1},
			DarkOliveGreen:{x:0.33,y:0.42,z:0.18,w:1},
			DarkOrange:{x:1,y:0.55,z:0,w:1},
			DarkOrchid:{x:0.6,y:0.2,z:0.8,w:1},
			DarkRed:{x:0.55,y:0,z:0,w:1},
			DarkSalmon:{x:0.91,y:0.59,z:0.48,w:1},
			DarkSeaGreen:{x:0.56,y:0.74,z:0.56,w:1},
			DarkSlateBlue:{x:0.28,y:0.24,z:0.55,w:1},
			DarkSlateGray:{x:0.18,y:0.31,z:0.31,w:1},
			DarkSlateGrey:{x:0.18,y:0.31,z:0.31,w:1},
			DarkTurquoise:{x:0,y:0.81,z:0.82,w:1},
			DarkViolet:{x:0.58,y:0,z:0.83,w:1},
			DeepPink:{x:1,y:0.08,z:0.58,w:1},
			DeepSkyBlue:{x:0,y:0.75,z:1,w:1},
			DimGray:{x:0.41,y:0.41,z:0.41,w:1},
			DimGrey:{x:0.41,y:0.41,z:0.41,w:1},
			DodgerBlue:{x:0.12,y:0.56,z:1,w:1},
			FireBrick:{x:0.7,y:0.13,z:0.13,w:1},
			FloralWhite:{x:1,y:0.98,z:0.94,w:1},
			ForestGreen:{x:0.13,y:0.55,z:0.13,w:1},
			Fuchsia:{x:1,y:0,z:1,w:1},
			Gainsboro:{x:0.86,y:0.86,z:0.86,w:1},
			GhostWhite:{x:0.97,y:0.97,z:1,w:1},
			Gold:{x:1,y:0.84,z:0,w:1},
			GoldenRod:{x:0.85,y:0.65,z:0.13,w:1},
			Gray:{x:0.5,y:0.5,z:0.5,w:1},
			Grey:{x:0.5,y:0.5,z:0.5,w:1},
			Green:{x:0,y:0.5,z:0,w:1},
			GreenYellow:{x:0.68,y:1,z:0.18,w:1},
			HoneyDew:{x:0.94,y:1,z:0.94,w:1},
			HotPink:{x:1,y:0.41,z:0.71,w:1},
			IndianRed:{x:0.8,y:0.36,z:0.36,w:1},
			Indigo:{x:0.29,y:0,z:0.51,w:1},
			Ivory:{x:1,y:1,z:0.94,w:1},
			Khaki:{x:0.94,y:0.9,z:0.55,w:1},
			Lavender:{x:0.9,y:0.9,z:0.98,w:1},
			LavenderBlush:{x:1,y:0.94,z:0.96,w:1},
			LawnGreen:{x:0.49,y:0.99,z:0,w:1},
			LemonChiffon:{x:1,y:0.98,z:0.8,w:1},
			LightBlue:{x:0.68,y:0.85,z:0.9,w:1},
			LightCoral:{x:0.94,y:0.5,z:0.5,w:1},
			LightCyan:{x:0.88,y:1,z:1,w:1},
			LightGoldenRodYellow:{x:0.98,y:0.98,z:0.82,w:1},
			LightGray:{x:0.83,y:0.83,z:0.83,w:1},
			LightGrey:{x:0.83,y:0.83,z:0.83,w:1},
			LightGreen:{x:0.56,y:0.93,z:0.56,w:1},
			LightPink:{x:1,y:0.71,z:0.76,w:1},
			LightSalmon:{x:1,y:0.63,z:0.48,w:1},
			LightSeaGreen:{x:0.13,y:0.7,z:0.67,w:1},
			LightSkyBlue:{x:0.53,y:0.81,z:0.98,w:1},
			LightSlateGray:{x:0.47,y:0.53,z:0.6,w:1},
			LightSlateGrey:{x:0.47,y:0.53,z:0.6,w:1},
			LightSteelBlue:{x:0.69,y:0.77,z:0.87,w:1},
			LightYellow:{x:1,y:1,z:0.88,w:1},
			Lime:{x:0,y:1,z:0,w:1},
			LimeGreen:{x:0.2,y:0.8,z:0.2,w:1},
			Linen:{x:0.98,y:0.94,z:0.9,w:1},
			Magenta:{x:1,y:0,z:1,w:1},
			Maroon:{x:0.5,y:0,z:0,w:1},
			MediumAquaMarine:{x:0.4,y:0.8,z:0.67,w:1},
			MediumBlue:{x:0,y:0,z:0.8,w:1},
			MediumOrchid:{x:0.73,y:0.33,z:0.83,w:1},
			MediumPurple:{x:0.58,y:0.44,z:0.86,w:1},
			MediumSeaGreen:{x:0.24,y:0.7,z:0.44,w:1},
			MediumSlateBlue:{x:0.48,y:0.41,z:0.93,w:1},
			MediumSpringGreen:{x:0,y:0.98,z:0.6,w:1},
			MediumTurquoise:{x:0.28,y:0.82,z:0.8,w:1},
			MediumVioletRed:{x:0.78,y:0.08,z:0.52,w:1},
			MidnightBlue:{x:0.1,y:0.1,z:0.44,w:1},
			MintCream:{x:0.96,y:1,z:0.98,w:1},
			MistyRose:{x:1,y:0.89,z:0.88,w:1},
			Moccasin:{x:1,y:0.89,z:0.71,w:1},
			NavajoWhite:{x:1,y:0.87,z:0.68,w:1},
			Navy:{x:0,y:0,z:0.5,w:1},
			OldLace:{x:0.99,y:0.96,z:0.9,w:1},
			Olive:{x:0.5,y:0.5,z:0,w:1},
			OliveDrab:{x:0.42,y:0.56,z:0.14,w:1},
			Orange:{x:1,y:0.65,z:0,w:1},
			OrangeRed:{x:1,y:0.27,z:0,w:1},
			Orchid:{x:0.85,y:0.44,z:0.84,w:1},
			PaleGoldenRod:{x:0.93,y:0.91,z:0.67,w:1},
			PaleGreen:{x:0.6,y:0.98,z:0.6,w:1},
			PaleTurquoise:{x:0.69,y:0.93,z:0.93,w:1},
			PaleVioletRed:{x:0.86,y:0.44,z:0.58,w:1},
			PapayaWhip:{x:1,y:0.94,z:0.84,w:1},
			PeachPuff:{x:1,y:0.85,z:0.73,w:1},
			Peru:{x:0.8,y:0.52,z:0.25,w:1},
			Pink:{x:1,y:0.75,z:0.8,w:1},
			Plum:{x:0.87,y:0.63,z:0.87,w:1},
			PowderBlue:{x:0.69,y:0.88,z:0.9,w:1},
			Purple:{x:0.5,y:0,z:0.5,w:1},
			RebeccaPurple:{x:0.4,y:0.2,z:0.6,w:1},
			Red:{x:1,y:0,z:0,w:1},
			RosyBrown:{x:0.74,y:0.56,z:0.56,w:1},
			RoyalBlue:{x:0.25,y:0.41,z:0.88,w:1},
			SaddleBrown:{x:0.55,y:0.27,z:0.07,w:1},
			Salmon:{x:0.98,y:0.5,z:0.45,w:1},
			SandyBrown:{x:0.96,y:0.64,z:0.38,w:1},
			SeaGreen:{x:0.18,y:0.55,z:0.34,w:1},
			SeaShell:{x:1,y:0.96,z:0.93,w:1},
			Sienna:{x:0.63,y:0.32,z:0.18,w:1},
			Silver:{x:0.75,y:0.75,z:0.75,w:1},
			SkyBlue:{x:0.53,y:0.81,z:0.92,w:1},
			SlateBlue:{x:0.42,y:0.35,z:0.8,w:1},
			SlateGray:{x:0.44,y:0.5,z:0.56,w:1},
			SlateGrey:{x:0.44,y:0.5,z:0.56,w:1},
			Snow:{x:1,y:0.98,z:0.98,w:1},
			SpringGreen:{x:0,y:1,z:0.5,w:1},
			SteelBlue:{x:0.27,y:0.51,z:0.71,w:1},
			Tan:{x:0.82,y:0.71,z:0.55,w:1},
			Teal:{x:0,y:0.5,z:0.5,w:1},
			Thistle:{x:0.85,y:0.75,z:0.85,w:1},
			Tomato:{x:1,y:0.39,z:0.28,w:1},
			Turquoise:{x:0.25,y:0.88,z:0.82,w:1},
			Violet:{x:0.93,y:0.51,z:0.93,w:1},
			Wheat:{x:0.96,y:0.87,z:0.7,w:1},
			White:{x:1,y:1,z:1,w:1},
			WhiteSmoke:{x:0.96,y:0.96,z:0.96,w:1},
			Yellow:{x:1,y:1,z:0,w:1},
			YellowGreen:{x:0.6,y:0.8,z:0.2,w:1}
		};
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