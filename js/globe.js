$(document).ready(function() {
  console.log("let's globe");

  var width = 500, height = 500;
  var projection = d3.geo.orthographic()
    .scale(200)
    .translate([width / 2, height / 2])
    .clipAngle(90);
  var path = d3.geo.path()
    .projection(projection);
  var svg = d3.select(".globe").append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.json("js/world-110m.json", function(error, world) {
    if (error) throw error;

    svg.append("path")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);
  });
});

/* DAVIES VERSION */
// $(document).ready(function() {
//
//   var width = 350, height = 350,
//     projection0 = orthographicProjection(width, height),
//     path0 = d3.geo.path().projection(projection0);
//
//   var comparison0 = d3.select(".globe").append("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .call(drawMap, path0, true);
//   comparison0.selectAll(".foreground")
//     .call(d3.behavior.drag()
//       .origin(function() { var r = projection0.rotate(); return {x: r[0], y: -r[1]}; })
//       .on("drag", function() {
//         projection0.rotate([d3.event.x, -d3.event.y]);
//         comparison0.selectAll("path").attr("d", path0);
//       }));
//
//   function drawMap(svg, path, mousePoint) {
//     var projection = path.projection();
//
//     svg.append("path")
//         .datum(d3.geo.graticule())
//         .attr("class", "graticule")
//         .attr("d", path);
//
//     // svg.append("path")
//     //     .datum({type: "Sphere"})
//     //     .attr("class", "foreground")
//     //     .attr("d", path)
//     //     .on("mousedown.grab", function() {
//     //       var point;
//     //       if (mousePoint) point = svg.insert("path", ".foreground")
//     //           .datum({type: "Point", coordinates: projection.invert(d3.mouse(this))})
//     //           .attr("class", "point")
//     //           .attr("d", path);
//     //       var path = d3.select(this).classed("zooming", true),
//     //           w = d3.select(window).on("mouseup.grab", function() {
//     //             path.classed("zooming", false);
//     //             w.on("mouseup.grab", null);
//     //             if (mousePoint) point.remove();
//     //           });
//     //     });
//   };
//
//   function orthographicProjection(width, height) {
//     return d3.geo.orthographic()
//         .precision(.5)
//         .clipAngle(90)
//         .clipExtent([[-1, -1], [width + 1, height + 1]])
//         .translate([width / 2, height / 2])
//         .scale(width / 2 - 10)
//         .rotate([0, -30]);
//   };
//
// });


/* BOSTOCK VERSION */
// $(document).ready(function() {
//   var width = 350,
//       height = 350;
//
//   var projection = d3.geo.orthographic()
//       .scale(250)
//       .translate([width / 2, height / 2])
//       .clipAngle(90);
//
//   var path = d3.geo.path()
//       .projection(projection);
//
//   var λ = d3.scale.linear()
//       .domain([0, width])
//       .range([-180, 180]);
//
//   var φ = d3.scale.linear()
//       .domain([0, height])
//       .range([90, -90]);
//
//   var svg = d3.select(".globe").append("svg")
//       .attr("width", width)
//       .attr("height", height);
//
//   //drag behaviour for globe dragging
//   var drag = d3.behavior.drag()
//     .origin(function() {
//       var r = projection.rotate();
//       console.log(r);
//       return {x: λ(r[0]), y: φ(r[1])};
//       // return {x: r[0], y: r[1]}
//     })
//     .on("drag", function() {
//       projection.rotate([λ(d3.event.x), φ(d3.event.y)]);
//       svg.selectAll("path").attr("d", path);
//       //console.log("being dragged!", d3.event);
//     });
//
//   //interactivity
//   svg.call(drag);
//   // svg.on("mousemove", function() {
//   //   var p = d3.mouse(this);
//   //   console.log(p);
//   //   projection.rotate([λ(p[0]), φ(p[1])]);
//   //   svg.selectAll("path").attr("d", path);
//   // });
//
//   d3.json("js/world-110m.json", function(error, world) {
//     if (error) throw error;
//
//     svg.append("path")
//         .datum(topojson.feature(world, world.objects.land))
//         .attr("class", "land")
//         .attr("d", path);
//   });
// })
