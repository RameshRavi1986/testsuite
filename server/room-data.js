(function (module) {

  var _ = require('underscore');
  var contacts = require("./data/contacts.json");
  var generator = require("./booking-generator");

  var offset = 11 - new Date().getHours();

  var mode = 0;
  var bookingCache = {}; //sorted with vacancies by room
  var bookingsDatabase = []; //raw data

//var theme = "warner";
  var theme = "nu";

  var users = [
    {name: "admin", displayName: "Admin Demo", password: "admin", group: 3},
    {name: "reception", displayName: "Reception Demo", password: "booking", group: 2}
  ];

  var currentUser = null;

  var bookingEnabled = true;
  var logo = "numis.png";

  var SIZE_ALL = 0;
  var SIZE_S = 1;
  var SIZE_M = 2;
  var SIZE_L = 3;

  var rooms = [
    {id: "R1", name: "Demo Room", size: SIZE_S, capacity: 4, location: "2nd Floor", info:"VC Room"},
    {id: "R2", name: "Room 6.02", size: SIZE_M, capacity: 8, location: "3rd Floor", info:"VC Room"},
    {id: "R3", name: "Meeting Room Four", size: SIZE_M, capacity: 16, location: "4th Floor", info:"Dining Room"},
    {id: "R4", name: "Brunel Room", size: SIZE_S, capacity: 5, location: "2nd Floor"},
    {id: "R5", name: "The Cave", size: SIZE_M, capacity: 23, location: "4th Floor"},
    {id: "R6", name: "VC Room", size: SIZE_L, capacity: 11, location: "Ground Floor"},
    {id: "R7", name: "Boardroom", size: SIZE_L, capacity: 32, location: "Top floor"}
  ];

  var panels = [
    {id: 1, roomId: "R1", ip: "192.168.1.11", mac: "00:00:00:00:A1", online: false},
    {id: 2, roomId: "R2", ip: "192.168.1.12", mac: "00:00:00:00:A2", online: false},
    {id: 3, roomId: "R3", ip: "192.168.1.13", mac: "00:00:00:00:A3", online: false},
    {id: 4, roomId: "R4", ip: "192.168.1.14", mac: "00:00:00:00:A4", online: false},
    {id: 5, roomId: "R5", ip: "192.168.1.15", mac: "00:00:00:00:A5", online: false},
    {id: 6, roomId: "R6", ip: "192.168.1.16", mac: "00:00:00:00:A6", online: true},
    {id: 7, roomId: "R7", ip: "192.168.1.17", mac: "00:00:00:00:A6", online: false}
  ];

  var news = [
    {
      title: "Micro Focus buys bigger US rival for $1.2 billion",

      content: [
        "Computing services firm Micro Focus International today bought its bigger American counterpart The Attachmate Group for $1.2 billion (£730 million) in a merger that should triple the UK firm’s business",
        "Under the terms of the deal, Attachmate’s parent company Wizard, will take a stake of about 40% in the enlarged company."
      ],
      displayTime: 5
    },
    {
      title: "The Force Awakens!",
      sub: "Title of the new Star Wars movie revealed",
      content: [
        "The seventh instalment of the sci-fi saga is set about 30 years after the events of Star Wars: Episode VI Return of the Jedi.",
        "The film sees a new cast including Daisy Ridley and John Boyega joining original cast members Mark Hamill, Harrison Ford and Carrie Fisher.",
        "Due to be released on 18 December 2015."
      ],
      displayTime: 10
    }
  ];

  var meta = {
    logos: [
      {
        "id": "bangandolufsen",
        "name": "Bang And Olufsen",
        "fileName": "BangAndOlufsen.jpg",
        "src": "/content/logos/BangAndOlufsen.jpg"
      },
      {
        "id": "shell",
        "name": "Shell",
        "fileName": "Shell.png",
        "src": "/content/logos/Shell.png"
      },
      {
        "id": "sony",
        "name": "Sony",
        "fileName": "Sony.jpg",
        "src": "/content/logos/Sony.jpg"
      }
    ],

    categories: [
      {id: 0, name: "Default", color: "#00A5FF"},
      {id: 1, name: "Internal", color: "#4C0CE8"},
      {id: 2, name: "External", color: "#FF0088"},
      {id: 3, name: "Important", color: "#E85B0C"},
      {id: 4, name: "Top Secret", color: "#FF0027"}
    ]
  };

  function startup() {
    bookingsDatabase = generateBookings();
  }

  function getTimeNow() {
    var time = new Date();

    if (offset != 0) {
      var hours = time.getHours();
      time.setHours(hours + offset);
      //console.log(time);
    }

    return time;
  }

  function getTimeOffsetDays(offsetDays) {
    var time = new Date();
    var hours = time.getHours();
    time.setHours(hours + offset + offsetDays * 24);

    return time;
  }

  function getStartOfDay() {
    var time = new Date();
    time.setHours(0, 0, 0, 0);
    return time;
  }

  function getEndOfDay() {
    var time = new Date();
    time.setHours(24, 0, 0, 0);

    return time;
  }

  function getMaxDate() {
    return new Date(8, 640e12);
  }

  /**
   * Process the raw booking data and fill in the gaps with vacant slots
   *
   * @param roomId
   * @param query
   * @returns {Array}
   */
  function processBookings(roomId, query) {
    var result = [];

    query = query || {};

    query.busy = !(query.busy === false); //default true
    query.vacant = query.vacant === true;   //default false

    var prevTime = query.from;

    function addVacantBooking(start, end) {
      var gapMins = (end - start) / (1000 * 60);

      if (gapMins < 5) {
        return false;
      }
    }

    bookingsDatabase.forEach(function (booking) {

      if (booking.roomId != roomId || booking.end < prevTime) {
        return;
      }

      booking.vacant = false;

      var count = result.length;
      if (count > 0) {
        prevTime = result[count - 1].end;
      }

      if (query.vacant) {
        //calculate the gap between the previous booking
        var gapMins = (booking.start - prevTime) / (1000 * 60);

        //push vacancy onto list
        if (gapMins > 5) {
          result.push({
            roomId: roomId,
            start: prevTime,
            end: booking.start,
            vacant: true
          });
        }
      }

      if (query.busy < 2) {
        result.push(booking);
      }
    });

    return result;
  }

  function getBookings(roomId, query) {
    var data = bookingCache[roomId];

    if (data == null) {
      //data = bookingCache[roomId] = processBookings(roomId);
    }

    return processBookings(roomId, query);
  }

  function invalidateCache(roomId) {
    bookingCache[roomId] = null;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateId() {
    return getRandomInt(0, 10000);
  }

  function generateBookings() {
    var data = [];

    rooms.forEach(function (room) {
      var id = room.id;
      invalidateCache(id);
      var roomData = generator(id);

      roomData.forEach(function (booking) {
        data.push(booking);
      });
    });

    return data;
  }

  function findRoomById(id) {
    return _.find(rooms, function (room) {
      return room.id == id;
    });
  }

  function filterRooms(roomList, query) {
    var sizeFilter = query.size || SIZE_ALL;

    var result = [];
    var room = null;

    if (query.roomId) {
      room = findRoomById(query.roomId);
      if (room) {
        return [room];
      }
      return [];
    }

    for (var i = 0; i < roomList.length; i++) {
      room = roomList[i];

      //check size
      if (room.size < sizeFilter) {
        continue;
      }

      result.push(room);
    }

    return result;
  }

  /**
   * Returns booking length in monutes
   * @param booking
   * @returns {number}
   */
  function calcBookingLength(booking) {
    return (booking.end - booking.start) / 60000
  }

  function generateDateStamp() {
    return {
      date: getTimeNow(),
      user: "express.server"
    }
  }

  //var millisecondsPerDay = 8.64e+7;

  function filterBookings(bookingList, query) {

    var minLengthFilter = query.minLength || 0;

    var to = query.to ? new Date(query.to) : getEndOfDay();
    var from = query.from ? new Date(query.from) : getTimeNow();

    var includeBusyFilter = (query.busy !== false);

    var result = [];

    if (!bookingList) {
      return result;
    }

    bookingList.forEach(function (booking) {

      //check busy status
      if (booking.busy && !includeBusyFilter) {
        return;
      }

      if (booking.end < from || booking.start > to) {
        return;
      }

      //check booking length (in minutes)
      if (minLengthFilter > 0) {
        var length = calcBookingLength(booking);
        if (length < minLengthFilter) {
          return;
        }
      }

      result.push(booking);
    });

    return result;
  }

  function bookingSearch(query) {
    query = query || {};

    var roomList = filterRooms(rooms, query);

    var result = [];

    roomList.forEach(function (room) {
      var data = getBookings(room.id, query);
      data = filterBookings(data, query);

      //append data to result list
      for (var i = 0; i < data.length; i++) {
        result.push(data[i]);
      }
    });

    return _.sortBy(result, function (obj) {
      return obj.start;
    });
  }

  /*
   Returns true if booking can be added/merged with current database without a time clash
   */
  function checkBookingClash(roomId, booking) {
    var bookingList = getBookings(roomId);

    if (!bookingList) {
      return true;
    }

    for (var i = 0; i < bookingList.length; i++) {
      var item = bookingList[i];

      //don't compare booking with itself when performing update
      if (item.id == booking.id) {
        continue;
      }

      //no clash
      if (item.end <= booking.start || item.start >= booking.end) {
        continue;
      }

      return false;
    }

    return true;
  }

  function parseBooking(booking) {
    if (!booking) {
      return null;
    }

    booking.start = new Date(booking.start);
    booking.end = new Date(booking.end);

    return booking;
  }

  //returns index of given id or -1 if not found
  function findBookingIndex(id) {
    if (!id) {
      return -1;
    }

    for (var i = 0; i < bookingsDatabase.length; i++) {
      if (bookingsDatabase[i].id == id) {
        return i;
      }
    }

    return -1;
  }

  function updateBooking(booking, callback) {
    addBooking(booking, callback);
  }

  function deleteBooking(roomId, bookingId, callback) {
    var index = findBookingIndex(bookingId);

    if (index < 0) {
      return callback("Booking not found");
    }

    var booking = bookingsDatabase[index];

    if (booking.roomId != roomId) {
      return callback("Room ID does not match booking");
    }

    invalidateCache(booking.roomId);
    bookingsDatabase.splice(index, 1);
    callback();
  }

  function addBooking(booking, callback) {

    booking = parseBooking(booking);

    if (!booking) {
      return callback("Invalid booking", null);
    }

    var room = findRoomById(booking.roomId);

    if (!room) {
      return callback("Invalid room id");
    }


    if (!checkBookingClash(room.id, booking)) {
      return callback("Booking clash", null);
    }

    booking.busy = true;
    booking.updated = generateDateStamp();

    setTimeout(function () {

      //find id of existing item
      var index = findBookingIndex(booking.id);

      if (index < 0) {
        booking.id = generateId();
        booking.created = generateDateStamp();
        bookingsDatabase.push(booking);
      }
      else {
        //cache belonging to the old booking needs to be cleared
        invalidateCache(bookingsDatabase[index].roomId);
        bookingsDatabase[index] = booking;
      }

      invalidateCache(booking.roomId);

      console.log("booking added ", booking);
      return callback(null, booking); //no error

    }, 1000);
  }


  function contactSearch(query) {
    //query = query || {};

    return contacts;
  }

  function getPanel(panelId) {
    return _.find(panels, function (item) {
      return (item.id == panelId);
    });
  }

  function getPanels() {
    return panels;
  }

  function getHeader(panelId) {
    var panel = getPanel(panelId);
    var room = null;

    if (panel) {
      room = findRoomById(panel.roomId);
    }

    return {
      time: getTimeNow(),
      offset: offset,
      mode: mode,
      room: room,
      panelTheme: theme,
      panelBookingEnabled: bookingEnabled
    };
  }

  function getLogo() {
    return logo;
  }

  function setOffset(value) {
    offset = value;
    console.log("time offset set to :", value);
  }

  function setMode(value) {
    mode = value;
    console.log("mode set to :", value);
  }

  function setBookingEnabled(value) {
    bookingEnabled = value;
    console.log("room enabled set to :", value);
  }

  function getRooms() {
    return rooms;
  }

  function getNews() {
    return news;
  }

  function getCategories() {
    return meta.categories;
  }

  function getLogos() {
    return meta.logos;
  }

  function getVisitors(date) {

    var min = new Date(date);
    var max = new Date(date);

    min.setHours(0, 0, 0, 0);
    max.setHours(24, 0, 0, 0);

    var list = [];

    bookingsDatabase.forEach(function (booking) {
      //filter by start and end time
      if (booking.start < min || booking.end > max) {
        return;
      }

      var visitors = _.where(booking.attendees, {visitor:true});

      if (visitors.length == 0) {
        return;
      }

      var arrival = booking.start;
      var host = booking.organizer ? booking.organizer.name : "";

      visitors.forEach(function (name) {
        list.push({
          name: name,
          arrival: arrival,
          host: host
        });
      });
    });

    return list;
  }

  function findUser(name) {
    return _.find(users, function (user) {
      return user.name == name;
    });
  }

  function login(data) {
    if (!data || !data.user) {
      return null;
    }

    var user = findUser(data.user);

    if (user && user.password == data.password) {
      currentUser = user;
      return user;
    }

    return null;
  }

  function logout() {
    currentUser = null;
  }

  function getCurrentUser() {
    return currentUser;
  }

  function getUsers() {
    return users;
  }

  function addUser(user) {

    user.name = user.user;

    if (findUserById(user.name)) {
      return null;
    }

    users.push(user);
  }

  function updateUser(user) {

    var existingUser = findUser(user.name);

    if (!existingUser) {
      return null;
    }

    if (user.displayName) {
      existingUser.displayName = user.displayName;
    }

    if (user.group) {
      existingUser.group = user.group;
    }

    return existingUser;
  }


  module.exports = {
    contactSearch: contactSearch,
    bookingSearch: bookingSearch,
    getHeader: getHeader,
    startup: startup,
    getRooms: getRooms,
    getNews: getNews,
    addBooking: addBooking,
    updateBooking: updateBooking,
    deleteBooking: deleteBooking,
    setOffset: setOffset,
    setMode: setMode,
    setBookingEnabled: setBookingEnabled,
    getLogo: getLogo,
    getPanels: getPanels,
    getVisitors: getVisitors,
    meta: {
      getLogos: getLogos,
      getCategories: getCategories
    },

    login: login,
    logout: logout,
    getCurrentUser: getCurrentUser,
    getUsers: getUsers,
    addUser: addUser,
    updateUser: updateUser
  };
}(module));