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
const {dom, props, out, rule, ruleset, score, type} = require('fathom-web');
const {Annealer} = require('fathom-web/optimizers');
const {staticDom} = require('fathom-web/utils');
const tuningRoutines = {
                        'title' : {'routine': tunedTitleFnodes, 'coeffs': []},
                        // 'price' : {'routine': tunedPriceFnodes, 'coeffs': [1, 1, 0.5]},
                        'image' : {'routine': tunedImageFnodes, 'coeffs': [1.9, 3.0, 4.2, 0.5, 0.1, 0.8, 1.3, 0.7, 0.4, 1, 0.1, 0.1, 1.3]}
                        };
const VIEWPORT_HEIGHT = 960;
const VIEWPORT_WIDTH = 1680;

function tunedImageFnodes(nodeToCssMap, coeffImgSize = 2.5, coeffImgHasSrc = 2.5, coeffImgTitle = 3,
  coeffItemprop = 0.5, coeffBadKeywords = 1, coeffGoodKeywords = 0.5, coeffClassKeywords = 1,
  coefftitlewords = 1, coeffAboveTheFold = 1, coeffLeftOfPage = 1, coeffSVGs = 1, coeffDataURLs = 1, titlewordsBase = 1.5) {
    let title = '';

    function imageSize(fnode) {
      const css = nodeToCssMap.get(fnode.element);
      if((css.left - css.right) * (css.top - css.bottom) === 0){
        return 1;
      }
      return (css.left - css.right) * (css.top - css.bottom) * coeffImgSize;
    }

    function imageHasSrc(fnode) {
      return (fnode.element.hasAttribute('src') && fnode.element.getAttribute('src') !== '') * coeffImgHasSrc;
    }

    function imageTitle(fnode) {
      const attrs = ['title', 'alt'];
      for(let i = 0; i < attrs.length; i++){
        if(fnode.element.getAttribute(attrs[i]) &&
            (fnode.element.getAttribute(attrs[i]).includes(title) || title.includes(fnode.element.getAttribute(attrs[i])))){
              return 100 * coeffImgTitle;
            }
      }
      return 1;
    }

    function itemprop(fnode){
      if(fnode.element.hasAttribute('itemprop') && fnode.element.getAttribute('itemprop').match(/(image|main|product|hero|feature)/i)){
        return 1000 * coeffItemprop;
      }
    }


    function keywords(fnode) {
      if(fnode.element.hasAttribute('src') && fnode.element.src.match(/(thumb|logo|icon)/i)){
        return 0.5 * coeffBadKeywords;
      }

      const attrs = ['src', 'id', 'alt', 'title'];
      for(let i = 0; i < attrs.length; i++){
        if(fnode.element.hasAttribute(attrs[i]) && fnode.element.getAttribute(attrs[i]).match(/(main|product|hero|feature|primary)/i)){
          return 1000 * coeffGoodKeywords;
        }
      }

      for(let i = 0; i < fnode.element.classList.length; i++){
        if(fnode.element.classList[i].match(/(hero|main|product|primary|feature)/i)){
          return 1000 * coeffClassKeywords;
        }
      }
      return 1;
    }

    function titlewords(fnode){
      const titleWords = title.replace('|', '').split(' ');
      const attrs = ['src', 'title', 'alt'];
      let start = 1;
      for(let j = 0; j < attrs.length; j++){
        for(let i = 0; i < titleWords.length; i++){
            if(titleWords[i].match(/^[a-z0-9]+$/i)){
              const regex = new RegExp(titleWords[i], "i");
              if(fnode.element.hasAttribute(attrs[j]) && fnode.element.getAttribute(attrs[j]).match(regex)){
                start+= fnode.element.getAttribute(attrs[j]).match(regex).length;
              }
          }
        }
      }
      //exaggerating the differences a little
      return Math.pow(titlewordsBase, start) * coefftitlewords;
    }

    function aboveTheFold(fnode){
      const css = nodeToCssMap.get(fnode.element);
      if(css.top < VIEWPORT_HEIGHT){
        return 1;
      }
      return 0.5 * coeffAboveTheFold;
    }

    function leftOfPage(fnode){
      const css = nodeToCssMap.get(fnode.element);
      if(css.left < VIEWPORT_WIDTH/2){
        return 1;
      }
      return 0.5 * coeffLeftOfPage;
    }

    function notSVGs(fnode){
      if(fnode.element.hasAttribute('src') && fnode.element.getAttribute('src').includes('.svg')){
        return 0;
      }
      return 1 * coeffSVGs;
    }

    function dataURLs(fnode){
      const css = nodeToCssMap.get(fnode.element);
      if (fnode.element.hasAttribute('src') && fnode.element.getAttribute('src').includes('data:')){
        return 0;
      }
      return 1 * coeffDataURLs;
    }


    const rules = ruleset(
      //get all images
      rule(dom('img'), type('images')),

      //better score for larger images
      rule(type('images'), score(imageSize)),

      //make sure image has src
      rule(type('images'), score(imageHasSrc)),

      //image title matches page title
      rule(type('images'), score(imageTitle)),

      //punish/bonus for good/bad css in class, id, url, etc.
      rule(type('images'), score(keywords)),

      //check if itemprop attribute has certain keywords
      rule(type('images'), score(itemprop)),

      //words in the title are in the src/image title/alt
      rule(type('images'), score(titlewords)),

      //static bonus for images visible without scrolling
      rule(type('images'), score(aboveTheFold)),

      //static bonus for images to the left of the page
      rule(type('images'), score(leftOfPage)),

      //eliminate images of type svg
      rule(type('images'), score(notSVGs)),

      //image src likely will not be a data-url
      rule(type('images'), score(dataURLs)),

      //return image with max score
      rule(type('images').max(), out('product-image'))

    );

    function tuningRoutine(doc) {
        title = tunedTitleFnodes(nodeToCssMap)(doc).map(fnode => fnode.element.innerHTML)[0];
        return rules.against(doc).get('product-image');
    }

    return tuningRoutine;
}

