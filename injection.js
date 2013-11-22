var experiences = {};

// Live NodeList
var abTests = document.getElementsByTagName('abtest');

// ab mutates as we replace its nodes
while (abTests.length) {
  // Define variables.
  var current = abTests[0];
  var children = current.children;
  var expNumber = ~~(Math.random()*children.length);
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