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
 *    All test sources are product detail pages (one product on this page)
 *    Later, go on to extract products from a product index page (multiple products per page)
 *
 */

const {readFileSync, writeFile, readdirSync, statSync} = require('fs');
const {dirname, join} = require('path');
const leven = require('leven');
const {dom, props, out, rule, ruleset, score, type} = require('fathom-web');
const {staticDom} = require('fathom-web/utils');
var currDict = {};

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

// function tunedImageFnodes() {
//     function imageSize(fnode) {
//       return fnode.element.offsetWidth * fnode.element.offsetHeight;
//     }
//
//     function imageHasSrc(fnode) {
//       return fnode.element.hasAttribute('src') && fnode.element.getAttribute('src') !== '';
//     }
//
//     function imageTitle(fnode) {
//       var title = document.getElementsByTagName('title')[1];
//       if (title === undefined) {
//         return 1;
//       }
//
//       if (fnode.element.getAttribute('title') &&
//          (fnode.element.getAttribute('title').includes(title.innerHTML) || title.innerHTML.includes(fnode.element.getAttribute('title'))) ||
//           fnode.element.getAttribute('alt') &&
//          (fnode.element.getAttribute('alt').includes(title.innerHTML) || title.innerHTML.includes(fnode.element.getAttribute('alt')))) {
//                return 10000;
//       }
//       return 1;
//     }
//
//     function keywords(fnode) {
//       if(fnode.element.hasAttribute('src') && fnode.element.src.match(/(thumb|logo|icon)/i)){
//         return 0;
//       } else if (fnode.element.hasAttribute('src') && fnode.element.src.match(/(hero|main|product|large)/i)){
//         return 1000;
//       }
//       return 1;
//     }
//
//     function imageType(fnode){
//       if(fnode.element.hasAttribute('src') && fnode.element.src.match(/(jpg|jpeg)/i)){
//         return 1000;
//       } else if (fnode.element.hasAttribute('src') && fnode.element.src.match(/(png|webp)/i)){
//         return 0;
//       }
//       return 1;
//     }
//
//     function titleInSrc(fnode){
//       var title = document.getElementsByTagName('title')[1];
//       if (title === undefined) {
//         return 1;
//       }
//
//       var arr = title.innerHTML.replace('|', '').split(' ');
//       var regexstring = '';
//       for(var i = 0; i < arr.length; i++){
//         regexstring += arr[i];
//         if(i !== arr.length - 1){
//           regexstring += "|";
//         }
//       }
//
//       var regex = new RegExp(regexstring, "gi");
//
//       if(fnode.element.hasAttribute('src') && fnode.element.src.match(regex)){
//         return 1000 * fnode.element.src.match(regex).length;
//       }
//
//       return 1;
//     }
//
//     const rules = ruleset(
//       //get all images
//       rule(dom('img'), type('images')),
//
//       //better score for larger images
//       rule(type('images'), score(imageSize)),
//
//       //jpegs used more often than pngs
//       rule(type('images'), score(imageType)),
//
//       //make sure image has src
//       rule(type('images'), score(imageHasSrc)),
//
//       //image title matches page title
//       rule(type('images'), score(imageTitle)),
//
//       //image title contained in image src
//       rule(type('images'), score(titleInSrc)),
//
//       //not to be confused with the thumbnail or logo
//       rule(type('images'), score(keywords)),
//
//       //return image with max score
//       rule(type('images').max(), out('product-image'))
//
//     );
//
//     function contentFnodes(doc) {
//         return rules.against(doc).get('product-image');
//     }
//
//     return contentFnodes;
// }

// function tunedTitleFnodes() {
//     const rules = ruleset(
//       //get all title tags in the inserted fixture
//       rule(dom('div#fixture > title'), type('titleish')),
//
//       //return image with max score
//       rule(type('titleish').max(), out('product-title'))
//
//     );
//
//     function contentFnodes(doc) {
//         return rules.against(doc).get('product-title');
//     }
//
//     return contentFnodes;
// }

// function tunedPriceFnodes() {
//
//     function hasDollarSign(fnode){
//       if(fnode.element.childNodes[0] && fnode.element.childNodes[0].nodeValue && fnode.element.childNodes[0].nodeValue.includes('$')){
//         return 2;
//       }
//       return 1;
//     }
//
//     function tagHasGoodCss(fnode){
//       if(fnode.element.id.match(/price/i) || fnode.element.classList.contains(/price/i)){
//         return 2;
//       }
//       return 1;
//     }
//
//     function notSavingsAmount(fnode){
//       if(fnode.element.childNodes[0] && fnode.element.childNodes[0].nodeValue &&
//         (fnode.element.childNodes[0].nodeValue.includes('-') || window.getComputedStyle(fnode.element).getPropertyValue('text-decoration') === 'line-through')){
//         return 0;
//       }
//       return 1;
//     }
//
//
//     const rules = ruleset(
//       //get all elements that could contain the price
//       rule(dom('span, div, li'), type('priceish')),
//
//       //bonus if direct text (not children) contains a dollar sign
//       rule(type('priceish'), score(hasDollarSign)),
//
//       //look for good css within tag
//       rule(type('priceish'), score(tagHasGoodCss)),
//
//       //not to be confused with amount off (minus sign, crossed off)
//       rule(type('priceish'), score(notSavingsAmount)),
//
//       //return image with max score
//       rule(type('priceish').max(), out('product-price'))
//
//     );
//
//     function contentFnodes(doc) {
//         return rules.against(doc).get('product-price');
//     }
//
//     return contentFnodes;
// }

