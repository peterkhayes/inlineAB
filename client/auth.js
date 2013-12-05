/**
 * Authorization information. This should be obtained through the Google APIs
 * developers console. https://code.google.com/apis/console/
 * Also there is more information about how to get these in the authorization
 * section in the Google JavaScript Client Library.
 * https://code.google.com/p/google-api-javascript-client/wiki/Authentication
 */

// Cloud console
var clientId = '434808078941-u814h6clkbve3dpp5cuaolqto1cmk0ui.apps.googleusercontent.com';
// Will need to change if Write access required
var scopes = 'https://www.googleapis.com/auth/analytics';
// InlineAB API key
var apiKey = 'AIzaSyCWpnPpii3cWo2RBlpi731U_bifkregbd8';

// InlineAB GA account id
var iabAccountId = 45967923; // used to generate propertyId
// InlineAB GA web property id
var iabWebPropertyId = 'UA-45967923-1'; // used with accountId to generate profileId
// InlineAB GA profile id
var iabProfileId = '79395509'; // used for querying


// Called after Google script finished loading
function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  // Check for auth -- user not prompted for access
  window.setTimeout(checkAuth(true), 1);
}

// Check whether user is authorized
function checkAuth(immediately) {
  console.log('check',immediately);
  gapi.auth.authorize({
    client_id: clientId, scope: scopes, immediate: immediately}, handleAuthResult);
}

var globalTok;

 // Creates the Analytics Service Object or asks user to authorize
function handleAuthResult(token) { // important to set token?
  if (token) {
    globalTok = token;
    gapi.client.load('analytics', 'v3', handleAuthorized);
  } else {
    handleUnauthorized();
  }
}

// Set demo button to trigger iabTest
function handleAuthorized() {
  console.log('token is: ',globalTok);
  var authorizeButton = document.getElementById('authorize-button');
  var runDemoButton = document.getElementById('run-demo-button');

  authorizeButton.style.visibility = 'hidden';
  runDemoButton.style.visibility = '';
  runDemoButton.onclick = listAccounts;
  // runDemoButton.onclick = postTest;
  outputToPage('Click the Run Demo button to begin.');
}

