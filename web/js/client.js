// Handling of graphical elements in index.html (svg manipulation, etc.)



// Meaningful comment
//

function start() {
  if ( window.config.auto ) addBag();
  for ( var i in window.wagons ) {
    if (window.config.auto) decidewagon(i);
    else asktheway(i);
  }
}

setTimeout(start,1000);



// Getting and updating the configuration file.
//

function pullConfig() {
  Scout.send(function(query) {
    query.action = 'pullconfig';
    query.data = {lol:'bidon'};
    query.resp = function(config) {
      console.log('received config');
      loadconfig(config);
    }
  })();
}

function loadconfig (config) {
  window.config = config;
  window.airport = config.airport;
  wagoninit();
  nodeinit();
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
    loadconfig(JSON.parse(e.target.result));
    pushConfig(true);
  }
  reader.readAsText(file);
}

function changeMode(auto) {
  window.config.auto = auto;
  pushConfig();
  if (auto) addBag();
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

function setposcentered (object, x, y) {
  var halfwidth = Number(object.getAttribute('width')) / 2,
      halfheight = Number(object.getAttribute('height')) / 2;
  setpos(object, x - halfwidth, y - halfheight);
}

// Speed is given in pixels / milliseconds.
// Object is something of the form
// {dom:dom element, timeout:number}.
function move (object, from, length, speed, whendone) {
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

// Decide where to go
function decidewagon(wagonidefix) {

  // if no destination, find one
  if ( !wagons[wagonidefix].dest ) {
    // if bag, deliver to destination
    if ( wagons[wagonidefix].bag ) destination = wagons[idefix].bag.dest;
    else {
      for ( var i in window.nodes ) {
        if ( window.nodes[i].bags.length > 0 ) {
          wagons[wagonidefix].dest = i;
          for ( var j in wagons ) {
            if ( j !== wagonidefix && wagons[j].dest === wagons[wagonidefix].dest ) {
              wagons[wagonidefix].dest = undefined;
            }
          }
        }
      }
    }
  }

  // if still no destination, go back to parking
  if ( !wagons[wagonidefix].dest ) wagons[wagonidefix].dest = window.parkingidx;

  // compute best move towards destination
  var nextPoint = choice(wagons[wagonidefix].railidx,wagons[wagonidefix].dest);
  movewagon(wagonidefix,nextPoint,function(){
    if (window.config.auto) decidewagon(wagonidefix);
    else asktheway(wagonidefix);
  });
}

// Stop a wagon that is running (or do nothing if it is stopped already).
function stopwagon (wagonidx) {
  var wagon = wagons[wagonidx];
  if (wagon.timeout) {
    clearTimeout(wagon.timeout);
  }
}

// If a wagon has been stopped, it is restarted through this method
// (which makes it start from where it stands).
function startwagon (wagonidx) {
  var wagon = wagons[wagonidx];
  // Calculate the initial offset that the wagon starts with.
  if (wagon.startagain) {
    move.apply(undefined, wagon.startagain);
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
          railidx = j;
          break;
        }
      }
      wagons.push({dom:domwagons[i], railidx:railidx});
      deskidx--;
    } else {
      // We put the wagon in the first parking lot available.
      // Let's first find this parking.
      window.parkingidx;
      for (var j = 0; j < airport.nodes.length; j++) {
        if (airport.nodes[j].type === 'parking') {
          window.parkingidx = j;
        }
      }
      if (window.parkingidx === undefined) {
        throw new Error('No parking was found!');
      }
      // Let's now find the rail that starts with this parking.
      for (var j = 0; j < airport.rails.length; j++) {
        if (airport.rails[j].points[0] === window.parkingidx) {
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
  }
}



// Manual mode.
//

// This creates a triangle and puts it at coordinates (x,y), given a choice id,
// and hooks it up to the function `choosepath`.
function createtriangle (x, y, wagonidx, railidx) {
  var tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  tri.setAttribute('points', x+','+(y-5)+' '+(7+x)+','+y+' '+x+','+(y+5));
  tri.setAttribute('fill', '#cfbcf4');
  tri.setAttribute('stroke', '#bface4');
  if (trirefcount[wagonidx] === undefined)  trirefcount[wagonidx] = 0;
  tri.setAttribute('id', 'triangle-wagon' + wagonidx + '-' +
      trirefcount[wagonidx]++);
  tri.setAttribute('onclick', 'choosewagonpath(' + wagonidx + ','
        + railidx + ')');
  document.getElementsByTagName('svg')[0].appendChild(tri);
  return tri;
}

var trirefcount = {};

function destroytriangles (wagonidx) {
  var tri;
  for (var i = 0; i < trirefcount[wagonidx]; i++) {
    tri = document.getElementById('triangle-wagon' + wagonidx + '-' + i);
    document.getElementsByTagName('svg')[0].removeChild(tri);
  }
  trirefcount[wagonidx] = 0;
}

function railbranches (nodeidx) {
  var possiblerailidx = [],
      possiblerails = airport.rails.filter(function (el, i) {
        if (el.points[0] === nodeidx) {
          possiblerailidx.push(i);
          return true;
        }
      });
  return [possiblerailidx, possiblerails];
}

function asktheway (wagonidx) {
  var domwagon = wagons[wagonidx].dom,
      x = +domwagon.getAttribute('x'),
      y = +domwagon.getAttribute('y'),
      railidx = wagons[wagonidx].railidx;
  
  // We need to know what options the wagon has.
  var confrail = airport.rails[railidx],
      confnodeidx = confrail.points[confrail.points.length - 1],
      possibilities = railbranches(confnodeidx),
      possiblerailidx = possibilities[0],
      possiblerails = possibilities[1];
  //console.log(possiblerails);

  for (var i = 0; i < possiblerails.length; i++) {
    var rail = possiblerails[i];

    // We will orient the triangle.
    var point0 = airport.nodes[rail.points[0]],
        point1 = airport.nodes[rail.points[1]],
        from = [point0.x, point0.y],
        to = [point1.x, point1.y],
        dx = to[0] - from[0],
        dy = to[1] - from[1],
        length = Math.sqrt(dx * dx + dy * dy),
        angle = Math.atan2(to[1] - from[1], to[0] - from[0]),
        tri = createtriangle(from[0] + 7, from[1],
            wagonidx, possiblerailidx[i]);
    tri.setAttribute('transform', 'rotate(' + angle * 180 / Math.PI
                     + ' ' + from[0] + ' ' + from[1] + ')');
  }
}

function choosewagonpath (wagonidx, railidx) {
  ///console.log('CHOSEN: wagon', wagonidx,'and rail',railidx);
  destroytriangles(wagonidx);
  movewagon(wagonidx, railidx, function () {
    if (!config.auto) {
      // We'll ask the path iff there is more than one possibility.
      var rail = airport.rails[railidx],
          possibilities = railbranches(rail.points[rail.points.length-1]);
          possiblerailidx = possibilities[0],
          possiblerails = possibilities[1];
      if (possiblerails.length === 1
          && airport.nodes[possiblerails[0].points[0]].type === 'branch') {
        choosewagonpath(wagonidx, possiblerailidx[0]);
      } else if (possiblerails.length < 1) {
        console.error('Wagon number', wagonidx, 'cannot go anywhere!');
      } else {
        asktheway(wagonidx);
      }
    } else decidewagon(wagonidx);
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
