/**
 * Randomizer class that's seedable with a random integer (mulberry32 by Tommy Ettinger, under public domain).
 * @alias HB.Math.SeededRandom
 * @memberof HB
 */
class SeededRandom{
	/**
	 * Create a new randomizer with a seed to extract values from.
	 * @param {number} seed - Integer to use as seed, defaults to current time in milliseconds.
	 * @param {boolean} integer - Whether to return integers or floats.
	 */
	constructor(seed = new Date().getTime(), integer = false) {
		this.t = seed + 0x6D2B79F;
		this.integer = integer;
	}

	/**
	 * Get a random value.
	 * @param {number} low=0 - The lowest value to return (inclusive).
	 * @param {number} high=1 - The highest value to return (exclusive), if 'integer' is true, this will default to the unsigned 32-bit integer max (4294967296).
	 * @param {boolean} integer=this.integer - Whether to return integers or floats, defaults to the value set in the constructor.
	 * @returns {number}
	 */
	value(low, high, integer = this.integer) {
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

/**
 * Simple Noise class, (can't remember where I got it from, however, it seems really similar to [this]{@link https://www.scratchapixel.com/lessons/procedural-generation-virtual-worlds/procedural-patterns-noise-part-1/creating-simple-1D-noise} and [this]{@link https://www.michaelbromley.co.uk/blog/simple-1d-noise-in-javascript/}).
 * @alias HB.Math.Noise
 * @memberof HB
 */
class Noise{
	/**
	 * Create a new Noise class.
	 * @param {number} amp - The amplitude of the noise.
	 * @param {number} scl - The scale of the noise.
	 */
	constructor(amp = 1, scl = 0.05) {
		this.vertices = 256, this.amp = amp, this.scl = scl, this.r = [];
		for(let i = 0; i < this.vertices; i++) this.r.push(Math.random());
	}

	/**
	 * Get the noise value at a specific value.
	 * @param {number} x - The value.
	 * @returns {number}
	 */
	value(x) {
		const sclX = x*this.scl, floorX = Math.floor(sclX), t = sclX-floorX;
		const xMin = floorX & this.vertices-1, xMax = (xMin + 1) & this.vertices-1;
		return HBMath.lerp(this.r[xMin], this.r[xMax], t*t*(3-2*t)) * this.amp;
	}
}

/**
 * Method to initialize the zero and one vectors, and assign {@link HB.SeededRandom} and {@link HB.Noise} to {@link HB.Math}.
 * @memberof HB
 */
function initMathObjects() {
	Vec2.init();
	Vec3.init();
	Vec4.init();
	HBMath.SeededRandom = SeededRandom;
	HBMath.Noise = Noise;
}

/**
 * The class that encompasses some useful static mathematical methods.
 * @alias HB.Math
 * @memberof HB
 */
class HBMath{
	/**
	 * Method to convert cartesian degrees to radians.
	 * @param {number} degrees - The amount of degrees to convert.
	 * @returns {number}
	 */
	static radians(degrees) {
		return degrees*(Math.PI/180);
	}
	/**
	 * Method to convert radians to cartesian degrees.
	 * @param {number} degrees - The amount of radians to convert.
	 * @returns {number}
	 */
	static degrees(radians) { // convert radians to degrees
		return radians*(180/Math.PI);
	}
	/**
	 * Method to get the distance between two 2D points.
	 * @param {number} x1 - X-coordinate of the first point.
	 * @param {number} y1 - Y-coordinate of the first point.
	 * @param {number} x2 - X-coordinate of the second point.
	 * @param {number} y2 - Y-coordinate of the second point.
	 * @returns {number}
	 */
	static dist(x1, y1, x2, y2) { // gets distance between 2 x+y pairs
		return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
	}
	/**
	 * Method to map a number to another range.
	 * @param {number} value - The value to map.
	 * @param {number} valLow - The minimum of value.
	 * @param {number} valHigh - The maximum of value.
	 * @param {number} resLow - The minimum value of the result.
	 * @param {number} resHigh - The maximum value of the result.
	 * @returns {number}
	 */
	static map(value, valLow, valHigh, resLow, resHigh) {
		return resLow + (resHigh - resLow) * (value - valLow) / (valHigh - valLow);
	}
	/**
	 * Utility method to get a random floating point value in a range, instead of 'Math.random' which only does 0-1.
	 * @param {number} low=0 - The minimum resulting value (inclusive).
	 * @param {number} high=1 - The maximum resulting value (exclusive).
	 * @returns {number}
	 */
	static random(low, high) {
		if(high !== undefined) {
			return Math.random() * (high-low) + low;
		} else if(low !== undefined) {
			return Math.random() * low;
		} else {
			return Math.random();
		}
	}
	/**
	 * Utility method to get a random integer in a range, instead of 'Math.random' which only does floats 0-1.
	 * @param {number} low=0 - The minimum resulting value (inclusive).
	 * @param {number} high=1 - The maximum resulting value (exclusive).
	 * @returns {number}
	 */
	static randomInt(low, high) {
		return Math.floor(this.random(low, high));
	}
	/**
	 * Linear interpolation method.
	 * @param {number} start - Value to interpolate from.
	 * @param {number} end - Value to interpolate to.
	 * @param {number} amt - Amount to interpolate by.
	 * @returns {number}
	 */
	static lerp(start, end, amt) {
		return start+amt*(end-start);
	}
	/**
	 * Method to constrain a value in a range.
	 * @param {number} value - Value to constrain.
	 * @param {number} min - Minimum to constrain to.
	 * @param {number} max - Maximum to constrain to.
	 * @returns {number} Original value if it is not constrained.
	 */
	static constrain(value, min, max) {
		if(value > max) {
			return max;
		} else if(value < min) {
			return min;
		} else {
			return value;
		}
	}
	/**
	 * Method to wrap a value once it is too big or small.
	 * @param {number} value - Value to wrap.
	 * @param {number} min - Minimum to wrap around.
	 * @param {number} max - Maximum to wrap around.
	 * @returns {number} Original value if it is not wrapped.
	 */
	static wrap(value, min, max) {
		if(value > max) {
			return min;
		} else if(value < min) {
			return max;
		} else {
			return value;
		}
	}
	/**
	 * Method to check for a collision between two axis-aligned rectangles.
	 * @param {HB.Vec2} vectorA - Position of the first rectangle.
	 * @param {HB.Vec2} sizeA - Size of the first rectangle.
	 * @param {HB.Vec2} vectorB - Position of the second rectangle.
	 * @param {HB.Vec2} sizeB - Size of the second rectangle.
	 * @returns {boolean} true if colliding.
	 */
	static rectRectCollision(vectorA, sizeA, vectorB, sizeB) {
		return (
			Math.abs((vectorA.x+sizeA.x/2)-(vectorB.x+sizeB.x/2))*2 < (sizeA.x+sizeB.x)
		) && (
			Math.abs((vectorA.y+sizeA.y/2)-(vectorB.y+sizeB.y/2))*2 < (sizeA.y+sizeB.y)
		);
	}
	/**
	 * Method to check for a collision between an axis-aligned rectangle and a circle.
	 * @param {HB.Vec2} rectPos - Position of the rectangle.
	 * @param {HB.Vec2} rectSize - Size of the rectangle.
	 * @param {HB.Vec2} circleCenter - Position of the center of the circle.
	 * @param {number} circleRadius - Radius of the circle.
	 * @returns {boolean} true if colliding.
	 */
	static rectCircleCollision(rectPos, rectSize, circleCenter, circleRadius) {
		const dx = circleCenter.x-Math.max(rectPos.x, Math.min(circleCenter.x, rectPos.x+rectSize.x));
		const dy = circleCenter.y-Math.max(rectPos.y, Math.min(circleCenter.y, rectPos.y+rectSize.y));
		return (dx*dx + dy*dy) < circleRadius*circleRadius;
	}
}

/**
 * 2D vector class.
 * @memberof HB
 */
class Vec2{
	/**
	 * Since static class properties are not widely supported, an init function is needed to set the 'zero' and 'one' vector. Is called automatically by {@link HB.initMathObjects}.
	 */
	static init() {
		Vec2.zero = {x: 0, y: 0};
		Vec2.one = {x: 1, y: 1};
	}

	/**
	 * Use this for creating a new vector.
	 * @param {number} x - The X-coordinate.
	 * @param {number} y - The Y-coordinate.
	 * @returns {Object} A new object with 'x' and 'y' properties.
	 */
	static new(x = 0, y = 0) { return { x: x, y: y }; }
	/**
	 * This method clones a vector.
	 * @param {Object} vector - The vector to clone 'x' and 'y' from.
	 * @returns {Object} A new object with 'x' and 'y' properties.
	 */
	static fromVec2(vector) { return { x: vector.x, y: vector.y }; }
	/**
	 * This method creates a vector from a radian angle.
	 * @param {Object} angle - The angle to create a vector from.
	 * @param {number} radius - The magnitude of the vector.
	 * @returns {Object} A new object with 'x' and 'y' properties.
	 */
	static fromAngle(angle, radius = 1) { return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }; }
	/**
	 * This method copies a vector into another.
	 * @param {Object} out - The vector to copy into.
	 * @param {Object} vector - The vector to copy.
	 */
	static copy(out, vector) { out.x = vector.x, out.y = vector.y; }
	/**
	 * This method sets the values of a vector.
	 * @param {Object} out - The vector to set the values of.
	 * @param {number} x - The X-coordinate to set.
	 * @param {number} y - The Y-coordinate to set.
	 */
	static set(out, x, y) { out.x = x, out.y = y; }

	/**
	 * This method adds values to a vector.
	 * @param {Object} out - The vector to add to.
	 * @param {number} x - The X value to add.
	 * @param {number} y - The Y value to add.
	 */
	static add(out, x, y) { out.x += x, out.y += y; }
	/**
	 * This method adds values of a vector to another vector.
	 * @param {Object} out - The vector to add to.
	 * @param {Object} vector - The vector with values to add.
	 */
	static addVec2(out, vector) { out.x += vector.x, out.y += vector.y; }
	/**
	 * This method adds a value to all properties of a vector.
	 * @param {Object} out - The vector to add to.
	 * @param {number} scalar - The value to add.
	 */
	static addScalar(out, scalar) { out.x += scalar, out.y += scalar; }

	/**
	 * This method subtracts values from a vector.
	 * @param {Object} out - The vector to subtract from.
	 * @param {number} x - The X value to subtract.
	 * @param {number} y - The Y value to subtract.
	 */
	static subtract(out, x, y) { out.x -= x, out.y -= y; }
	/**
	 * This method subtracts values of a vector from another vector.
	 * @param {Object} out - The vector to subtract from.
	 * @param {Object} vector - The vector with values to subtract.
	 */
	static subtractVec2(out, vector) { out.x -= vector.x, out.y -= vector.y; }
	/**
	 * This method subtracts a value from all properties of a vector.
	 * @param {Object} out - The vector to subtract from.
	 * @param {number} scalar - The value to subtract.
	 */
	static subtractScalar(out, scalar) { out.x -= scalar, out.y -= scalar; }

	/**
	 * This method multiplies a vector by values.
	 * @param {Object} out - The vector to multiply.
	 * @param {number} x - The X value to multiply by.
	 * @param {number} y - The Y value to multiply by.
	 */
	static multiply(out, x, y) { out.x *= x, out.y *= y; }
	/**
	 * This method multiplies values of a vector by another vector.
	 * @param {Object} out - The vector to multiply.
	 * @param {Object} vector - The vector with values to multiply by.
	 */
	static multiplyVec2(out, vector) { out.x *= vector.x, out.y *= vector.y; }
	/**
	 * This method multiplies all properties of a vector by the same value.
	 * @param {Object} out - The vector to multiply.
	 * @param {number} scalar - The value to multiply by.
	 */
	static multiplyScalar(out, scalar) { out.x *= scalar, out.y *= scalar; }

	/**
	 * This method divides a vector by values.
	 * @param {Object} out - The vector to divide.
	 * @param {number} x - The X value to divide by.
	 * @param {number} y - The Y value to divide by.
	 */
	static divide(out, x, y) { out.x /= x, out.y /= y; }
	/**
	 * This method divides values of a vector by another vector.
	 * @param {Object} out - The vector to divide.
	 * @param {Object} vector - The vector with values to divide by.
	 */
	static divideVec2(out, vector) { out.x /= vector.x, out.y /= vector.y; }
	/**
	 * This method divides all properties of a vector by the same value.
	 * @param {Object} out - The vector to divide.
	 * @param {number} scalar - The value to divide by.
	 */
	static divideScalar(out, scalar) { out.x /= scalar, out.y /= scalar; }

	/**
	 * Method to constrain a vector in ranges.
	 * @param {number} out - Vector to constrain.
	 * @param {number} lowX - Minimum to constrain X to.
	 * @param {number} hiX - Maximum to constrain X to.
	 * @param {number} lowY - Minimum to constrain Y to.
	 * @param {number} hiY - Maximum to constrain Y to.
	 * @see {@link HB.Math.constrain}
	 */
	static constrain(out, lowX, hiX, lowY, hiY) {
		out.x = HBMath.constrain(out.x, lowX, hiX);
		out.y = HBMath.constrain(out.y, lowY, hiY);
	}

	/**
	 * Method to get the angle between two vectors.
	 * @param {Object} vectorA - First vector.
	 * @param {Object} vectorB - Second vector.
	 * @returns {number} Angle in radians between the vectors.
	 */
	static angleBetweenVec2(vectorA, vectorB) {
		return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
	}

	/**
	 * Method to get the distance between two vectors.
	 * @param {Object} vectorA - First vector.
	 * @param {Object} vectorB - Second vector.
	 * @returns {number} Distance between the vectors.
	 */
	static distBetweenVec2(vectorA, vectorB) {
		return Math.sqrt((vectorB.x-vectorA.x)*(vectorB.x-vectorA.x) + (vectorB.y-vectorA.y)*(vectorB.y-vectorA.y));
	}

	/**
	 * Method to check if a vector is within a rectangle.
	 * @param {Object} vector - The vector.
	 * @param {Object} rectPos - Vector with the top-left position of the rectangle.
	 * @param {Object} rectSize - Vector with the size of the rectangle.
	 * @returns {boolean} True if colliding.
	 */
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

/**
 * 3D vector class.
 * @memberof HB
 */
class Vec3{
	/**
	 * Since static class properties are not widely supported, an init function is needed to set the 'zero' and 'one' vector. Is called automatically by {@link HB.initMathObjects}.
	 */
	static init() {
		Vec3.zero = { x: 0, y: 0, z: 0 };
		Vec3.one = { x: 1, y: 1, z: 1 };
	}

	/**
	 * Use this for creating a new vector.
	 * @param {number} x - The X-coordinate.
	 * @param {number} y - The Y-coordinate.
	 * @param {number} z - The Z-coordinate.
	 * @returns {Object} A new object with 'x', 'y' and 'z' properties.
	 */
	static new(x = 0, y = 0, z = 0) { return { x: x, y: y, z: z }; }
	/**
	 * This method clones a vector.
	 * @param {Object} vector - The vector to clone 'x', 'y' and 'z' from.
	 * @returns {Object} A new object with 'x', 'y' and 'z' properties.
	 */
	static fromVec3(vector) { return { x: vector.x, y: vector.y, z: vector.z }; }
	/**
	 * This method copies a vector into another.
	 * @param {Object} out - The vector to copy into.
	 * @param {Object} vector - The vector to copy.
	 */
	static copy(out, vector) { out.x = vector.x, out.y = vector.y, out.z = vector.z; }
	/**
	 * This method sets the values of a vector.
	 * @param {Object} out - The vector to set the values of.
	 * @param {number} x - The X-coordinate to set.
	 * @param {number} y - The Y-coordinate to set.
	 * @param {number} z - The Z-coordinate to set.
	 */
	static set(out, x, y, z) { out.x = x, out.y = y, out.z = z; }

	/**
	 * This method adds values to a vector.
	 * @param {Object} out - The vector to add to.
	 * @param {number} x - The X value to add.
	 * @param {number} y - The Y value to add.
	 * @param {number} z - The Z value to add.
	 */
	static add(out, x, y, z) { out.x += x, out.y += y, out.z += z; }
	/**
	 * This method adds values of a vector to another vector.
	 * @param {Object} out - The vector to add to.
	 * @param {Object} vector - The vector with values to add.
	 */
	static addVec3(out, vector) { out.x += vector.x, out.y += vector.y, out.z += vector.z; }
	/**
	 * This method adds a value to all properties of a vector.
	 * @param {Object} out - The vector to add to.
	 * @param {number} scalar - The value to add.
	 */
	static addScalar(out, scalar) { out.x += scalar, out.y += scalar, out.z += scalar; }

	/**
	 * This method subtracts values from a vector.
	 * @param {Object} out - The vector to subtract from.
	 * @param {number} x - The X value to subtract.
	 * @param {number} y - The Y value to subtract.
	 * @param {number} z - The Z value to subtract.
	 */
	static subtract(out, x, y, z) { out.x -= x, out.y -= y, out.z -= z; }
	/**
	 * This method subtracts values of a vector from another vector.
	 * @param {Object} out - The vector to subtract from.
	 * @param {Object} vector - The vector with values to subtract.
	 */
	static subtractVec3(out, vector) { out.x -= vector.x, out.y -= vector.y, out.z -= vector.z; }
	/**
	 * This method subtracts a value from all properties of a vector.
	 * @param {Object} out - The vector to subtract from.
	 * @param {number} scalar - The value to subtract.
	 */
	static subtractScalar(out, scalar) { out.x -= scalar, out.y -= scalar, out.z -= scalar; }

	/**
	 * This method multiplies a vector by values.
	 * @param {Object} out - The vector to multiply.
	 * @param {number} x - The X value to multiply by.
	 * @param {number} y - The Y value to multiply by.
	 * @param {number} z - The Z value to multiply by.
	 */
	static multiply(out, x, y, z) { out.x *= x, out.y *= y, out.z *= z; }
	/**
	 * This method multiplies values of a vector by another vector.
	 * @param {Object} out - The vector to multiply.
	 * @param {Object} vector - The vector with values to multiply by.
	 */
	static multiplyVec3(out, vector) { out.x *= vector.x, out.y *= vector.y, out.z *= vector.z; }
	/**
	 * This method multiplies all properties of a vector by the same value.
	 * @param {Object} out - The vector to multiply.
	 * @param {number} scalar - The value to multiply by.
	 */
	static multiplyScalar(out, scalar) { out.x *= scalar, out.y *= scalar, out.z *= scalar; }

	/**
	 * This method divides a vector by values.
	 * @param {Object} out - The vector to divide.
	 * @param {number} x - The X value to divide by.
	 * @param {number} y - The Y value to divide by.
	 */
	static divide(out, x, y, z) { out.x /= x, out.y /= y, out.z /= z; }
	/**
	 * This method divides values of a vector by another vector.
	 * @param {Object} out - The vector to divide.
	 * @param {Object} vector - The vector with values to divide by.
	 */
	static divideVec3(out, vector) { out.x /= vector.x, out.y /= vector.y, out.z /= vector.z; }
	/**
	 * This method divides all properties of a vector by the same value.
	 * @param {Object} out - The vector to divide.
	 * @param {number} scalar - The value to divide by.
	 */
	static divideScalar(out, scalar) { out.x /= scalar, out.y /= scalar, out.z /= scalar; }
}

/**
 * 4D vector class.
 * @memberof HB
 */
class Vec4{
	/**
	 * Since static class properties are not widely supported, an init function is needed to set the 'zero' and 'one' vector. Is called automatically by {@link HB.initMathObjects}.
	 * Also sets {@link HB.Vec4.colors}, an object with all of the HTML colors indexed by name, see [W3Schools]{@link https://www.w3schools.com/colors/colors_names.asp}.
	 */
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

	/**
	 * Use this for creating a new vector.
	 * @param {number} x - The X-coordinate.
	 * @param {number} y - The Y-coordinate.
	 * @param {number} z - The Z-coordinate.
	 * @param {number} w - The W-coordinate.
	 * @returns {Object} A new object with 'x', 'y', 'z' and 'w' properties.
	 */
	static new(x = 0, y = 0, z = 0, w = 0) { return { x: x, y: y, z: z, w: w }; }
	/**
	 * This method sets the values of a vector.
	 * @param {Object} out - The vector to set the values of.
	 * @param {number} x - The X-coordinate to set.
	 * @param {number} y - The Y-coordinate to set.
	 * @param {number} z - The Z-coordinate to set.
	 * @param {number} w - The W-coordinate to set.
	 */
	static set(out, x, y, z, w) { out.x = x, out.y = y, out.z = z, out.w = w; }

	/**
	 * This method multiplies values of a vector by a matrix.
	 * @param {Object} out - The vector to multiply into.
	 * @param {Object} vector - The vector with values to multiply the matrix by.
	 * @param {Object} matrix - The matrix with values to multiply.
	 * @returns {Object} The out vector.
	 */
	static multMat4(out, vector, matrix) {
		out.x = (vector.x * matrix.aa) + (vector.y * matrix.ba) + (vector.z * matrix.ca) + (vector.w * matrix.da);
		out.y = (vector.x * matrix.ab) + (vector.y * matrix.bb) + (vector.z * matrix.cb) + (vector.w * matrix.db);
		out.z = (vector.x * matrix.ac) + (vector.y * matrix.bc) + (vector.z * matrix.cc) + (vector.w * matrix.dc);
		out.w = (vector.x * matrix.ad) + (vector.y * matrix.bd) + (vector.z * matrix.cd) + (vector.w * matrix.dd);

		return out;
	}
}

/**
 * 4x4 matrix class.
 * @memberof HB
 */
class Mat4{
	/**
	 * Use this for creating a new matrix.
	 * @param {number} identity - Value to use in 'aa', 'bb', 'cc' and 'dd'.
	 * @returns {Object} A new object with 'aa' - 'dd' properties, first letter for row and second for column.
	 */
	static new(identity = 0) {
		return {
			aa: identity, ab: 0, ac: 0, ad: 0,
			ba: 0, bb: identity, bc: 0, bd: 0,
			ca: 0, cb: 0, cc: identity, cd: 0,
			da: 0, db: 0, dc: 0, dd: identity
		};
	}
	/**
	 * This method clones a matrix.
	 * @param {Object} matrix - The matrix to clone.
	 * @returns {Object} A new object with cloned 'aa' - 'dd' properties, first letter for row and second for column.
	 */
	static fromMat4(matrix) {
		return {
			aa: matrix.aa, ab: matrix.ab, ac: matrix.ac, ad: matrix.ad,
			ba: matrix.ba, bb: matrix.bb, bc: matrix.bc, bd: matrix.bd,
			ca: matrix.ca, cb: matrix.cb, cc: matrix.cc, cd: matrix.cd,
			da: matrix.da, db: matrix.db, dc: matrix.dc, dd: matrix.dd
		};
	}
	/**
	 * This method copies a matrix into another.
	 * @param {Object} out - The matrix to copy into.
	 * @param {Object} matrix - The matrix to copy.
	 * @returns {Object} The 'out' matrix.
	 */
	static copy(out, matrix) {
		out.aa = matrix.aa, out.ab = matrix.ab, out.ac = matrix.ac, out.ad = matrix.ad;
		out.ba = matrix.ba, out.bb = matrix.bb, out.bc = matrix.bc, out.bd = matrix.bd;
		out.ca = matrix.ca, out.cb = matrix.cb, out.cc = matrix.cc, out.cd = matrix.cd;
		out.da = matrix.da, out.db = matrix.db, out.dc = matrix.dc, out.dd = matrix.dd;

		return out;
	}

	/**
	 * This method transposes a matrix into another (switch the row-column configuration).
	 * @param {Object} out - The matrix to transpose into.
	 * @param {Object} matrix - The matrix to transpose.
	 * @returns {Object} The 'out' matrix.
	 */
	static transpose(out, matrix) {
		const temp = this.fromMat4(matrix);

		out.aa = temp.aa, out.ab = temp.ba, out.ac = temp.ca, out.ad = temp.da;
		out.ba = temp.ab, out.bb = temp.bb, out.bc = temp.cb, out.bd = temp.db;
		out.ca = temp.ac, out.cb = temp.bc, out.cc = temp.cc, out.cd = temp.dc;
		out.da = temp.ad, out.db = temp.bd, out.dc = temp.cd, out.dd = temp.dd;

		return out;
	}
	/**
	 * This method converts a matrix into an array.
	 * @param {Object} matrix - The matrix to convert.
	 * @returns {Array} An array with the matrix elements in [row-major order]{@link https://en.wikipedia.org/wiki/Row-_and_column-major_order}.
	 */
	static toArray(matrix) {
		return [
			matrix.aa, matrix.ab, matrix.ac, matrix.ad,
			matrix.ba, matrix.bb, matrix.bc, matrix.bd,
			matrix.ca, matrix.cb, matrix.cc, matrix.cd,
			matrix.da, matrix.db, matrix.dc, matrix.dd
		];
	}

	/**
	 * A method to create an orthographic projection matrix.
	 * @param {Object} out - The matrix to create the orthopgraphic projection into.
	 * @param {number} left - The left clipping plane.
	 * @param {number} right - The right clipping plane.
	 * @param {number} top - The top clipping plane.
	 * @param {number} bottom - The bottom clipping plane.
	 * @param {number} near=-1 - The near clipping plane.
	 * @param {number} far - The far clipping plane.
	 * @returns {Object} The 'out' matrix.
	 * @see [Wikipedia]{@link https://en.wikipedia.org/wiki/Orthographic_projection#Geometry}
	 */
	static orthographic(out, left, right, top, bottom, near = -1, far = 1) {
		const rl = right-left, tb = top-bottom, fn = far-near;

		out.aa = 2/rl, out.ab =    0, out.ac =     0, out.ad = -(right+left)/rl;
		out.ba =    0, out.bb = 2/tb, out.bc =     0, out.bd = -(top+bottom)/tb;
		out.ca =    0, out.cb =    0, out.cc = -2/fn, out.cd =   -(far+near)/fn;
		out.da =    0, out.db =    0, out.dc =     0, out.dd =                1;

		return out;
	}

	/**
	 * A method to create a perspective projection matrix.
	 * @ignore
	 * @param {Object} out - The matrix to create the perspective projection into.
	 * @param {number} FoV - The frustum Field of View.
	 * @param {number} aspect - The frustum aspect ratio.
	 * @param {number} near - The near clipping plane.
	 * @param {number} far - The far clipping plane.
	 * @returns {Object} The 'out' matrix.
	 * @see [Wikipedia]{@link https://en.wikipedia.org/wiki/3D_projection#Perspective_projection}
	 */
	// static perspective(out, FoV = 60, aspect = canvas.width/canvas.height, near = 0.01, far = 1000) {
	// 	const f = Math.tan(Math.PI * 0.5 - 0.5 * HBMath.radians(FoV));
	// 	const invRange = 1.0 / (near - far);

	// 	out.aa = f/aspect, out.ab =    0, out.ac =                   0, out.ad =  0;
	// 	out.ba =        0, out.bb =    f, out.bc =                   0, out.bd =  0;
	// 	out.ca =        0, out.cb =    0, out.cc = (near+far)*invRange, out.cd = -1;
	// 	out.da =        0, out.db =    0, out.dc = near*far*invRange*2, out.dd =  0;
	// }

	/**
	 * This method multiplies two matrices with eachother.
	 * @param {Object} out - The matrix to multiply into.
	 * @param {Object} matrixA - The matrix to multiply.
	 * @param {Object} matrixB - The matrix to multiply by.
	 * @returns {Object} The 'out' matrix.
	 */
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

	/**
	 * This method scales a matrix.
	 * @param {Object} out - The matrix to scale into.
	 * @param {Object} matrix - The matrix to scale.
	 * @param {Object} scale - The scale.
	 * @returns {Object} The 'out' matrix.
	 */
	static scale(out, matrix, scale) {
		return this.multMat4(out, matrix, {
			aa: scale, ab: 0, ac: 0, ad: 0,
			ba: 0, bb: scale, bc: 0, bd: 0,
			ca: 0, cb: 0, cc: scale, cd: 0,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
	/**
	 * This method translates a matrix.
	 * @param {Object} out - The matrix to translate into.
	 * @param {Object} matrix - The matrix to translate.
	 * @param {Object} vector3 - The XYZ-coordinates to translate by.
	 * @returns {Object} The 'out' matrix.
	 */
	static translate(out, matrix, vector3) {
		return this.multMat4(out, matrix, {
			aa: 1, ab: 0, ac: 0, ad: vector3.x,
			ba: 0, bb: 1, bc: 0, bd: vector3.y,
			ca: 0, cb: 0, cc: 1, cd: vector3.z,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
	/**
	 * This method rotates a matrix around a rotation axis.
	 * @param {Object} out - The matrix to rotate into.
	 * @param {Object} matrix - The matrix to rotate.
	 * @param {Object} up - The 3D vector that points upward (rotation axis).
	 * @param {Object} angle - The radian angle to rotate by.
	 * @returns {Object} The 'out' matrix.
	 */
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
	/**
	 * This method rotates a matrix around the X-axis.
	 * @param {Object} out - The matrix to rotate into.
	 * @param {Object} matrix - The matrix to rotate.
	 * @param {Object} angle - The radian angle to rotate by.
	 * @returns {Object} The 'out' matrix.
	 */
	static rotateX(out, matrix, angle) {
		return this.multMat4(out, matrix, {
			aa: 1, ab: 0, ac: 0, ad: 0,
			ba: 0, bb: Math.cos(-angle), bc: Math.sin(angle), bd: 0,
			ca: 0, cb: Math.sin(-angle), cc: Math.cos(-angle), cd: 0,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
	/**
	 * This method rotates a matrix around the Y-axis.
	 * @param {Object} out - The matrix to rotate into.
	 * @param {Object} matrix - The matrix to rotate.
	 * @param {Object} angle - The radian angle to rotate by.
	 * @returns {Object} The 'out' matrix.
	 */
	static rotateY(out, matrix, angle) {
		return this.multMat4(out, matrix, {
			aa: Math.cos(-angle), ab: 0, ac: Math.sin(-angle), ad: 0,
			ba: 0, bb: 1, bc: 0, bd: 0,
			ca: Math.sin(angle), cb: 0, cc: Math.cos(-angle), cd: 0,
			da: 0, db: 0, dc: 0, dd: 1
		});
	}
	/**
	 * This method rotates a matrix around the Z-axis.
	 * @param {Object} out - The matrix to rotate into.
	 * @param {Object} matrix - The matrix to rotate.
	 * @param {Object} angle - The radian angle to rotate by.
	 * @returns {Object} The 'out' matrix.
	 */
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