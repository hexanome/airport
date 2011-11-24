
function choice(rail,dest) {
  domrail = window.config.airport.rails[rail];
  var usedPoints = {}; usedPoints[JSON.stringify(domrail)] = true;
  var shortestPath = choicerec(domrail, +dest, usedPoints, 0);
  console.log('path from',rail,'to',dest,'is',JSON.stringify(shortestPath),JSON.stringify(usedPoints));
  return (shortestPath ? shortestPath : []);
}

function choicerec(rail,dest,usedPoints,level){
  var children = getChildren(rail);
  for (var i in children){
    var current = children[i];
    //console.log(JSON.stringify(current),level);
    if ( usedPoints[JSON.stringify(current)] !== true ) {
      console.log('DEST? ', current.points[current.points.length-1], 'dest is', dest);
      if (current.points[current.points.length-1]===dest){
        //console.log('found a path from',rail,'to',dest,':',JSON.stringify(current));
        for ( var i in config.airport.rails ) {
          console.log('comparing',JSON.stringify(current),'with',JSON.stringify(config.airport.rails[i]))
          if ( JSON.stringify(current) === JSON.stringify(config.airport.rails[i]) ) {
            console.log('RETURNING',i);
            return [i];
          }
        }
      }
      console.log('using path',JSON.stringify(current));
      if (JSON.stringify(current) === "{\"points\":[3,14]}") {
        console.log('comparing',JSON.stringify(current),'with',JSON.stringify(config.airport.rails[i]))
      }
      usedPoints[JSON.stringify(current)] = true;
      var shortestPath = choicerec(current,dest,usedPoints,level+1);
      if (shortestPath) {
        for ( var i in config.airport.rails ) {
          if ( JSON.stringify(current) === JSON.stringify(config.airport.rails[i]) ) {
            shortestPath.unshift(i);
            console.log('FINAL',JSON.stringify(shortestPath));
            return shortestPath;
          }
        }
      }
    }
  }
}

function getChildren(rail){
  var children=[];
  var rails=config.airport.rails;
  var lastPoint=rail.points[rail.points.length-1];
  for (var i in rails){
    if (lastPoint==rails[i].points[0]){
      children.push(rails[i]);
    }
  }
  //console.log('children of',JSON.stringify(rail),'are',JSON.stringify(children));
  return children;
}