function postTest(){
  var xhr = new XMLHttpRequest();
  xhr.open('post','https://www.googleapis.com/analytics/v3/management/accounts/45967923/webproperties/UA-45967923-1/profiles/79395509/experiments?fields=accountId&key=AIzaSyB1qEJH0RIDBLPW7gK-7fxBmuY1opr_PNU', true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer "+globalTok.access_token);
  var data = {
    "name": "hashtagwinning",
    "status": "READY_TO_RUN",
    "objectiveMetric":"ga:bounces",
    "variations": [
  {
   "name": "\"no javascript!\"",
   "url":"http://www.google.com",
   "status":"ACTIVE"
  },
  {
   "name": "\"html only!\"",
   "url":"http://www.yahoo.com",
   "status":"ACTIVE"
  }
 ]
}
  xhr.onreadystatechange = function(){
    if (xhr.readyState===4 && xhr.status===200){
      console.log(xhr.responseText);  
    }
  }
  xhr.send(JSON.stringify(data));
}

// Query core reporting with hardcoded data
function iabTest(){
  queryCoreReportingApi(iabProfileId);
}

// Ask the user to authorize
function handleUnauthorized() {
  var authorizeButton = document.getElementById('authorize-button');
  var runDemoButton = document.getElementById('run-demo-button');

  runDemoButton.style.visibility = 'hidden';
  authorizeButton.style.visibility = '';
  authorizeButton.onclick = handleAuthClick;
  outputToPage('Please authorize this script to access Google Analytics.');
}

function handleAuthClick(event) {
  // User prompted to give access
  checkAuth(false);
}

// Query (list) all accounts
function listAccounts() {
  outputToPage('Querying Accounts.');
  // makeMetadataRequest();
  gapi.client.analytics.management.accounts.list().execute(handleAccounts);
}

// FINDS A LIST OF ACCOUNTS
// TODO: add logic for account selection to pass on
// TODO: convert into common utility function

////////////------------------------------------------------------------------------------------


function handleAccounts(response) {
  if (!response.code) {
    if (response.items && response.items.length) {

      //populate the account list:
      var accountList = {};
      for (var i = 0; i < response.items.length; i++) {
        accountList[response.items[i].name] = response.items[i].id;
      };

      // accountList has been populated, include script to display on DOM
      outputToPage(Object.keys(accountList));

      //jump ahead and find all the properties associated with accounts
      for( var account in accountList){
        queryWebproperties(accountList[account]);
      }
      // var firstAccountId = response.items[0].id;
      // queryWebproperties(firstAccountId);
    } else {
      outputToPage('No accounts found for this user.', true);
    }
  } else {
    outputToPage('There was an error querying accounts: ' + response.message, true);
  }
}

function populateAccountList(accounts){
};

// Query all web properties for a given account
function queryWebproperties(accountId) {
  outputToPage('Querying Webproperties.', true);
  gapi.client.analytics.management.webproperties.list({
      'accountId': accountId
  }).execute(handleWebproperties);
}

////////////------------------------------------------------------------------------------------

// Selects by default the first web property. 
// TODO: add logic for web property selection to pass on
function handleWebproperties(response) {
  if (!response.code) {
    if (response.items && response.items.length) {
      console.log("response", response);
      console.log("responseItems", responseItems);
      var firstAccountId = response.items[0].accountId;
      var firstWebpropertyId = response.items[0].id;
      queryProfiles(firstAccountId, firstWebpropertyId);
    } else {
      outputToPage('No web properties found for this user.', true);
    }
  } else {
    outputToPage('There was an error querying web properties: ' + response.message, true);
  }
}

// Query all profiles for a given account and web property
// TODO: combine all functions into a shared utility function
function queryProfiles(accountId, webpropertyId) {
  outputToPage('Querying Profiles.', true);
  gapi.client.analytics.management.profiles.list({
    'accountId': accountId,
    'webPropertyId': webpropertyId // set as inlineAB?
  }).execute(handleProfiles);
}

// Selects by default the first profile
// TODO: add logic for profile selection to pass on
function handleProfiles(response) {
  if (!response.code) {
    if (response && response.items && response.items.length) {
      var firstProfileId = response.items[0].id;
      queryCoreReportingApi(firstProfileId);
    } else {
      outputToPage('No profiles found for this user.', true);
    }
  } else {
    outputToPage('There was an error querying profiles: ' + response.message, true);
  }
}

// function responseHandler(response) {
//   if (!response.code) {
//     var id = response.items[0].id,
//         secondId;
//     if (response && response.items && response.items.length) {
//       if(type === 'account' || 'profile'){
//         type === 'account' ? queryWebproperties(id) : queryCoreReportingApi(id);
//       } else if(type === 'webproperty'){
//         secondId = response.items[0].accountId;
//         queryProfiles(id, secondId);
//       } else {
//         throw 'Handling type not specified';
//       }
//     } else {
//       outputToPage('No '+ type + 's found.', true);
//     }
//   } else {
//     outputToPage('There was an error querying' + type + 's: ' + response.message, true);
//   }
// }

// Core querying function
// TODO: make inputs more flexible
function queryCoreReportingApi(profileId) {
  outputToPage('Querying Core Reporting API.', true);
  gapi.client.analytics.data.ga.get({
    'ids': 'ga:' + profileId,
    'start-date': lastNDays(14),
    'end-date': lastNDays(0),
    'metrics': 'ga:visits',
    'dimensions': 'ga:eventCategory, ga:eventAction, ga:eventLabel'
    // 'sort': '-ga:visits,ga:source',
    // 'filters': 'ga:medium==organic',
    // 'max-results': 25
  }).execute(handleCoreReportingResults);
}

// Prints formatted response
function handleCoreReportingResults(response) {
  if (!response.code) {
    console.log(response);
    if (response.rows && response.rows.length) {
      var output = [];

      // Profile Name.
      output.push('Profile Name: ', response.profileInfo.profileName, '<br>');

      var table = ['<table>'];

      // Put headers in table.
      table.push('<tr>');
      for (var i = 0, header; header = response.columnHeaders[i]; ++i) {
        table.push('<th>', header.name, '</th>');
      }
      table.push('</tr>');

      // Put cells in table.
      for (var i = 0, row; row = response.rows[i]; ++i) {
        table.push('<tr><td>', row.join('</td><td>'), '</td></tr>');
      }
      table.push('</table>');

      output.push(table.join(''));
      outputToPage(output.join(''));
    } else {
      outputToPage('No results found.');
    }
  } else {
    outputToPage('There was an error querying core reporting API: ' +
        response.message, true);
  }
}

// Add date to page
function outputToPage(output, appendData) {
  if(appendData){
    document.getElementById('output').innerHTML += '<br>' + output;
  } else {
    document.getElementById('output').innerHTML = output;
  }
}

/**
 * Utility method to return the lastNdays from today in the format yyyy-MM-dd.
 * @param {Number} n The number of days in the past from tpday that we should
 *     return a date. Value of 0 returns today.
 */
function lastNDays(n) {
  var today = new Date();
  var before = new Date();
  before.setDate(today.getDate() - n);

  var year = before.getFullYear();

  var month = before.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }

  var day = before.getDate();
  if (day < 10) {
    day = '0' + day;
  }

  return [year, month, day].join('-');
}

