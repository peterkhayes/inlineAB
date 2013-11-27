// 
// injector.js
// Copyright: Peter Hayes, Rich Parrish, Alex Prokop, Gavin Shriver, Joey Yang
// License: CC BY-SA
//
// injector.js reads an HTML file with inline A/B tests as specified by the Inline A/B library
// and displays the user a persistent variation of that website. It then sends the test results
// to Google Universal Analytics for analysis.
//
// The file is inserted directly after the opening <body> tag in the page's HTML.
//

// Standard Google Universal Analytics setup code.
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

// Set second argument with your GA Tracking ID.
// This can be found under Admin > Property > Property Settings > Tracking ID
ga('create', 'UA-45967923-1', 'auto');

(function(window) {

  // Add custom HTML tags for IE versions that are not 9 or 10+
  if(navigator.appVersion.indexOf('MSIE 9') === -1
    && navigator.appVersion.indexOf('MSIE 1') === -1){
    document.createElement('abtest');
    document.createElement('abclass');
    document.createElement('abgoal');
  }

  // Find all elements to be tested as defined by markup
  var abTests = document.getElementsByTagName('abtest'),
      abClasses = document.getElementsByTagName('abclass'),
      abGoals = document.getElementsByTagName('abgoal'),
      testData = {},
      GAID,
      timeout;

  // create cookie at document.cookie
  var createCookie = function(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
  };

  // read property of cookie at document.cookie
  var readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  };

  // erase property of cookie at document.cookie
  var eraseCookie = function(name) {
    createCookie(name,"",-1);
  };

  // create and read cookie
  var makeAndReadCookie = function(days){
    !readCookie('hash') && createCookie('hash', Math.random(), days);
    return readCookie('hash');
  };

  // Polyfill for the String.prototype.trim function
  ''.trim || (String.prototype.trim = function(){return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g,'');});

  // Get the Google Analytics ID, if it exists.
  var getGAID = function(key){
    var result;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null;
  };

  // Standard hashing function, used to generate page variations based on the value of a user's cookie.
  // Because the cookie ID persists between sessions, the user always sees the same variations.
  var hash = function(input){
    input = (typeof input === 'string' ? input : input.toString());
    var hash = 0, i, char;
    if (input.length === 0) return hash;
    for (i = 0, l = input.length; i < l; i++) {
        char  = input.charCodeAt(i);
        hash  = ((hash>>>5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Takes hashed cookie ID and determines which variation of a test a user sees.
  var getExpNumber = function(testName, numberOfExperiences) {
    // typeof GAID === 'undefined' && !readCookie('hash') && makeAndReadCookie(1000); 
    id = readCookie('hash') || makeAndReadCookie(1000);
    var hashed = hash(testName + id);
    var ans = (hashed % numberOfExperiences);
    return ans;
  };

  // add event listeners on DOM nodes (depending on browser)
  var addListener = function(element, type, callback) {
    if (element.addEventListener) {
      element.addEventListener(type, callback, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, callback);
    }
  };

  // Determines which variation of all tests to show the user and removes the other tests from the DOM,
  // then displays the selected variation to the user on DOM load.
  var substitute = function() {

    // abTests (the DOM nodes with 'abtest' as a tag) mutates as we replace its nodes
    while (abTests.length) {

      // Define variables.
      var currentTest = abTests[0];
      var testName = currentTest.getAttribute('test-name');
      // var expName = currentTest.getAttribute('exp-name');
      var experiences = currentTest.children;
      var expNumber = getExpNumber(testName, experiences.length);
      var selectedExperience = experiences[expNumber];

      // Save the history of the test.
      testData[testName] = selectedExperience.getAttribute('exp-name');

      // Send to Google Analytics:
      ga('send', 'event', 'ab-test: ' + testName, testData[testName], 'pageView');

      // Clean up the DOM.
      selectedExperience.removeAttribute('exp-name');
      currentTest.parentNode.replaceChild(selectedExperience, currentTest);
    }

    // abClasses (the DOM nodes with 'abclass' as a tag) mutates as we replace its nodes
    while (abClasses.length) {
      var currentClassTest = abClasses[0];
      var elem = currentClassTest.children[0];
      var classTestName = currentClassTest.getAttribute('test-name');
      var classOptions = currentClassTest.getAttribute('test-classes').split(',');
      var classExpNumber = getExpNumber(classTestName, classOptions.length);
      var selectedClass = classOptions[classExpNumber].trim();
      elem.className += (' ' + selectedClass);

      // Save the history of the test.
      testData[classTestName] = classOptions[classExpNumber].trim();

      // Send to Google Analytics:
      ga('send', 'event', 'ab-class: ' + classTestName, testData[classTestName], 'pageView');
     
      // Clean up the DOM.
      currentClassTest.parentNode.replaceChild(elem, currentClassTest);
    }

    // abGoals (the DOM nodes with 'abgoal' as a tag) mutates as we replace its nodes
    while(abGoals.length) {
      var goal = abGoals[0];
      var goalName = goal.getAttribute('goal-name').trim();
      var goalTarget = goal.children[0];
      var goalActions = goal.getAttribute('goal-action').split(',') || ['click'];

      // clean extra spaces from string
      for (var i = 0; i < goalActions.length; i++) {
        goalActions[i] = goalActions[i].trim();
      }

      // mouse events: click, dblclick, mousedown, mouseup, mouseover, mouseout, dragstart, drag, dragenter, dragleave, dragover, drop, dragend, keydown
      // keyboard events: enter (keyCode === 13), keyup, keydown, keypress
      // html form events: select, change, submit, reset, focus, blur
      // touch events: touchstart, touchend, touchenter, touchleave, touchcancel

      // Attach click listener to every goal trigger and send goal event to GA on click
      for (var i = 0; i < goalActions.length; i++){
        if (goalActions[i] === 'enter') {
          addListener(goalTarget, 'keyup', function(event) {
            event.keyCode === 13 && ga('send', 'event', 'ab-goal: ' + goalName, goalActions[i], goalName);
          });
        } else {
          addListener(goalTarget, goalActions[i], function() {
            ga('send', 'event', 'ab-goal: ' + goalName, goalActions[i], goalName);
          });
        }
      }

      // Clean up the DOM
      goal.parentNode.replaceChild(goalTarget, goal);
    }
  };

  // scan the DOM for new DOM elements every 20ms (faster than frame rate human eyes can detect)
  timeout = setInterval(substitute, 20);

  // send a pageview event to GA when DOM content is loaded
  addListener(document, 'DOMContentLoaded', function() {

    // Send event recording the viewing of a page.
    ga('send', 'pageview');

  }, false);

})(window);
