var express = require('express');
var http = require('http');
var path = require('path');
var googleapis = require('googleapis');
var restler = require('restler');

var redirect = process.env.REDIRECT_URL || 'http://inlineAB.azurewebsites.net';
var clientId = process.env.CLIENT_ID || '1111111111111111';
var clientSecret = process.env.CLIENT_SECRET || 'joeyEatsDeadPeopleClientSecret';
var browserAPIKey = process.env.B_API_KEY || 'pOisOniVyBrowserKey';
var serverAPIKey = process.env.S_API_KEY || 'clientAPIKEYGAVINLOVESSHAWARMSAS';
var redirectURL = process.env.REDIRECT_URL || 'mygodbeckylookatherbuttitissobig';

var accountId = '46140385'; // used to generate propertyId
var webPropertyId = 'UA-46140385-1'; // used with accountId to generate profileId
var profileId = '79670733'; // used for querying

// Create server
var app = express();

// Configure server
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());

// Mount statics
app.use(express.static(path.join(__dirname, '/client')));
app.use(express.bodyParser());

//make OAuth Client
var OAuth2Client = googleapis.OAuth2Client;
var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectURL);

// Route index.html
app.get('/', function(req, res) {
  res.sendfile(path.join(__dirname, './client/index.html'));
});

app.post('/downloadCustom', function(req, res){

  console.log("Got a request to download custom script. Req is", req);

  var file = __dirname + '/js/inlineAB.js';

  console.log("Here is our file:", file);

  var variationsText = "";
  for (var i = 0; i < req.body.variations.length; i++) {
    variationsText += "'" + req.body.variations[i].name + "',";
  }
  variationsText = "[" + variationsText.slice(0, variationsText.length - 1) + "];";

  file.replace("'PASTE-EXPERIMENT-ID'", "'" + req.body.experimentID + "'");
  file.replace("['VARIATION1', 'VARIATION2']", variationsText);
  file.replace("/* CONTENT EXPERIMENT SCRIPT */", snippet);

  console.log("Here is our customized file:", file);

  res.download(file);
});

/*


        THIS IS A LARGE BLOCK COMMENT.


*/

app.post('/tokenized', function(req,res){

  var oAuthToken = req.body.token;

  oauth2Client.credentials = {
    access_token: oAuthToken
  };

  console.log(req.body.token)
  console.log('serverAPI ', serverAPIKey)
  console.log('browserAPI ', browserAPIKey)

  console.log('posting to tokenized! ');
  var postURL = '/analytics/v3/management/accounts/'+accountId+'/webproperties/'+webPropertyId+'/profiles/'+profileId+'/experiments?fields=accountId&key='+ serverAPIKey;
  var body = {       
        "name": "joeyEatsDeadPeopleThursday",
        "status": "READY_TO_RUN",
        "objectiveMetric":"ga:bounces",
        "variations": [
          { "name": "very javascrapet!", "url":"http://www.inlineAB.azurewebsites.net", "status":"ACTIVE" },
          { "name": "so htmale!!!", "url":"http://www.inlineAB.azurewebsites.net", "status":"ACTIVE" }
         ]
       };

  var headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer "+ oAuthToken
  };

  restler.post(postURL, {
      headers : headers,
      data : JSON.stringify(body)
      })
    .on('complete', function(data, response) {
      console.log(data);
      console.log(response);
      if (response.statusCode == 201) {
    // you can get at the raw response like this...
      }
    });
});
  // googleapis
  // .discover('analytics', 'v3')
  // .execute(function(err, client) {
  //   var request = client.analytics.management.experiments.insert({
  //       accountId : accountId,
  //       webPropertyId : webPropertyId,
  //       profileId : profileId
  //       })
  //   .withMedia('application/json', body)
  //   .withApiKey(browserAPIKey)
  //   .withAuthClient(oauth2Client)
  //   request.execute(function(err,result){
  //     if (err){
  //       console.log(err);
  //       res.send(402, 'afdhiheio[hrfrio[hio[grrentttttttttt');          
  //     } else {
  //       console.log(result);
  //       res.send(200);
  //     }
  //   });
  // });
