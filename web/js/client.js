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

// speed is given in pixels / milliseconds.
function move (object, from, length, speed, whendone) {
  if (length <= 0) { whendone? whendone():void 0; return; }
  var halfwidth = Number(object.getAttribute('width')) / 2,
      halfheight = Number(object.getAttribute('height')) / 2;
  setpos(object, from[0] - halfwidth, from[1] - halfheight);
  setTimeout(move, 1 / speed, object,
      [from[0] + 1,from[1]], length - 1, speed, whendone);
};

function alongsegment (object, segment, speed, idx) {
  idx = idx || 0;
  var from = segment[idx],
      to = segment[idx + 1],
      dx = to[0] - from[0],
      dy = to[1] - from[1],
      length = Math.sqrt(dx * dx + dy * dy),
      angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  object.setAttribute('transform', 'rotate(' + angle * 180 / Math.PI
                     + ' ' + from[0] + ' ' + from[1] + ')');
  move(object, segment[idx], length, speed, function whendone() {
    if (!segment[idx + 2]) return;
    alongsegment(object, segment, speed, idx + 1);
  });
}

// This function takes a <path d="..."> and converts it to a series of points if
// said <path d="..."> contains nothing but M and L operations.
function datafrompath (path) {
  return path.getAttribute('d').match(/[\d\.]+\s+[\d\.]+/g).map(function(el) {
    return el.split(/\s+/).map(function(num){ return Number(num); });
  });
}

function movewagon (wagonidx, railidx) {
  var domwagon = document.getElementById('wagon' + wagonidx),
      domrail = document.getElementById('p' + railidx);
  alongsegment(domwagon, datafrompath(domrail), 0.01);
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
  for (i = 0; i < nbwagons; i++) {
    if (config.airport.nodes[i].type === 'desk') {
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

  var deskidx = nbdesks - 1;   // This goes through all desk indices.
  for (i = 0; i < nbwagons; i++) {
    if (deskidx >= 0) {
      // TODO: find out the rail corresponding to a desk.
      var railcorrespondingtodesk = config.airport.rails.filter(function (el) {
        return el.points[0] === desks.i;
      });
      wagons.push({dom:domwagons[i], railidx:railcorrespondingtodesk});
      deskidx--;
    } else {
      // We put the wagon in the first parking lot available.
      // Let's first find this parking.
      var parkingidx;
      for (var j = 0; j < config.airport.nodes.length; j++) {
        if (config.airport.nodes[j].type === 'parking') {
          parkingidx = j;
        }
      }
      if (parkingidx === undefined) {
        throw new Error('No parking was found!');
      }
      wagons.push({dom:domwagons[i], railidx:parkingidx});
    }
  }

  // Put every wagon at its rightful place.
  positionwagonsatinit(wagons);
}

function positionwagonsatinit(wagons) {
  for (var i = 0; i < wagons.length; i++) {
    var wagon = wagons[i],
        node = airport.nodes[airport.rails[wagon.railidx].points[0]];
    setpos(wagon.dom, node.x, node.y);
  }
}


// Wagon control.
//


// Initialization code:
// Each desk must have a wagon.

function filldesks () {
  var desks = config.airport.nodes.filter(function (el) {
    return el.desk
  });
}



// vim: ts=8 et
