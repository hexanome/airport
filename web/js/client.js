// Handling of graphical elements in index.html (svg manipulation, etc.)


// Getting and updating the configuration file.
//

function pullConfig() {
  Scout.send(function(query) {
    query.action = 'pullconfig';
    query.data = {lol:'bidon'};
    query.resp = function(config) {
      console.log('received config');
      window.config = config;
      window.airport = config.airport;
      wagoninit();
      nodeinit();
      startSim();
    }
  })();
}

function pushConfig(reload) {
  Scout.send(function(query){
    query.action = 'pushconfig';
    query.data = {config: window.config};
    query.resp = function() {
      if (reload) location.reload(true);
    }
  })();
}

addEventListener('load', function() {
  pullConfig();
}, false);

function save() {
  window.open('/config.json','Save As','height=400,width=400');
}

function load(files) {
  var file = files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    window.config = JSON.parse(e.target.result);
    pushConfig(true);
  }
  reader.readAsText(file);
}

function changeMode(auto) {
  window.config.auto = auto;
  pushConfig();
}


// GUI.
//

$(function () {
  $("input[rel=popover]")
    .popover({
      offset: 10
    })
    .click(function(e) {
      e.preventDefault()
    })
})


// Wagon movements (UI primitives).
//

function setpos (object, x, y) {
  object.setAttribute('x', x + '');
  object.setAttribute('y', y + '');
}

// Speed is given in pixels / milliseconds.
// Object is something of the form
// {dom:dom element, timeout:number}.
function move (object, from, length, speed, whendone) {
  if (length <= 0) { whendone? whendone():void 0; return; }
  var halfwidth = Number(object.dom.getAttribute('width')) / 2,
      halfheight = Number(object.dom.getAttribute('height')) / 2;
  setpos(object.dom, from[0] - halfwidth, from[1] - halfheight);
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
function movewagon (wagonidx, railidx, whendone) {
  var domrail = document.getElementById('p' + railidx);
  wagons[wagonidx].railidx = railidx;
  alongsegment(wagons[wagonidx], datafrompath(domrail),
      airport.wagons[wagonidx].speed, function () {
        whendone(wagonidx, railidx);
  });
}

// Stop a wagon that is running (or do nothing if it is stopped already).
function stopwagon (wagonidx) {
  var wagon = wagons[wagonidx];
  if (wagon.timeout) {
    clearTimeout(wagon.timeout);
  }
}

// This variable holds data about the position of all wagons.
// Each element of this list holds the dom element of the wagon,
// and the rail index in which it is currently located, like so:
// {dom:domwagon, railidx:railidx}.
window.wagons = [];

// Filling up wagons.
// This happens as soon as I get the config file.
function wagoninit() {
  var nbwagons = config.airport.wagons.length,
      domwagons = [],
      i = 0;    // We use this little one a lot. Believe me.
  // Getting all domwagons, in order.
  for (i = 0; i < nbwagons; i++) {
    domwagons.push(document.getElementById('wagon' + i));
  }

  // For what comes next, we need to get a list of {i:deskidx, desk:desk}.
  var desks = [];
  for (i = 0; i < airport.nodes.length; i++) {
    if (airport.nodes[i].type === 'desk') {
      desks.push({i:i, desk:config.airport.nodes[i]});
    }
  }

  // Choosing where to put the wagons -- one for each desk,
  // the rest in the garage.
  var nbdesks = desks.length,
      domdesks = [];
  for (i = 0; i < nbdesks; i++) {
    domdesks.push(document.getElementById('desk' + i));
  }
  if (nbwagons < nbdesks) {
    console.warn('Not enough wagons (%s) for all the desks (%s)!',
        nbwagons, nbdesks);
  }

  var deskidx = nbdesks - 1,   // This goes through all desk indices.
      railidx;
  for (i = 0; i < nbwagons; i++) {
    if (deskidx >= 0) {
      // Find out the rail corresponding to a desk.
      for (var j = 0; j < airport.rails.length; j++) {
        if (airport.rails[j].points[0] === desks[deskidx].i) {
          ///console.log('rail',j,':', airport.rails[j],'is desk',desks[deskidx].i,'at',deskidx);
          railidx = j;
          break;
        }
      }
      wagons.push({dom:domwagons[i], railidx:railidx});
      deskidx--;
    } else {
      // We put the wagon in the first parking lot available.
      // Let's first find this parking.
      var parkingidx;
      for (var j = 0; j < airport.nodes.length; j++) {
        if (airport.nodes[j].type === 'parking') {
          parkingidx = j;
        }
      }
      if (parkingidx === undefined) {
        throw new Error('No parking was found!');
      }
      // Let's now find the rail that starts with this parking.
      for (var j = 0; j < airport.rails.length; j++) {
        if (airport.rails[j].points[0] === parkingidx) {
          railidx = j;
          break;
        }
      }
      wagons.push({dom:domwagons[i], railidx:railidx});
    }
  }

  // Put every wagon at its rightful place.
  positionwagonsatinit(wagons);
}

function positionwagonsatinit(wagons) {
  ///console.log(wagons);
  for (var i = 0; i < wagons.length; i++) {
    var wagon = wagons[i],
        node = airport.nodes[airport.rails[wagon.railidx].points[0]],
        halfwidth = Number(wagon.dom.getAttribute('width')) / 2,
        halfheight = Number(wagon.dom.getAttribute('height')) / 2;
    setpos(wagon.dom, node.x - halfwidth, node.y - halfheight);
    //setpos(wagon.dom, node.x, node.y);
  }
}


// Wagon control.
//


// Initialization code:
// Each desk must have a wagon.

function nodeinit() {
  
  window.nodes = [];
  var confignodes = window.config.airport.nodes;

  for ( var i in confignodes ) {
    var dom = document.getElementById(confignodes[i].type+i);
    window.desks[i] = {dom: dom, bags: []};
  }
}

// vim: ts=8 et
