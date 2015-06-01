#svg3d

Add third dimension to SVG pictures, declare and manipulate 3d declared SVG.

Demonstration web page is : http://debeissat.nicolas.free.fr/svg3d.php
With explanations on the algorithms used.

##Quick start

Once you drew your SVG picture under inkscape for example, add the following attributes to svg tag :

```HTML
xmlns:z="http://debeissat.nicolas.free.fr/svg3d/svg3d.rng" onload="svg3d.init(this)"
```

And the following tags under the svg tag :

```HTML
    <script type="text/ecmascript" xlink:href="../svg3d/svg3d.js"></script>
    <script type="text/ecmascript" xlink:href="../svg3d/svg3d_parsing.js"></script>
    <script type="text/ecmascript" xlink:href="../svg3d/dom_utils.js"></script>
```

The SVG is then parsed and you can begin 3D modifications.

##3D declarations

The simplest way is to declare your coordinates with a 3rd figure which will be the value of the z coordinate of the point.


Initial repository was : https://code.google.com/p/svg3d/

