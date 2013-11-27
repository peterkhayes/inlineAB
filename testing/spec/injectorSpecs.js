describe('injector', function(){

  var sampleTest1;
  var sampleTest2;
  var sampleClassTest;
  var sampleGoal1;
  var sampleGoal2;

  sampleTest1 = $('<abtest test-name="test1"><p exp-name="dog">WOOF</p><p exp-name="cat">MEOW</p></abtest>');
  sampleTest2 = $('<abtest test-name="test2"><p exp-name="bam">BAM</p><p exp-name="pow">POW</p></abtest>');
  sampleClassTest = $('<abclass test-name="classTest" test-classes="red|blue"><p>Colorful sentence!</p></abclass>');
  sampleGoal1 = $('<abgoal goal-name="buy" goal-action="click"><button>Buy Now!</button></abgoal>');
  sampleGoal1 = $('<abgoal goal-name="buy" goal-action="enter"><input type="text"/></abgoal>');


  it('removes ab tags from page quickly', function(){
    $('body').append(sampleTest1);
    $('body').append(sampleTest2);
    $('body').append(sampleClassTest);
    $('body').append(sampleGoal1);
    $('body').append(sampleGoal2);

    var tests = $('abtest');
    var classTests = $('abclass');
    var goals = $('abgoal');

    setTimeout(function() {
      expect(tests.length).toEqual(0);
      expect(classTests.length).toEqual(0);
      expect(goals.length).toEqual(0);
    }, 20);
  });

});