/*jshint esnext: true*/
/*jslint
    es6, maxerr: 10, node
*/
/*global chrome:false, document:false, console:false,
  d3:false*/
(function (window) {
  'use strict';
  var r = 35;
  var svg = d3.select('html')
          .append('svg')
          .attr('id', 'ripple-extension-svg')
          .style('z-index', '2147483647')
          .style('width', '100%')
          .style('height', '100%')
          .style('position', 'fixed')
          .style('top', 0)
          .style('right', 0)
          .style('bottom', 0)
          .style('left', 0)
          .style('pointer-events', 'none');

  var positionLabel = svg.append("text")
          .attr("x", 10)
          .attr("y", 30);

  var isOn = false;
  chrome.runtime.onMessage.addListener(function (request) {
    if (request.op === 'switch') {
      isOn = request.value;
    }
  });
  document.body.addEventListener("click", function (ev) { //<-D
    var i;
    if (!isOn) {
      return;
    }
    d3.select("body").style('height', '100%');
    for (i = 0; i < 3; i += 1) {
        //var position = d3.mouse(svg.node());
        let position = [ev.clientX, ev.clientY];
        let circle = svg.append("circle")
                .attr("cx", position[0])
                .attr("cy", position[1])
                .attr("r", 0)
                .style('fill', 'none')
                .style('stroke', '#cc0000')
                .style("stroke-width", 5 / (i))
                .transition()
                    .delay(Math.pow(i, 2.5) * 50)
                    .duration(600)
                    .ease('quad-out')
                .attr("r", r)
                .style("stroke-opacity", 0)
                .each("end", function () {
                    d3.select(this).remove();
                });
    }
  }, true);

  /*
    body {
            font-family: "helvetica";
            height: 100%;
    }

    svg {
      pointer-events: none;
      width: 100%;
      height: 100%;
    }

    circle {
      fill: none;
      stroke: #cc0000;
    }
  */
}(this));
