svg3d.xInfinite = 600;
svg3d.yInfinite = 10;
svg3d.xOrigin = 600;
svg3d.yOrigin = 10;
//zRatio = 20;
svg3d.sortAlgo = svg3d.AVERAGE_Z;

$( document ).ready(function() {
  $("#g3038").animate({
    svg3d: {
      clone3d: {
        row: 10,
        x: 50,
        layer: 100,
        y: 50,
        z: 50,
        nb: 300
      }
    },
    yInfinite: 300,
    yOrigin: 200,
    xInfinite: 0,
    xOrigin: -600
  }, {
    duration: 4000, 
    easing: "easeInOutCubic",
    specialEasing: {
      yInfinite: "easeInCubic",
      yOrigin: "easeInCubic"
    }
  });
  
});
