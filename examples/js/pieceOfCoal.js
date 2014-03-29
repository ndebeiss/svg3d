svg3d.xInfinite = 600;
svg3d.yInfinite = 10;
svg3d.xOrigin = 600;
svg3d.yOrigin = 10;
//zRatio = 20;
svg3d.sortAlgo = svg3d.AVERAGE_Z;

$( document ).ready(function() {
  $("#g3172").animate({
    svg3d: {
      translate3d : {x: 400, y: 300, z: 1000}
    }
  }, {
    duration: 1000, 
    easing: "easeInCubic"
  });
  
});
