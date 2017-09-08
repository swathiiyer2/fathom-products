# fathom-products

  Using fathom to extract a product from its product page,
  where a 'product' is defined by the bundle of features that
  makes it identifiable.
 
  Features: Title, Image, Price
 
  Testing:
     50 test products in product_classification_test_data folder
     All test sources are product detail pages (one main product on this page)
     Later, go on to extract products from a product index page (multiple products per page)
 
## Usage

  Run on training set using:

	node --max-old-space-size=8192 products.js 
