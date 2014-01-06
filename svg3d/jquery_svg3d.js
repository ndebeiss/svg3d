(function($) {

var baseEasings = {};

$.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
	baseEasings[ name ] = function( p ) {
		return Math.pow( p, i + 2 );
	};
});

$.extend( baseEasings, {
	Sine: function ( p ) {
		return 1 - Math.cos( p * Math.PI / 2 );
	},
	Circ: function ( p ) {
		return 1 - Math.sqrt( 1 - p * p );
	},
	Elastic: function( p ) {
		return p === 0 || p === 1 ? p :
			-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
	},
	Back: function( p ) {
		return p * p * ( 3 * p - 2 );
	},
	Bounce: function ( p ) {
		var pow2,
			bounce = 4;

		while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
		return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
	}
});

$.each( baseEasings, function( name, easeIn ) {
	$.easing[ "easeIn" + name ] = easeIn;
	$.easing[ "easeOut" + name ] = function( p ) {
		return 1 - easeIn( 1 - p );
	};
	$.easing[ "easeInOut" + name ] = function( p ) {
		return p < 0.5 ?
			easeIn( p * 2 ) / 2 :
			1 - easeIn( p * -2 + 2 ) / 2;
	};
});

function addShapes(shapes, parentNode) {
    for (var node = getFirstChildElement(parentNode) ; node ; node = getNextSiblingElement(node)) {
		if (node.localName === "g") {
			addShapes(shapes, node);
		} else {
			var shape = shapeFactory(node);
			if (shape) {
				shapes.push(shape);
			}
		}
	}
}

function getNodes(returnedArr, parentNode) {
  for (var node = getFirstChildElement(parentNode) ; node ; node = getNextSiblingElement(node)) {
		if (node.localName === "g") {
			getNodes(returnedArr, node);
		} else {
			returnedArr.push(node);
		}
	}
}

function svg3dtransform(svg3dshapes, matrixArray) {
	var i = svg3dshapes.length;
	while (i--) {
		svg3dshapes[i].transform(matrixArray);
	}
}


var rExtractScale = /scale\(([^)]*)\)/;
var rReplaceScale = /scale\([^\)]*\)/;
var rExtractTranslatex = /translate\(([^),]*),[^)]*\)/;
var rExtractTranslatey = /translate\([^),]*,([^)]*)\)/;
var rReplaceTranslate = /translate\([^\)]*\)/;

function getTransformPart(elem, partName, extractRegexp) {
	var index, value, transformAttr = elem.getAttribute("transform");
	if (transformAttr == undefined) {
		return 0;
	}
	index = transformAttr.indexOf(partName);
	if (index === -1) {
		return 0;
	}
	value = extractRegexp.exec(transformAttr)[1];
	return parseFloat(value);
}

function setTransformPart(elem, value, partName, replaceRegexp, appendAfter) {
	var indexOfScale, i, transformAttr = elem.getAttribute("transform");
	if (transformAttr == undefined) {
		transformAttr = partName + "(" + value + ")";
	} else {
		indexOfScale = transformAttr.indexOf(partName);
		if (indexOfScale === -1) {
			if (appendAfter) {
				transformAttr = transformAttr + " " + partName + "(" + value + ")";
			} else {
				transformAttr = partName + "(" + value + ")" + " " + transformAttr;
			}
		} else {
			transformAttr = transformAttr.replace(replaceRegexp, partName + "(" + value + ")");
		}
	}
	elem.setAttribute("transform", transformAttr);
	if (elem.svg3dclones !== undefined) {
		i = elem.svg3dclones.length;
		while (i--) {
			elem.svg3dclones[i].setAttribute("transform", transformAttr);
		}
	}
}

function sortClones(elem) {
	if (elem.svg3dshapes.length > 0) {
		var indexArray = [], i = elem.svg3dclones.length, current, j, beforeElem = true, parentNode = elem.parentNode;
		// sort the clones by their z coordinates
		while (i--) {
			current = elem.svg3dclones[i];
			j = indexArray.length;
			while (j && elem.svg3dclones[indexArray[j - 1]].svg3dshapes[0].z > current.svg3dshapes[0].z) {
				//translates to the end
				indexArray[j] = indexArray[j - 1];
				j--;
			}
			//only dumps the index of the path
			indexArray[j] = i;
		}
		j = indexArray.length;
		while (j--) {
			current = elem.svg3dclones[indexArray[j]];
			if (beforeElem && current.svg3dshapes[0].z > elem.svg3dshapes[0].z) {
				parentNode.insertBefore(current, elem);
			} else {
				beforeElem = false;
				parentNode.appendChild(current);
			}
		}
	}
}


