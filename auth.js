function auth() {
  var config = {
    'response_type': 'token',
    'approval_prompt': 'auto',
    'client_id': 'YOUR CLIENT ID',
    'scope': 'https://www.googleapis.com/auth/analytics.readonly'
  };
  gapi.auth.authorize(config, function(res) {
    console.log('login complete');
    console.log(gapi.auth.getToken());
    console.log(res);
    cb(res);
  });
}

function cb() {
  // Parse the query string
  var params = {}, 
      queryString = location.hash.substring(1),
      regex = /([^&=]+)=([^&]*)/g, 
      m;

  while (m = regex.exec(queryString)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }

  // Send the token to the server
  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'https://' + window.location.host + '/catchtoken?' + queryString, true);

  xhr.onreadystatechange = function (e) {
    if (xhr.readyState === 4) {
       if(xhr.status === 200){
         window.location = params['state'];
     }
    else if(xhr.status === 400) {
          alert('There was an error processing the token.');
      }
      else {
        alert('something else other than 200 was returned');
      }
    }
  };
  xhr.send(null);
}