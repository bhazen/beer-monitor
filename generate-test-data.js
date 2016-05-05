'use strict';
var fs = require('fs');
var os = require('os');
var moment = require('moment');

var startTime = moment();
var stream = fs.createWriteStream("test_file.txt");

stream.once('open', function(fd) {
  for(var i = 0; i < 100; i++) {
    var data = {
      temperature: 65 + (Math.random() * 10),
      time: startTime.add(1, 'minutes').toISOString()
    };
    stream.write(JSON.stringify(data) + os.EOL);
  }
  stream.end();
});
