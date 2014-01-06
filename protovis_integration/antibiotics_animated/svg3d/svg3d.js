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


function Shape(domNode) {
    this.domNode = domNode;
};
/*
get next coord in the string
*/
var COORD = new RegExp("^ *,? *(-?[\\d.]+([eE][-+]?\\d+)?)");
Shape.prototype.getCoord = function() {
    var coord = COORD.exec(this.coords.substr(this.index));
    if (coord) {
        this.index += coord[0].length;
        return parseFloat(coord[1]);
    }
    return undefined;
};

/*
    *  M = moveto
    * L = lineto
    * H = horizontal lineto
    * V = vertical lineto
    * C = curveto
    * S = smooth curveto
    * Q = quadratic Belzier curve
    * T = smooth quadratic Belzier curveto
    * A = elliptical Arc
    * Z = closepath
*/
function transformPath(matrixArray) {
    this.index = 0;
    var pt3d = new Array(3);
    var points = [];
    var newD = "";
    //optimization ?
    var ch = "";
    var coord = 0;
    var x_axis_rotation = 0;
    var large_arc_flag = 0;
    var sweep_flag = 0;
    var isAbsolute = true;
    var pathLength = this.coords.length;
    for (this.index = 0 ; this.index < pathLength ;) {
        ch = this.coords.charAt(this.index);
        isAbsolute = true;
        switch (ch) {
            case "m":
            case "l":
            case "c":
            case "s":
            case "q":
            case "t":
                isAbsolute = false;
                ch = ch.toUpperCase();
            case "M":
            case "L":
            case "C":
            case "S":
            case "Q":
            case "T":
                //(x y)+ or (x1 y1 x2 y2 x y)+
                this.index++;
                for (coord = this.getCoord() ; coord !== undefined ; coord = this.getCoord()) {
                    if (isAbsolute) {
                        this.getPoint(pt3d, coord);
                    } else {
                        this.getPointCumul(pt3d, coord);
                    }
                    newD += ch + transformAndStore(pt3d, matrixArray, points);
                    //if the loop is executed more than once, then a comma is dumped between points
                    ch = ",";
                }
                break;
            case "h":
                isAbsolute = false;
            case "H":            
                // x+
                this.index++;
                //changes h or H into L
                ch = "L";
                //the former y will be kept
                for (coord = this.getCoord() ; coord !== undefined ; coord = this.getCoord()) {
                    if (isAbsolute) {
                        this.getXZ(pt3d, coord);
                    } else {
                        this.getXZCumul(pt3d, coord);
                    }
                    newD += ch + transformAndStore(pt3d, matrixArray, points);
                    //if the loop is executed more than once, then a comma is dumped between points
                    ch = ",";
                }
                break;
            case "v":
                isAbsolute = false;
            case "V":
                // y+
                this.index++;
                //changes v or V into L
                ch = "L";
                //the former x will be kept
                for (coord = this.getCoord() ; coord !== undefined ; coord = this.getCoord()) {
                    if (isAbsolute) {
                        this.getYZ(pt3d, coord);
                    } else {
                        this.getYZCumul(pt3d, coord);
                    }
                    newD += ch + transformAndStore(pt3d, matrixArray, points);
                    //if the loop is executed more than once, then a comma is dumped between points
                    ch = ",";
                }
                break;
            case "a":
                isAbsolute = false;
                ch = ch.toUpperCase();
            case "A":
                //(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
                this.index++;
                for (coord = this.getCoord() ; coord !== undefined ; coord = this.getCoord()) {
                    /*
                    var oldPt3d = cloneArray(pt3d);
                    transformPoint(matrixArray, oldPt3d);
                    projectPoint3d(oldPt3d);
                    // the pt3d retrieved here is radial so it is relative
                    this.getPointCumul(pt3d, coord);
                    //does not modify pt3d for support of relative coords
                    var newPt3d = cloneArray(pt3d);
                    transformPoint(matrixArray, newPt3d);
                    projectPoint3d(newPt3d);
                    var rx = newPt3d[0] - oldPt3d[0];
                    var ry = newPt3d[1] - oldPt3d[1];
                    newD += ch + Math.abs(rx) + "," + Math.abs(ry);
                    */
		    var rx = coord;
                    var ry = this.getCoord();
                    newD += ch + rx + "," + ry;

                    x_axis_rotation = this.getCoord();
                    /*
	            //given in degree, 0 is vertical, 90 horizontal right
                    var x_axis_rotationRadian = (90 - x_axis_rotation) * Math.PI / 180;
                    var cobayePoint1 = cloneArray(pt3d);
                    var cobayePoint2 = [pt3d[0] + Math.cos(x_axis_rotationRadian), pt3d[1] + Math.sin(x_axis_rotationRadian), pt3d[2]];

                    transformPoint(matrixArray, cobayePoint1);
                    transformPoint(matrixArray, cobayePoint2);

                    var deltaX = cobayePoint2[0] - cobayePoint1[0];
                    var deltaY = cobayePoint2[1] - cobayePoint1[1];

                    var new_x_axis_rotationRadian = Math.acos(Math.abs(deltaX));
                    //distinguish between several results of acos with frame position, result in degree waited is opposite
                    //upper left quarter frame
                    if (deltaX < 0 && deltaY < 0) {
                        new_x_axis_rotationRadian = Math.PI - new_x_axis_rotationRadian;
                    //lower left quarter frame
                    } else if (deltaX < 0) {
                        new_x_axis_rotationRadian = Math.PI + new_x_axis_rotationRadian;
                    //lower right quarter frame
                    } else if (deltaY > 0) {
                        new_x_axis_rotationRadian = - new_x_axis_rotationRadian;
                    }

                    var new_x_axis_rotation = 90 - (new_x_axis_rotationRadian * 180 / Math.PI);
                    */

                    large_arc_flag = this.getCoord();
                    sweep_flag = this.getCoord();
                    //newD += "," + new_x_axis_rotation + "," + large_arc_flag + "," + sweep_flag + ",";
                    newD += "," + x_axis_rotation + "," + large_arc_flag + "," + sweep_flag + ",";
                    if (isAbsolute) {
                        this.getPoint(pt3d, this.getCoord());
                    } else {
                        this.getPointCumul(pt3d, this.getCoord());
                    }
                    newD += transformAndStore(pt3d, matrixArray, points);
                    //if the loop is executed more than once, then a comma is dumped between points
                    ch = ",";
                }
                break;
            case "z":
            case "Z":
                this.index++;
                newD += ch;
                break;
            default:
                // for invalid chars
                this.index++;
                break;
        }
        
    }
    this.setDirectorVector(points);
    this.domNode.setAttribute("d", newD);
};

