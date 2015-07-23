// $(document).ready(function() {

  var width = 500, height = 500;
  var projection = d3.geo.orthographic()
    .scale(200)
    .translate([width / 2, height / 2])
    .clipAngle(90);
  var path = d3.geo.path()
    .projection(projection);
  var graticule = d3.geo.graticule();
  var svg = d3.select(".globe").append("svg")
    .attr("width", width)
    .attr("height", height);

  var drag = d3.behavior.drag()
    .origin(function() {
      var r = projection.rotate();
      return {x: r[0], y: -r[1]}
    })
    .on("dragstart", function() {
      clearInterval(globeSpin);
    })
    .on("drag", function() {
      projection.rotate([d3.event.x, -d3.event.y]);
      svg.selectAll("path").attr("d", path);
    });

  svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

  //for some reason, only occasionally works if drag is called
  //after the country paths are drawn - too laggy?
  svg.call(drag);

  d3.json(window.location.origin + "/js/world-110m.json", function(error, world) {
    if (error) throw error;

    svg.append("path")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);
  });


  /* works, but maxes out CPU - not really what d3.timer is designed for apparently... http://stackoverflow.com/questions/13390438/how-do-you-set-periodic-timers-in-d3-js */
  // d3.timer(function(){
  //   var r = projection.rotate();
  //   console.log(r[0] + 1);
  //   projection.rotate([r[0] + 1, r[1]]);
  //   svg.selectAll("path").attr("d", path);
  // });

  var globeSpin = setInterval(function() {
    var r = projection.rotate();
    projection.rotate([r[0] + 0.5, r[1]]);
    svg.selectAll("path").attr("d", path);
  }, 25);

// });
