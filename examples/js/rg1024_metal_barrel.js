svg3d.xInfinite = 600;
svg3d.yInfinite = 10;
svg3d.xOrigin = 600;
svg3d.yOrigin = 10;
//zRatio = 20;
svg3d.sortAlgo = svg3d.AVERAGE_Z;

$( document ).ready(function() {
	var shapeAxex = svg3d.shapeFactory(document.getElementById("axex"));
	shapeAxex.transform([svg3d.setTranslationMatrix(0, 0, 0)]);
	var shapeAxey = svg3d.shapeFactory(document.getElementById("axey"));
	shapeAxey.transform([svg3d.setTranslationMatrix(0, 0, 0)]);
	var shapeAxez = svg3d.shapeFactory(document.getElementById("axez"));
	shapeAxez.transform([svg3d.setTranslationMatrix(0, 0, 0)]);
	$("#layer1").animate({
		svg3d: {
			translate3d : {x: 400, y: 300, z: 0},
			clone3d: {
				row: 10,
				x: 50,
				surface: 100,
				y: -50,
				z: 50,
				nb: 40
			},
		},
		scaleInPlace: {
			scale: 1,
			xOrigin: 20,
			yOrigin: 15
		},
		yInfinite: -400,
		yOrigin: -400
	}, {
		duration: 3000, 
		easing: "easeInOutCubic",
		specialEasing: {
			yInfinite: "easeInCubic",
			yOrigin: "easeInCubic"
		}
 	});
	
});
