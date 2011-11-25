// Handling of graphical elements in index.html (svg manipulation, etc.)





// GUI.
//
// Actually, this is all about popovers in the page.
// It uses JQuery.

$(function () {
  $("input[rel=popover]")
    .popover({
      offset: 10
    })
    .click(function(e) {
      e.preventDefault()
    });
  $("rect[rel=popover]")
    .popover({
      offset: 10
    })
    .click(function(e) {
      e.preventDefault()
    })
})


// Wagon movements (UI primitives).
//
// The basic idea is to change the x and y coordinates of the wagons.

function setpos (object, x, y) {
  object.setAttribute('x', x + '');
  object.setAttribute('y', y + '');
}

function setposcentered (object, x, y) {
  var halfwidth = Number(object.getAttribute('width')) / 2,
      halfheight = Number(object.getAttribute('height')) / 2;
  setpos(object, x - halfwidth, y - halfheight);
}

// Speed is given in pixels / milliseconds.
// Object is something of the form
// {dom:dom element, timeout:number}.
function move (object, from, length, speed, whendone) {
  for (var i = 0; i < wagons.length; i++) {
    var otherwagon = wagons[i].dom;
    if (Math.abs((+object.dom.getAttribute('x')) - (+otherwagon.getAttribute('x'))) < 10) {
      //alert('Collision');
    }
  }
  if (length <= 0) { whendone? whendone():void 0; return; }
  setposcentered(object.dom, from[0], from[1]);
  object.startagain = [object, [from[0]+1, from[1]], length-1, speed, whendone];
  object.timeout = setTimeout(move, 1 / speed, object,
      [from[0] + 1,from[1]], length - 1, speed, whendone);
};

// object is something of the form
// {dom:dom element, timeout:number}.
function alongsegment (object, segment, speed, whendone, idx) {
  idx = idx || 0;
  var from = segment[idx],
      to = segment[idx + 1],
      dx = to[0] - from[0],
      dy = to[1] - from[1],
      length = Math.sqrt(dx * dx + dy * dy),
      angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  object.dom.setAttribute('transform', 'rotate(' + angle * 180 / Math.PI
                     + ' ' + from[0] + ' ' + from[1] + ')');
  object.timeout = move(object, segment[idx], length, speed, function cb() {
    if (!segment[idx + 2]) {
      whendone();
      return;
    }
    alongsegment(object, segment, speed, whendone, idx + 1);
  });
}

// This function takes a <path d="..."> and converts it to a series of points if
// said <path d="..."> contains nothing but M and L operations.
function datafrompath (path) {
  return path.getAttribute('d').match(/[\d\.]+\s+[\d\.]+/g).map(function(el) {
    return el.split(/\s+/).map(function(num){ return Number(num); });
  });
}

// The whendone function takes the wagon index and the rail index.
// Give it the wagon and rail indices, anda function to be run when arrived.
function movewagon (wagonidx, railidx, whendone) {
  whendone = whendone || function(){};
  var domrail = document.getElementById('p' + railidx);
  wagons[wagonidx].railidx = railidx;
  alongsegment(wagons[wagonidx], datafrompath(domrail),
      airport.wagons[wagonidx].speed, function () {
        whendone(wagonidx, railidx);
  });
}

// Initializing nodes.

function nodeinit() {
  
  window.nodes = [];
  var confignodes = window.config.airport.nodes;

  for ( var i in confignodes ) {
    var dom = document.getElementById(confignodes[i].type+i);
    window.nodes[i] = {dom: dom, bags: []};
  }
}

// vim: ts=8 et
