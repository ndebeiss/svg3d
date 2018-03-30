
    	svg3d.xOrigin = 0;
    	svg3d.yOrigin = 0;
    	svg3d.xInfinite = 0;
    	svg3d.yInfinite = 0;

    	var path = "";
    	
    	function rotate(id) {
    		var shapeCloned = svg3d.shapeFactory(document.getElementById(id));
    		var yTranslate = 3100;
    		shapeCloned.transform([svg3d.setScaleMatrix(1, 1, 0.2), svg3d.setTranslationMatrix(0, yTranslate, 0) , svg3d.MATRIX.makeRotationX(-Math.PI/2), svg3d.setTranslationMatrix(0, -yTranslate, 0)]);
    		var pathShapeCloned3d = document.getElementById("path3433_Clone3d");
    		pathShapeCloned3d.setAttribute("d", path);
    		var shapeCloned3d = svg3d.shapeFactory(pathShapeCloned3d);
    		shapeCloned3d.transform([svg3d.MATRIX.makeTranslation(-400, 0, 0)]);
    	}

