(function(window) {

    if (window.svg3d === undefined) {
        window.svg3d = function() {};
    }

    //distance from the eye to the screen
    svg3d.focalDistance = 400;
    //z is divided by this ratio in order not to deform too much the image
    // applying a very big perspective
    svg3d.zRatio = 3;

    //sorting algorithm used
    svg3d.AVERAGE_Z = "averageZ";
    svg3d.ONE_TO_ALL = "oneToAll";
    svg3d.ALL_TO_ALL = "allToAll";
    //no sorting of faces
    svg3d.NONE = "none";
    svg3d.sortAlgo = svg3d.ONE_TO_ALL;

    //transformations used
    var ROTATION = "rotation";
    var TRANSLATION = "translation";
    var OPTIMIZED_ROTATION = "optimizedrotation";

    var PATH = "path";
    var POLYLINE = "polyline";

    svg3d.xOrigin = 0;
    svg3d.yOrigin = 0;

    svg3d.xInfinite = 150;
    svg3d.yInfinite = 150;

    svg3d.objects;

    svg3d.rotationTime = 50;

    svg3d.debugDirectorVector = false;

    svg3d.clockRotation = undefined;

    svg3d.init = function(g) {
        svg3d.initObjects(g);
        svg3d.clockRotation = window.setInterval(svg3d.transform, svg3d.rotationTime);
    }

    svg3d.initObjects = function(g) {
        var focalDistanceAttr = g.getAttribute("z:focalDistance");
        // can not be changed to !== as DOM returns null
        if (focalDistanceAttr != undefined) {
            svg3d.focalDistance = parseFloat(focalDistanceAttr);
        }
        var zRatioAttr = g.getAttribute("z:zRatio");
        if (zRatioAttr != undefined) {
            svg3d.zRatio = parseFloat(zRatioAttr);
        }
        var xOriginAttr = g.getAttribute("z:xOrigin");
        if (xOriginAttr != undefined) {
            svg3d.xOrigin = parseFloat(xOriginAttr);
        }
        var yOriginAttr = g.getAttribute("z:yOrigin");
        if (yOriginAttr != undefined) {
            svg3d.yOrigin = parseFloat(yOriginAttr);
        }
        var xInfiniteAttr = g.getAttribute("z:xInfinite");
        if (xInfiniteAttr != undefined) {
            svg3d.xInfinite = parseFloat(xInfiniteAttr);
        }
        var yInfiniteAttr = g.getAttribute("z:yInfinite");
        if (yInfiniteAttr != undefined) {
            svg3d.yInfinite = parseFloat(yInfiniteAttr);
        }
        var rotationTimeAttr = g.getAttribute("z:rotationTime");
        if (rotationTimeAttr != undefined) {
            svg3d.rotationTime = parseFloat(rotationTimeAttr);
        }
        var sortAlgoAttr = g.getAttribute("z:sortAlgo");
        if (sortAlgoAttr != undefined) {
            svg3d.sortAlgo = sortAlgoAttr;
        }
        var debugDirectorVectorAttr = g.getAttribute("z:showDirectorVector");
        if (debugDirectorVectorAttr != undefined) {
            svg3d.debugDirectorVector = debugDirectorVectorAttr === "true";
        }
        svg3d.objects = [];
        svg3d.createObjects(g);
    }

    svg3d.createObjects = function(g) {
        for (var node = getFirstChildElement(g); node; node = getNextSiblingElement(node)) {
            if (node.localName === "g") {
                svg3d.createObjects(node);
            } else {
                var shape = svg3d.shapeFactory(node);
                if (shape) {
                    svg3d.objects.push(shape);
                }
            }
        }
    }

    svg3d.toggleRotation = function() {
        if (!svg3d.clockRotation) {
            svg3d.clockRotation = window.setInterval(svg3d.transform, svg3d.rotationTime);
        } else {
            svg3d.clockRotation = window.clearInterval(svg3d.clockRotation);
        }
    }

    svg3d.transform = function() {
        var i = svg3d.objects.length;
        while (i--) {
            svg3d.applyTransform(svg3d.objects[i]);
        }
        svg3d.sort(svg3d.objects);
    }

    svg3d.sort = function(objectArray) {
        var indexPathsSorted;
        switch (svg3d.sortAlgo) {
            case svg3d.NONE:
                break;
            case svg3d.AVERAGE_Z:
                indexPathsSorted = svg3d.sortFacesAverageZ(objectArray);
                svg3d.sortFaces(objectArray, indexPathsSorted);
                break;
            case svg3d.ALL_TO_ALL:
                indexPathsSorted = svg3d.sortFacesAllToAll(objectArray);
                svg3d.sortFaces(objectArray, indexPathsSorted);
                showDirectorVectorsIfNeeded(objectArray);
                break;
            default:
                indexPathsSorted = svg3d.sortFacesOneToAll(objectArray);
                svg3d.sortFaces(objectArray, indexPathsSorted);
                showDirectorVectorsIfNeeded(objectArray);
                break;
        }
    }

    //indexPathsSorted contains the index of the objects in the order they have to be displayed, from front to behind
    svg3d.sortFaces = function(objectArray, indexPathsSorted) {
        var previousDomNode = objectArray[indexPathsSorted[0]].domNode;
        var parentNode = previousDomNode.parentNode;
        var length = indexPathsSorted.length;
        for (var j = 1; j < length; j++) {
            var index = indexPathsSorted[j];
            var objectDomNode = objectArray[index].domNode;
            parentNode.insertBefore(objectDomNode, previousDomNode);
            previousDomNode = objectDomNode;
        }
    }


    function showDirectorVectorsIfNeeded(objectArray) {
        if (svg3d.debugDirectorVector) {
            var i = objectArray.length;
            while (i--) {
                var object = objectArray[i];
                if (!object.cloned) {
                    object.cloned = object.domNode.cloneNode(true);
                    var id = object.cloned.getAttribute("id");
                    object.cloned.setAttribute("id", "vector_" + id);
                }
                var origin = new Array(object.position[0], object.position[1], object.position[2]);
                svg3d.projectPoint3d(origin);
                var vector = new Array(object.position[0] + (object.directorVector[0] / 50), object.position[1] + (object.directorVector[1] / 50), object.position[2] + (object.directorVector[2] / 50));
                svg3d.projectPoint3d(vector);
                object.cloned.setAttribute("d", "M" + origin[0] + "," + origin[1] + "L" + vector[0] + "," + vector[1] + "z");
                var style = object.cloned.getAttribute("style");
                var color = style.replace(/^.*fill *: */, "").replace(/ *; *.*$/, "");
                object.cloned.setAttribute("stroke", color);
                object.domNode.parentNode.appendChild(object.cloned);
            }
        }
    }

    svg3d.applyTransform = function(object) {
        var matrixArray = [];
        for (var node = getFirstChildElement(object.domNode); node; node = getNextSiblingElement(node)) {
            switch (node.localName) {
                case ROTATION:
                    matrixArray.push(svg3d.getRotation(node));
                    break;
                case TRANSLATION:
                    matrixArray.push(svg3d.getTranslation(node));
                    break;
                case OPTIMIZED_ROTATION:
                    matrixArray.push(svg3d.getOptimizedRotation(node));
                    break;
            }
        }
        object.transform(matrixArray);
    }

    /*
rotation is specified by rotX, rotY, ...
*/
    svg3d.getRotation = function(node) {
        var rotX = getAttrValue(node, "rotX", "incRotX");
        var rotY = getAttrValue(node, "rotY", "incRotY");
        var rotZ = getAttrValue(node, "rotZ", "incRotZ");
        return svg3d.setAnglesRotationMatrix(rotX, rotY, rotZ);
    }

    /*
rotation is specified by cos x, cos y, etc...
*/
    svg3d.getOptimizedRotation = function(node) {
        var cosX = getAttrValue(node, "cosX", "incCosX");
        var cosY = getAttrValue(node, "cosY", "incCosY");
        var cosZ = getAttrValue(node, "cosZ", "incCosZ");
        var sinX = getAttrValue(node, "sinX", "incSinX");
        var sinY = getAttrValue(node, "sinY", "incSinY");
        var sinZ = getAttrValue(node, "sinZ", "incSinZ");
        return svg3d.setRotationMatrix(cosX, sinX, cosY, sinY, cosZ, sinZ);
    }

    svg3d.getTranslation = function(node) {
        var x = getAttrValue(node, "x", "incX");
        var y = getAttrValue(node, "y", "incY");
        var z = getAttrValue(node, "z", "incZ");
        return svg3d.setTranslationMatrix(x, y, z);
    }

    function getAttrValue(node, tag, incTag) {
        var attValue = node.getAttribute(tag);
        var incAttValue = node.getAttribute(incTag);
        var returnedValue = 0;
        //can be undefined or 0
        if (attValue) {
            returnedValue = parseFloat(attValue);
        }
        if (incAttValue) {
            var incValue = parseFloat(incAttValue);
            node.setAttribute(tag, returnedValue + incValue);
        }
        return returnedValue;
    }

})(window);