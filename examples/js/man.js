
    	svg3d.xOrigin = 0;
    	svg3d.yOrigin = 0;
    	svg3d.xInfinite = 0;
    	svg3d.yInfinite = 0;

    	var path = "";
    	
    	function rotate(id) {
    		var shapeCloned = svg3d.shapeFactory(document.getElementById(id));
    		var yTranslate = 3100;
    		shapeCloned.transform([svg3d.setScaleMatrix(1, 1, 0.2), svg3d.setTranslationMatrix(0, yTranslate, 0),
				svg3d.setAnglesRotationMatrix(-Math.PI/2, 0, 0), svg3d.setTranslationMatrix(0, -yTranslate, 0)]);
    	}