// Gives generic list of queryable reports
function makeMetadataRequest() {
  var request = gapi.client.analytics.metadata.columns.list({
      'reportType': 'ga'
  });
  request.execute(renderMetadataReport);
}

// Render and print data
function renderMetadataReport(results) {
  console.log(results);
  var reportHtml = [];
  reportHtml.push(
      getReportInfo(results),
      getAttributes(results),
      getColumns(results));

  // Renders the results to a DIV element
  document.getElementById('DIV_ID').innerHTML = reportHtml.join('');
}

// Format report info
function getReportInfo(results) {
  var html = [];
  if (results) {
    html.push('<h2>Report Info</h2>');
    html.push('<pre>Kind: ', results.kind, '</pre>');
    html.push('<pre>Etag: ', results.etag, '</pre>');
    html.push('<pre>Total Results: ', results.totalResults, '</pre>');
  }
  return html.join('');
}

// Format attribute info
function getAttributes(results) {
  var html = [];
  if (results) {
    html.push('<h2>Attribute Names</h2><ul>');
    var attributes = results.attributeNames;

    for (var i = 0, attribute; attribute = attributes[i]; i++) {
      html.push('<li>', attribute, '</li>');
    }
    html.push('</ul>');
  }
  return html.join('');
}

// Format column info
function  getColumns(results) {
  var html = [];
  if (results) {
    var columns = results.items;
    html.push('<h2>Columns</h2>');

    for (var i = 0, column; column = columns[i]; i++) {
      html.push('<h3>', column.id, '</h3>');
      var attributes = column.attributes;
      for (attribute in attributes) {
        html.push('<pre><strong>', attribute, '</strong> : ',
                  attributes[attribute], '</pre>');
      }
    }
  }
  return html.join('');
}

// (Unused) Used following first auth request to avoid confused deputy
function validate(token) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET','https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+token, true);
  xhr.onreadystatechange = function(e){
    if(xhr.readyState === 4 && xhr.status === 200){
      if(e.audience === clientId){
        console.log(e);
      }
    } else if(xhr.status === 400){
      console.log('server error');
    } else {
      console.log('random error!');
    }
  }
  xhr.send(null);
}