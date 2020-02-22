function bytes(type) {
	switch(type) {
		case gl.FLOAT: case gl.UNSIGNED_INT: return 4;
		case gl.BYTE: return 1;
	}
}