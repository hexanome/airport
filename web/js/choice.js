
function choice(rail,dest) {
  rail = window.config.airport.rails[rail];
  return choicerec(rail,dest,{},0);
}

function choicerec(rail,dest,used,level){

	var children=getChildren(rail);
	for (var i in children){
		var current=children[i];
		console.log(JSON.stringify(current),level);
		if ( !used[JSON.stringify(current)] ) {
		  if (current.points[current.points.length-1]===dest){
				console.log('ZOMG FOUND IT',JSON.stringify(current));
			  return true;
	    }
		  used[JSON.stringify(current)] = true;
		  var ret = choicerec(current,dest,used,level+1);
			if (ret) {
				return (level === 0 ? i: true);
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
	console.log('children of',JSON.stringify(rail),'are',JSON.stringify(children));
	return children;
}
