describe('Roommate features test calendar', function() {
    var loginPage = require('../loginlogout/loginpage-po.js');
	var calendar = require('../calendar/calendar-po.js');
    var page=new loginPage();
	var calendarPo=new calendar();
	// Loads the browser before loading the app
	beforeEach(function() {
		page.visitPage();
	});

	afterAll(function(){
			page.logout();
			page.confirmLogout.click();

	});
  
  it('check clicking on button shows calendar popup', function() {
			page.login("ramesh","upwork");
			expect(page.isLoggedIn()).toBe(true);	
			expect(calendarPo.calPopup().isPresent()).toBe(false); 
			calendarPo.clickDate();
			expect(calendarPo.calPopup().isDisplayed()).toBeTruthy(); 


  });

it('check whether calendar shows current date', function() {
		   calendarPo.dateText.getText().then(function(date){
				expect(date).toBe(calendarPo.getCurrentDate());
			});
	 });
	
it('check whether date bar and date picker shows the same date', function() {

			calendarPo.clickDate();
			calendarPo.checkDate().then(function(date){
				expect(date).toBe(calendarPo.splitDates.date);
				expect(calendarPo.getCalYear()).toBe(calendarPo.splitDates.year);
			});
			calendarPo.getCalMonth().then(function(selectedValue){
				expect(calendarPo.monthNames[selectedValue]).toBe(calendarPo.splitDates.month);
			});


	 });

});
