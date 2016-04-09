/*jshint esnext: true*/
/*jslint
    es6, maxerr: 10, node
*/
/*global chrome:false, document:false, console:false,
  d3:false*/
(function (window) {
  'use strict';
  var r = 20;
  var color = '#cc0000';
  var duration = 500;
  var transition = 'quad-out';
  var ripplecount = 2;
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

  var isOn = false;
  function setOptions(opts) {
    color = opts.color;
    r = opts.radius;
    duration = opts.duration;
    transition = opts.transition;
    ripplecount = opts.ripplecount;
  }
  chrome.runtime.onMessage.addListener(function (request) {
    if (request.op === 'switch') {
      isOn = request.value;
    }
    if (request.op === 'options') {
      setOptions(request.value);
    }
  });
  function showRipple(ev) { //<-D
    var i;
    if (!isOn) {
      return;
    }
    d3.select("body").style('height', '100%');
    for (i = 0; i < ripplecount; i += 1) {
        //var position = d3.mouse(svg.node());
        let position = [ev.clientX, ev.clientY];
        let circle = svg.append("circle")
                .attr("cx", position[0])
                .attr("cy", position[1])
                .attr("r", 0)
                .style('fill', 'none')
                .style('stroke',color)
                .style("stroke-width", 3 / (i + 1))
                .transition()
                    .delay(Math.pow(i, 1.1) * duration/ripplecount/2)
                    .duration(duration)
                    .ease(transition)
                .attr("r", r)
                .style("stroke-opacity", 0)
                .each("end", function () {
                    d3.select(this).remove();
                });
    }
  }
  document.body.addEventListener("click", showRipple, true);
  if (window.RippleOptionsPage) {
    RippleOptionsPage.pubsub.sub('optionsChanged', function (opts) {
      setOptions(opts);
    });
    RippleOptionsPage.optionsPromise.then(function (opts) {
      setOptions(opts);
    });
    isOn = true;

  }
}(this));
