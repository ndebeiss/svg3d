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

(function( window ) {

if (window.svg3d === undefined) {
    window.svg3d = function() {};
}

function Shape(domNode) {
    this.domNode = domNode;
    this.assignSetDirectorVector();
}
/*
get next coord in the string
*/
var COORD = new RegExp("^ *,? *(-?[\\d.]+([eE][-+]?\\d+)?) ?");
Shape.prototype.getCoord = function() {
    var coord = COORD.exec(this.coords.substr(this.index));
    if (coord) {
        this.index += coord[0].length;
        return parseFloat(coord[1]);
    }
    return undefined;
};

Shape.prototype.assignSetDirectorVector = function() {
    switch (svg3d.sortAlgo) {
        case svg3d.NONE:
            this.setDirectorVector = function() {};
            break;
        case svg3d.AVERAGE_Z:
            this.setDirectorVector = setDirectorVector_averageZ;
            this.z = 0;
            break;
        case svg3d.ALL_TO_ALL:
            this.setDirectorVector = setDirectorVector_default;
            this.directorVector = [0, 0, 0];
            this.position = [0, 0, 0];
            break;
        default:
            this.setDirectorVector = setDirectorVector_default;
            this.directorVector = [0, 0, 0];
            this.position = [0, 0, 0];
            break;
    }
}

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
    var pt3d = [0, 0, 0];
    var points = [];
    var newD = "";
    var ch, coord, x_axis_rotation, large_arc_flag, sweep_flag, isAbsolute, relativeOriginRefreshAt;
    var pathLength = this.coords.length;
    for (this.index = 0 ; this.index < pathLength ;) {
        ch = this.coords.charAt(this.index);
        isAbsolute = true;
        relativeOriginRefreshAt = 0;
        switch (ch) {
            case "c":
                // ends at 3
                relativeOriginRefreshAt++;
            case "s":
            case "q":
                // ends at 2
                relativeOriginRefreshAt++;
            case "m":
            case "l":
            case "t":
                // ends at 1
                relativeOriginRefreshAt++;
                var relativeOriginPt = cloneArray(pt3d);
                var relativeOriginIndex = 0;
                ch = ch.toUpperCase();
                //(x y)+ or s(x2 y2 x y)+ or q(x1 y1 x y)+ or c(x1 y1 x2 y2 x y)+
                this.index++;
                for (coord = this.getCoord() ; coord !== undefined ; coord = this.getCoord()) {
                    this.getPointCumul(pt3d, coord, relativeOriginPt);
                    relativeOriginIndex++;
                    if (relativeOriginIndex === relativeOriginRefreshAt) {
                        relativeOriginPt = cloneArray(pt3d);
                        relativeOriginIndex = 0;
                    }
                    newD += ch + transformAndStore(pt3d, matrixArray, points);
                    //if the loop is executed more than once, then a comma is dumped between points
                    ch = ",";
                }
                relativeOriginRefreshAt = 0;
                break;
            case "M":
            case "L":
            case "C":
            case "S":
            case "Q":
            case "T":
                //(x y)+ or s(x2 y2 x y)+ or q(x1 y1 x y)+ or c(x1 y1 x2 y2 x y)+
                this.index++;
                for (coord = this.getCoord() ; coord !== undefined ; coord = this.getCoord()) {
                    this.getPoint(pt3d, coord);
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
                    var oldPt3d = cloneArray(pt3d);
                    transformPoint(matrixArray, oldPt3d);
                    svg3d.projectPoint3d(oldPt3d);
                    // the pt3d retrieved here is radial so it is relative
                    this.getPointCumul(pt3d, coord, pt3d);
                    //does not modify pt3d for support of relative coords
                    var newPt3d = cloneArray(pt3d);
                    transformPoint(matrixArray, newPt3d);
                    svg3d.projectPoint3d(newPt3d);
                    var rx = newPt3d[0] - oldPt3d[0];
                    var ry = newPt3d[1] - oldPt3d[1];
                    newD += ch + Math.abs(rx) + "," + Math.abs(ry);
                    //TODO modify x_axis_rotation with rotation on y (-rotY % (2*Math.PI)) * 360 / (2*Math.PI)
                    x_axis_rotation = this.getCoord();
                    large_arc_flag = this.getCoord();
                    sweep_flag = this.getCoord();
                    newD += " " + x_axis_rotation + " " + large_arc_flag + " " + sweep_flag + " ";
                    if (isAbsolute) {
                        this.getPoint(pt3d, this.getCoord());
                    } else {
                        this.getPointCumul(pt3d, this.getCoord(), oldPt3d);
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
}

Path.prototype = new Shape();
Path.constructor = Path;

function Path(domNode) {
    Shape.call(this, domNode);
    if (domNode) {
        this.coords = domNode.getAttribute("d");
    }
}

function getPt2d(pt3d, firstCoord) {
    pt3d[0] = firstCoord;
    pt3d[1] = this.getCoord();
    pt3d[2] = 0;
}
function getPt2dCumul(pt3d, firstCoord, relativeOriginPt) {
    pt3d[0] = relativeOriginPt[0] + firstCoord;
    pt3d[1] = relativeOriginPt[1] + this.getCoord();
}
function getXZ2d(pt3d, firstCoord) {
    pt3d[0] = firstCoord;
    pt3d[2] = 0;
}
function getXZ2dCumul(pt3d, firstCoord) {
    pt3d[0] += firstCoord;
}
function getYZ2d(pt3d, firstCoord) {
    pt3d[1] = firstCoord;
    pt3d[2] = 0;
}
function getYZ2dCumul(pt3d, firstCoord) {
    pt3d[1] += firstCoord;
}

Path.prototype.transform = transformPath;
Path.prototype.getPoint = getPt2d;
Path.prototype.getPointCumul = getPt2dCumul;
Path.prototype.getXZ = getXZ2d;
Path.prototype.getXZCumul = getXZ2dCumul;
Path.prototype.getYZ = getYZ2d;
Path.prototype.getYZCumul = getYZ2dCumul;
Path.prototype.cloneOn = function(domNode) {
    domNode.setAttribute("d", this.coords);
    var clone = new Path(domNode);
    return clone;
};

/*
http://mckoss.com/jscript/object.htm
*/
Path3d.prototype = new Path();
Path3d.constructor = Path3d;

function Path3d(domNode) {
    Path.call(this, domNode);
}

function getPt3d(pt3d, firstCoord) {
    pt3d[0] = firstCoord;
    pt3d[1] = this.getCoord();
    pt3d[2] = this.getCoord();
}
/*
get next 3d or 2d coordinates in the string and adds it to current point
*/
function getPt3dCumul(pt3d, firstCoord, relativeOriginPt) {
    pt3d[0] = relativeOriginPt[0] + firstCoord;
    pt3d[1] = relativeOriginPt[1] + this.getCoord();
    pt3d[2] = relativeOriginPt[2] + this.getCoord();
}
function getXZ3d(pt3d, firstCoord) {
    pt3d[0] = firstCoord;
    pt3d[2] = this.getCoord();
}
function getXZ3dCumul(pt3d, firstCoord) {
    pt3d[0] += firstCoord;
    pt3d[2] += this.getCoord();
}
function getYZ3d(pt3d, firstCoord) {
    pt3d[1] = firstCoord;
    pt3d[2] = this.getCoord();
}
function getYZ3dCumul(pt3d, firstCoord) {
    pt3d[1] += firstCoord;
    pt3d[2] += this.getCoord();
}
Path3d.prototype.getPoint = getPt3d;
Path3d.prototype.getPointCumul = getPt3dCumul;
Path3d.prototype.getXZ = getXZ3d;
Path3d.prototype.getXZCumul = getXZ3dCumul;
Path3d.prototype.getYZ = getYZ3d;
Path3d.prototype.getYZCumul = getYZ3dCumul;
Path3d.prototype.cloneOn = function(domNode) {
    domNode.setAttribute("d", this.coords);
    var clone = new Path3d(domNode);
    return clone;
};


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
}

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
        if (rxAtt !== undefined) {
            this.rx = parseFloat(rxAtt);
        } else {
            this.rx = 0;
        }
        var ryAtt = domNode.getAttribute("ry");
        if (ryAtt !== undefined) {
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
}

Rect.prototype.transform = transformPath;
Rect.prototype.getPoint = getPt2d;
Rect.prototype.getPointCumul = getPt2dCumul;
Rect.prototype.getXZ = getXZ2d;
Rect.prototype.getXZCumul = getXZ2dCumul;
Rect.prototype.getYZ = getYZ2d;
Rect.prototype.getYZCumul = getYZ2dCumul;
// The original domNode has not been modified, the domNode passed here must be the hidden domNode
Rect.prototype.cloneOn = function(domNode) {
    var clone = new Rect(domNode);
    return clone;
};


function transformPolyline(matrixArray) {
    this.index = 0;
    var pt3d = [0, 0, 0];
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
}

Polyline.prototype = new Shape();
Polyline.constructor = Shape;

function Polyline(domNode) {
    Shape.call(this, domNode);
    if (domNode) {
        this.coords = domNode.getAttribute("points");
    }
}

Polyline.prototype.transform = transformPolyline;
Polyline.prototype.getPoint = getPt2d;
Polyline.prototype.cloneOn = function(domNode) {
    this.domNode.setAttribute("points", this.coords);
    var clone = new Polyline(domNode);
    return clone;
};

Polyline3d.prototype = new Polyline();
Polyline3d.constructor = Polyline;

function Polyline3d(domNode) {
    Polyline.call(this, domNode);
}

Polyline3d.prototype.getPoint = getPt3d;
Polyline3d.prototype.cloneOn = function(domNode) {
    this.domNode.setAttribute("points", this.coords);
    var clone = new Polyline3d(domNode);
    return clone;
};

function transformCircle(matrixArray) {
    var pt3d = cloneArray(this.center);
    var points = [];
    transformPoint(matrixArray, pt3d);
    //points are stored before projection
    if (svg3d.sortAlgo !== svg3d.NONE) {
        points.push(pt3d);
    }
    svg3d.projectPoint3d(pt3d);
    this.setDirectorVector(points);
    //reduces or increases the radius of the circle (sphere)
    var perspectiveRatio = svg3d.focalDistance / (svg3d.focalDistance + (pt3d[2] / svg3d.zRatio));
    var newRadius = this.radius * perspectiveRatio;
    this.domNode.setAttribute("cx", pt3d[0]);
    this.domNode.setAttribute("cy", pt3d[1]);
    this.domNode.setAttribute("r", newRadius);
}

Circle.prototype = new Shape();
Circle.constructor = Shape;

function Circle(domNode) {
    Shape.call(this, domNode);
    if (domNode) {
        this.radius = domNode.getAttribute("r");
        this.center = [0, 0, 0];
        this.center[0] = domNode.getAttribute("cx");
        this.center[1] = domNode.getAttribute("cy");
        this.center[2] = 0;
    }
}

Circle.prototype.transform = transformCircle;
Circle.prototype.cloneOn = function(domNode) {
    this.domNode.setAttribute("r", this.radius);
    this.domNode.setAttribute("cx", this.center[0]);
    this.domNode.setAttribute("cy", this.center[1]);
    var clone = new Circle(domNode);
    return clone;
};

Circle3d.prototype = new Circle();
Circle3d.constructor = Circle;

function Circle3d(domNode) {
    Circle.call(this, domNode);
    if (domNode) {
        this.center[2] = domNode.getAttribute("z:cz");
    }
}

Circle3d.prototype.cloneOn = function(domNode) {
    this.domNode.setAttribute("r", this.radius);
    this.domNode.setAttribute("cx", this.center[0]);
    this.domNode.setAttribute("cy", this.center[1]);
    this.domNode.setAttribute("z:cz", this.center[2]);
    var clone = new Circle3d(domNode);
    return clone;
};

Group.prototype = new Shape();
Group.constructor = Shape;

function Group(domNode, subShapes) {
    Shape.call(this, domNode);
    if (subShapes === undefined) {
        this.subShapes = [];
        addShapes(this.subShapes, domNode);
    } else {
        this.subShapes = subShapes;
    }
}

function addShapes(shapes, parentNode) {
    if (parentNode) {
        for (var node = getFirstChildElement(parentNode) ; node ; node = getNextSiblingElement(node)) {
            var shape = svg3d.shapeFactory(node);
            if (shape) {
                shapes.push(shape);
            }
        }
    }
}

function addClonedSubShapes(clonedSubShapes, subShapes, parentNode) {
    if (parentNode) {
        for (var node = getFirstChildElement(parentNode), i = 0 ; node ; node = getNextSiblingElement(node), i++) {
            var clonedSubShape = subShapes[i].cloneOn(node);
            clonedSubShapes.push(clonedSubShape);
        }
    }
}

Group.prototype.transform = function(matrixArray) {
    var i = this.subShapes.length;
    while (i--) {
        this.subShapes[i].transform(matrixArray);
    }
    this.setDirectorVector();
};

Group.prototype.cloneOn = function(domNode) {
    var clonedSubShapes = [];
    addClonedSubShapes(clonedSubShapes, this.subShapes, domNode);
    var clone = new Group(domNode, clonedSubShapes);
    return clone;
};

Group.prototype.assignSetDirectorVector = function() {
    switch (svg3d.sortAlgo) {
        case svg3d.NONE:
            this.setDirectorVector = function() {};
            break;
        case svg3d.AVERAGE_Z:
            this.setDirectorVector = function() {
                // z will be the average z of all the shapes contained in that g tag
                var sumZ = 0, i = this.subShapes.length;
                while (i--) {
                    sumZ += this.subShapes[i].z;
                }
                this.z = sumZ / this.subShapes.length;
            };
            this.z = 0;
            break;
        case svg3d.ALL_TO_ALL:
            this.setDirectorVector = this.setPositionDirectorVectorAverage;
            this.directorVector = [0, 0, 0];
            this.position = [0, 0, 0];
            break;
        default:
            this.setDirectorVector = this.setPositionDirectorVectorAverage;
            this.directorVector = [0, 0, 0];
            this.position = [0, 0, 0];
            break;
    }
};

Group.prototype.setPositionDirectorVectorAverage = function(points) {
    // position and director vector will be the average position and director vector of all the shapes contained in that g tag
    var sumPosition = [0, 0, 0], sumDirectorVector = [0, 0, 0], i = this.subShapes.length;
    while (i--) {
        sumPosition[0] += this.subShapes[i].position[0];
        sumPosition[1] += this.subShapes[i].position[1];
        sumPosition[2] += this.subShapes[i].position[2];
        sumDirectorVector[0] += this.subShapes[i].position[0];
        sumDirectorVector[1] += this.subShapes[i].position[1];
        sumDirectorVector[2] += this.subShapes[i].position[2];
    }
    this.position[0] = sumPosition[0] / this.subShapes.length;
    this.position[1] = sumPosition[1] / this.subShapes.length;
    this.position[2] = sumPosition[2] / this.subShapes.length;
    this.directorVector[0] = sumDirectorVector[0] / this.subShapes.length;
    this.directorVector[1] = sumDirectorVector[1] / this.subShapes.length;
    this.directorVector[2] = sumDirectorVector[2] / this.subShapes.length;
};

function setDirectorVector_averageZ(points) {
    var i = points.length - 1;
    var sumZ = points[i][2];
    while (i--) {
        sumZ += points[i][2];
    }
    this.z = sumZ / points.length;
}

function setDirectorVector_default(points) {
    switch (points.length) {
        case 0:
            this.directorVector[0] = 0;
            this.directorVector[1] = 0;
            this.directorVector[2] = 0;
            this.position = [0, 0, 0];
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
            var i = points.length - 1;
            this.position[0] = points[i][0];
            this.position[1] = points[i][1];
            this.position[2] = points[i][2];
            while (i--) {
                this.position[0] += points[i][0];
                this.position[1] += points[i][1];
                this.position[2] += points[i][2];
            }
            this.position[0] = this.position[0] / points.length;
            this.position[1] = this.position[1] / points.length;
            this.position[2] = this.position[2] / points.length;
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
}

svg3d.shapeFactory = function(domNode) {
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
        case "g":
            returnedShape = new Group(domNode);
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
    return returnedShape;
}

function transformAndStore(pt3d, matrixArray, points) {
    //does not modify pt3d for support of relative coords
    var newPt3d = cloneArray(pt3d);
    if (newPt3d[2] === undefined) {
        newPt3d[2] = 0;
    }
    transformPoint(matrixArray, newPt3d);
    //points are stored before projection
    if (svg3d.sortAlgo !== svg3d.NONE) {
        points.push(cloneArray(newPt3d));
    }
    svg3d.projectPoint3d(newPt3d);
    return newPt3d[0] + "," + newPt3d[1];
}

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
}

svg3d.projectPoint3d = function(pt3d) {
    var perspectiveRatio = svg3d.focalDistance / (svg3d.focalDistance + (pt3d[2] / svg3d.zRatio));
    pt3d[0] = (pt3d[0] - svg3d.xOrigin) * perspectiveRatio + svg3d.xInfinite;
    pt3d[1] = (pt3d[1] - svg3d.yOrigin) * perspectiveRatio + svg3d.yInfinite;
}

// Sets the specified matrix to a rotation matrix
svg3d.setAnglesRotationMatrix = function(rotx, roty, rotz) {
    // Assuming the angles are in radians
    var cx = Math.cos(rotx);
    var sx = Math.sin(rotx);
    var cy = Math.cos(roty);
    var sy = Math.sin(roty);
    var cz = Math.cos(rotz);
    var sz = Math.sin(rotz);
    return svg3d.setRotationMatrix(cx, sx, cy, sy, cz, sz);
}

svg3d.setRotationMatrix = function(cx, sx, cy, sy, cz, sz) {
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
}

svg3d.setTranslationMatrix = function(x, y, z) {
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
}

svg3d.sortFacesAverageZ = function(pathArray) {
    var indexArray = [];
    var i = pathArray.length;
    while (i--) {
        var current = pathArray[i];
        var j = indexArray.length;
        while (j && pathArray[indexArray[j-1]].z > current.z) {
            //translates to the right
            indexArray[j] = indexArray[j-1];
            j--;
        }
        //only dumps the index of the path
        indexArray[j] = i;
    }
    return indexArray;
}

svg3d.sortFacesOneToAll = function(pathArray) {
    var indexArray = [];
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
}

svg3d.sortFacesAllToAll = function(pathArray) {
    var indexArray = [];
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
}

/*
With :
- A is the position of the camera
- B is the position of the face
- P is the position of the reference face
- u is the director vector of the reference
if AP . u and BP . u have opposite signs, then they are not on the same side of the plan, then face is behind reference

A is ( 0, 0, -infinite )
AP . u = APx * ux + APy * uy + APz * uz = Px * ux + Py * uy + (Pz  + infinite) * uz
If uz = 0 then AP . u = Px * ux + Py * uy and it must be calculated
But if uz != 0 then it is infinite or -infinite and AP . u has the sign of uz

BP . u = BPx * ux + BPy * uy + BPz * uz
BP . u = ( Px - Bx ) * ux + ( Py - By ) * uy + ( Pz - Bz ) * uz

*/
function isBehind(face, reference) {
    var u = reference.directorVector;
    var p = reference.position;
    var b = face.position;
    var bpu = (p[0] - b[0]) * u[0] + (p[1] - b[1]) * u[1] + (p[2] - b[2]) * u[2];
    if (u[2] === 0) {
        var apu = p[0] * u[0] + p[1] * u[1];
        if (bpu * apu < 0) {
            return true;
        }
        return false;
    }
    if (bpu * u[2] < 0) {
        return true;
    }
    return false;
}

/*
Expose Objects
*/

svg3d.Shape = Shape;
svg3d.Path = Path;
svg3d.Path3d = Path3d;
svg3d.Rect = Rect;
svg3d.Polyline = Polyline;
svg3d.Polyline3d = Polyline3d;
svg3d.Circle = Circle;
svg3d.Circle3d = Circle3d;

window.svg3d = svg3d;

})( window );
