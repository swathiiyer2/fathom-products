/**
 * Using fathom to extract a product from its product page,
 * where a 'product' is defined by the bundle of features that
 * makes it identifiable.
 *
 * Features:
 *    In Progress - Title, Image, Price
*     Future - Reviews, Product ID?
 *
 * Testing:
 *    50 test products in product_classification_test_data folder
 *    All test sources are product detail pages (one main product on this page)
 *    Later, go on to extract products from a product index page (multiple products per page)
 *
 */

const {readFileSync, writeFile, readdirSync, statSync} = require('fs');
const {dirname, join} = require('path');
const leven = require('leven');
const {dom, props, out, rule, ruleset, score, type} = require('fathom-web');
const {staticDom} = require('fathom-web/utils');
const tuningRoutines = {'title' : tunedTitleFnodes,
                        // 'price' : tunedPriceFnodes,
                        // 'image' : tunedImageFnodes
                        };


// const {domSort, staticDom} = require('../../utils');
// const {Annealer} = require('../../optimizers');
// const {productImageDocPairs, productTitleDocPairs, productPriceDocPairs} = require('./docpairs');


// function euclideanDistance(nodeA, nodeB){
//
//   /* getBoundingClientRect is relative to the viewport, should be fine for tests and demos
//   but might need to be tweaked or replaced with a different call when integrated
//   into a real-life browsing session, where the user might have scrolled */
//
//   var rectA = nodeA.getBoundingClientRect();
//   var rectB = nodeB.getBoundingClientRect();
//   var x = rectB.left - rectA.left;
//   var y = rectB.bottom - rectB.bottom;
//   return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
// }

function tunedImageFnodes() {
    // function imageSize(fnode) {
    //   return fnode.element.offsetWidth * fnode.element.offsetHeight;
    // }
    //
    // function imageHasSrc(fnode) {
    //   return fnode.element.hasAttribute('src') && fnode.element.getAttribute('src') !== '';
    // }
    //
    // function imageTitle(fnode) {
    //   var title = document.getElementsByTagName('title')[1];
    //   if (title === undefined) {
    //     return 1;
    //   }
    //
    //   if (fnode.element.getAttribute('title') &&
    //      (fnode.element.getAttribute('title').includes(title.innerHTML) || title.innerHTML.includes(fnode.element.getAttribute('title'))) ||
    //       fnode.element.getAttribute('alt') &&
    //      (fnode.element.getAttribute('alt').includes(title.innerHTML) || title.innerHTML.includes(fnode.element.getAttribute('alt')))) {
    //            return 10000;
    //   }
    //   return 1;
    // }
    //
    // function keywords(fnode) {
    //   if(fnode.element.hasAttribute('src') && fnode.element.src.match(/(thumb|logo|icon)/i)){
    //     return 0;
    //   } else if (fnode.element.hasAttribute('src') && fnode.element.src.match(/(hero|main|product|large)/i)){
    //     return 1000;
    //   }
    //   return 1;
    // }
    //
    // function imageType(fnode){
    //   if(fnode.element.hasAttribute('src') && fnode.element.src.match(/(jpg|jpeg)/i)){
    //     return 1000;
    //   } else if (fnode.element.hasAttribute('src') && fnode.element.src.match(/(png|webp)/i)){
    //     return 0;
    //   }
    //   return 1;
    // }
    //
    // function titleInSrc(fnode){
    //   var title = document.getElementsByTagName('title')[1];
    //   if (title === undefined) {
    //     return 1;
    //   }
    //
    //   var arr = title.innerHTML.replace('|', '').split(' ');
    //   var regexstring = '';
    //   for(var i = 0; i < arr.length; i++){
    //     regexstring += arr[i];
    //     if(i !== arr.length - 1){
    //       regexstring += "|";
    //     }
    //   }
    //
    //   var regex = new RegExp(regexstring, "gi");
    //
    //   if(fnode.element.hasAttribute('src') && fnode.element.src.match(regex)){
    //     return 1000 * fnode.element.src.match(regex).length;
    //   }
    //
    //   return 1;
    // }
    //
    // const rules = ruleset(
    //   //get all images
    //   rule(dom('img'), type('images')),
    //
    //   //better score for larger images
    //   rule(type('images'), score(imageSize)),
    //
    //   //jpegs used more often than pngs
    //   rule(type('images'), score(imageType)),
    //
    //   //make sure image has src
    //   rule(type('images'), score(imageHasSrc)),
    //
    //   //image title matches page title
    //   rule(type('images'), score(imageTitle)),
    //
    //   //image title contained in image src
    //   rule(type('images'), score(titleInSrc)),
    //
    //   //not to be confused with the thumbnail or logo
    //   rule(type('images'), score(keywords)),
    //
    //   //return image with max score
    //   rule(type('images').max(), out('product-image'))
    //
    // );
    //
    // function tuningRoutine(doc) {
    //     return rules.against(doc).get('product-image');
    // }
    //
    // return tuningRoutine;
}

function tunedTitleFnodes(dict) {
    const rules = ruleset(
      //get all title tags in the inserted fixture
      rule(dom('title'), type('titleish')),

      //return image with max score
      rule(type('titleish').max(), out('product-title'))

    );

    function tuningRoutine(doc) {
        return rules.against(doc).get('product-title');
    }

    return tuningRoutine;
}