$(document).ready(function() {
	$.cssHooks[ "svg3d" ] = {
		expand: function( value ) {
			return {
				translate3dx : value.translate3d.x,
				translate3dy : value.translate3d.y,
				translate3dz : value.translate3d.z,
				clone3drow : value.clone3d.row,
				clone3dx : value.clone3d.x,
				clone3dsurface : value.clone3d.surface,
				clone3dy : value.clone3d.y,
				clone3dz : value.clone3d.z,
				clone3dNb : value.clone3d.nb,
				svg3d : 1
			};
		},
		set: function( elem, value ) {
			var objects = [];
			if (elem.svg3dshapes === undefined) {
				elem.svg3dshapes = [];
				addShapes(elem.svg3dshapes, elem);
			}
			var matrixArray = [];
			if (elem.translateMatrix !== undefined) {
				matrixArray.push(elem.translateMatrix);
			}
			svg3dtransform(elem.svg3dshapes, matrixArray);
			if (elem.svg3dclones !== undefined) {
				var i = elem.svg3dclones.length;
				while (i--) {
					var matrixArray4Clone = [];
					matrixArray4Clone.push(elem.svg3dclones[i].cloneMatrix);
					if (elem.translateMatrix !== undefined) {
						matrixArray4Clone.push(elem.translateMatrix);
					}
					svg3dtransform(elem.svg3dclones[i].svg3dshapes, matrixArray4Clone);
				}
				sortClones(elem);
			}
		}
	};
	$.cssHooks[ "translate3dx" ] = {
		set: function( elem, value ) {
			elem.translate3dx = value;
		}
	};
	$.cssHooks[ "translate3dy" ] = {
		set: function( elem, value ) {
			elem.translate3dy = value;
		}
	};
	$.cssHooks[ "translate3dz" ] = {
		set: function( elem, value ) {
			elem.translate3dz = value;
			elem.translateMatrix = setTranslationMatrix(elem.translate3dx, elem.translate3dy, elem.translate3dz);
		}
	};
	$.cssHooks[ "clone3dx" ] = {
		set: function( elem, value, end ) {
			elem.clone3dx = end;
		}

	};
	$.cssHooks[ "clone3drow" ] = {
		set: function( elem, value, end ) {
			elem.clone3drow = end;
		}

	};
	$.cssHooks[ "clone3dy" ] = {
		set: function( elem, value, end ) {
			elem.clone3dy = end;
		}

	};
	$.cssHooks[ "clone3dsurface" ] = {
		set: function( elem, value, end ) {
			elem.clone3dsurface = end;
		}

	};
	$.cssHooks[ "clone3dz" ] = {
		set: function( elem, value, end ) {
			elem.clone3dz = end;
		}

	};
	$.cssHooks[ "clone3dNb" ] = {
		set: function( elem, value ) {
			if (elem.svg3dclones === undefined) {
				elem.svg3dclones = [];
			}
			for (var i = elem.svg3dclones.length; i < value; i++) {
				var clone = $(elem).clone()[0];
				elem.svg3dclones.push(clone);
				if (clone.svg3dshapes === undefined) {
					clone.svg3dshapes = [];
					var j = elem.svg3dshapes.length;
					var nodes = [];
					getNodes(nodes, clone);
					while (j--) {
						var shapeCloned = elem.svg3dshapes[j].cloneOn(nodes[j]);
						clone.svg3dshapes.push(shapeCloned);						
					}
				}
				var surface = Math.floor( i / elem.clone3dsurface );
				var row = Math.floor( ( i % elem.clone3dsurface ) / elem.clone3drow);
				var z = Math.floor( ( ( i % elem.clone3dsurface ) % elem.clone3drow ) );
				clone.cloneMatrix = setTranslationMatrix(elem.clone3dx * row, elem.clone3dy * surface, elem.clone3dz * z);
			}
		}
	};
	$.cssHooks[ "scaleInPlace" ] = {
		expand: function( value ) {
			return {
				scaleInPlaceXOrigin : value.xOrigin,
				scaleInPlaceYOrigin : value.yOrigin,
				scaleInPlace : value.scale
			};
		},
		set: function( elem, value ) {
			var correctionTranslatex = elem.scaleInPlaceXOrigin, correctionTranslatey = elem.scaleInPlaceYOrigin;
			if (elem.translatex !== undefined) {
				correctionTranslatex += elem.translatex;
			}
			if (elem.translate3dx !== undefined) {
				correctionTranslatex += elem.translate3dx;
			}
			if (elem.translatey !== undefined) {
				correctionTranslatey += elem.translatey;
			}
			if (elem.translate3dy !== undefined) {
				correctionTranslatey += elem.translate3dy;
			}
			correctionTranslatex = correctionTranslatex * (1 - value);
			correctionTranslatey = correctionTranslatey * (1 - value);
			setTransformPart(elem, value, "scale", rReplaceScale);

			setTransformPart(elem, correctionTranslatex + ", " + correctionTranslatey, "translate", rReplaceTranslate);

		},
		get: function( elem ) {
			return getTransformPart(elem, "scale", rExtractScale);
		}
	};
	$.cssHooks[ "scaleInPlaceXOrigin" ] = {
		set: function( elem, value, end ) {
			elem.scaleInPlaceXOrigin = end;
		}
	};
	$.cssHooks[ "scaleInPlaceYOrigin" ] = {
		set: function( elem, value, end ) {
			elem.scaleInPlaceYOrigin = end;
		}
	};
	$.cssHooks[ "translate" ] = {
		expand: function( value ) {
			return {
				translatex : value.x,
				translatey : value.y,
				translate : 1
			};
		},
		set: function( elem, value ) {
			setTransformPart(elem, elem.translatex + ", " + elem.translatey, "translate", rReplaceTranslate);
		},
		get: function( elem ) {
			return getTransformPart(elem, "translate", rExtractTranslate);
		}
	};
	$.cssHooks[ "translatex" ] = {
		set: function( elem, value ) {
			elem.translatex = value;
		},
		get: function( elem ) {
			return getTransformPart(elem, "translate", rExtractTranslatex);
		}
	};
	$.cssHooks[ "translatey" ] = {
		set: function( elem, value ) {
			elem.translatey = value;
		},
		get: function( elem ) {
			return getTransformPart(elem, "translate", rExtractTranslatey);
		}
	};


	$.fx.step[ "translate3d" ] = function( fx ) {
		$.cssHooks[ "translate3d" ].set( fx.elem, fx.now );
	};
	$.fx.step[ "translate3dx" ] = function( fx ) {
		$.cssHooks[ "translate3dx" ].set( fx.elem, fx.now );
	};
	$.fx.step[ "translate3dy" ] = function( fx ) {
		$.cssHooks[ "translate3dy" ].set( fx.elem, fx.now );
	};
	$.fx.step[ "translate3dz" ] = function( fx ) {
		$.cssHooks[ "translate3dz" ].set( fx.elem, fx.now );
	};
	$.fx.step[ "clone3dx" ] = function( fx ) {
		$.cssHooks[ "clone3dx" ].set( fx.elem, fx.now, fx.end );	
	};
	$.fx.step[ "clone3drow" ] = function( fx ) {
		$.cssHooks[ "clone3drow" ].set( fx.elem, fx.now, fx.end );	
	};
	$.fx.step[ "clone3dy" ] = function( fx ) {
		$.cssHooks[ "clone3dy" ].set( fx.elem, fx.now, fx.end );	
	};
	$.fx.step[ "clone3dsurface" ] = function( fx ) {
		$.cssHooks[ "clone3dsurface" ].set( fx.elem, fx.now, fx.end );	
	};
	$.fx.step[ "clone3dz" ] = function( fx ) {
		$.cssHooks[ "clone3dz" ].set( fx.elem, fx.now, fx.end );	
	};
	$.fx.step[ "clone3dNb" ] = function( fx ) {
		$.cssHooks[ "clone3dNb" ].set( fx.elem, fx.now );	
	};
	$.fx.step[ "svg3d" ] = function( fx ) {
		$.cssHooks[ "svg3d" ].set( fx.elem, fx.now );	
	};
	$.fx.step[ "scaleInPlace" ] = function( fx ) {
		$.cssHooks[ "scaleInPlace" ].set( fx.elem, fx.now );	
	};
	$.fx.step[ "scaleInPlaceXOrigin" ] = function( fx ) {
		$.cssHooks[ "scaleInPlaceXOrigin" ].set( fx.elem, fx.now, fx.end );	
	};
	$.fx.step[ "scaleInPlaceYOrigin" ] = function( fx ) {
		$.cssHooks[ "scaleInPlaceYOrigin" ].set( fx.elem, fx.now, fx.end );	
	};
	$.fx.step[ "translate" ] = function( fx ) {
		$.cssHooks[ "translate" ].set( fx.elem, fx.now );	
	};
	$.fx.step[ "translatex" ] = function( fx ) {
		$.cssHooks[ "translatex" ].set( fx.elem, fx.now );	
	};
	$.fx.step[ "translatey" ] = function( fx ) {
		$.cssHooks[ "translatey" ].set( fx.elem, fx.now );	
	};
});

})(jQuery);
