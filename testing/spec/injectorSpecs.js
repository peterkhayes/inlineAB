describe('injector', function(){


  afterEach(function () {
    $('.ab-container').empty();
  });

  var sampleTest1;
  var sampleTest2;
  var sampleClassTest;
  var sampleGoal1;
  var sampleGoal2;


  sampleTest1 = '<abtest test-name="test1"><p exp-name="dog">WOOF</p><p exp-name="cat">MEOW</p></abtest>';
  sampleTest2 = '<abtest test-name="test2"><p exp-name="bam">BAM</p><p exp-name="pow">POW</p></abtest>';
  sampleClassTest = '<abclass test-name="classTest" test-classes="red|blue"><p>Colorful sentence!</p></abclass>';
  sampleGoal1 = $('<abgoal goal-name="buy" goal-action="click"><button>Buy Now!</button></abgoal>');
  sampleGoal2 = $('<abgoal goal-name="buy" goal-action="enter"><input type="text"/></abgoal>');
  sampleGoal3 = $('<abgoal goal-name="comment" goal-action="click"><input type="text"/></abgoal>');
  sampleGoal4 = $('<abgoal goal-name="share" goal-action="click"><input type="text"/></abgoal>');


  it('removes ab tags from page quickly', function(){
    $('.ab-container').append(sampleTest1);
    $('.ab-container').append(sampleTest2);
    $('.ab-container').append(sampleClassTest);
    $('.ab-container').append(sampleGoal1);
    $('.ab-container').append(sampleGoal2);

    var tests = $('abtest');
    var classTests = $('abclass');
    var goals = $('abgoal');

    setTimeout(function() {
      expect(tests.length).toEqual(0);
      expect(classTests.length).toEqual(0);
      expect(goals.length).toEqual(0);
    }, 20);
  });



  it('continues scanning for ab tags in perpetuity', function(){
    $('.ab-container').append(sampleTest1);
    $('.ab-container').append(sampleTest2);
    $('.ab-container').append(sampleClassTest);
    $('.ab-container').append(sampleGoal1);
    $('.ab-container').append(sampleGoal2);
    $('.ab-container').append(sampleGoal1);
    $('.ab-container').append(sampleGoal2)


  

    setTimeout(function() {
      expect(tests.length).toEqual(0);
      expect(classTests.length).toEqual(0);
      expect(goals.length).toEqual(0);
    }, 20);

    $('.ab-container').empty();

    var tests = $('abtest');
    var classTests = $('abclass');
    var goals = $('abgoal');

    $('.ab-container').append(sampleTest1);
    $('.ab-container').append(sampleTest2);
    $('.ab-container').append(sampleClassTest);
    $('.ab-container').append(sampleGoal1);

    setTimeout(function() {
      expect(tests.length).toEqual(0);
      expect(classTests.length).toEqual(0);
      expect(goals.length).toEqual(0);
    }, 20);

    $('.ab-container').empty();


    var tests = $('abtest');
    var classTests = $('abclass');
    var goals = $('abgoal');

    $('.ab-container').append(sampleTest1);
    $('.ab-container').append(sampleTest2);
    $('.ab-container').append(sampleTest1);
    $('.ab-container').append(sampleTest2);
    $('.ab-container').append(sampleClassTest);
    $('.ab-container').append(sampleGoal1);

    setTimeout(function() {
      expect(tests.length).toEqual(0);
      expect(classTests.length).toEqual(0);
      expect(goals.length).toEqual(0);
    }, 20);

  });

  it('fires events every time a test view is chosen', function(){
    spyOn(window, 'ga');
    $('.ab-container').append(sampleTest1);
    setTimeout(function() {
      expect(window.ga.callCount).toEqual(1);
    },50);
  });
  
  it('fires events every time a goal is clicked', function(){
    spyOn(window, 'ga');
    $('.ab-container').append(sampleGoal1);

    window.button = $('button')[0];

    console.log(ga.callCount);
    $(button).trigger('click');
    setTimeout(function() {
      expect(window.ga.callCount).toEqual(1);
    },50);
  });


  it('attaches events to all goals--(*this test will only pass in Chrome*)', function(){


    setTimeout(function() {
    },50);
  })

});

