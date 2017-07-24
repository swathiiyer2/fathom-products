const {readFileSync, writeFile, readdirSync, statSync} = require('fs');
const {dirname, join} = require('path');
var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().
withCapabilities(webdriver.Capabilities.safari()).
build();


if (require.main === module) {
  //Get folders
  const dirs = p => readdirSync(p).filter(f => statSync(p+"/"+f).isDirectory());
  const folders = dirs(join(dirname(__dirname), 'fathom-products' , 'product_classification_test_data'));
  driver.manage().window().maximize();
  driver.manage().timeouts().setScriptTimeout(100000); 


  folders.forEach(function(item){
      var currUrl = join('file://', dirname(__dirname), 'fathom-products' , 'product_classification_test_data', item, 'source.webarchive');

      //Get the page
      driver.get(currUrl);

      //Get dimensions and css data
      driver.executeAsyncScript(function(dir) {
        var callback = arguments[ arguments.length - 1 ];
        var src = document.documentElement.outerHTML;
        var node_properties = {};
        var all = document.getElementsByTagName("*");
        for (var j = 0; j < all.length; j++) {
             var curr = all[j].getBoundingClientRect();
             node_properties[j.toString()] = {
                                              "top" : curr.top,
                                              "bottom" : curr.bottom,
                                              "left" : curr.left,
                                              "right" : curr.right,
                                              "display" : all[j].style.display,
                                              "visibility" : all[j].style.visibility,
                                              "strikethrough" : window.getComputedStyle(all[j]).getPropertyValue('text-decoration')
                                            };
        }

        setTimeout(function () {
           callback({
              html: src,
              css: node_properties,
              folder : dir
           });
        });

      }, item).then(function(doc_info) {
        console.log(doc_info.folder);
        var src_filepath = join(dirname(__dirname), 'fathom-products', 'product_classification_test_data', doc_info.folder, 'source.html');
        var nodes_filepath = join(dirname(__dirname), 'fathom-products', 'product_classification_test_data', doc_info.folder, 'nodes.txt');

        //Write html to file
        writeFile(src_filepath, String(doc_info.html) , 'utf-8', (err) => {
        	if (err) {
            throw err;
        	   console.log("ERROR: ", err);
          }
          console.log(src_filepath, "DONE");
        });

        //Write data to file
        writeFile(nodes_filepath, JSON.stringify(doc_info.css) , 'utf-8', (err) => {
          if (err) {
            throw err;
            console.log("ERROR: ", err);
          }
          console.log(nodes_filepath, "DONE");
        });

      });

      setTimeout(function () {}, 1000);

  });

  driver.close();
}
