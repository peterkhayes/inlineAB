///CLIENT CODE
console.log('Auth.js is running!')
// Cloud console
var clientId = '434808078941-p4jaot1bpupfguckj84s9qgf2vo1m9q2.apps.googleusercontent.com';
// Will need to change if Write access required
var scopes = 'https://www.googleapis.com/auth/analytics';
// InlineAB API key
var garbageApiKey = 'AIzaSyBqBRgHijo2L3Ezbwu_DsEVzQRTL5oVpg8';

// InlineAB GA account id
var iabAccountId = 46140385; // used to generate propertyId
// InlineAB GA web property id
var iabWebPropertyId = 'UA-46140385-1'; // used with accountId to generate profileId
// InlineAB GA profile id
var iabProfileId = '79670733'; // used for querying

// important to set token?

// Called after Google script finished loading
function handleClientLoad() {
  console.log('handling client load')
  gapi.client.setApiKey(garbageApiKey);
  // Check for auth -- user not prompted for access
  window.setTimeout(checkAuth(true), 1);
}

// Check whether user is authorized
function checkAuth(immediately) {
  console.log('check',immediately);
  gapi.auth.authorize({
    client_id: clientId, scope: scopes, immediate: immediately}, handleAuthResult);
}

 // Creates the Analytics Service Object or asks user to authorize
function handleAuthResult(token) {
  console.log('handling auth result')
  if (token) {
    console.log('token found', token.access_token);
    tokenKey = token.access_token;
    sendToken({'token': tokenKey}); 
    console.log(tokenKey);
    gapi.client.load('analytics', 'v3', handleAuthorized);
  } else {
    console.log('token not found')
    sendToken({'token': 'thisisnotarealtokenthisisonlyatestanddontuseitforanythingimportant'}) 
    handleUnauthorized();
  }

  //TODO: post token to server, UAID, ACCOUNTID, Client id, all the identifying 
}

// Set demo button to trigger iabTest
function handleAuthorized() {
  var authorizeButton = document.getElementById('authorize-button');
  var runDemoButton = document.getElementById('run-demo-button');

  authorizeButton.style.visibility = 'hidden';
  runDemoButton.style.visibility = '';
  // runDemoButton.onclick = makeApiCall;
  runDemoButton.onclick = iabTest;
  outputToPage('Click the Run Demo button to begin.');
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
  console.log('handleauthcliclkdnsv')
  checkAuth(false);
}

// Query (list) all accounts
function makeApiCall() {
  outputToPage('Querying Accounts.');
  // makeMetadataRequest();
  gapi.client.analytics.management.accounts.list().execute(responseHandler);
}

// Selects by default the first account. 
// TODO: add logic for account selection to pass on
// TODO: convert into common utility function
function handleAccounts(response) {
  if (!response.code) {
    if (response.items && response.items.length) {
      var firstAccountId = response.items[0].id;
      queryWebproperties(firstAccountId);
    } else {
      outputToPage('No accounts found for this user.', true);
    }
  } else {
    outputToPage('There was an error querying accounts: ' + response.message, true);
  }
}

// Query all web properties for a given account
function queryWebproperties(accountId) {
  outputToPage('Querying Webproperties.', true);
  gapi.client.analytics.management.webproperties.list({
      'accountId': accountId
  }).execute(responseHandler);
}

// Selects by default the first web property. 
// TODO: add logic for web property selection to pass on
function handleWebproperties(response) {
  if (!response.code) {
    if (response.items && response.items.length) {
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
  }).execute(responseHandler);
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

function responseHandler(response) {
  if (!response.code) {
    var id = response.items[0].id,
        secondId;
    if (response && response.items && response.items.length) {
      if(type === 'account' || 'profile'){
        type === 'account' ? queryWebproperties(id) : queryCoreReportingApi(id);
      } else if(type === 'webproperty'){
        secondId = response.items[0].accountId;
        queryProfiles(id, secondId);
      } else {
        throw 'Handling type not specified';
      }
    } else {
      outputToPage('No '+ type + 's found.', true);
    }
  } else {
    outputToPage('There was an error querying' + type + 's: ' + response.message, true);
  }
}

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

function sendToken(data){
  console.log('sending token jquery')
  var request = $.ajax({
        url: "/tokenized",
        type: "post",
        data: data
  });
  // callback handler that will be called on success
  request.done(function (response, textStatus, jqXHR){
      // log a message to the console
      console.log("Hooray, it worked!");
  });
  // callback handler that will be called on failure
  request.fail(function (jqXHR, textStatus, errorThrown){
      // log the error to the console
      console.error(
          "The following error occured: " +
          JSON.parse(jqXHR), textStatus, errorThrown
      );
  });
}

 