Path.prototype = new Shape();
Path.constructor = Path;

function Path(domNode) {
    Shape.call(this, domNode);
    if (domNode) {
        this.coords = domNode.getAttribute("d");
    }
};

function getPt2d(pt3d, firstCoord) {
    pt3d[0] = firstCoord;
    pt3d[1] = this.getCoord();
    pt3d[2] = 0;
};
function getPt2dCumul(pt3d, firstCoord) {
    pt3d[0] += firstCoord;
    pt3d[1] += this.getCoord();
};
function getXZ2d(pt3d, firstCoord) {
    pt3d[0] = firstCoord;
    pt3d[2] = 0;
};
function getXZ2dCumul(pt3d, firstCoord) {
    pt3d[0] += firstCoord;
}
function getYZ2d(pt3d, firstCoord) {
    pt3d[1] = firstCoord;
    pt3d[2] = 0;
};
function getYZ2dCumul(pt3d, firstCoord) {
    pt3d[1] += firstCoord;
};

Path.prototype.transform = transformPath;
Path.prototype.getPoint = getPt2d;
Path.prototype.getPointCumul = getPt2dCumul;
Path.prototype.getXZ = getXZ2d;
Path.prototype.getXZCumul = getXZ2dCumul;
Path.prototype.getYZ = getYZ2d;
Path.prototype.getYZCumul = getYZ2dCumul;

/*
http://mckoss.com/jscript/object.htm
*/
Path3d.prototype = new Path();
Path3d.constructor = Path3d;

function Path3d(domNode) {
    Path.call(this, domNode);
};