// });




// var insertExperiment = function(accountId,webPropertyId,profileId,body){
//   googleapis
//   .discover('analytics', 'v3')
//   .execute(function(err, client) {
//     var request = client.analytics.management.experiments.insert({
//         accountId : accountId,
//         webPropertyId : webPropertyId,
//         profileId : profileId,
//         resource : body
//         })
//     .withApiKey(browserAPIKey)
//     .withAuthClient(oauth2Client)
//     request.execute(function(err,result){
//       if (err){
//         console.log(err);
//         res.send(402);          
//       } else {
//         console.log(result);
//         res.send(200);
//       }
//     });
//   });
// }

// var createGoal = function(){
//   //TODO: make one google analytics object at the start and save it for all calls?
//   googleapis
//   .discover('analytics', 'v3')
//   .execute(function(err, client){

//   })
// }






























//withOpts

// app.get('/experiments', function(req,res){
//   res.sendfile(path.join(__dirname, './client/create_experiment.html'));
// });

// var errorHandler = function (error){
// }


// var listExperiments = function(){
//   googleapis
//   .discover('analytics', 'v3')
//   .execute(function(err, client) {
//     var request = client.analytics.management.experiments.list({
//         accountId : accountId,
//         webPropertyId : webPropertyId,
//         profileId : profileId
//         // resource : body
//         })
//     .withApiKey(browserAPIKey)
//     .withAuthClient(oauth2Client)
//       request.execute(function(err,result){
//         if (err){
//           console.log(err);
//           res.send(402);          
//         } else {
//           console.log(result);
//           res.send(200);
//         }
//       });
//   });
// }


// https://www.googleapis.com/analytics/v3/management/accounts/accountId/webproperties/webPropertyId/profiles/profileId/experiments

// var request = gapi.client.request({
//   'path': '/analytics/v3/management/accounts/{accountId}/webproperties/{webPropertyId}/profiles/{profileId}/experiments',
//   'method': 'POST',
//   'body': JSON.stringify(requestBody)});
//   request.execute(handleAccounts);
// }

//TODO: reformat as post request.
  // var postURL = '/analytics/v3/management/accounts/'+accountId+'/webproperties/'+webPropertyId+'/profiles/'+profileId+'/experiments?fields=accountId&key='+ serverAPIKey;
  // googleapis
  // .discover('analytics', 'v3')
  // .execute(function(err, client) {
  //   var request = client.request({
  //     'path' : postURL,
  //     'method': 'POST',
  //     'body': JSON.stringify(body)
  //   });
  //   request.execute(function(err,result){
  //     if (err){
  //       console.log(err);
  //       res.send(402, 'afdhiheio[hrfrio[hio[grrentttttttttt');          
  //     } else {
  //       console.log(result);
  //       res.send(200);
  //     }
  //   });
  // });




// app.post('/experiment', function(req, res){
//   console.log(req.body);


// POST https://www.googleapis.com/analytics/v3/management/accounts/45896851/webproperties/UA-45896851-1/profiles/79295069/experiments?fields=accountId&key={YOUR_API_KEY}

// Content-Type:  application/json
// Authorization:  Bearer ya29.1.AADtN_UmkqEPq2kS1UrhGhsmEyxz71AzL4AZGVBeS72h2QAHLk3ONhl_jACK-SU
// X-JavaScript-User-Agent:  Google APIs Explorer
 
// {
//  "name": "left-box-text",
//  "status": "DRAFT",
//  "variations": [
//   {
//    "name": "\"no javascript!\""
//   },
//   {
//    "name": "\"html only!\""
//   }
//  ]
// }
// }
  // request.post(
  //     'http://www.yoursite.com/formpage',
  //     { form: { key: 'value' } },
  //     function (error, response, body) {
  //         if (!error && response.statusCode == 200) {
  //             console.log(body)
  //         }
  //     }
  // );
// });


  //TODO: remove if unneeded.



// Start server
http.createServer(app).listen(app.get('port'), function() {
  console.log(
    'Express server listening on port ' + app.get('port'),
    '\nPress Ctrl+C to shutdown'
  );
});
