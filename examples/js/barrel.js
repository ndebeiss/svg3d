svg3d.xInfinite = 600;
svg3d.yInfinite = 10;
svg3d.xOrigin = 600;
svg3d.yOrigin = 10;
//zRatio = 20;
svg3d.sortAlgo = svg3d.AVERAGE_Z;

$( document ).ready(function() {
	$("#barrel").animate({
		scaleInPlace: {
			scale: 10,
			xOrigin: 530,
			yOrigin: 415
		},
		translate: {
			x: -10,
			y: -10
		}
	}, {
		duration: 3000, 
		easing: "easeInCubic"
 	});
	
});
