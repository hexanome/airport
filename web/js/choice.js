// The shortest path that the wagon should take is computed here.


// The choice function decides where to go when the wagon is on the rail index
// `rail`, and must go to rail index `dest`.
function choice(rail,dest) {
  domrail = window.config.airport.rails[rail];
  var usedPoints = {}; usedPoints[JSON.stringify(domrail)] = true;
  var shortestPath = choicerec(domrail, +dest, usedPoints, 0);
  return (shortestPath ? shortestPath : []);
}

function choicerec(rail,dest,usedPoints,level){
  var children = getChildren(rail);
  for (var i in children){
    var current = children[i];
    if ( usedPoints[JSON.stringify(current)] !== true ) {
      if (current.points[current.points.length-1]===dest){
        for ( var i in config.airport.rails ) {
          if ( JSON.stringify(current) === JSON.stringify(config.airport.rails[i]) ) {
            return [i];
          }
        }
      }
      if (JSON.stringify(current) === "{\"points\":[3,14]}") {
      }
      usedPoints[JSON.stringify(current)] = true;
      var shortestPath = choicerec(current,dest,usedPoints,level+1);
      if (shortestPath) {
        for ( var i in config.airport.rails ) {
          if ( JSON.stringify(current) === JSON.stringify(config.airport.rails[i]) ) {
            shortestPath.unshift(i);
            return shortestPath;
          }
        }
      }
    }
  }
}

// This helper function gives the rails that are linked after a particular rail
// of index `rail`.
function getChildren(rail){
  var children=[];
  var rails=config.airport.rails;
  var lastPoint=rail.points[rail.points.length-1];
  for (var i in rails){
    if (lastPoint==rails[i].points[0]){
      children.push(rails[i]);
    }
  }
  return children;
}
