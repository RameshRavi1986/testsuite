var LoginPage = (function () {
    function LoginPage() {
		this.user=element(by.model('user'));
		this.password=element(by.model('password'));
		this.loginButton=element(by.css('.md-button'));
		this.rememberme=element(by.model("rememberMe"));
		this.errorMessage=element(by.binding('alert'));
		this.logoutButton=element(by.css('[ng-click="logout()"]'));
		this.confirmLogout=element(by.css('[ng-click="dialog.hide()"]'));
		this.denyLogout=element(by.css('[ng-click="dialog.abort()"]'));
    }

    LoginPage.prototype.visitPage = function () {
        browser.get('http://rm-test.ddns.net/calendar/');
    };

	LoginPage.prototype.login=function(username,password){

		
		 if (this.user.isPresent()) {
			this.user.clear();
			this.user.sendKeys(username);
        }
        this.password.sendKeys(password);
		this.loginButton.click();
	}




	LoginPage.prototype.clickRememberMe=function () {
		if(this.rememberme.isSelected()){
			this.rememberme.click();

			
		}
	};

    LoginPage.prototype.getErrorMessage = function () {
        return this.errorMessage.getText();
    };
    LoginPage.prototype.logout = function () {
		return this.logoutButton.click();
    };

    LoginPage.prototype.isLoggedIn=function(){
		return this.logoutButton.isPresent();

    }

    return LoginPage;

})();

module.exports = LoginPage;