function getPt3d(pt3d, firstCoord) {
    pt3d[0] = firstCoord;
    pt3d[1] = this.getCoord();
    pt3d[2] = this.getCoord();
};
/*
get next 3d or 2d coordinates in the string and adds it to current point
*/
function getPt3dCumul(pt3d, firstCoord) {
    pt3d[0] += firstCoord;
    pt3d[1] += this.getCoord();
    pt3d[2] += this.getCoord();
};
function getXZ3d(pt3d, firstCoord) {
    pt3d[0] = firstCoord;
    pt3d[2] = this.getCoord();
};
function getXZ3dCumul(pt3d, firstCoord) {
    pt3d[0] += firstCoord;
    pt3d[2] += this.getCoord();
};
function getYZ3d(pt3d, firstCoord) {
    pt3d[1] = firstCoord;
    pt3d[2] = this.getCoord();
};
function getYZ3dCumul(pt3d, firstCoord) {
    pt3d[1] += firstCoord;
    pt3d[2] += this.getCoord();
};
Path3d.prototype.getPoint = getPt3d;
Path3d.prototype.getPointCumul = getPt3dCumul;
Path3d.prototype.getXZ = getXZ3d;
Path3d.prototype.getXZCumul = getXZ3dCumul;
Path3d.prototype.getYZ = getYZ3d;
Path3d.prototype.getYZCumul = getYZ3dCumul;


/*
transfoms the rect to a Path that can be rotated. The rounded edges are transformed to a C (cubic Bezier curve)
    */
function rectToPath() {
    var maxX = this.x + this.width;
    var maxY = this.y + this.height;
    var x = this.x + 2*this.rx;
    var d = "M" + x +"," + this.y;
    x = maxX - 2*this.rx;
    d += "H" + x;
    var y = this.y + 2*this.ry;
    if (this.rx || this.ry) {
        d += "C" + maxX + "," + this.y + "," + maxX + "," + this.y + "," + maxX + "," + y;
    }
    y = maxY - 2*this.ry;
    d += "V" + y;
    if (this.rx || this.ry) {
        d += "C" + maxX + "," + maxY + "," + maxX + "," + maxY + "," + x + "," + maxY;
    }
    x = this.x + 2*this.rx;
    d += "H" + x;
    if (this.rx || this.ry) {
        d += "C" + this.x + "," + maxY + "," + this.x + "," + maxY + "," + this.x + "," + y;
    }
    y = this.y + 2*this.ry;
    d += "V" + y;
    if (this.rx || this.ry) {
        d += "C" + this.x + "," + this.y + "," + this.x + "," + this.y + "," + x + "," + this.y;
    }
    return d;
};

Rect.prototype = new Path();
Rect.constructor = Path;
Rect.prototype.toPath = rectToPath;

function Rect(domNode) {
    if (domNode) {
        this.x = parseFloat(domNode.getAttribute("x"));
        this.y = parseFloat(domNode.getAttribute("y"));
        this.width = parseFloat(domNode.getAttribute("width"));
        this.height = parseFloat(domNode.getAttribute("height"));
        var rxAtt = domNode.getAttribute("rx");
        if (rxAtt != undefined) {
            this.rx = parseFloat(rxAtt);
        } else {
            this.rx = 0;
        }
        var ryAtt = domNode.getAttribute("ry");
        if (ryAtt != undefined) {
            this.ry = parseFloat(ryAtt);
        } else {
            this.ry = 0;
        }
        this.coords = this.toPath();
        var newDomNode = document.createElementNS("http://www.w3.org/2000/svg", "path");
        var i = domNode.attributes.length;
        while (i--) {
            var att = domNode.attributes.item(i);
            newDomNode.setAttribute(att.name, att.value);
        }
        for (var node = getFirstChildElement(domNode) ; node ; node = getFirstChildElement(domNode)) {
            newDomNode.appendChild(node);
        }
        newDomNode.setAttribute("d", this.coords);
        Path.call(this, newDomNode);
        domNode.parentNode.insertBefore(newDomNode, domNode);
        domNode.style.display = "none";
    }
};

Rect.prototype.transform = transformPath;
Rect.prototype.getPoint = getPt2d;
Rect.prototype.getPointCumul = getPt2dCumul;
Rect.prototype.getXZ = getXZ2d;
Rect.prototype.getXZCumul = getXZ2dCumul;
Rect.prototype.getYZ = getYZ2d;
Rect.prototype.getYZCumul = getYZ2dCumul;


