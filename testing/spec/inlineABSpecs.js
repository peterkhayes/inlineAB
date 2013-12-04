describe('injector', function(){


  // afterEach(function () {
  //   $('.ab-container').empty();
  // });

  var sampleTest1;
  var sampleTest2;
  var sampleClassTest;
  var sampleGoal1;
  var sampleGoal2;

  sampleTest1 = '<abtest test-name="test1"><p exp-name="dog">WOOF</p><p exp-name="cat">MEOW</p></abtest>';
  sampleTest2 = '<abtest test-name="test2"><p exp-name="bam">BAM</p><p exp-name="pow">POW</p></abtest>';
  sampleGoal1 = $('<abgoal goal-name="buy" goal-action="click"><button>Buy Now!</button></abgoal>');
  sampleGoal2 = $('<abgoal goal-name="buy" goal-action="enter"><input type="text"/></abgoal>');
  sampleGoal3 = $('<abgoal goal-name="comment" goal-action="click"><input type="text"/></abgoal>');
  sampleGoal4 = $('<abgoal goal-name="share" goal-action="click"><input type="text"/></abgoal>');

  beforeEach(function() {
    document.cookie = 'GAEventSent=';
  });

  it('replaces lots of tags fast', function() {
    runs(function() {
      for (var i = 0; i < 50; i++) {
        $('.ab-container').append($(sampleTest1).clone());
      }
    });
    
    waitsFor(function() {
      // console.log($('abgoal').length);
      return !document.getElementsByTagName("abtest")[0];
    }, "removal of abtest tags", 50);
  })

  it('fires events every time a test view is chosen', function(){
    runs(function() {
      spyOn(window, 'ga');
      $('.ab-container').append(sampleTest1);
      expect(window.ga.callCount).toEqual(0);
    });
    
    waitsFor(function() {
      return !document.getElementsByTagName("abtest")[0];
    }, "removal of abtest tag", 30);

    runs(function() {
      expect(window.ga.callCount).toEqual(1);
    });
  });

  
  it('fires events every time a goal is clicked', function(){
    runs(function() {
      spyOn(window, 'ga');
      $('.ab-container').append(sampleGoal1);
    });
    
    waitsFor(function() {
      return !document.getElementsByTagName("abgoal")[0];
    }, "removal of abgoal tag", 30);

    runs(function() {
      expect(window.ga.callCount).toEqual(0);
      window.button = $('button')[0];
      $(button).trigger('click');
      expect(window.ga.callCount).toEqual(1);
    });

  });

  it('fires only one event for repeated tests', function() {
    runs(function() {
      spyOn(window, 'ga');
      for (var i = 0; i < 50; i++) {
        $('.ab-container').append($(sampleTest1).clone());
      }
    });

    waitsFor(function() {
      // console.log($('abgoal').length);
      return !document.getElementsByTagName("abtest")[0];
    }, "removal of abtest tags", 100);

    runs(function() {
      expect(window.ga.callCount).toEqual(1);
    });
  });
});

