const {readFileSync, writeFile, readdirSync, statSync} = require('fs');
const {dirname, join} = require('path');
var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().
withCapabilities(webdriver.Capabilities.safari()).
build();


if (require.main === module) {
  //Get folders
  const dirs = p => readdirSync(p).filter(f => statSync(p+"/"+f).isDirectory());
  const folders = dirs(join(dirname(__dirname), 'product_classification_test_data'));

  for(var i = 0; i < folders.length; i++){
      var currUrl = join('file://', dirname(__dirname), 'product_classification_test_data', folders[i], 'source.webarchive');
      var filepath = join(dirname(__dirname), 'product_classification_test_data', folders[i], 'nodes.txt');

      //Get the page
      driver.get(currUrl);

      //Get dimensions and css data
      driver.executeScript(function() {
        var doc_dimensions = {};
        var all = document.getElementsByTagName("*");
        for (var j = 0; j < all.length; j++) {
             var curr = all[j].getBoundingClientRect();
             doc_dimensions[j.toString()] = {
                                              "top" : curr.top,
                                              "bottom" : curr.bottom,
                                              "left" : curr.left,
                                              "right" : curr.right,
                                              "display" : all[j].style.display,
                                              "visibility" : all[j].style.visibility,
                                              "strikethrough" : window.getComputedStyle(all[j]).getPropertyValue('text-decoration')
                                            };
        }

        return doc_dimensions;
      }).then(function(dimensions) {
        //Write data to file
        writeFile(filepath, JSON.stringify(dimensions) , 'utf-8');

      });
  }
  driver.close();
}