function transformPolyline(matrixArray) {
    this.index = 0;
    var pt3d = new Array(3);
    var points = [];
    var newPoints = "";
    var coord = 0;
    var ch = "";
    var pointsLength = this.coords.length;
    for (this.index = 0 ; this.index < pointsLength ;) {
        for (coord = this.getCoord() ; coord !== undefined ; coord = this.getCoord()) {
            this.getPoint(pt3d, coord);
            newPoints += ch + transformAndStore(pt3d, matrixArray, points);
            //if the loop is executed more than once, then a comma is dumped between points
            ch = ",";
        }
    }
    this.setDirectorVector(points);
    this.domNode.setAttribute("points", newPoints);
};

Polyline.prototype = new Shape();
Polyline.constructor = Shape;

function Polyline(domNode) {
    Shape.call(this, domNode);
    if (domNode) {
        this.coords = domNode.getAttribute("points");
    }
};

Polyline.prototype.transform = transformPolyline;
Polyline.prototype.getPoint = getPt2d;

Polyline3d.prototype = new Polyline();
Polyline3d.constructor = Polyline;

function Polyline3d(domNode) {
    Polyline.call(this, domNode);
};

Polyline3d.prototype.getPoint = getPt3d;

function transformCircle(matrixArray) {
    var pt3d = cloneArray(this.center);
    var points = [];
    transformPoint(matrixArray, pt3d);
    //points are stored before projection
    if (sortAlgo !== NONE) {
        points.push(pt3d);
    }
    projectPoint3d(pt3d);
    this.setDirectorVector(points);
    //reduces or increases the radius of the circle (sphere)
    var perspectiveRatio = focalDistance / (focalDistance + (pt3d[2] / zRatio));
    var newRadius = this.radius * perspectiveRatio;
    this.domNode.setAttribute("cx", pt3d[0]);
    this.domNode.setAttribute("cy", pt3d[1]);
    this.domNode.setAttribute("r", newRadius);
};

Circle.prototype = new Shape();
Circle.constructor = Shape;

function Circle(domNode) {
    Shape.call(this, domNode);
    if (domNode) {
        this.radius = domNode.getAttribute("r");

        this.center = new Array(3);
        this.center[0] = domNode.getAttribute("cx");
        this.center[1] = domNode.getAttribute("cy");
        this.center[2] = 0;
    }
};

Circle.prototype.transform = transformCircle;

Circle3d.prototype = new Circle();
Circle3d.constructor = Circle;

function Circle3d(domNode) {
    Circle.call(this, domNode);
    if (domNode) {
        this.center[2] = domNode.getAttribute("z:cz");
    }
};


function setDirectorVector_averageZ(points) {
    var length = points.length;
    var i = length - 1;
    var sum = points[i][2];
    while (i--) {
        sum += points[i][2];
    }
    this.z = sum / length;
};

function setDirectorVector_default(points) {
    var length = points.length;
    switch (length) {
        case 0:
            this.directorVector[0] = 0;
            this.directorVector[1] = 0;
            this.directorVector[2] = 0;
            this.position = new Array(0, 0, 0);
            break;
        case 1:
            //surface is parallel to ( x, y ) plan
            this.directorVector[0] = 0;
            this.directorVector[1] = 0;
            this.directorVector[2] = 1;
            this.position = cloneArray(points[0]);
            break;
        case 2:
            //surface is orthogonal to the segment
            this.directorVector[0] = points[1][0] - points[0][0];
            this.directorVector[1] = points[1][1] - points[0][1];
            this.directorVector[2] = points[1][2] - points[0][2];
            this.position = cloneArray(points[0]);
            break;
        //as soon we have 3 points
        default:
            //calcultates the position of the surface, also avoids the problem of very small director vectors
            var i = length - 1;
            this.position[0] = points[i][0];
            this.position[1] = points[i][1];
            this.position[2] = points[i][2];
            while (i--) {
                this.position[0] += points[i][0];
                this.position[1] += points[i][1];
                this.position[2] += points[i][2];
            }
            this.position[0] = this.position[0] / length;
            this.position[1] = this.position[1] / length;
            this.position[2] = this.position[2] / length;
            //this.position will be used as third point, still in order to avoid problem of very small director vectors (1e-15 ...)
            // in order to calculate director vector
            // u=(ux, uy, uz) et v=(vx, vy, vz)
            //                (  uy vz - uz vy )
            //  u /\ v = (  uz vx - ux vz   )
            //                (  ux vy - uy vx   )
            var ux = points[1][0] - points[0][0];
            var uy = points[1][1] - points[0][1];
            var uz = points[1][2] - points[0][2];
            var vx = this.position[0] - points[0][0];
            var vy = this.position[1] - points[0][1];
            var vz = this.position[2] - points[0][2];
            this.directorVector[0] = uy * vz - uz * vy;
            this.directorVector[1] = uz * vx - ux * vz;
            this.directorVector[2] = ux * vy - uy * vx;
            break;
    }
};

