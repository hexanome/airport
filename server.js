/* server.js: run this with Node.js in the publish/ folder to start your server.
 * Copyright © 2011 Jan Keromnes, Thaddee Tyl. All rights reserved.
 * Code covered by the LGPL license. */


// Import the Camp
var Camp = require ('./camp/camp.js');



// Let's rock'n'roll!
Camp.start(process.argv[2] || 80,
           process.argv[3] || 0);