function tunedTitleFnodes(nodeToCssMap) {

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

function tunedPriceFnodes(nodeToCssMap, coeffDollarSign = 1, coeffCSS = 1, coeffSavings = 0.5) {

    function hasDollarSign(fnode){
      if(fnode.element.childNodes[0] && fnode.element.childNodes[0].nodeValue && fnode.element.childNodes[0].nodeValue.includes('$')){
        return 2 * coeffDollarSign;
      }
      return 1;
    }

    function tagHasGoodCss(fnode){
      if(fnode.element.id.match(/(price|sale|deal)/i) || fnode.element.classList.contains(/(price|sale|deal)/i) || fnode.element.itemprop && fnode.element.itemprop.match(/price/i) ||
          fnode.element.classList[0] && fnode.element.classList[0].match(/(price|sale|deal)/i)){
        return 2 * coeffCSS;
      }
      return 1;
    }

    function notSavingsAmount(fnode){
      const css = nodeToCssMap.get(fnode.element);
      if(css.strikethrough === 'line-through'){
        return coeffSavings;
      }
      return 1;
    }

    const rules = ruleset(
      //get all elements that could contain the price
      rule(dom('span, div, li, strong, p, em'), type('priceish')),

      //bonus if direct text (not children) contains a dollar sign
      rule(type('priceish'), score(hasDollarSign)),

      //look for good css within tag
      rule(type('priceish'), score(tagHasGoodCss)),

      //not to be confused with amount off (minus sign, crossed off)
      rule(type('priceish'), score(notSavingsAmount)),

      //return image with max score
      rule(type('priceish').max(), out('product-price'))

    );

    function tuningRoutine(doc) {
        return rules.against(doc).get('product-price');
    }

    return tuningRoutine;
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
        this.tuningRoutine = tuningRoutine || tuningRoutines[feature].routine;
    }

    compare(expectedDom, sourceDom, nodeToCssMap, coeffs) {
        let expectedText;
        let gotText;
        if (this.feature === 'image') {
          //compare images by src, strip query params

          //console.log(expectedDom.body.firstChild.outerHTML);
          // expectedText = expectedDom.body.firstChild.outerHTML;
          // gotText = this.tuningRoutine(nodeToCssMap)(sourceDom).map(fnode => fnode.element.outerHTML)[0];
          expectedText = expectedDom.body.firstChild.src;
          gotText = this.tuningRoutine(nodeToCssMap, ...coeffs)(sourceDom).map(fnode => fnode.element.src)[0];
          if(expectedText.includes('?')){
            expectedText = expectedText.substr(0,expectedText.indexOf('?'));
          }
          if(gotText.includes('?')){
            gotText = gotText.substr(0,gotText.indexOf('?'));
          }

        } else if (this.feature === 'title') {
          //compare innerHTML text of titles
          expectedText = expectedDom.head.firstChild.innerHTML;
          gotText = this.tuningRoutine(nodeToCssMap, ...coeffs)(sourceDom).map(fnode => fnode.element.innerHTML)[0];
        } else if (this.feature === 'price') {
          //strip whitespace and dollar sign if there is one when comparing price

          // console.log(expectedDom.body.firstChild.outerHTML);
          // expectedText = expectedDom.body.firstChild.outerHTML;
          // gotText = this.tuningRoutine(nodeToCssMap)(sourceDom).map(fnode => fnode.element.outerHTML)[0];
          expectedText = expectedDom.body.firstChild.textContent.replace('$', '').trim();
          gotText = this.tuningRoutine(nodeToCssMap, ...coeffs)(sourceDom).map(fnode => fnode.element.textContent.replace('$', '').trim())[0];

        }

        this.numTests++;
        if(expectedText !== gotText) {
          this.deviation++;
        }

        // Uncomment for debugging:
        // console.log('Got:\n' + gotText);
        // console.log('\nExpected:\n' + expectedText);
        // console.log(this.deviation, this.numTests, expectedText === gotText);
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

  //Match each node from the sourceDom to its css, and store in the global dict
  for(let i = 0; i < elems.length; i++){
    nodesMap.set(elems[i], numberToCss[i]);
  }

  //check that #nodes in sourceDom match #elements in number->css dictionary
  if(sourceDom.getElementsByTagName('*').length !== nodesMap.size){
    throw 'number of nodes do not match number of elements in css dictionary';
  }
  return nodesMap;
}

/*
 * Calculate overall score for one feature
 * @param {object} folders array of all test folders
 * @param {string} feature title/image/price
 * @param {object} array of tuning coeffs if any
 */
function deviationScore(dataMap, folders, feature, coeffs = []) {
    const stats = new DiffStats(tuningRoutines[feature].routine, feature);

    //For each test file, create the object-> css map, and run the comparison function
    folders.forEach(function(store){
      // console.log(store);
      stats.compare(dataMap[store][feature], dataMap[store].sourceDom, dataMap[store].nodeToCssMap, coeffs);
      // console.log(stats.score());
    });
    console.log(stats.score());
    return stats.score();
}

/*
 * Creates a map from each folder to its corresponding node-CSS map, sourceDom, and expected image, title, and price.
 */

function createDataMap(folders){
  let dataMap = {};
  folders.forEach(function(store){
    const domFromFile = fileName => staticDom(readFileSync(join(dirname(__dirname), 'fathom-products', 'product_classification_test_data', store, fileName)));
    const sourceDom = domFromFile('source.html');
    const nodeToCssMap = createDict(store, sourceDom);
    dataMap[store] = {'nodeToCssMap' : nodeToCssMap,
                      'sourceDom' : sourceDom,
                      'image': domFromFile('expected-image.html'),
                      'title': domFromFile('expected-title.html'),
                      'price': domFromFile('expected-price.html')}
    console.log('Map made for: ', store);
  });
  return dataMap;
}

if (require.main === module) {
    const foldersIn = p => readdirSync(p).filter(f => statSync(p + "/" + f).isDirectory());
    const folders = foldersIn(join(dirname(__dirname), 'fathom-products' , 'product_classification_test_data'));
    const dataMap = createDataMap(folders);

    class ProductOptimizer extends Annealer {
        constructor(feature) {
            super();
            this.feature = feature;
            this.solutionCost = coeffs => deviationScore(dataMap, folders, feature, coeffs);
        }

        initialSolution() {
            return tuningRoutines[this.feature].coeffs;
        }

        /** Nudge a random coefficient in a random direction by 0.5. */
        randomTransition(coeffs) {
            const ret = coeffs.slice();  // Make a copy.
            ret[Math.floor(Math.random() * coeffs.length)] += Math.floor(Math.random() * 2) ? -.3 : .3;
            return ret;
        }
    }

    //For each feature, calculate score
    Object.keys(tuningRoutines).forEach(function(f){
      const annealer = new ProductOptimizer(f);
      // tuningRoutines[f].coeffs = annealer.anneal();
      console.log('Tuned coeficients:', tuningRoutines[f].coeffs);
      console.log('% difference from ideal:', deviationScore(dataMap, folders, f, tuningRoutines[f].coeffs));
    });
}
