function choice(rail,dest){
	var next;
	var current=rail;
	var rails=config.airport.rails;
	var nodes=config.airport.nodes;

	var level=0;
	var distance=-1;
	var usedRails=[];

	while (current!==dest){
		var children=getChildren(current);	
		level++;
		for (var i in children){
			current
		}

	}

	return next;
}
function getChildren(rail){
	var children=[];
	var rails=config.airport.rails;
	var lastPoint=rail.points[rail.points.length-1];
	for (var i in rails){
		if (lastPoint=rails[i].points[0]){
			children.push(rail);
		}
	}
	return children;
}
