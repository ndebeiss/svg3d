svg3d.xInfinite = 1000;
svg3d.yInfinite = 10;
svg3d.xOrigin = 1000;
svg3d.yOrigin = 10;
svg3d.sortAlgo = svg3d.AVERAGE_Z;

$( document ).ready(function() {
	var shapeAxex = svg3d.shapeFactory(document.getElementById("axex"));
	shapeAxex.transform([svg3d.setTranslationMatrix(0, 0, 0)]);
	var shapeAxey = svg3d.shapeFactory(document.getElementById("axey"));
	shapeAxey.transform([svg3d.setTranslationMatrix(0, 0, 0)]);
	var shapeAxez = svg3d.shapeFactory(document.getElementById("axez"));
	shapeAxez.transform([svg3d.setTranslationMatrix(0, 0, 0)]);
	$("#layer1").each(function( index, elm ) {
		elm.svg3dCloneGeographicDistribution = function(cloneIndex, clone3drow, clone3dlayer, clone3dx, clone3dy, clone3dz) {
			var layer = Math.floor( cloneIndex / clone3dlayer );
			var row = Math.floor( ( cloneIndex % clone3dlayer ) / clone3drow);
			var z = Math.floor( ( ( cloneIndex % clone3dlayer ) % clone3drow ) );
			return {incx: clone3dx * row,
					incy: clone3dy * layer,
					incz: clone3dz * z};
		};
	});
	$("#layer1").animate({
		svg3d: {
			translate3d : {x: 200, y: 300, z: 0},
			clone3d: {
				row: 10,
				x: 200,
				layer: 100,
				y: -50,
				z: 200,
				nb: 20
			},
		},
		scaleInPlace: {
			scale: 1,
			xOrigin: 20,
			yOrigin: 15
		}
	}, {
		duration: 3000, 
		easing: "easeInOutCubic"
 	});
	
});
