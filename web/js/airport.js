/* airport.js
   Main package for the airport terminal building simulator.
   Copyright (c) 2011-2012 INSA IF Hexanome 4101
 */
 
var terminal = [];

function Hall(component) {
  this.baggageHolders = baggageHolders || [];
}



function BaggageHolder(baggages, detectors) {
  this.baggages = baggages || [];
  this.detectors = detectors || [];
}





function Node(type, links) {
  // type can be: plane, desk, carrousel, speedwalk, slide.
  this.type = type || 'plane';
  this.links = links || [];
}
Node.prototype = BaggageHolder.prototype;
Node.prototype.addLink = function (type, toNode) {
  var link = new Link(type, this, toNode);
  this.links.push(link);
  toNode.links.push(link);
  return link;
};



function Link(type, from, to) {
  // type can be: train, trail.
  this.type = type || 'train';
  this.from = from || new Node();
  this.to = to || new Node();
}
Link.prototype = BaggageHolder.prototype;




function Baggage() {
  this.
}

