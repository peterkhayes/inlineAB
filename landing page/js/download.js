var mostRecentABJS;

$.ajax({
      url: 'injector.js',
      dataType: 'html',
      success: function(data){
        mostRecentABJS = data;
      }
    });
  
  var save = function(){
    var gaSnippit = $('#ga-snippit').val();
    var gaCustomDimensionMapping =  makeCustomDimensionsMap();
    document.getElementById('saveButton').setAttribute(
      'href',
      'data:Content-type: text/plain, ' + escape(gaSnippit + '\n' + gaCustomDimensionMapping + '\n' + mostRecentABJS)
    );
  };

  var addRow = function(){
    var numberOfRows = $('.customDimensions').children().length + 1;
    var newRow = $("<div class='row'><div class='large-4 small-10 columns'><div class='row dimension'><div class='small-6 columns'>Dimension " + numberOfRows + ":</div><input class='small-6 columns'/></div></div></div>");
    newRow.append(newRow);
    $('.customDimensions').append(newRow);
  };

  var makeCustomDimensionsMap = function(){
    var results = "";
    var dimensions = $('.dimension').makeArray();
    for (var i = 0; i < dimensions.length; i++) {
      var number = dimensions[i].find('div').text().replace(" ", "").replace(":", "");
      number = number[0].toLowerCase() + number.slice(1);
      var name = dimensions[i].find('input').val();
      results += (number + ": '" + name + "',");
    }
    var results = "var customDimensions = {" + results.slice(0,results.length-1) + "};";
    return results;
  };
