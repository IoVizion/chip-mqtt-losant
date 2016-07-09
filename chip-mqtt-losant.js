var five = require('johnny-five');
var ChipIO = require('chip-io');
var Device = require('losant-mqtt').Device;
var os = require("os");

console.log('OS Hostname: ' + os.hostname());
console.log('endianness : ' + os.endianness());
console.log('type : ' + os.type());
console.log('platform : ' + os.platform());
console.log('total memory : ' + os.totalmem() + " bytes.");
console.log('free memory : ' + os.freemem() + " bytes.");


// Construct Losant device.
var device = new Device({
  id: '577e76749623b80100e3b25e',
  key: '746b3247-9a21-4914-80c8-840a89b6c2b8',
  secret: 'c4fcb4384a47e9fd2a885ed095d54634437040e7722b3897fedca7c8529fed33'
});

// Connect the device to Losant.
device.connect();

var board = new five.Board({
  io: new ChipIO()
});

const UPDATEINTERVAL = 5000

board.on('ready', function() {

  // LED connected to pin 53.
  var led = new five.Led('XIO-P0');

  // Button connected to GPIO 54.
  var button = new five.Button('XIO-P1');

  device.sendState({ hostname: + os.hostname() });

  // When the button is pressed.
  button.on('down', function() {
    // Send state to Losant.
    device.sendState({ button: true });
  });

  var thermometer = new five.Thermometer({
    controller: ChipIO.Controllers.INTERNAL_TEMP,
    freq: UPDATEINTERVAL
  });

  thermometer.on('data', function(data) {
    device.sendState({ AXP290temp: data.celsius.toFixed(2) })
    console.log('Internal temperature is ' + data.celsius.toFixed(2) + '°C');
  });

  String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
  }

  function setFreeMem() {
    var freemem = (os.freemem()/1024)/1024;
    console.log('Free mem: (MB) ' + freemem);
    device.sendState({ freemem: freemem });
  }

  function setUpTime () {
    var time = os.uptime();
    var uptime = String((time + "").toHHMMSS());
    console.log('uptime: ' + uptime);
    device.sendState({ uptime: uptime });
  }

  setInterval(setUpTime,UPDATEINTERVAL);
  setInterval(setFreeMem,UPDATEINTERVAL);	

});

