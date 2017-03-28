svg3d.xInfinite = 600;
svg3d.yInfinite = 10;
svg3d.xOrigin = 600;
svg3d.yOrigin = 10;
//zRatio = 20;

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
				layer: 100,
				y: -50,
				z: 50,
				nb: 40,
				symbolize: 1
			}
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
		},
		done : function(animation, jumpedToEnd) {
			var htmlAxes = '<g id="axesAdded">';
			htmlAxes += '<path id="axeXAdded" z:threeD="true" d="M100,100,0L-100,100,0z" style="fill: red; stroke-width: 1px; stroke: red"/>';
			htmlAxes += '<path id="axeYAdded" z:threeD="true" d="M100,100,0L100,45,0z" style="fill: blue; stroke-width: 1px; stroke: blue"/>';
			htmlAxes += '<path id="axeZAdded" z:threeD="true" d="M100,45,0L100,45,450z" style="fill: green; stroke-width: 1px; stroke: green"/>';
			htmlAxes += '</g>';
			document.getElementById("svg2").innerHTML += htmlAxes;
			var axeXAdded = svg3d.shapeFactory(document.getElementById("axeXAdded"));
  			var axeZAdded = svg3d.shapeFactory(document.getElementById("axeZAdded"));
			var axeYAdded = svg3d.shapeFactory(document.getElementById("axeYAdded"));
			var matrixArray = [svg3d.setTranslationMatrix(520, 275, 0)];
  			axeXAdded.transform(matrixArray);
  			axeYAdded.transform(matrixArray);
  			axeZAdded.transform(matrixArray);
  			document.getElementById("axesAdded").innerHTML += '<text><textPath xlink:href="#axeXAdded" startOffset="20%"><tspan dy="-10">X axes text</tspan></textPath></text>';
  			document.getElementById("axesAdded").innerHTML += '<text><textPath xlink:href="#axeYAdded"><tspan dy="15">Y text</tspan></textPath></text>';
  			document.getElementById("axesAdded").innerHTML += '<text><textPath xlink:href="#axeZAdded" startOffset="20%"><tspan dy="15">Z axes text</tspan></textPath></text>';
		}
 	});
	
});
