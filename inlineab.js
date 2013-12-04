// injector.js
// Copyright: Peter Hayes, Rich Parrish, Alex Prokop, Gavin Shriver, Joey Yang
// License: CC BY-SA
//
// injector.js reads an HTML file with inline A/B tests as specified by the Inline A/B library
// and displays the user a persistent variation of that website. It then sends the test results
// to Google Universal Analytics for analysis.
//
// The file is inserted directly after the opening <body> tag in the page's HTML.

(function(window) {

  // Stuff that gets downloaded from the script generator.
  var experimentID = "asdfghjk";
  var variations = ["default", "var1", "var2", "var3", "var4"];

  // Add custom HTML tags for IE versions that are not 9 or 10+
  if(navigator.appVersion.indexOf('MSIE 9') === -1
    && navigator.appVersion.indexOf('MSIE 1') === -1) {
    document.createElement('abtest');
    document.createElement('abclass');
    document.createElement('abgoal');
  }

  // Find all elements to be tested as defined by markup
  var abTests = document.getElementsByTagName('abtest'),
      abClasses = document.getElementsByTagName('abclass'),
      abGoals = document.getElementsByTagName('abgoal'),
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
  var getVariationNumber = function() {
    id = makeAndReadCookie(1000);
    var hashed = hash(experimentID + id);
    var ans = (hashed % variations.length);
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

      // Get the current set of experiences.
      var currentTest = abTests[0];
      var experiences = currentTest.children;
      var selectedExperience = experiences[0];
      var expNumber;

      // Get one of the variations if it has the correct number.
      for (var i = 0; i < experiences.length; i++) {
        var experience = experiences[i];
        expNumber = variations.indexOf(exp.getAttribute('exp-name') || 'default');

        if (expNumber === variationNumber) {
          selectedExperience = experiences[i];
        }
      }

      // Send to Google Analytics, if not already sent.
      if (!readCookie('GAEventSent')){
        ga('send', 'event', experimentID, expName, 'pageView');
        createCookie('GAEventSent');
      }

      // Clean up the DOM.
      selectedExperience.removeAttribute('exp-name');
      currentTest.parentNode.replaceChild(selectedExperience, currentTest);
    }

    // abGoals (the DOM nodes with 'abgoal' as a tag) mutates as we replace its nodes
    while(abGoals.length) {
      var goal = abGoals[0];
      var goalName = goal.getAttribute('goal-name').trim();
      var goalTarget = goal.children[0];
      var goalActions = goal.getAttribute('goal-action') ? goal.getAttribute('goal-action').split(',') : ['click'];

      // clean extra spaces from string
      for (var i = 0; i < goalActions.length; i++) {
        goalActions[i] = goalActions[i].trim();
      }

      // mouse events: click, dblclick, mousedown, mouseup, mouseover, mouseout, dragstart, drag, dragenter, dragleave, dragover, drop, dragend, keydown
      // keyboard events: keyup, keydown, keypress
      // html form events: select, change, submit, reset, focus, blur
      // touch events: touchstart, touchend, touchenter, touchleave, touchcancel

      // Attach click listener to every goal trigger and send goal event to GA on click
      for (var i = 0; i < goalActions.length; i++){
        addListener(goalTarget, goalActions[i], function(action){
          var boundAction = action;
          var boundGoalName = goalName;
          return function() { ga('send', 'event', 'ab-goal: ' + boundGoalName, boundAction, boundGoalName); };
        }(goalActions[i]));
      }

      // Clean up the DOM
      goal.parentNode.replaceChild(goalTarget, goal);
    }
  };

  var variationNumber = getVariationNumber();

  // scan the DOM for new DOM elements every 20ms (faster than frame rate human eyes can detect)
  timeout = setInterval(substitute, 20);

  // send a pageview event to GA when DOM content is loaded
  addListener(document, 'DOMContentLoaded', function() {

    // Send event recording the viewing of a page.
    ga('send', 'pageview');

  }, false);

})(window);
