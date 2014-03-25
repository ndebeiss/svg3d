svg3d.xInfinite = 600;
svg3d.yInfinite = 10;
svg3d.xOrigin = 600;
svg3d.yOrigin = 10;
//zRatio = 20;
svg3d.sortAlgo = svg3d.AVERAGE_Z;

$( document ).ready(function() {
  $("#g3172").animate({
    svg3d: {
      translate3d : {x: 0, y: 0, z: 0},
      clone3d: {
        row: 10,
        x: 50,
        surface: 100,
        y: -50,
        z: 50,
        nb: 0
      },
    }
  }, {
    duration: 1000, 
    easing: "easeInCubic"
  });
  
});
