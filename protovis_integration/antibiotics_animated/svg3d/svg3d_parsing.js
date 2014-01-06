/*
Copyright or © or Copr. Nicolas Debeissat

nicolas.debeissat@gmail.com (http://debeissat.nicolas.free.fr/)

This software is a computer program whose purpose is to rotate svg
 pictures in a 3 dimensional space and projects it back on the screen.

This software is governed by the CeCILL license under French law and
abiding by the rules of distribution of free software.  You can  use, 
modify and/ or redistribute the software under the terms of the CeCILL
license as circulated by CEA, CNRS and INRIA at the following URL
"http://www.cecill.info". 

As a counterpart to the access to the source code and  rights to copy,
modify and redistribute granted by the license, users are provided only
with a limited warranty  and the software's author,  the holder of the
economic rights,  and the successive licensors  have only  limited
liability. 

In this respect, the user's attention is drawn to the risks associated
with loading,  using,  modifying and/or developing or reproducing the
software by the user in light of its specific status of free software,
that may mean  that it is complicated to manipulate,  and  that  also
therefore means  that it is reserved for developers  and  experienced
professionals having in-depth computer knowledge. Users are therefore
encouraged to load and test the software's suitability as regards their
requirements in conditions enabling the security of their systems and/or 
data to be ensured and,  more generally, to use and operate it in the 
same conditions as regards security. 

The fact that you are presently reading this means that you have had
knowledge of the CeCILL license and that you accept its terms.

*/

//distance from the eye to the screen
var focalDistance = 400;
//z is divided by this ratio in order not to deform too much the image
// applying a very big perspective
var zRatio = 3;

//sorting algorithm used
var AVERAGE_Z = "averageZ";
var ONE_TO_ALL = "oneToAll";
var ALL_TO_ALL = "allToAll";
//no sorting of faces
var NONE = "none";
var sortAlgo = ONE_TO_ALL;

//transformations used
var ROTATION = "rotation";
var TRANSLATION = "translation";
var OPTIMIZED_ROTATION = "optimizedrotation";

var PATH = "path";
var POLYLINE = "polyline";

var xOrigin = 150;
var yOrigin = 150;

var objects;

var rotationTime = 50;

var debugDirectorVector = false;

var clockRotation;

function init(g) {
    initObjects(g);
    clockRotation = window.setInterval("transform()", rotationTime);
}

function initObjects(g) {
    var focalDistanceAttr = g.getAttribute("z:focalDistance");
    // can not be changed to !== as DOM returns null
    if (focalDistanceAttr != undefined) {
        focalDistance = parseFloat(focalDistanceAttr);
    }
    var zRatioAttr = g.getAttribute("z:zRatio");
    if (zRatioAttr != undefined) {
        zRatio = parseFloat(zRatioAttr);
    }
    var xOriginAttr = g.getAttribute("z:xOrigin");
    if (xOriginAttr != undefined) {
        xOrigin = parseFloat(xOriginAttr);
    }
    var yOriginAttr = g.getAttribute("z:yOrigin");
    if (yOriginAttr != undefined) {
        yOrigin = parseFloat(yOriginAttr);
    }
    var rotationTimeAttr = g.getAttribute("z:rotationTime");
    if (rotationTimeAttr != undefined) {
        rotationTime = parseFloat(rotationTimeAttr);
    }
    var sortAlgoAttr = g.getAttribute("z:sortAlgo");
    if (sortAlgoAttr != undefined) {
        sortAlgo = sortAlgoAttr;
    }
    var debugDirectorVectorAttr = g.getAttribute("z:showDirectorVector");
    if (debugDirectorVectorAttr != undefined) {
        debugDirectorVector = debugDirectorVectorAttr === "true";
    }
    objects = [];
    createObjects(g);
}

function createObjects(g) {
    for (var node = getFirstChildElement(g) ; node ; node = getNextSiblingElement(node)) {
        if (node.localName === "g") {
            createObjects(node);
        } else {
            var shape = shapeFactory(node);
            if (shape) {
                objects.push(shape);
            }
        }
    }
}

function toggleRotation() {
    if (!clockRotation) {
        clockRotation = window.setInterval("transform()", rotationTime);
    } else {
        clockRotation = window.clearInterval(clockRotation);
    }
}	

