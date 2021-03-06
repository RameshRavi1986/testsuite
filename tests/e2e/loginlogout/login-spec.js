describe('Roommate features test login logout', function() {
    var loginPage = require('../loginlogout/loginpage-po.js');
     var page=new loginPage();
	// Loads the browser before loading the app
	beforeEach(function() {
		page.visitPage();
	});
	it('Check login failure scenario', function(done) {
		page.login("ramesh","upf");
		expect(page.getErrorMessage()).toEqual('Invalid user name or password');
		done();
    });
  
  it('Check login success scenario', function(done) {
			page.login("ramesh","upwork");
			expect(page.isLoggedIn()).toBe(true);	
			done();
  });


  it('Check the session is still valid', function(done) {
			expect(page.isLoggedIn()).toBe(true);	
			done();
  });

  it('Check logout functionality by confirming no', function(done) {
				page.logout().then(function(){
					page.denyLogout.click();
					expect(page.isLoggedIn()).toBe(true);	
				});
				done();
  });

  it('Check logout functionality by confirming yes', function(done) {
			page.logout().then(function(){
				page.confirmLogout.click();
				expect(page.isLoggedIn()).toBe(false);	
			});
		done();
  });
});
