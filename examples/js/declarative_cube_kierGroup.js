svg3d.xInfinite = 600;
svg3d.yInfinite = 300;
svg3d.xOrigin = 500;
svg3d.yOrigin = 100;
//zRatio = 20;
//svg3d.sortAlgo = svg3d.AVERAGE_Z;

$( document ).ready(function() {
	$("#g1").animate({
		svg3d: {
			clone3d: {
				row: 2,
				x: 200,
				layer: 4,
				y: -50,
				z: 200,
				nb: 4
			},
			matrix3ds: [svg3d.setTranslationMatrix(-100, -100, -100), svg3d.setAnglesRotationMatrix(Math.PI/10, Math.PI/10, Math.PI/10), svg3d.setTranslationMatrix(100, 100, 100)]
		}
	}, {
		duration: 3000, 
		easing: "easeInOutCubic",
		specialEasing: {
			yInfinite: "easeInCubic",
			yOrigin: "easeInCubic"
		}
 	});
	
});
