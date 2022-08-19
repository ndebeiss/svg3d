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

### On HTML tags

With https://www.w3.org/TR/css-transforms-1/ (working draft), the transformations done in that library in JS could be done with CSS.
The support on [HTML tags](https://www.scaler.com/topics/html/html-tags/) becomes good, especially with the CSS attribute : 
```css
transformStyle="preserve-3d" :
```
which manages stacking of shapes.

Below the result of test with https://www.w3schools.com/cssref/trycss3_transform-style_inuse.htm :

| Firefox | Chrome | Internet Explorer |
| --- | --- | --- |
| ![preserve-3d on Firefox](https://github.com/ndebeiss/svg3d/blob/master/doc/Capture_firefox_preserve-3d.PNG "preserve-3d on Firefox") | ![preserve-3d on Chrome](https://github.com/ndebeiss/svg3d/blob/master/doc/Capture_chrome_preserve-3d.PNG "preserve-3d on Chrome") | ![preserve-3d on Internet Explorer](https://github.com/ndebeiss/svg3d/blob/master/doc/Capture_IE_preserve-3d.PNG "preserve-3d on Internet Explorer") |

Firefox makes it work, Chrome even splits the rectangle if only a part of it is behind, but Internet Explorer does not show any intention to make the yellow rectangle going behind the other, with any rotation angle applied.

### On SVG tags

CSS 3d transformation on SVG tags is a lot more recent.

Below the result of test with my test file : https://github.com/ndebeiss/svg3d/blob/master/tests/css_3d_transform.svg

| Firefox | Chrome | Internet Explorer |
| --- | --- | --- |
| ![preserve-3d on Firefox](https://github.com/ndebeiss/svg3d/blob/master/doc/Capture_firefox_preserve-3d_SVG.PNG "preserve-3d on Firefox") | ![preserve-3d on Chrome](https://github.com/ndebeiss/svg3d/blob/master/doc/Capture_chrome_preserve-3d_SVG.PNG "preserve-3d on Chrome") | ![preserve-3d on Internet Explorer](https://github.com/ndebeiss/svg3d/blob/master/doc/Capture_IE_preserve-3d_SVG.PNG "preserve-3d on Internet Explorer") |

These are screenshots at the end of the animation. The blue rectangle rotates around Y axe and should pass above yellow rectangle, then the green rectangle comes from behind, passes above yellow rectangle, then passes above blue one.

Only Firefox handles it well. Chrome makes the animation, but it does not manage the stacking. Internet Explorer does not apply the CSS 3d transformations at all.

## Make it 3D

Below, 3 possible ways of using svg3d library.

### Declare 3D coordinates

The simplest way to add the 3rd dimension is to declare your coordinates with a 3rd number which will be the value of the z coordinate of the point.
In order to do that, add an attribute to the tag :

```HTML
z:threeD="true"
```

Then you can declare a shape like :

```HTML
<path d="M200,100,400 A1.571,1.571,0 30 0,1 0,100,400" fill="none" stroke="blue" stroke-width="5" z:threeD="true"/>
```

This is for paths objects. For other use cases, browse the examples given.

### Declare 3D transformations

Or you can apply 3D transformations to a 2D shape adding z:rotation or z:translation tags inside the SVG tag like :

```HTML
<z:rotation rotX="0.628" incRotX="0.07" incRotY="0.1" incRotZ="0.3"/>
<z:translation z="-75" />
```

### Programmatically apply 3D transformations

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


