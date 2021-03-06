describe('Roommate features test calendar', function() {
    var loginPage = require('../loginlogout/loginpage-po.js');
	var calendar = require('../calendar/calendar-po.js');
    var page=new loginPage();
	var calendarPo=new calendar();
	// Loads the browser before loading the app
	beforeEach(function() {
		page.visitPage();
	});

	/* afterAll(function(){
			page.logout();
			page.confirmLogout.click();
			browser.driver.sleep(3000);
	}); */
  
  it('Check clicking on button shows calendar popup', function(done) {
			page.login("ramesh","upwork");
			expect(page.isLoggedIn()).toBe(true);	
			expect(calendarPo.calPopup().isPresent()).toBe(false); 
			calendarPo.clickDate();
			expect(calendarPo.calPopup().isDisplayed()).toBeTruthy(); 
			done();

  });

it('Check whether calendar shows current date', function(done) {
		   calendarPo.dateText.getText().then(function(date){
				expect(date).toBe(calendarPo.getFormattedDate());
			});
			done();
	 });
	
it('Check whether date bar and date picker shows the same date', function(done) {

			calendarPo.dateText.getText().then(function(date){
				calendarPo.updateDateParts(date);
			});
			calendarPo.clickDate();
			calendarPo.checkDate().then(function(date){
				expect(date).toBe(calendarPo.splitDates.date);
				expect(calendarPo.getCalYear()).toBe(calendarPo.splitDates.year);
			});
			calendarPo.getCalMonth().then(function(selectedValue){
				expect(calendarPo.monthNames[selectedValue]).toBe(calendarPo.splitDates.month);
			});
			done();

});
it('Check changing the date in calendar', function(done) {

	calendarPo.clickDate();
	calendarPo.calDates.getText().then(function(dates){
		calendarPo.calDates.get(10).click().then(function(){
			calendarPo.dateText.getText().then(function(dateBar){
				calendarPo.updateDateParts(dateBar);
				expect(dates[10]).toBe(calendarPo.splitDates.date);
			});

		});
	});
	done();
});	
it('Check changing the month in calendar using arrows', function(done) {
			var month="";
			calendarPo.clickDate();
			
			calendarPo.getCalMonth().then(function(index){
				month=calendarPo.monthNames[index];
			});
			calendarPo.dateText.getText().then(function(dateBar){
				expect(month).toBe(calendarPo.splitDates.month);
			});
			calendarPo.calMonthRScroll.click().then(function(){
				calendarPo.dateText.getText().then(function(dateBar){
					calendarPo.updateDateParts(dateBar);
					calendarPo.getCalMonth().then(function(index){
						month=calendarPo.monthNames[index];
						expect(month).toBe(calendarPo.splitDates.month);
					});
				});
			});
			calendarPo.calMonthLScroll.click().then(function(){
				calendarPo.dateText.getText().then(function(dateBar){
					calendarPo.updateDateParts(dateBar);
					calendarPo.getCalMonth().getAttribute("value").then(function(index){
						month=calendarPo.monthNames[index];
						expect(month).toBe(calendarPo.splitDates.month);
					});
				});
			});
			done();
});

it("Check today button",function(done){
	calendarPo.clickDate();
	calendarPo.calDates.getText().then(function(dates){
		calendarPo.calDates.get(10).click().then(function(){
			calendarPo.dateText.getText().then(function(dateBar){
				calendarPo.updateDateParts(dateBar);
				expect(dates[10]).toBe(calendarPo.splitDates.date);
			});

		});
	});
		calendarPo.clickDate();
		calendarPo.todayButton.click();
		expect(calendarPo.dateText.getText()).toBe(calendarPo.getFormattedDate());
		done();
});
it("Check entering wrong values in year field", function(done){
	var dateBar="";
	calendarPo.dateText.getText().then(function(date){
		dateBar=date;
		calendarPo.clickDate();
		calendarPo.calYear.sendKeys("00000000");
	});
	calendarPo.dateText.getText().then(function(date){
		expect(dateBar).toBe(date);
	});

	done();
});
it("Check dates before current date are disabled", function(done){
	
	var pastDate=calendarPo.getPastDate(2);
	var appDate="";
	calendarPo.clickDate();
	calendarPo.dateText.getText().then(function(dateBar){
		appDate=dateBar;
	
	});
		calendarPo.calDates.get(pastDate.getDate()).click();
		calendarPo.dateText.getText().then(function(dateBar){
			expect(dateBar).toBe(appDate);
		});
		
	done();
});
it("Dummy test to logout of the page" ,function(){
			page.logout();
			page.confirmLogout.click();
			browser.driver.sleep(3000);
});
});