function shapeFactory(domNode) {
    var returnedShape;
    var threeD = domNode.getAttribute("z:threeD");
    if (threeD && threeD === "true") {
        threeD = true;
    } else {
        threeD = false;
    }
    switch (domNode.localName) {
        case "path":
            if (threeD) {
                returnedShape = new Path3d(domNode);
            } else {
                returnedShape = new Path(domNode);
            }
            break;
        case "rect":
            returnedShape = new Rect(domNode);
            break;
        case "polyline":
            if (threeD) {
                returnedShape = new Polyline3d(domNode);
            } else {
                returnedShape = new Polyline(domNode);
            }
            break;
        case "circle":
            if (threeD) {
                returnedShape = new Circle3d(domNode);
            } else {
                returnedShape = new Circle(domNode);
            }
            break;
        default:
            return;
    }
    switch (sortAlgo) {
        case NONE:
            returnedShape.setDirectorVector = function() {};
            break;
        case AVERAGE_Z:
            returnedShape.setDirectorVector = setDirectorVector_averageZ;
            returnedShape.z = 0;
            break;
        case ALL_TO_ALL:
            returnedShape.setDirectorVector = setDirectorVector_default;
            returnedShape.directorVector = new Array(3);
            returnedShape.position = new Array(3);
            break;
        default:
            returnedShape.setDirectorVector = setDirectorVector_default;
            returnedShape.directorVector = new Array(3);
            returnedShape.position = new Array(3);
            break;
    }
    return returnedShape;
};

function transformAndStore(pt3d, matrixArray, points) {
    //does not modify pt3d for support of relative coords
    var newPt3d = cloneArray(pt3d);
    if (newPt3d[2] === undefined) {
        newPt3d[2] = 0;
    }
    transformPoint(matrixArray, newPt3d);
    //points are stored before projection
    if (sortAlgo !== NONE) {
        points.push(cloneArray(newPt3d));
    }
    projectPoint3d(newPt3d);
    return newPt3d[0] + "," + newPt3d[1];
};

// multiplies by matrix from last to first
function transformPoint(matrixArray, pt3d) {
    //optimization ?
    var newx = 0;
    var newy = 0;
    var newz = 0;
    var i = matrixArray.length;
    while (i--) {
        var matrix = matrixArray[i];
        //must keep the old values
        newx = pt3d[0]*matrix[0] + pt3d[1]*matrix[1] + pt3d[2]*matrix[2] + matrix[3];
        newy = pt3d[0]*matrix[4] + pt3d[1]*matrix[5] + pt3d[2]*matrix[6] + matrix[7];
        newz = pt3d[0]*matrix[8] + pt3d[1]*matrix[9] + pt3d[2]*matrix[10] + matrix[11];
        pt3d[0] = newx;
        pt3d[1] = newy;
        pt3d[2] = newz;
    }
};

function projectPoint3d(pt3d) {
    var perspectiveRatio = focalDistance / (focalDistance + (pt3d[2] / zRatio));
    pt3d[0] = pt3d[0] * perspectiveRatio + xOrigin;
    pt3d[1] = pt3d[1] * perspectiveRatio + yOrigin;
};

