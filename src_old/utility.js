// gives byte amount of different WebGL types
function bytes(type) {
	switch(type) {
		case gl.FLOAT: case gl.UNSIGNED_INT: return 4;
		case gl.BYTE: return 1;
	}
}
// get the mouse position in the form of a Vec2
function getMousePos(e) {
	const rect = HBCanvas.getBoundingClientRect(), root = document.body;
	return [e.clientX-rect.left-root.scrollLeft, e.clientY-rect.top-root.scrollTop];
}