var express = require('express'),
    app = express(),
    cors = require("cors"),
    gcm = require('node-gcm'),
    apnagent = require('apnagent'),
    bodyParser = require('body-parser');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req, res) {
  res.send('Hello World!');
});


app.post("/gcm", function (req, res) {
  var token = req.body.token,
      apiKey = req.body.apiKey,
      messageData = req.body.message || "dummy message",
      os = req.body.os  || "android";


  var message = new gcm.Message();

  message.addData('message', messageData);
  message.addData('os', os);
  message.addNotification("title", "Notification");
  var regTokens = [token];

  // Set up the sender with you API key
  var sender = new gcm.Sender(apiKey);

  //Now the sender can be used to send messages
  sender.send(message, {registrationTokens: regTokens}, function (err, response) {
    if (err) {
      res.send(err);
    } else {
      res.send(response);
    }
  });
});

app.post("/apns", function (req, res) {
  var token = req.body.token,
      messageData = req.body.message || "dummy message",
      os = req.body.os || "ios",
      path = require("path"),
      rootFolder = path.dirname(require.main.filename),
      pfx = rootFolder  + '/key/cer.p12',
      agent = module.exports = new apnagent.Agent();

  // set our credentials
  agent.set('pfx file', pfx)
      .set("passphrase", "crossword")
      .enable('sandbox')
      .on("message:error", function (err, msg) {
    //result.apnMessage = globalSettings.errorMessage.apn;

    switch (err.name) {
      // This error occurs when Apple reports an issue parsing the message.
      case "GatewayNotificationError":
        console.log("[message:error] GatewayNotificationError: %s", err.message);

        // The err.code is the number that Apple reports.
        // Example: 8 means the token supplied is invalid or not subscribed
        // to notifications for your application.
        if (err.code === 8) {
          console.log("    > %s", msg.device().toString());
          // In production you should flag this token as invalid and not
          // send any further messages to it until you confirm validity
        }

        break;

      // This happens when apnagent has a problem encoding the message for transfer
      case "SerializationError":
        console.log("[message:error] SerializationError: %s", err.message);
        break;

      // unlikely, but could occur if trying to send over a dead socket
      default:
        console.log("[message:error] other error: %s", err.message);
        break;
    }
  });

  agent.createMessage()
      .device(token)
      .alert(messageData)
      .set("os", os)
      .send();

  agent.connect(function (err) {
    // gracefully handle auth problems
    if (err && err.name === 'GatewayAuthorizationError') {
      console.log('Authentication Error: %s' , err.message);
      process.exit(1);
    } else if (err) {
      throw err;
    }

    // it worked!
    var env = agent.enabled('sandbox') ? 'sandbox' : 'production';

    console.log('apnagent [%s] gateway connected', env);
  });


  var feedback = new apnagent.MockFeedback();

  feedback.set("interval", "30s") // default is 30 minutes?
      .connect();

  res.send("do message");
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('notification app listening at http://%s:%s', host, port);
});