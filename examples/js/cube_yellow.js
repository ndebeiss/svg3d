svg3d.xInfinite = 150;
svg3d.yInfinite = 150;
svg3d.xOrigin = 0;
svg3d.yOrigin = 0;
svg3d.sortAlgo = svg3d.ONE_TO_ALL;

$( document ).ready(function() {
var svgClonableG = $("#g1");
svgClonableG.animate(
    { "svg3d":
         {"clone3d":
         	{
	         	layer: 100,
				nb: 10,
				row: 1,
				x: 150,
				y: -90,
				z: 220
			}
		}
    }, 
    { "duration"  : 0, 
      "easing"    : "easeInCubic",
      "complete"  : function()
          { svgClonableG.animate(
            { "svg3d":
            	{"translate3d":
            		{
    		    		x: 200,
						y: 200,
						z: 0
            		}
            	}
            },
            {
	            duration: 1000, 
     	        easing: "easeInCubic"
            });
            $("#svgTranslatableG_ad530959e0d04d6d9d2b83028be85eaf").animate(
                { "svg3d":{"translate3d":
            		{
    		    		x: 200,
						y: 200,
						z: 0
            		}
            	}
                },
                { queue: This.id,
                  duration: 1000, 
                  easing: "easeInCubic"
                });
              }
          }
);
});