function transform() {
    var i = objects.length;
    while (i--) {
        applyTransform(objects[i]);
    }
    switch (sortAlgo) {
        case NONE:
            break;
        case AVERAGE_Z:
            var indexPathsSorted = sortFacesAverageZ(objects);
            sortFaces(objects, indexPathsSorted);
            break;
        case ALL_TO_ALL:
            var indexPathsSorted = sortFacesAllToAll(objects);
            sortFaces(objects, indexPathsSorted);
            showDirectorVectorsIfNeeded();
            break;
        default:
            var indexPathsSorted = sortFacesOneToAll(objects);
            sortFaces(objects, indexPathsSorted);
            showDirectorVectorsIfNeeded();
            break;
    }
}

//indexPathsSorted contains the index of the objects in the order they have to be displayed, from front to behind
function sortFaces(objectArray, indexPathsSorted) {
    var previousDomNode = objectArray[indexPathsSorted[0]].domNode;
    var parentNode = previousDomNode.parentNode;
    var length = indexPathsSorted.length;
    for (var j = 1 ; j < length ; j++) {
        var index = indexPathsSorted[j];
        var objectDomNode = objectArray[index].domNode;
        parentNode.insertBefore(objectDomNode, previousDomNode);
        previousDomNode = objectDomNode;
    }
}


function showDirectorVectorsIfNeeded() {
    if (debugDirectorVector) {
        var i = objects.length;
        while (i--) {
            var object = objects[i];
            if (!object.cloned) {
                object.cloned = object.domNode.cloneNode(true);
                var id = object.cloned.getAttribute("id");
                object.cloned.setAttribute("id", "vector_" + id);
            }
            var origin = new Array(object.position[0], object.position[1], object.position[2]);
            projectPoint3d(origin);
            var vector = new Array(object.position[0] + (object.directorVector[0] / 50), object.position[1] + (object.directorVector[1] / 50), object.position[2] + (object.directorVector[2] / 50));
            projectPoint3d(vector);
            object.cloned.setAttribute("d", "M" + origin[0] + "," + origin[1] + "L" + vector[0] + "," + vector[1] + "z");
            var style = object.cloned.getAttribute("style");
            var color = style.replace(/^.*fill *: */,"").replace(/ *; *.*$/,"");
            object.cloned.setAttribute("stroke", color);
            object.domNode.parentNode.appendChild(object.cloned);
        }
    }
}

function applyTransform(object) {
    var matrixArray = new Array();
    for (var node = getFirstChildElement(object.domNode) ; node ; node = getNextSiblingElement(node)) {
        switch (node.localName) {
            case ROTATION:
                matrixArray.push(getRotation(node));
                break;
            case TRANSLATION:
                matrixArray.push(getTranslation(node));
                break;
            default:
                matrixArray.push(getOptimizedRotation(node));
                break;
        }
    }
    object.transform(matrixArray);
}

/*
rotation is specified by rotX, rotY, ...
*/
function getRotation(node) {
    var rotX = getAttrValue(node, "rotX", "incRotX");
    var rotY = getAttrValue(node, "rotY", "incRotY");
    var rotZ = getAttrValue(node, "rotZ", "incRotZ");
    return setAnglesRotationMatrix(rotX, rotY, rotZ);
}

/*
rotation is specified by cos x, cos y, etc...
*/
function getOptimizedRotation(node) {
    var cosX = getAttrValue(node, "cosX", "incCosX");
    var cosY = getAttrValue(node, "cosY", "incCosY");
    var cosZ = getAttrValue(node, "cosZ", "incCosZ");
    var sinX = getAttrValue(node, "sinX", "incSinX");
    var sinY = getAttrValue(node, "sinY", "incSinY");
    var sinZ = getAttrValue(node, "sinZ", "incSinZ");
    return setRotationMatrix(cosX, sinX, cosY, sinY, cosZ, sinZ);

}

function getTranslation(node) {
    var x = getAttrValue(node, "x", "incX");
    var y = getAttrValue(node, "y", "incY");
    var z = getAttrValue(node, "z", "incZ");
    return setTranslationMatrix(x, y, z);
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
