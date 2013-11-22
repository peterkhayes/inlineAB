var GAID = "peter.k.hayes";
var experiences = {};

var hash = function(input){
  input = (typeof input === "string" ? input : input.toString());
  var hash = 0, i, char;
  if (input.length === 0) return hash;
  for (i = 0, l = input.length; i < l; i++) {
      char  = input.charCodeAt(i);
      hash  = ((hash<<5)-hash)+char;
      hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Live NodeList
var abTests = document.getElementsByTagName('abtest');

var currIDHash = Math.abs(hash(GAID));
// ab mutates as we replace its nodes
while (abTests.length) {
  // Define variables.
  var current = abTests[0];
  var children = current.children;
  var expNumber = currIDHash % children.length;
  console.log(expNumber);
  currIDHash = Math.abs(hash(currIDHash));
  var selectedChild = children[expNumber];

  // Save the history of the test.
  var testName = current.getAttribute('test-name');
  var expName = selectedChild.getAttribute('exp-name');
  experiences[testName] = expName;

  selectedChild.removeAttribute('exp-name');
  current.parentNode.replaceChild(selectedChild, current);
}

var abGoals = document.getElementsByTagName('abgoal');

for (var i = 0; i < abGoals.length; i++) {
  var goal = abGoals[i];
  var goalName = goal.getAttribute('goal-name');
  goal.addEventListener('click', function() { console.log('clicked ' + goalName, experiences); }, false);
  selectedChild.removeAttribute('goal-name');

}

// GAID - ID of a user on our site from google.
// Hash this id.
// element 1 - take this hash mod the number of choices.
// Hash the hash again.
// element 2 - take this new hash mod the number of choices.
// etc etc...










