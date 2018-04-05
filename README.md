# svg3d

Add third dimension to SVG pictures, declare and manipulate 3d declared SVG.

Demonstration web page is : http://debeissat.nicolas.free.fr/svg3d.php
with explanations on the algorithms used.

## Quick start

Once you drew your SVG picture under Inkscape for example, add the following attributes to SVG tag :

```HTML
<svg xmlns:z="http://debeissat.nicolas.free.fr/svg3d/svg3d.rng" onload="svg3d.init(this)">
```

And the following tags under the SVG tag :

```HTML
    <script type="text/ecmascript" xlink:href="../svg3d/svg3d.js"></script>
    <script type="text/ecmascript" xlink:href="../svg3d/svg3d_parsing.js"></script>
    <script type="text/ecmascript" xlink:href="../svg3d/dom_utils.js"></script>
```

The SVG is then parsed and you can begin 3D modifications.

## Comparison with new CSS 3d transformations

With https://www.w3.org/TR/css-transforms-1/ (working draft), the transformations done in that library in JS can be done with CSS applied on SVG tags.
The support on HTML tags becomes good, especially the CSS attribute : 
```css
transformStyle="preserve-3d" :
```
which manages stacking of shapes.

IE11 should have support for it, but the example :
https://www.w3schools.com/cssref/trycss3_transform-style_inuse.htm
does not work on my IE11 at the time of writing.

Firefox does make it work, and Chrome even splits the shape if a part of it is behind and the other part is above.

CSS 3d transformation on SVG tags is a lot more recent.

You can test support of CSS 3d transformations on that file :
https://github.com/ndebeiss/svg3d/blob/master/tests/css_3d_transform.svg

## Declare 3D coordinates

The simplest way to add the 3rd dimension is to declare your coordinates with a 3rd number which will be the value of the z coordinate of the point.
In order to do that, add an attribute to the tag :

```HTML
z:threeD="true"
```

Then you can declare a shape like :

```HTML
<path d="M200,100,400 A1.571,1.571,0 30 0,1 0,100,400" fill="none" stroke="blue" stroke-width="5" z:threeD="true"/>
```

## Declare 3D transformations

Or you can apply 3D transformations to a 2D shape adding z:rotation or z:translation tags inside the SVG tag like :

```HTML
<z:rotation rotX="0.628" incRotX="0.07" incRotY="0.1" incRotZ="0.3"/>
<z:translation z="-75" />
```

## Programmatically apply 3D transformations

In that case do not add the attribute :

```HTML
onload="svg3d.init(this)"
```

Instead, create the svg3d objects individually by calling following function on DOM nodes :

```JavaScript
var shape = svg3d.shapeFactory(node);
```

and apply the matrix array you want by calling :

```JavaScript
var matrixArray = [];
matrixArray[0] = svg3d.setAnglesRotationMatrix(30,60,10);
matrixArray[1] = svg3d.setTranslationMatrix(0,0,-60);
shape.transform(matrixArray);
```


