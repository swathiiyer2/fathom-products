const {readFileSync, writeFile, readdirSync, statSync} = require('fs');
const {dirname, join} = require('path');
var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().
withCapabilities(webdriver.Capabilities.safari()).
build();

function writeToFile(path, thing){
  writeFile(path, thing, 'utf-8', (err) => {
    if (err) {
      console.log("ERROR: ", err);
      throw err;
    }
    console.log(path, "DONE");
  });
}

function collectCSS(dir) {
  let callback = arguments[arguments.length - 1];
  let node_properties = {};
  const src = document.documentElement.outerHTML;
  const all = document.getElementsByTagName("*");
  for (let j = 0; j < all.length; j++) {
       const curr = all[j].getBoundingClientRect();
       node_properties[j] = {
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

}

if (require.main === module) {
  //Get folders
  const dirs = p => readdirSync(p).filter(f => statSync(p+"/"+f).isDirectory());
  const folders = dirs(join(dirname(__dirname), 'fathom-products' , 'product_classification_test_data'));
  driver.manage().window().setSize(1680, 960);
  driver.manage().timeouts().setScriptTimeout(100000);

  folders.forEach(function(item){
      let currUrl = join('file://', dirname(__dirname), 'fathom-products' , 'product_classification_test_data', item, 'source.webarchive');

      //Get the page
      driver.get(currUrl);

      //Get dimensions and css data
      driver.executeAsyncScript(collectCSS, item).then(function(doc_info) {
        console.log(doc_info.folder);
        const base = join(dirname(__dirname), 'fathom-products', 'product_classification_test_data', doc_info.folder);
        writeToFile(base + '/source.html', String(doc_info.html));
        writeToFile(base + '/nodes.txt', JSON.stringify(doc_info.css));
    });
  });
  driver.close();
}
