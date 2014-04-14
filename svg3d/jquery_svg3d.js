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
	if (elem.svg3dshape !== undefined) {
		var indexArray = [], i = elem.svg3dclones.length, current, j, beforeElem = true, parentNode = elem.parentNode;
		// sort the clones by their z coordinates
		while (i--) {
			current = elem.svg3dclones[i];
			j = indexArray.length;
			while (j && elem.svg3dclones[indexArray[j - 1]].svg3dshape.z > current.svg3dshape.z) {
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
			if (beforeElem && current.svg3dshape.z > elem.svg3dshape.z) {
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
			var expanded = {};
            if (value.translate3d !== undefined) {
                expanded.translate3dx = value.translate3d.x;
                expanded.translate3dy = value.translate3d.y;
                expanded.translate3dz = value.translate3d.z;
            }
            if (value.clone3d !== undefined) {
                expanded.clone3drow = value.clone3d.row;
                expanded.clone3dx = value.clone3d.x;
                expanded.clone3dlayer = value.clone3d.layer;
                expanded.clone3dy = value.clone3d.y;
                expanded.clone3dz = value.clone3d.z;
                expanded.clone3dNb = value.clone3d.nb;
            }
            expanded.svg3d = 1;
            return expanded;
		},
		set: function( elem, value ) {
			var objects = [];
			if (elem.svg3dshape === undefined) {
				elem.svg3dshape = svg3d.shapeFactory(elem);
			}
			var matrixArray = [];
			if (elem.translateMatrix !== undefined) {
				matrixArray.push(elem.translateMatrix);
			} else {

			}
			elem.svg3dshape.transform(matrixArray);
			if (elem.svg3dclones !== undefined) {
				var i = elem.svg3dclones.length;
				while (i--) {
					var matrixArray4Clone = [];
					matrixArray4Clone.push(elem.svg3dclones[i].cloneMatrix);
					if (elem.translateMatrix !== undefined) {
						matrixArray4Clone.push(elem.translateMatrix);
					}
					elem.svg3dclones[i].svg3dshape.transform(matrixArray4Clone);
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
			elem.translateMatrix = svg3d.setTranslationMatrix(elem.translate3dx, elem.translate3dy, elem.translate3dz);
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
	$.cssHooks[ "clone3dlayer" ] = {
		set: function( elem, value, end ) {
			elem.clone3dlayer = end;
		}

	};
	$.cssHooks[ "clone3dz" ] = {
		set: function( elem, value, end ) {
			elem.clone3dz = end;
		}

	};
	$.cssHooks[ "clone3dNb" ] = {
		set: function( elem, value ) {
			var incx, incy, incz, clone, i, increments, layer, row, z;
			if (elem.svg3dclones === undefined) {
				elem.svg3dclones = [];
			}
			for (i = elem.svg3dclones.length; i < value; i++) {
				clone = $(elem).clone()[0];
				elem.svg3dclones.push(clone);
				if (clone.svg3dshape === undefined) {
					clone.svg3dshape = elem.svg3dshape.cloneOn(clone);
				}
				if (elem.svg3dCloneGeographicDistribution !== undefined) {
					increments = elem.svg3dCloneGeographicDistribution(i, elem.clone3drow, elem.clone3dlayer, elem.clone3dx, elem.clone3dy, elem.clone3dz);
					incx = increments.incx;
					incy = increments.incy;
					incz = increments.incz;
				} else {
					layer = Math.floor( i / elem.clone3dlayer );
					row = Math.floor( ( i % elem.clone3dlayer ) / elem.clone3drow);
					z = Math.floor( ( ( i % elem.clone3dlayer ) % elem.clone3drow ) );
					incx = elem.clone3dx * row;
					incy = elem.clone3dy * layer;
					incz = elem.clone3dz * z;
				}
				clone.cloneMatrix = svg3d.setTranslationMatrix(incx, incy, incz);
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
	$.cssHooks[ "xInfinite" ] = {
		set: function( elem, value ) {
			svg3d.xInfinite = value;
		},
		get: function( elem ) {
			return svg3d.xInfinite ;
		}
	};
	$.cssHooks[ "yInfinite" ] = {
		set: function( elem, value ) {
			svg3d.yInfinite = value;
		},
		get: function( elem ) {
			return svg3d.yInfinite ;
		}
	};
	$.cssHooks[ "xOrigin" ] = {
		set: function( elem, value ) {
			svg3d.xOrigin = value;
		},
		get: function( elem ) {
			return svg3d.xOrigin;
		}
	};
	$.cssHooks[ "yOrigin" ] = {
		set: function( elem, value ) {
			svg3d.yOrigin = value;
		},
		get: function( elem ) {
			return svg3d.yOrigin;
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
	$.fx.step[ "clone3dlayer" ] = function( fx ) {
		$.cssHooks[ "clone3dlayer" ].set( fx.elem, fx.now, fx.end );	
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
	$.fx.step[ "xInfinite" ] = function( fx ) {
		$.cssHooks[ "xInfinite" ].set( fx.elem, fx.now );	
	};
	$.fx.step[ "yInfinite" ] = function( fx ) {
		$.cssHooks[ "yInfinite" ].set( fx.elem, fx.now );	
	};
	$.fx.step[ "xOrigin" ] = function( fx ) {
		$.cssHooks[ "xOrigin" ].set( fx.elem, fx.now );	
	};
	$.fx.step[ "yOrigin" ] = function( fx ) {
		$.cssHooks[ "yOrigin" ].set( fx.elem, fx.now );	
	};
});

})(jQuery);
