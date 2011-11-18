/* server.js: run this with Node.js in the publish/ folder to start your server.
 * Copyright © 2011 Jan Keromnes, Thaddee Tyl. All rights reserved.
 * Code covered by the LGPL license. */


// Import modules
var fs = require('fs'),
    camp = require ('./camp/camp.js');

function start(config) {

  // Let's rock'n'roll!
  camp.start(config.port || 80,
             config.debug || 0);
             
}

(function main() {
  var config = process.argv[2] || '../config.json';
  
  fs.readFile(config, function(err, data) {
    if ( err ) throw err;
    start(JSON.parse(data));
  });
  
})();