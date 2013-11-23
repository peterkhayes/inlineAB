(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-45967923-1', 'auto');
ga('send', 'pageview');


var getGAID = function(){   
  var key = '__utma';
  var result;
  return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null;
}

var GAID = getGAID() || ("peter.k.hayes"+Math.random());
var experiences = {};

var hash = function(input){
  input = (typeof input === 'string' ? input : input.toString());
  var hash = 0, i, char;
  if (input.length === 0) return hash;
  for (i = 0, l = input.length; i < l; i++) {
      char  = input.charCodeAt(i);
      hash  = ((hash<<5)-hash)+char;
      hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

var substitute = function() {
  console.log('sub');
  // Live NodeList
  var abTests = document.getElementsByTagName('abtest');

  var currIDHash = Math.abs(hash(GAID));
  // ab mutates as we replace its nodes
  while (abTests.length) {
    // Define variables.
    var current = abTests[0];
    var children = current.children;
    var expNumber = currIDHash % children.length;
    currIDHash = Math.abs(hash(currIDHash));
    var selectedChild = children[expNumber];

    // Save the history of the test.
    var testName = current.getAttribute('test-name');
    var expName = selectedChild.getAttribute('exp-name');
    experiences[testName] = expName;

    selectedChild.removeAttribute('exp-name');
    current.parentNode.replaceChild(selectedChild, current);
    // ga('set', testName, expName);
    //we need the indexed dimension name here??
  }

  var abGoals = document.getElementsByTagName('abgoal');

  for (var i = 0; i < abGoals.length; i++) {
    var goal = abGoals[i];
    var goalName = goal.getAttribute('goal-name');
    goal.addEventListener('click', function() { console.log('clicked ' + goalName, experiences); }, false);
    selectedChild.removeAttribute('goal-name');
  }
};

var doneSwizzling = false;

document.addEventListener('DOMContentLoaded', function() {
  doneSwizzling = true;
  substitute();
});

var swizzle = function() {
  substitute();
  if(!doneSwizzling){
    swizzle();
  }
};


// GAID - ID of a user on our site from google.
// Hash this id.
// element 1 - take this hash mod the number of choices.
// Hash the hash again.
// element 2 - take this new hash mod the number of choices.
// etc etc...










