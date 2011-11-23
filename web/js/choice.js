
function choice(rail,dest) {
  domrail = window.config.airport.rails[rail];
  var used = {}; used[JSON.stringify(domrail)] = true;
  var ret = choicerec(domrail,+dest,used,0);
  console.log('path from',rail,'to',dest,'is',JSON.stringify(ret),JSON.stringify(used));
  return (ret ? ret : []);
}

function choicerec(rail,dest,used,level){
  var children = getChildren(rail);
  for (var i in children){
    var current = children[i];
    //console.log(JSON.stringify(current),level);
    if ( used[JSON.stringify(current)] !== true ) {
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
      used[JSON.stringify(current)] = true;
      var ret = choicerec(current,dest,used,level+1);
      if (ret) {
        for ( var i in config.airport.rails ) {
          if ( JSON.stringify(current) === JSON.stringify(config.airport.rails[i]) ) {
            ret.unshift(i);
            console.log('FINAL',JSON.stringify(ret));
            return ret;
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