function tunedPriceFnodes() {

    // function hasDollarSign(fnode){
    //   if(fnode.element.childNodes[0] && fnode.element.childNodes[0].nodeValue && fnode.element.childNodes[0].nodeValue.includes('$')){
    //     return 2;
    //   }
    //   return 1;
    // }
    //
    // function tagHasGoodCss(fnode){
    //   if(fnode.element.id.match(/price/i) || fnode.element.classList.contains(/price/i)){
    //     return 2;
    //   }
    //   return 1;
    // }
    //
    // function notSavingsAmount(fnode){
    //   if(fnode.element.childNodes[0] && fnode.element.childNodes[0].nodeValue &&
    //     (fnode.element.childNodes[0].nodeValue.includes('-') || window.getComputedStyle(fnode.element).getPropertyValue('text-decoration') === 'line-through')){
    //     return 0;
    //   }
    //   return 1;
    // }
    //
    //
    // const rules = ruleset(
    //   //get all elements that could contain the price
    //   rule(dom('span, div, li'), type('priceish')),
    //
    //   //bonus if direct text (not children) contains a dollar sign
    //   rule(type('priceish'), score(hasDollarSign)),
    //
    //   //look for good css within tag
    //   rule(type('priceish'), score(tagHasGoodCss)),
    //
    //   //not to be confused with amount off (minus sign, crossed off)
    //   rule(type('priceish'), score(notSavingsAmount)),
    //
    //   //return image with max score
    //   rule(type('priceish').max(), out('product-price'))
    //
    // );
    //
    // function tuningRoutine(doc) {
    //     return rules.against(doc).get('product-price');
    // }
    //
    // return tuningRoutine;
}

/**
 * Maintain state as we compare a series of DOMs, reporting the percent
 * difference at the end.
 */
class DiffStats {
    constructor(tuningRoutine, feature) {
        this.numTests = 0;
        this.deviation = 0;
        this.feature = feature;
        this.tuningRoutine = tuningRoutine || tuningRoutines[feature];
    }

    compare(expectedDom, sourceDom, dict) {
        let expectedText;
        let gotText;
        if (this.feature === 'image') {
          //compare images by src
          expectedText = expectedDom.body.firstChild.src;
          gotText = this.tuningRoutine()(sourceDom).map(fnode => fnode.element.src)[0];
        } else if (this.feature === 'title') {
          //compare innerHTML text of titles
          expectedText = expectedDom.head.firstChild.innerHTML;
          gotText = this.tuningRoutine(dict)(sourceDom).map(fnode => fnode.element.innerHTML)[0];
        } else if (this.feature === 'price') {
          //strip whitespace and dollar sign if there is one when comparing price
          expectedText = expectedDom.body.firstChild.textContent.replace('$', '').trim();
          gotText = this.tuningRoutine()(sourceDom).map(fnode => fnode.element.textContent.replace('$', '').trim())[0];
        }

        this.numTests++;
        if(expectedText !== gotText) {
          this.deviation++;
        }

        // Uncomment for debugging:
        console.log(leven(expectedText, gotText), expectedText.length, leven(expectedText, gotText)/expectedText.length);
        console.log('Got:\n' + gotText);
        console.log('\nExpected:\n' + expectedText);
    }

    score() {
        return this.deviation / this.numTests * 100;
    }
}

/*
 * Reads/parses the node#->css dictionary collected by selenium, and creates a new map from HTMLObj -> CSS
 */

function createDict(item, sourceDom){
  let nodesMap = new Map();
  const numberToCss = JSON.parse(readFileSync(join(dirname(__dirname), 'fathom-products', 'product_classification_test_data', item, 'nodes.txt'), 'utf-8'));
  const elems = sourceDom.getElementsByTagName('*');
  console.log(sourceDom.getElementsByTagName('*').length, Object.keys(numberToCss).length);

  //Match each node from the sourceDom to its css, and store in the global dict
  for(let i = 0; i < elems.length; i++){
    nodesMap.set(elems[i], numberToCss[i]);
  }
  console.log(nodesMap.size);
  return nodesMap;
}

/*
 * Calculate overall score for one feature
 * Args: folders - list of all test folders; feature - title/image/price; coeffs - tuning coeffs if any
 */
function deviationScore(folders, feature, coeffs = []) {
    const stats = new DiffStats(tuningRoutines[feature], feature);

    //For each test file, create the object-> css map, and run the comparison function
    folders.forEach(function(store){
      if(['macys', 'swatch'].includes(store)){return;} // HACK: random jsdom script tag parsing errors, ignore for now
      const domFromFile = fileName => staticDom(readFileSync(join(dirname(__dirname), 'fathom-products', 'product_classification_test_data', store, fileName)));
      const dict = createDict(store, domFromFile('source.html'));
      const pair = [domFromFile('expected-' + feature + '.html'), domFromFile('source.html')];
      stats.compare(pair[0], pair[1], dict);
      console.log(stats.score());
    });

    // return stats.score();
}

if (require.main === module) {
    const folders_in = p => readdirSync(p).filter(f => statSync(p + "/" + f).isDirectory());
    // const folders = folders_in(join(dirname(__dirname), 'fathom-products' , 'product_classification_test_data'));
    const folders = ['amazon'];

    //For each feature, calculate score
    Object.keys(tuningRoutines).forEach(function(f){
      deviationScore(folders, f);
      //console.log('% difference from ideal:', deviationScore(folders, f));
    });
}
