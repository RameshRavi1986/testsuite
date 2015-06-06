// An example configuration file.
var HtmlReporter = require('protractor-html-screenshot-reporter');
var path=require('path');
exports.config = {
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  // Framework to use. Jasmine 2 is recommended.
  framework: 'jasmine',
	 /* onPrepare: function() {
      // Add a screenshot reporter and store screenshots to `/tmp/screnshots`: 
       jasmine.getEnv().addReporter(new HtmlReporter({
		dest: '../tests/e2e/screenshots',
		filename: 'Roommatefeatures-testreport.html',
		pathBuilder: function(currentSpec, suites, browserCapabilities) {
			console.log(suites.description);
			  return  currentSpec.fullName;
		}
      }));
   },*/
	onPrepare: function() {
      // Add a screenshot reporter and store screenshots to `/tmp/screnshots`: 
      jasmine.getEnv().addReporter(new HtmlReporter({
         baseDirectory: '../tests/e2e/screenshots',
		 docTitle: 'Roommate features test report',
		 pathBuilder: function pathBuilder(spec, descriptions, results, capabilities) {
						
					    return path.join(capabilities.caps_.browserName,spec.env.currentSpec.suite.description, descriptions.join('-'));
		}
      }));
   },
  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: ['**/*spec.js'],

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000,
	isVerbose : true,
	showColors:true,
	includeStackTrace : true
  }

};
