'use strict';

(function () {

  var MINUTE = 60000;
  var DAY = 86400000;

  function calcDay(date) {
    return Math.floor(date.getTime() / DAY);
  }

  function addDays(date, days) {
    return new Date(date.getTime() + days*DAY);
  }


  var BookingConstructor = function ($http,
                                     $q,
                                     $interval,
                                     HeaderDataSvc,
                                     CategoryListSvc,
                                     LogoListSvc,
                                     RoomListSvc) {

    var settings = HeaderDataSvc.settings;

    function Booking(data) {
      this.id = data.id || null;
      this.endStr    = "";
      this.startStr  = "";

      this.start     = null;
      this.end       = null;
      this.organizer = data.organizer || {};
      this.roomId    = data.roomId;

      this.$$original = null;

      if(this.id) {
        this.$$original = data.$$original || data;
      }

      this.logoId    = data.logoId;
      this.logoText  = data.logoText;
      this.title     = data.title;
      this.vacant    = data.vacant  || false;
      this.busy      = !this.vacant;
      this.categoryId  = data.categoryId || 0;

      this.fullscreenLogo = !!data.fullscreenLogo;
      this.embeddedLogo = !!data.embeddedLogo;

      this.notes     = data.notes;
      this.resources = data.resources;
      this.prepared  = data.prepared;
      this.preparedBy  = data.preparedBy;

      this.attendees = [];

      if(data.attendees) {
        angular.copy(data.attendees, this.attendees);
      }

      this.totalAttendees = data.totalAttendees || this.attendees.length;

      this.created = data.created || {};
      this.updated = data.updated || {};

      if(this.created.date) {
        this.created.date = new Date(this.created.date);
      }

      if(this.updated.date) {
        this.updated.date = new Date(this.updated.date);
      }

      this.setStart(data.start);
      this.setEnd(data.end);

      //if(this.start >= this.end) {
        //throw "Invalid Booking : End time must be greater than Start"
      //}

      this.startMin = new Date(this.start);
      this.endMax = new Date(this.end);
      this.maxLength = Math.max(this.getLengthMinutes(), settings.maxLength);


      if(this.vacant) {
        //TODO: put this in a resource file
        this.title = "Vacant";
      }
      if(!this.title)
      {
        this.title = "Meeting";
      }
    }

    //private methods
    Booking.prototype = {
      constructor: Booking,

      /**
       * Set the date by shifting the start and end times
       * @param date
       */
      setDate: function(date) {
        var targetDay = calcDay(date);
        var currentDay = calcDay(this.start);

        var offset = targetDay - currentDay;

        if(offset == 0) {
          return;
        }

        this.start = addDays(this.start, offset);
        this.end   = addDays(this.end, offset);
      },

      setStart: function(value) {
        this.start = new Date(value);
        this.startStr = HeaderDataSvc.formatTime(this.start);
        return true;
      },

      setEnd: function(value){
        this.end = new Date(value);
        this.endStr = HeaderDataSvc.formatTime(this.end);
        return true;
      },

      isValid: function() {
        return this.start < this.end;
      },


      getLengthMinutes: function() {
        var diff = this.end.getTime() - this.start.getTime();
        return Math.round(diff / MINUTE);
      },

      getTimeBeforeStart: function() {
        var diff = this.start.getTime() - HeaderDataSvc.time.getTime();
        return Math.round(diff / MINUTE);
      },

      getOrganizerName: function() {
          if(!this.organizer) {
              return "";
          }

          return this.organizer.name || "";
      },

      getLengthText: function() {
        var mins  = Math.floor(this.getLengthMinutes());
        var hours = Math.floor(mins / 60);

        mins -= hours * 60;

        var msg = "";

        if (hours == 1) {
          msg = "1 hour "; //1 hour
        }
        else if (hours > 1) {
          msg = hours + " hours "; // 2 or more hours
        }
        if (mins > 0) {
          msg += mins + " mins"; //append minutes if non zero
        }

        return msg;
      },

      duplicate: function() {
        return new Booking(this);
      },

      adjustStart: function(mins) {
        var value = this.start.getTime() + mins*MINUTE;

        //down
        if(mins < 0) {
          var min = this.startMin.getTime();

          if(value <= min) {
            value = min;
          }
        }

        //up
        if(mins > 0) {
          var max = this.end.getTime()-settings.minLength*MINUTE;

          if(value > max) {

            //try and shuffle the end up
            if(!this.adjustEnd(mins)) {
              value = max;
            }
          }
        }

        if(value == this.start.getTime()) {
          return false;
        }

        if(!this.setStart(value))
        {
          return false;
        }

        //length check
        var endMax = value + this.maxLength*MINUTE;

        if(this.end.getTime() > endMax) {
          this.setEnd(endMax);
        }

        return true;

      },

      adjustEnd: function(mins) {
        var value = this.end.getTime() + mins*MINUTE;

        //down
        if(mins < 0) {
          var min = this.start.getTime() + settings.minLength*MINUTE;
          if(value < min) {
            if(!this.adjustStart(mins))
            {
              value = min;
            }
          }
        }

        //up
        if(mins > 0) {
          var max = this.endMax.getTime();

          if(value >= max) {
            value = max;
          }
        }

        if(value == this.end.getTime()) {
          return false;
        }

        if(!this.setEnd(value))
        {
          return false;
        }

        //length check
        var startMin = value - this.maxLength*MINUTE;

        if(this.start.getTime() < startMin) {
          this.setStart(startMin);
        }

        return true;
      },

      setMaxLength: function(mins) {
        this.maxLength = mins;
        var length = this.getLengthMinutes();

        if(length > mins) {
          this.adjustEnd(mins-length);
        }
      },

      getCategoryName: function() {
        return CategoryListSvc.find(this.categoryId).name;
      },

      getRoomName: function() {
        return RoomListSvc.getRoomName(this.roomId);
      },

      getRoomCapacity: function() {
        return RoomListSvc.getRoomCapacity(this.roomId);
      },

      /**
       * Returns true if total number of attendees is greater than room capacity
       */
      getRoomCapacityWarning: function() {
        var capacity = this.getRoomCapacity();

        return capacity > 0 && capacity < this.totalAttendees;
      },

      getLogoName: function() {
        var logo = LogoListSvc.find(this.logoId);

        if(!logo || !logo.src) {
          return null;
        }

        return logo.name;
      },

      getLogoSrc: function() {
        var logo = LogoListSvc.find(this.logoId);

        if(!logo || !logo.src) {
          return null;
        }

        return logo.src;
      },

      /**
       * check that the total number of attendees >= the number of people in the list
       */
      updateAttendees : function() {
        var minTotal = this.attendees.length;

        if(minTotal > this.totalAttendees) {
          this.totalAttendees = minTotal;
        }
      },

      addAttendee : function() {
        this.attendees.push({});
        this.updateAttendees();
      },

      removeAttendee : function(index) {
        var length = this.attendees.length;

        if(index < 0 || index >= length) {
          return;
        }
        this.attendees.splice(index,1);
        if(this.totalAttendees > 0) {
          this.totalAttendees--;
        }
      },

      hasVisitors: function() {
        var length = this.attendees.length;

        for(var i = 0 ; i < length; i++)  {
          if(this.attendees[i].company) {
            return true;
          }
        }
        return false;
      },

      hasResources: function() {
        return this.resources && this.resources.length > 0;
      },

      hasLogo: function() {
        return this.logoId || this.logoText;
      },

      hasEmbeddedLogo: function() {
        return this.hasLogo() && this.embeddedLogo;
      },

      hasFullscreenLogo: function() {
        return this.hasLogo() && this.fullscreenLogo;
      },

      verifyLogo: function(success, error) {
        var logoSrc = this.getLogoSrc();

        if(!logoSrc) {

          var d=$q.defer();

          if(this.logoText) {
            d.resolve("Using fallback text");
          }
          else {
            d.reject("Invalid logo src");
          }

          return d.promise;
        }

        return $http.get(logoSrc, {timeout:5000})
          .error(function() {
            console.debug("Failed to resolve logo image");
          });
      },

      getOriginalBooking: function() {
        if(this.$$original) {
          return new Booking(this.$$original);
        }
        return null;
      },

      /**
       * Clear the original booking information.
       * Useful when a booking is cloned but we don't want to keep the history
       */
      asNew: function() {
        this.id = null;
        this.$$original = null;
      },

      /**
       * @param date to be tested
       * @returns {boolean} true if date lies inside this booking
       */
      clashTest: function(date) {
        return date > this.start && date < this.end;
      }
    };

    return Booking;
  };

  angular.module('rm').
    factory('Booking', BookingConstructor);
})();