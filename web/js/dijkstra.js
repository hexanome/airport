// Définition des variables

function calculChemin(elements){

	var infini = 99;

	var debut = 0;

	// contient les noeuds pour lesquels la recherche s'arrête
	var finit = [];
	for (var i=0; i<=nbnoeud; i++){
		finit.push(0);
	}

	// contient les chaines des noeuds
	/*
	 * var elements = [[0,0,0],
									[1,0,0],
									[9,0,0]];
	*/
			
	var nbnoeud = elements.length;

	// tableau intermédiaire du déroulement du calcul
	var tableau = []; 
	// remplissage de tableau
	for (i = 0; i < nbnoeud; i++) {
	 tableau[i] = [];  
	}

	// tableau contenant la liste ordonnée des noeuds du chemin
	var chemin = [];

	// Définition des fonctions

	// renvoi la colonne de la plus petite valeur de la ligne donnée
	function minligne (n) {
	var r = 10000;
	var a = -1;
		
	 for (i = 0; i < nbnoeud; i++) {   
			 if (r > tableau[i][n]) {
				 r = tableau[i][n];       
				 a = i;       
			 }    
	 }   
	 return a;    
	}

	// remplit la ligne position du tableau
	function ligne (petit, position) {
		
		for (i = 1; i < nbnoeud; i++){  
			tableau[i][position] = -1;
		
			tableau[petit][position] = infini;

			tableau[0][position] = infini;
		
			if ((elements[i][petit] !== 0)&&(finit[i] !== 1)) {        
				tableau[i][position] = +tableau[petit][position-1] + elements[i][petit];
			}
		
			if (tableau[i][position] === -1) {
				tableau[i][position] = tableau[i][position-1];
			}
		 
			if ((tableau[i][position] === infini)&(tableau[i][position-1] !== infini)) {
				finit[i] = 1;      
			}
		}
	}

	// fonction principale
	function calcul () {  
	 var minimum = 0;

	 // en remplit la deuxième ligne de tableau
	 tableau[0][0] = [0];
	 for (i = 0; i < nbnoeud; i++) {
			if (i !== 0) {
			 tableau[i][0] = infini;
			}
	 }  
	 
	 ligne(0,1);
	 
	 for (count = 1; count < nbnoeud-1; count++) {
		 ligne(minligne(count),count+1);     
	 }
		return tableau;  
	}

	calcul();

	// renvoit la ligne du minimum d'une colonne
	function mincolonne(colonne) {

		var minimum = 1000;
		var ligne = -1;
		
		for (i = 0; i < 10; i++) {
			console.log(colonne);
			if ( minimum > tableau[colonne][i]) {
				minimum = tableau[colonne][i];
				ligne = i;
			}
		}
		return ligne;
	}


// remplissage de chemin

	chemin[nbnoeud] = minligne((mincolonne(nbnoeud-1))-1);

	for (countc = nbnoeud-1; countc > 1; countc--){
		
		if (chemin[countc-1] !== -1){
			
		chemin[countc] = minligne((mincolonne(chemin[countc+1]))-1);
		}
		
		if (chemin[countc] === 0) break;
	}

	chemin[nbnoeud + 1] = nbnoeud-1;

	while (chemin[0] !== 0){
		for (deca1 = 0; deca1 < nbnoeud+1; deca1++) {
			if (chemin[deca1] === 0) {
				for (deca2 = deca1-1; deca2 < nbnoeud+1; deca2++) {
					chemin[deca2] = chemin[deca2+1];
				}
				chemin[deca2] = -1;
			}
		}
	}
	
	return chemin;
}

/**************************************/

function distance(node1, node2){
	return Math.sqrt(Math.pow(node1.x-node2.x,2)+Math.pow(node1.y-node2.y,2))
}

function reorderDistances(elems,start,dest){
	var table=[];
	for (var i in elems)
	{
		table[i]=elems[i].slice(0);
	}
	var temp=table[0];

	//invert first line and start and last line and stop
	table[0]=table[start];
	table[start]=temp;
	
	temp=table[table.length-1];
	table[table.length-1]=table[dest];
	table[dest]=temp;

	//invert first column and start and last column and stop
	for (var i in table){
		temp=table[i][0];
		table[i][0]=table[i][start];
		table[i][start]=temp;

		temp=table[i][table[i].length-1];
		table[i][table[i].length-1]=table[i][dest];
		table[i][dest]=temp;
	}
	
	return table;
}

function inverse(elems){
	var ne=[];
	for (var i in elems){
		ne[i]=[];
		for (var j in elems[0]){
			ne[i][j]=elems[j][i];
		}
	}
	return ne;
}
function display(table){
	for (var i in table){
		console.log(table[i]);
	}
}
function findDistances(){
	var nodes=config.airport.nodes;
	var rails=config.airport.rails;
	var elems=[[]];

	for (var i in nodes){
		/*Go through each node to which the wagon can stop (true nodes)*/
		elems.push([])
		for (var j in nodes){
			elems[i].push(0);
		}
		/*Find out wich nodes he is linked to and the distance between them */
		for (var k in rails){
			if (rails[k].points[0]==i){
				var last=rails[k].points[rails[k].points.length-1];
				elems[i][last]=0;
				for (var l=0; l<rails[k].points.length-1; l++){
					elems[i][last]+=distance(nodes[rails[k].points[l]],nodes[rails[k].points[l+1]]);
				}
			}
		}
	}
	elems.pop();
	return inverse(elems);
}
function dijkstra(elems,start,dest)
{
	var reverse=reorderDistances(elems,start,dest);
	var next=calculChemin(reverse);	
	return next[1];
}
