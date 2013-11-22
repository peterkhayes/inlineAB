var ab_tests = document.getElementsByTagName('ab');

while (ab_tests.length) {
  var children = ab_tests[0].children;
  var exp_number = ~~(Math.random()*children.length);

  ab_tests[0].parentNode.replaceChild(children[exp_number], ab_tests[0]);
}