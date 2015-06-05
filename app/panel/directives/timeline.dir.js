
(function() {

var template = "<canvas width='0' height='60'></canvas>";

/**
 * @ngInject
 */
function rmTimeline($window,$compile, $state, HeaderDataSvc, RoomStatusSvc, RmTouch) {

  var marginLeft = 20;
  var marginRight = 20;

  var scaleWidth = 1.0;
  var scaleFactor = 1.0;

  var xMin = 0;
  var xMax = 1;

  var startTime = 0;
  var endTime = 24;

  var posY0 = 15;
  var posY1 = 20;
  var posY2 = 30;


  function getX(time) {
    return xMin +(time.getTime()-startTime.getTime())*scaleFactor;
  }

  function getTime(x) {
    var f = (x-xMin)/scaleFactor;

    var time = Math.floor(startTime.getTime() + (x-xMin)/scaleFactor);

    return time;
  }

  function formatTick(tick, isEnd) {
    var hours = tick.getHours();
    return hours + ":00";

    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    var txt = hours + ":00";

    if(isEnd) {
      txt += ' ' + ampm;
    }
    return txt;
  }

  function drawBar(ctx, start, end, color, grad) {

    var grad = grad || false;

    var posX1 = getX(start);
    var posX2 = getX(end);

    start = end;

    if (posX1 > xMax) {
      return;
    }

    if (posX1 < xMin) {
      posX1 = xMin;
    }

    if (posX2 > xMax) {
      posX2 = xMax;
    }

    var width = posX2 - posX1;

    ctx.fillStyle = color;

    if(grad) {
      var gradWidth = Math.min(width, 30);
      var gradFill=ctx.createLinearGradient(posX2-gradWidth,0,posX2,0);
      gradFill.addColorStop(0,"#333");
      gradFill.addColorStop(1,color);
      ctx.fillStyle = gradFill;
    }

    ctx.fillRect(posX1, posY1, width, posY2 - posY1);

    ctx.beginPath();
    ctx.moveTo(posX1, posY1);
    ctx.lineTo(posX1, posY2);
    ctx.stroke();
  }

  function drawTriangle(ctx, tick) {
    ctx.fillStyle="#FFF";

    var x = getX(tick);
    if (x > xMax || x < xMin) {
      return;
    }

    var y = posY2;
    var sx = 3;
    var sy = 2*sx;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+sx,y+sy);
    ctx.lineTo(x-sx,y+sy);
    ctx.closePath();
    ctx.fill();
  }

  function redraw(width, el){

    var ctx = el.getContext('2d');
    el.width = width;

    var timeline = HeaderDataSvc.getTimeline();
    if(!timeline || timeline.length < 2)
    {
      return;
    }

    try
    {
      var colorVacant = window.getComputedStyle(document.querySelector('.vacant')).getPropertyValue('color');
      var colorBusy = window.getComputedStyle(document.querySelector('.busy')).getPropertyValue('color');
    }
    catch(e)
    {
      return;
    }


    startTime = timeline[0];
    endTime   = timeline[timeline.length-1];

    scaleWidth = width-marginLeft-marginRight;
    scaleFactor = scaleWidth/(endTime-startTime);

    xMin = marginLeft;
    xMax = xMin + scaleWidth;


    //draw background
    ctx.fillStyle="#333";

    ctx.fillRect(xMin, posY1, xMax-xMin,posY2-posY1);

    ctx.lineWidth = 1;

    //draw ticks

    var time = HeaderDataSvc.time;
    ctx.font = '12px Roboto';
    ctx.textAlign="center";

    for(var i= 0 ; i < timeline.length; i++) {
      var tick = timeline[i];

      var posX1 = getX(tick);

      var color = tick < time ? "#AAA" : "#fff";

      ctx.fillStyle   = color;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(posX1, posY1);
      ctx.lineTo(posX1, posY0);
      ctx.stroke();

      var isEnd = (i==0) || (i == timeline.length-1);

      var txt = formatTick(tick, isEnd);

      ctx.fillText(txt, posX1, posY0-2);
    }


    //now fill up the booking data
    var bookings  = RoomStatusSvc.getData();
    if(!bookings || bookings.length == 0 )
    {
      return;
    }

    //draw bars
    ctx.strokeStyle="#333";

    var activeBooking = null;

    drawTriangle(ctx, time);

    for(var i = 0; i < bookings.length; i++) {
      var booking = bookings[i];

      var start = (i==0) ? bookings[0].start : bookings[i-1].end;
      var end = bookings[i].end;

      if (end < time) {
        continue;
      }

      var color =  booking.busy ? colorBusy : colorVacant;

      drawBar(ctx, start, end, color);

      //overlay for current bar
      if(start < time && end > time) {
        //color= "rgba(0,0,0, 0.5)";
        //fillStyle = gr
        drawBar(ctx, start, time, color, true);
      }
    }
  }

  return {
    restrict: "A",
    replace:true,
    link: function (scope, element, attr) {

      function sync() {
        element.html(template);
        $compile(element.contents())(scope); //<---- recompilation

        var el = element.find("canvas")[0];

        var width = element[0].offsetWidth;
        redraw(width, el);
      }

      function onTouch(e) {
        var targetTime = getTime(e.offsetX);
        console.debug("timeline touch @ %s",new Date(targetTime).toString("HH:mm"));

        $state.go("main.today", {
          start:targetTime
        });
      }

      RmTouch.bind(element, onTouch);

      angular.element($window)
       .bind('resize', sync);

      sync();
      scope.$on("RoomStatusSvc:update", sync);
    }
  };
}

  angular
    .module('rm')
    .directive('rmTimeline',rmTimeline);

})();