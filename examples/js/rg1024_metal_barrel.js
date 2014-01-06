xInfinite = 600;
yInfinite = 10;
xOrigin = 600;
yOrigin = 10;
//zRatio = 20;
sortAlgo = AVERAGE_Z;

$( document ).ready(function() {
	var shapeAxex = shapeFactory(document.getElementById("axex"));
	shapeAxex.transform([setTranslationMatrix(0, 0, 0)]);
	var shapeAxey = shapeFactory(document.getElementById("axey"));
	shapeAxey.transform([setTranslationMatrix(0, 0, 0)]);
	var shapeAxez = shapeFactory(document.getElementById("axez"));
	shapeAxez.transform([setTranslationMatrix(0, 0, 0)]);
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
		}
	}, {
		duration: 1000, 
		easing: "easeInCubic"
 	});
	
});
