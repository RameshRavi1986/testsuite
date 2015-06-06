var Calendar = (function () {
    function Calendar() {
		this.splitDates={};
		this.calendarPopup=element(by.css('[ng-if="visible"] > .date-control > .title'));
		this.dateBar=element(by.model('display.date'));
		this.dateText=element(by.css('.display md-toolbar'));
		this.dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		this.monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		this.selectedDate=element.all(by.css(".days button.selected span"));
		this.calDates=element.all(by.css(".days button span"));
		this.calMonth=element(by.model('calendar._month'));
		this.calMonthOptions=element(by.css('.month-part select option'));
		this.calYear=element(by.model('calendar._year'));
		this.calMonthLScroll=element(by.css('[ng-click="calendar._incMonth(-1)"]'));
		this.calMonthRScroll=element(by.css('[ng-click="calendar._incMonth(1)"]'));
		this.todayButton=element(by.css('[ng-click="today()"]'));
		this.cancelButton=element(by.css('[ng-click="cancel()"]'));
    };

	
	Calendar.prototype.calPopup=function(){
		return this.calendarPopup;
	};
	Calendar.prototype.clickDate=function(){
		this.dateBar.click();
	};
	Calendar.prototype.checkDate=function(){
		var service=this;
		return this.selectedDate.get(0).getText();
	
	};
	Calendar.prototype.getCalMonth=function(){

		return this.calMonth.getAttribute('value')
	};
	Calendar.prototype.getCalYear=function(){
		return this.calYear.getAttribute('value');
	}
	Calendar.prototype.updateDateParts=function(dateBar){
			var service=this;
			var dateParts=dateBar.split(" ");
			service.splitDates.day=dateParts[0];
			service.splitDates.date=dateParts[1];
			service.splitDates.month=dateParts[2];
			service.splitDates.year=dateParts[3];
   }
	Calendar.prototype.getFormattedDate=function(year, month,day){
		var formattedDate="";
		var date;
		if(typeof year === "undefined")
		date=new Date();
		else
		date=new Date(year, month, day);
		var day=this.dayNames[date.getDay()];
		var month=this.monthNames[date.getMonth()];
		var year=date.getFullYear();
		var dat=date.getDate();
		formattedDate=day+" "+dat+" "+month+" "+year;
		return formattedDate;
		
	};
	Calendar.prototype.getPastDate=function(days){
		var date=new Date();
		date.setDate(date.getDate()-days);
		return date;
	}
    return Calendar;

})();

module.exports = Calendar;