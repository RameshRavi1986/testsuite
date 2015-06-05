var Calendar = (function () {
    function Calendar() {
		this.splitDates={};
		this.calendarPopup=element(by.css('[ng-if="visible"] > .date-control > .title'));
		this.dateBar=element(by.model('display.date'));
		this.dateText=element(by.css('.display md-toolbar'));
		this.dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		this.monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		this.selectedDate=element.all(by.css(".days button.selected span"));
		this.calMonth=element(by.model('calendar._month'));
		this.calYear=element(by.model('calendar._year'));
    };


	Calendar.prototype.calPopup=function(){
		return this.calendarPopup;
	};
	Calendar.prototype.clickDate=function(){
		this.dateBar.click();
	};
	Calendar.prototype.getCurrentDate=function(){
		var currentDate="";
		var date=new Date();
		var day=this.dayNames[date.getDay()];
		var month=this.monthNames[date.getMonth()];
		var year=date.getFullYear();
		var dat=date.getDate();
		currentDate=day+" "+dat+" "+month+" "+year;
		console.log("Current date is" +currentDate);
		return currentDate;
		
	};
	Calendar.prototype.splitDate=function(){
		var service=this;
		this.dateText.getText().then(function(date){
			var dateParts=date.split(" ");
			service.splitDates.day=dateParts[0];
			service.splitDates.date=dateParts[1];
			service.splitDates.month=dateParts[2];
			service.splitDates.year=dateParts[3];

		});
	};
	Calendar.prototype.checkDate=function(){
		var service=this;
		this.splitDate();
		return this.selectedDate.get(0).getText();
	
	};
	
	Calendar.prototype.getCalMonth=function(){

		return this.calMonth.getAttribute('value')
	};
	Calendar.prototype.getCalYear=function(){
		return this.calYear.getAttribute('value');
	}
	
    return Calendar;

})();

module.exports = Calendar;