/**
 * Maintain state as we compare a series of DOMs, reporting the percent
 * difference at the end.
 */
class DiffStats {
    constructor(contentFnodes, feature) {
        this.lengthOfExpectedTexts = 0;
        this.lengthOfDiffs = 0;
        this.feature = feature;
        if (feature === 'image') {
          this.contentFnodes = contentFnodes || tunedImageFnodes();
        } else if (feature === 'title'){
          this.contentFnodes = contentFnodes || tunedTitleFnodes();
        } else {
          this.contentFnodes = contentFnodes || tunedPriceFnodes();
        }
    }

    compare(expectedDom, sourceDom) {
        var expectedText;
        var gotText;
        if (this.feature === 'image') {
          //compare images by src
          expectedText = expectedDom.body.firstChild.src;
          gotText = this.contentFnodes(sourceDom).map(fnode => fnode.element.src)[0];
        } else if (this.feature === 'title') {
          //compare innerHTML text of titles
          expectedText = expectedDom.head.firstChild.innerHTML;
          gotText = this.contentFnodes(sourceDom).map(fnode => fnode.element.innerHTML)[0];
        } else if (this.feature === 'price') {
          //strip whitespace and dollar sign if there is one when comparing price
          expectedText = expectedDom.body.firstChild.textContent.replace('$', '').trim();
          gotText = this.contentFnodes(sourceDom).map(fnode => fnode.element.textContent.replace('$', '').trim())[0];
        }

        this.lengthOfExpectedTexts++;
        if(expectedText !== gotText) {
          this.lengthOfDiffs++;
        }

        // Uncomment for debugging:
        console.log(leven(expectedText, gotText), expectedText.length, leven(expectedText, gotText)/expectedText.length);
        console.log('Got:\n' + gotText);
        console.log('\nExpected:\n' + expectedText);
    }

    score() {
        return this.lengthOfDiffs / this.lengthOfExpectedTexts * 100;
    }
}

function createDict(item, sourceDom){
  var nodesDict = JSON.parse(readFileSync(join(dirname(__dirname), 'fathom-products', 'product_classification_test_data', item, 'nodes.txt'), 'utf-8'));
  var elems = sourceDom.getElementsByTagName('*');
  console.log(sourceDom.getElementsByTagName('*').length, Object.keys(nodesDict).length);

  //Match each node from the sourceDom to its css, and store in the global dict
  for(let i = 0; i < Object.keys(nodesDict).length; i++){
    currDict[elems[i]] = nodesDict[i.toString()];
  }
}


function deviationScore(folders, feature, coeffs = []) {
    var stats;
    if(feature === 'image') {
      stats = new DiffStats(tunedImageFnodes(...coeffs), feature);
    } else if (feature === 'title') {
      stats = new DiffStats(tunedTitleFnodes(...coeffs), feature);
    } else {
      stats = new DiffStats(tunedPriceFnodes(...coeffs), feature);
    }

    //For each test file, create the object-> css map, and run the comparison function
    folders.forEach(function(item){
      if(['macys', 'swatch'].includes(item)){return;} //random jsdom script tag parsing errors, ignore for now
      const domFromFile = fileName => staticDom(readFileSync(join(dirname(__dirname), 'fathom-products', 'product_classification_test_data', item, fileName)));

      createDict(item, domFromFile('source.html'));
      var pair = [domFromFile('expected-' + feature + '.html'), domFromFile('source.html')];
      stats.compare(...pair);
      console.log(stats.score());
      currDict = {};
    });

    return stats.score();
}

if (require.main === module) {
    const features = ['title', 'image', 'price'];
    const dirs = p => readdirSync(p).filter(f => statSync(p+"/"+f).isDirectory());
    const folders = dirs(join(dirname(__dirname), 'fathom-products' , 'product_classification_test_data'));
    // const folders = ['amazon'];

    //For each feature, calculate score
    features.forEach(function(f){
      // deviationScore(folders, f);
      console.log('% difference from ideal:', deviationScore(folders, f));
    });
}
