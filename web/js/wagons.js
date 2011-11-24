// Here, we have all functions that deal with wagon objects.
// We can move them, decide where they go, etc.
//
// There are different functionnality for automatic mode and manual mode.




// --- UI ---
//


// This variable holds data about the position of all wagons.
// Each element of this list holds the dom element of the wagon,
// and the rail index in which it is currently located, like so:
// {dom:domwagon, railidx:railidx}.
window.wagons = [];

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
      wagons.push({dom:domwagons[i], railidx:railidx, dest:[]});
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
      wagons.push({dom:domwagons[i], railidx:railidx, dest:[]});
    }
  }

  // Put every wagon at its rightful place.
  positionwagonsatinit(wagons);
}

function positionwagonsatinit(wagons) {
  for (var i = 0; i < wagons.length; i++) {
    var wagon = wagons[i],
        node = airport.nodes[airport.rails[wagon.railidx].points[0]],
        halfwidth = Number(wagon.dom.getAttribute('width')) / 2,
        halfheight = Number(wagon.dom.getAttribute('height')) / 2;
    setpos(wagon.dom, node.x - halfwidth, node.y - halfheight);
  }
}


// --- Manual mode ---
//

// Decide where to go
function decidewagon(wagonidefix) {

  // if no destination, find one
  if (wagons[wagonidefix].dest.length==0) {
    // if bag, deliver to destination
    if (wagons[wagonidefix].bag) {
      wagons[wagonidefix].dest = choice(wagons[wagonidefix].railidx, wagons[wagonidefix].bag.dest);
      console.log(wagonidefix,'going towards destination',wagons[wagonidefix].dest);
    } else {
      for (var i in window.nodes) {
        if (window.nodes[i].bags.length > 0) {
          wagons[wagonidefix].dest = choice(wagons[wagonidefix].railidx,i);
          console.log(wagonidefix,'maybe going towards desk',i,wagons[wagonidefix].dest);
          for (var j in wagons) {
            var hisdest = wagons[j].dest[wagons[j].dest.length-1];
            if (j !== wagonidefix && hisdest && hisdest === wagons[wagonidefix].dest[wagons[wagonidefix].dest.length-1]) {
              console.log(wagonidefix,'oops,',j,'is already going towards this desk',hisdest);
              wagons[wagonidefix].dest = [];
            }
          }
        }
      }
    }
  }

  // if still no destination, go back to parking
  if (wagons[wagonidefix].dest.length==0) {
    wagons[wagonidefix].dest = choice(wagons[wagonidefix].railidx, window.parkingidx);
    console.log(wagonidefix,'nothing to do, going back to parking',wagons[wagonidefix].dest);
  }

  if (wagons[wagonidefix].dest.length==0) {
    console.log(wagonidefix,'already in parking, stop there',wagons[wagonidefix].dest);
    stopwagon(wagonidefix)
  } else {
    movewagon(wagonidefix,wagons[wagonidefix].dest.shift(),function(){
      if (window.config.auto) decidewagon(wagonidefix);
      else asktheway(wagonidefix);
    });
  }
}



// --- Manual mode ---
//
// The following functions handle the movements of wagons in manual mode.

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

