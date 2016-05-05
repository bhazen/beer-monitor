'use strict';

var config = require('./config');
var Protocol = require('azure-iot-device-http').Http;
var Client = require('azure-iot-device').Client;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;
var Cylon = require('cylon');

var connectionString = config.connectionString;
var deviceId = ConnectionString.parse(connectionString).DeviceId;
var client = Client.fromConnectionString(connectionString, Protocol);

client.open(function (err, results) {
  var data;
  if (err) {
    console.log('Could not connect to Azure IoT Hub');
    console.error(err);
    process.exit(1);
  }

  Cylon.robot({
    connections: {
      edison: { adapter: 'intel-iot' }
    },

    devices: {
      environment: { driver: 'analog-sensor', pin: 0 }
    },

    work: function(device) {
      var voltage,
        celsius,
        data;

      every((1).second(), function() {
        voltage = device.environment.analogRead() * 0.004882814,
          celsius =(voltage - 0.5) * 100.0;
        data = {
          voltage: voltage,
          celsius: celsius,
          fahrenheit: celsius * (9.0 / 5.0) + 32.0,
          time: new Date().toISOString()
        };

        var dataString = JSON.stringify({ deviceId: deviceId, temperature: data.fahrenheit, time: data.time });
        console.log('Sending data to IoT Hub', dataString);
        client.sendEvent(new Message(dataString), function onSendMessageFail(err) {
          if (err) {
            console.log('Error sending data to IoT Hub', err.toString());
          }
        });
      })
    }
  }).start();
});