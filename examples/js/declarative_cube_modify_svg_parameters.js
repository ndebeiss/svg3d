var updateOriginAndInfinite = function() {
	var origin = document.getElementById("origin");
    origin.setAttribute("cx", svg3d.xOrigin);
    origin.setAttribute("cy", svg3d.yOrigin);
    var infinite = document.getElementById("infinite");
    infinite.setAttribute("cx", svg3d.xInfinite);
    infinite.setAttribute("cy", svg3d.yInfinite);
}

var rotate = function() {
    var t = new Date();
    var max = 4500;
    var ms = (t.getSeconds() % 10 * 1000 + t.getMilliseconds()) - max;
    //ms is contained between max - 1 and - max
    // a revolution is done in 10 secs
    svg3d.xInfinite = 0;
    svg3d.yInfinite = 0;
    //svg3d.xInfinite = Math.sin(ms * 2 * Math.PI / max) * 100 + 600;
    //svg3d.yInfinite = Math.cos(ms * 2 * Math.PI / max) * 100 + 500;
    //svg3d.xOrigin = Math.sin(ms * 2 * Math.PI / max) * -10 + 550;
    //svg3d.yOrigin = Math.cos(ms * 2 * Math.PI / max) * -10 + 450;
    svg3d.xOrigin = Math.sin(ms * 2 * Math.PI / max) * 120 - 200;
    svg3d.yOrigin = Math.cos(ms * 2 * Math.PI / max) * 120 - 200;
	updateOriginAndInfinite();
}

var rotateInterval;

var toggleRotate = function() {
	if (rotateInterval === undefined) {
		rotateInterval = window.setInterval(rotate, 50);
	} else {
		window.clearInterval(rotateInterval);
		rotateInterval = undefined;
	}
}