// Sets the specified matrix to a rotation matrix
function setAnglesRotationMatrix(rotx, roty, rotz) {
    // Assuming the angles are in radians
    var cx = Math.cos(rotx);
    var sx = Math.sin(rotx);
    var cy = Math.cos(roty);
    var sy = Math.sin(roty);
    var cz = Math.cos(rotz);
    var sz = Math.sin(rotz);
    return setRotationMatrix(cx, sx, cy, sy, cz, sz);
};

function setRotationMatrix(cx, sx, cy, sy, cz, sz) {
    var matrix = [];
    matrix[0] = cz * cy;
    matrix[1] = sz * cx * cy - sx * sy;
    matrix[2] = sz * sx * cy + cx * sy;
    matrix[3] = 0;
    matrix[4] = -sz;
    matrix[5] = cz * cx;
    matrix[6] = cz * sx;
    matrix[7] = 0;
    matrix[8] = cz * sy;
    matrix[9] = sz * cx * sy + sx * cy;
    matrix[10] = sz * sx * sy - cx * cy;
    matrix[11] = 0;
    return matrix;
};

function setTranslationMatrix(x, y, z) {
    var matrix = [];
    matrix[0] = 1;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = x;
    matrix[4] = 0;
    matrix[5] = 1;
    matrix[6] = 0;
    matrix[7] = y;
    matrix[8] = 0;
    matrix[9] = 0;
    matrix[10] = 1;
    matrix[11] = z;
    return matrix;
};

function sortFacesAverageZ(pathArray) {
    var indexArray = new Array();
    var i = pathArray.length;
    while (i--) {
        var current = pathArray[i];
        var j = indexArray.length;
        while (j && pathArray[indexArray[j-1]].z > current.z) {
            //translates to the right
            indexArray[j] = indexArray[j-1];
            j--;
        }
        //only dumps the indice of the path
        indexArray[j] = i;
    }
    return indexArray;
};

function sortFacesOneToAll(pathArray) {
    var indexArray = new Array();
    //optimization
    var i = pathArray.length;
    while (i--) {
        var current = pathArray[i];
        var j = indexArray.length;
        //compares current to each path, if it is in front puts it at the beginning of the list
        while (j && isBehind(pathArray[indexArray[j-1]], current)) {
            //translates the index to the right
            indexArray[j] = indexArray[j-1];
            j--;
        }
        //only dumps the indice of the path
        indexArray[j] = i;
    }
    return indexArray;
};

function sortFacesAllToAll(pathArray) {
    var indexArray = new Array();
    var i = pathArray.length;
    while (i--) {
        var current = pathArray[i];
        var j = indexArray.length;
        //continue browsing if compared is behind current
        var continueBrowsing = true;
        //compares current to each path, if it is in front puts it at the beginning of the list
        while (j && continueBrowsing) {
            var compared = pathArray[indexArray[j-1]];
            //it is possible that both are true or false
            var comparedIsBehindCurrent = isBehind(compared, current);
            var currentIsBehindCompared = isBehind(current, compared);
            //by default compared is behind in order to continue comparison on the rest of the list
            continueBrowsing = (comparedIsBehindCurrent ===  currentIsBehindCompared) || comparedIsBehindCurrent;
            if (continueBrowsing) {
                //translates the index to the right
                indexArray[j] = indexArray[j-1];
                j--;
            }
        }
        //only dumps the indice of the path
        indexArray[j] = i;
    }
    return indexArray;
};

/*
if AP . u and BP . u have opposite signs, then they are not on the same side of the plan, then face is behind reference
A is ( 0, 0, -infinite )
AP . u = APx * ux + APy * uy + APz * uz = Px * ux + Py * uy + (Pz  + infinite) * uz
so if uz < 0 then it is -infinite otherwise it is infinite
AP . u has the sign of uz
BP . u = BPx * ux + BPy * uy + BPz * uz
BP . u = ( Px - Bx ) * ux + ( Py - By ) * uy + ( Pz - Bz ) * uz

*/
function isBehind(face, reference) {
    var u = reference.directorVector;
    var p = reference.position;
    var b = face.position;
    var bpu = (p[0] - b[0]) * u[0] + (p[1] - b[1]) * u[1] + (p[2] - b[2]) * u[2];
    if (bpu * u[2] < 0) {
        return true;
    }
    return false;
}

