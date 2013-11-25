(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-45967923-1', 'auto');

(function(window) {

  console.log(document.cookie);


// Check for cookie
// If cookie,
  // If !didNotUseCookie use GAID
  // Else use saved exp (didNotUseCookie)
// If no cookie, Math.random exp && save didNoteUseCookie = exp;


// Polyfills
''.trim || (String.prototype.trim = function(){return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g,'');});

var testsSeen = '';

// Google Analytics stuff.
var getGAID = function(key){
  var result;
  return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null;
};

var GAID = getGAID('_ga') || getGAID('__utma');
var testData = {};

var hash = function(input){
  input = (typeof input === 'string' ? input : input.toString());
  var hash = 0, i, char;
  if (input.length === 0) return hash;
  for (i = 0, l = input.length; i < l; i++) {
      char  = input.charCodeAt(i);
      hash = hash & hash; // Convert to bitwise
      hash  = ((hash>>>5)-hash)+char;
      hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

var getExpNumber = function(testName, numberOfExperiences) {
  var hashed = hash(testName + GAID);
  var ans = (hashed % numberOfExperiences);
  return ans;
};

var abTests = document.getElementsByTagName('abtest');
var abClasses = document.getElementsByTagName('abclass');
var abGoals = document.getElementsByTagName('abgoal');


var substitute = function() {
  console.log('sub');
  // Live NodeList

  // ab mutates as we replace its nodes
  while (abTests.length) {
    // Define variables.
    var currentTest = abTests[0];
    var testName = currentTest.getAttribute('test-name');
    var expName = currentTest.getAttribute('exp-name');
    testsSeen += '&.t' + testName + '__' + expName;
    var experiences = currentTest.children;
    var expNumber = getExpNumber(testName, experiences.length);
    var selectedExperience = experiences[expNumber];

    // Save the history of the test.
    testData[testName] = selectedExperience.getAttribute('exp-name');

    // Clean up the DOM.
    selectedExperience.removeAttribute('exp-name');
    currentTest.parentNode.replaceChild(selectedExperience, currentTest);
  }

  while (abClasses.length) {
    var currentClassTest = abClasses[0];
    var elem = currentClassTest.children[0];
    var classTestName = currentClassTest.getAttribute('test-name');
    var classOptions = currentClassTest.getAttribute('test-classes').split('|');
    var classExpNumber = getExpNumber(classTestName, classOptions.length);
    var selectedClass = classOptions[classExpNumber].trim();
    testsSeen += '&.c' + classTestName + '__' + selectedClass;
    elem.className += (' ' + selectedClass);

    // Save the history of the test.
    testData[classTestName] = classOptions[classExpNumber].trim();

    // Clean up the DOM.
    currentClassTest.parentNode.replaceChild(elem, currentClassTest);
  }

  while(abGoals.length) {
    var goal = abGoals[0];
    var goalName = goal.getAttribute('goal-name');
    var goalTarget = goal.children[0];

    // Clean up the DOM.
    goalTarget.addEventListener('click', function() { console.log('clicked ' + goalName, testData); }, false);
    goal.parentNode.replaceChild(goalTarget, goal);
  }
};

var timeout;

timeout = setInterval(substitute, 20);

document.addEventListener('DOMContentLoaded', function() {
  console.log("Dom content loaded");
  // clearTimeout(timeout);
  
  // Send custom attributes held in testsSeen
  ga('send', {
    'hitType': 'pageview',
    'title': testsSeen
  });

  // substitute();
});

// var swizzle = function() {
//   substitute();
//   timeout = setTimeout(swizzle, 1);
// };

// swizzle();



})(window);











