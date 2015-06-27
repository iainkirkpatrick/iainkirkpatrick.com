$(document).ready(function() {
  var width = 800,
      height = 500;

  var projection = d3.geo.orthographic()
      .scale(250)
      .translate([width / 2, height / 2])
      .clipAngle(90);

  var path = d3.geo.path()
      .projection(projection);

  var λ = d3.scale.linear()
      .domain([0, width])
      .range([-180, 180]);

  var φ = d3.scale.linear()
      .domain([0, height])
      .range([90, -90]);

  var svg = d3.select(".globe").append("svg")
      .attr("width", width)
      .attr("height", height);

  //drag behaviour for globe dragging
  var drag = d3.behavior.drag()
    .origin(function() {
      var r = projection.rotate();
      console.log(r);
      // return {x: λ(r[0]), y: φ(r[1])};
      return {x: r[0], y: r[1]}
    })
    .on("drag", function() {
      projection.rotate([λ(d3.event.x), φ(d3.event.y)]);
      svg.selectAll("path").attr("d", path);
      //console.log("being dragged!", d3.event);
    });

  //interactivity
  svg.call(drag);
  // svg.on("mousemove", function() {
  //   var p = d3.mouse(this);
  //   console.log(p);
  //   projection.rotate([λ(p[0]), φ(p[1])]);
  //   svg.selectAll("path").attr("d", path);
  // });

  d3.json("js/world-110m.json", function(error, world) {
    if (error) throw error;

    svg.append("path")
        .datum(topojson.feature(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);
  });
})
