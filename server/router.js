/**
 * Created by tom on 14/05/2015.
 */



module.exports = function (roomData) {

  var express = require("express");

  //smil time stamp
  var smilTime = new Date();

  function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
  }

  /**
   * Transform string values in req.query to native types
   *
   * @param req Request Object
   * @returns {Object}
   */
  function parseQuery(req) {
    var query = req.query;
    for (var key in query) {
      if (key != "roomId" && query.hasOwnProperty(key) && typeof query[key] === 'string') {
        try {
          query[key] = JSON.parse(query[key]);
        }
        catch (error) {

        }

      }
    }

    return query;
  }


  function getHeader(req, res) {
    var header = roomData.getHeader(req.id);
    if (!header) {
      res.send(400, "Invalid room id");
      return;
    }

    res.sendJson(header);
  }


  return express.Router({strict: true})

    .use(function (req, res, next) {

      //inject sendJson function for data routes
      res.sendJson = function (obj) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(obj));
      };

      next();
    })

    .get('/auth/user', function (req, res) {
      var user = roomData.getCurrentUser();

      if (user) {
        res.send(user);
      } else {
        res.status(401).send();
      }
    })

    .post('/auth/login', function (req, res) {
      var credentials = req.body;
      var user = roomData.login(credentials);
      if (user) {
        res.send(user);
      } else {
        res.status(401).send("Login failed");
      }
    })

    .post('/auth/logout', function (req, res, next) {
      roomData.logout();
      res.send("logged out");
    })

    .post('/data/regen', function (req, res, next) {
      roomData.startup();
      res.send("Booking data regenerated");
    })

    .get('/data/users', function (req, res) {
      res.sendJson(roomData.getUsers());
    })

    .post('/data/users', function (req, res) {
      var user = req.body;

      user = roomData.addUser(user);

      if (!user) {
        res.sendJson(user);
      }
      else {
        res.status(401).send("Invalid user");
      }
    })

    .put('/data/users/:userId', function (req, res) {
      var user = req.body;
      user.id = req.query['userId'];

      user = roomData.updateUser(user);

      if (!user) {
        res.sendJson(user);
      }
      else {
        res.status(401).send("Invalid user id");
      }
    })

    .get('/data/rooms', function (req, res) {
      res.sendJson(roomData.getRooms());
    })

    .get('/data/news', function (req, res) {
      res.sendJson(roomData.getNews());
    })

    .get('/data/visitors', function (req, res) {

      var date = req.query.date || new Date();

      if (!date) {
        res.status(400).send("Invalid date param");
        return;
      }

      date = new Date(date);

      res.sendJson(roomData.getVisitors(date));
    })

    .get('/data/panels', function (req, res) {
      res.sendJson(roomData.getPanels());
    })

    .get('/data/contacts', function (req, res) {
      var query = parseQuery(req);
      var result = roomData.contactSearch(query);
      res.sendJson(result);
    })

    .get('/data/meta/logos', function (req, res) {
      res.sendJson(roomData.meta.getLogos());
    })

    .get('/data/meta/categories', function (req, res) {
      res.sendJson(roomData.meta.getCategories());
    })

    .get('/data/bookings', function (req, res) {
      var query = parseQuery(req);
      var result = roomData.bookingSearch(query);
      res.sendJson(result);
    })

    .get('/data/bookings/:roomId', function (req, res) {
      var query = parseQuery(req);
      query.roomId = req.params.roomId;

      var result = roomData.bookingSearch(query);
      res.sendJson(result);
    })


    .post('/data/bookings/:roomId', function (req, res) {
      var booking = req.body;
      booking.roomId = req.params.roomId;

      roomData.addBooking(booking, function (err, updatedBooking) {
        if (err) {
          res.status(400).send(err);
          return;
        }

        res.send(updatedBooking);
      });
    })

    .put('/data/bookings/:roomId/:bookingId', function (req, res) {
      var booking = req.body;

      booking.roomId = req.params['roomId'];
      booking.id = req.params['bookingId'];

      roomData.updateBooking(booking, function (err, updatedBooking) {
        if (err) {
          res.status(400).send(err);
          return;
        }

        res.send(updatedBooking);
      });
    })

    .delete('/data/bookings/:roomId/:bookingId', function (req, res) {

      var roomId = req.params['roomId'];
      var bookingId = req.params['bookingId'];

      roomData.deleteBooking(roomId, bookingId, function (err) {
        if (err) {
          res.status(400).send(err);
          return;
        }

        res.send();
      });
    })

    .get(["/panel/"], function (req, res, next) {
      return res.redirect("/panel/auto/");
    })

    .get(['/panel/:id/header.json'], function (req, res) {
      req.id = req.params.id;
      if (req.id == 0) {
        req.id = 1;
      }
      getHeader(req, res);
    })

    .get("/panel/:id/", function (req, res, next) {
      req.url = "/panel/panel.app.html";
      next();
    })

    .post('/data/time', function (req, res) {

      var data = req.body;
      console.log("body", req.body);

      if (isNaN(data.offset)) {
        res.status(400).send("Invalid data");
        return;
      }

      roomData.setOffset(data.offset);
      res.send("Offset updated");
    })

    .post('/data/settings', function (req, res) {

      var data = req.body;
      console.log("body", req.body);

      var message = "";

      if (!isNaN(data.mode)) {
        roomData.setMode(data.mode);
        message += "Mode set to : " + data.mode + "\n";
      }

      if (typeof data.panelBookingEnabled != 'undefined') {
        roomData.setBookingEnabled(data.panelBookingEnabled);
        message += "BookingEnabled set to :" + data.panelBookingEnabled + "\n";
      }

      res.send(message);
    })

    .get('/index.smil', function (req, res, next) {
      res.setHeader('Last-Modified', smilTime.toUTCString());
      next();
    })

    .get(['/config/logo.png', '/images/brand-small.png'], function (req, res, next) {
      req.url = '/config/' + roomData.getLogo();
      nocache(req, res, next);
    })

    .get('/admin/header.json', function (req, res) {
      req.id = "admin";
      getHeader(req, res);
    })

    .get(["/admin/"], function (req, res, next) {
      req.url = "/admin/admin.app.html";
      next();
    })

    .get("/calendar/", function (req, res, next) {
      req.url = "/calendar/calendar.app.html";
      next();
    })

    .get('/calendar/header.json', function (req, res) {
      req.id = "calendar";
      getHeader(req, res);
    })

};