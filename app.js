var express = require('express');
var http = require('http');
var path = require('path');
var googleapis = require('googleapis');
var restler = require('restler');
var fs = require('fs');
var url = require('url');


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

// Save reference to Oauth2Client
var OAuth2Client = googleapis.OAuth2Client;




// Route index.html
// app.get('/', function(req, res) {
//   res.sendfile(path.join(__dirname, '/client/index.html'));
// });

app.get('/downloadCustom', function(req, res){
  // var data = qs.parse(req.body.params);
  // var data = url_parts.parse(req.url, true);
  // console.log('start request body:')
  // console.log(req);
  // console.log('end request body')
  var urlData = url.parse(req.url,true).query;
  console.log("-------------------")
  console.log("urlDATA=", urlData)
  console.log("-------------------")
  var expID = urlData.expID;
  console.log('testID', expID);
  var variations = urlData.vars + ';';
  console.log('variations', variations);
  var snippitID = urlData.snipID;
  console.log('snippitID', snippitID);

  var filePath = __dirname + '/client/js/inlineAB.js';

  var variationsArray = JSON.parse(req.body.variations);

  fs.readFile(filePath, function(err, inlineABjs){
    var inlineABstring = inlineABjs.toString();


    // var variationsText = var
    
    // for (var i = 0; i < variations.length; i++) {
    //   variationsText += "'" + variations[i] + "',";
    // }

    // console.log('variATIONS TEXT', variationsText)
    
    // variationsText = "[" + variationsText.slice(0, variationsText.length - 1) + "];";
    
    var customizedScript = inlineABstring.replace("'PASTE-EXPERIMENT-ID'", "'" + expID + "'").replace("['VARIATION1', 'VARIATION2']", variations).replace("/* CONTENT EXPERIMENT SCRIPT */", snipID);
    
    res.setHeader('Content-disposition', 'attachment; filename=inlineAB.js');
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    res.write(customizedScript);
    res.end();
  });
});


/*


        THIS IS A LARGE BLOCK COMMENT.


*/

app.post('/updateExperiment', function(req,res){
  var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectURL);
  var access_token = req.body.token.access_token;

  oauth2Client.credentials = {
    access_token: access_token
  };

  googleapis
  .discover('analytics', 'v3')
  .execute(function(err, client) {
    var request = client.analytics.management.experiments.update({
        accountId : req.body.accountId,
        webPropertyId : req.body.webPropertyId,
        profileId : req.body.profileId,
        experimentId : req.body.experimentId
        }, req.body.body)
    .withApiKey(serverAPIKey)
    .withAuthClient(oauth2Client)
    request.execute(function(err,result){
      if (err){
        console.log(err);
        res.send(402);          
      } else {
        console.log(result);
        res.send(200);
      }
    });
  });
});



app.post('/deleteExperiment', function(req,res){
  var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectURL);
  var access_token = req.body.token.access_token;

  oauth2Client.credentials = {
    access_token: access_token
  };

  googleapis
  .discover('analytics', 'v3')
  .execute(function(err, client) {
    var request = client.analytics.management.experiments.delete({
        accountId : req.body.accountId,
        webPropertyId : req.body.webPropertyId,
        profileId : req.body.profileId,
        experimentId : req.body.experimentId
        })
    .withApiKey(serverAPIKey)
    .withAuthClient(oauth2Client)
    request.execute(function(err,result){
      if (err){
        console.log(err);
        res.send(402);          
      } else {
        console.log(result);
        res.send(200);
      }
    });
  });
});



app.post('/createExperiment', function(req,res){
  var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectURL);
  var access_token = req.body.token.access_token;

  oauth2Client.credentials = {
    access_token: access_token
  };

  googleapis
  .discover('analytics', 'v3')
  .execute(function(err, client) {
    var request = client.analytics.management.experiments.insert({
        accountId : req.body.accountId,
        webPropertyId : req.body.webPropertyId,
        profileId : req.body.profileId
        }, req.body.body)
    .withApiKey(serverAPIKey)
    .withAuthClient(oauth2Client)
    request.execute(function(err,result){
      if (err){
        console.log(err);
        res.send(402);          
      } else {
        console.log(result);
        res.send(200);
      }
    });
  });
});
































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
