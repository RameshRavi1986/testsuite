
var contacts = require("./data/contacts.json");

function pickRandom(array) {
  var index = getRandomInt(0,array.length);
  return array[index];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId() {
  return "Demo-"+getRandomInt(0,10000);
}

function generateDateStamp() {
  return {
    date: new Date(),
    user: "express.server"
  }
}

function generateRandomBookings(roomId) {
  var bookings = [];

  //var now = new Date();
  var now = (new Date()).setHours(8,0,0,0);

  var hour = 1000*60*60;

  var unit = 0.25*hour; //15 mins

  var vacantTimes = [
    3, 7,10, 11, 16
  ];

  var names = [
    "Marketing Review",
    "Meeting about a dog",
    "HR Presentation",
    "Interviews",
    "Interviews",
    "Meeting",
    "Meeting",
    "IT Maintenance"
  ];

  var companies = [
    "Shell",
    "British Petroleum",
    "XL Insurance",
    "Louis Vuitton",
    "",
    ""
  ];

  var latin = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. ";
  var latin2 = "At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";

  var notes = [
    "Very famous person. No peeking",
    "Please ask all interviewees to wait outside",
    "Don't mention football",
    latin,
    latin2,
    latin
  ];


  var resources = [
    ["Tea","Coffee","Pie"],
    ["Hot Food","Drinks"],
    [],
    []
  ];

  /*
  var contacts = [
    {name:"Tom Makin", email:"tom.makin@candeovision.co.uk"},
    {},
    {name:"Alan Betts", email:"alan.betts@candeovision.co.uk"},
    {name:"Rob Lingley"},
    {name:"Kerry Revel"},
    null,
    null,
    {name:"Sam Smith"},
    {name:"Sir J Bloggs"},
    null
  ];
  */

  var lengths = [
    1.0,
    0.75,
    0.5,
    0.25,
    1.5
  ];

  var count = 0;
  for(var i = 1 ; i <= 20; i++) {

    var lengthIndex = getRandomInt(0,lengths.length-1);
    var roomIndex = getRandomInt(0,names.length-1);
    var contactIndex = getRandomInt(0,contacts.length-1);
    var vacant = getRandomInt(0,10) > 5; // half of all appointments are vacant

    var f = lengths[lengthIndex];

    var start = new Date(now);

    now = now + f*hour;
    var end = new Date(now);

    if(vacant) {
      continue;
    }


    var attendees = [];

    var max = getRandomInt(1,8);

    for(var j=0 ; j < max; j++) {
      var contact = pickRandom(contacts);

      if(contact) {
        attendees.push({
          name:contact.name,
          company:pickRandom(companies),
          sent:false
        });
      }
    }



    bookings.push({
      id: generateId(),
      roomId:roomId,
      notes: pickRandom(notes),
      resources: pickRandom(resources),
      prepared: (getRandomInt(0,5) > 3),
      people: null,
      title: pickRandom(names),
      organizer: pickRandom(contacts),
      categoryId: getRandomInt(0,4),
      logoId: getRandomInt(0,3),
      logoText: pickRandom(companies),
      embeddedLogo: true,
      fullscreenLogo: true,
      attendees: attendees,
      totalAttendees: attendees.length,
      start: start,
      end: end,
      created: generateDateStamp(),
      updated: generateDateStamp()
    });
    count++;
  }

  //console.log("booking count = %d", count);

  return bookings;
}

module.exports = generateRandomBookings;