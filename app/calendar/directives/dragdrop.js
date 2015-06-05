(function () {

  function isDnDsSupported() {
    return 'ondrag' in document.createElement("a");
  }

  if (!isDnDsSupported()) {
    console.log("drag and drop not supported");
    return;
  }

  if (window.jQuery && (-1 == window.jQuery.event.props.indexOf("dataTransfer"))) {
    window.jQuery.event.props.push("dataTransfer");
  }

  var currentData;

  function rmDraggable($parse, $rootScope) {
    return {
      restrict: "A",
      scope: {
        drag:"&",
        dragEnabled:"&"
      },
      link: function (scope, element, attrs) {
        var isDragHandleUsed = false,
          dragHandleClass,
          draggingClass = attrs.draggingClass || "on-dragging",
          dragTarget;

        element.attr("draggable", true);

        if (angular.isString(attrs.dragHandleClass)) {
          isDragHandleUsed = true;
          dragHandleClass = attrs.dragHandleClass.trim() || "drag-handle";

          element.bind("mousedown", function (e) {
            dragTarget = e.target;
          });
        }

        function dragendHandler(e) {
          setTimeout(function () {
            element.unbind('$destroy', dragendHandler);
          }, 0);
          var sendChannel = attrs.dragChannel || "defaultchannel";
          $rootScope.$broadcast("ANGULAR_DRAG_END", sendChannel);
          if (e.dataTransfer && e.dataTransfer.dropEffect !== "none") {
            if (attrs.onDropSuccess) {
              var fn = $parse(attrs.onDropSuccess);
              scope.$evalAsync(function () {
                fn(scope, {$event: e});
              });
            } else {
              if (attrs.onDropFailure) {
                var fn = $parse(attrs.onDropFailure);
                scope.$evalAsync(function () {
                  fn(scope, {$event: e});
                });
              }
            }
          }
          element.removeClass(draggingClass);
        }

        function dragstartHandler(e) {
          if (isDragHandleUsed && !dragTarget.classList.contains(dragHandleClass)) {
            e.preventDefault();
            return;
          }

          if(scope.dragEnabled && !scope.dragEnabled())  {
            console.debug("Drag disabled");
            e.preventDefault();
            return;
          }


          var sendChannel = attrs.dragChannel || "defaultchannel";
          var dragData = scope.drag();

          //save the offset on the target object
          var offset = {
            y : e.offsetY,
            x : e.offsetX
          };

          var page = {
            y : e.pageY,
            x : e.pageX
          };


          var sendData = angular.toJson({data: dragData, channel: sendChannel, offset: offset, page: page});

          element.addClass(draggingClass);
          element.bind('$destroy', dragendHandler);

          e.dataTransfer.setData("dataToSend", sendData);
          currentData = angular.fromJson(sendData);
          e.dataTransfer.effectAllowed = "copyMove";
          $rootScope.$broadcast("ANGULAR_DRAG_START", sendChannel, currentData.data);
        }

        element.bind("dragend", dragendHandler);

        element.bind("dragstart", dragstartHandler);
      }
    };
  }

  function rmOnDrop($parse, $rootScope) {
    return function (scope, element, attr) {
      var dragging = 0; //Ref. http://stackoverflow.com/a/10906204
      var dropChannel = attr.dropChannel || "defaultchannel";
      var dragChannel = "";
      var dragEnterClass = attr.dragEnterClass || "on-drag-enter";
      var dragHoverClass = attr.dragHoverClass || "on-drag-hover";
      var customDragEnterEvent = $parse(attr.onDragEnter);
      var customDragLeaveEvent = $parse(attr.onDragLeave);

      function onDragOver(e) {
        if (e.preventDefault) {
          e.preventDefault(); // Necessary. Allows us to drop.
        }

        if (e.stopPropagation) {
          e.stopPropagation();
        }

        var fn = $parse(attr.rmOnDragOver);
        scope.$evalAsync(function () {
          fn(scope, {$event: e, $channel: dropChannel});
        });

        e.dataTransfer.dropEffect = e.shiftKey ? 'copy' : 'move';
        return false;
      }

      function onDragLeave(e) {
        if (e.preventDefault) {
          e.preventDefault();
        }

        if (e.stopPropagation) {
          e.stopPropagation();
        }
        dragging--;

        if (dragging == 0) {
          scope.$evalAsync(function () {
            customDragEnterEvent(scope, {$event: e});
          });
          element.removeClass(dragHoverClass);
        }

        var fn = $parse(attr.uiOnDragLeave);
        scope.$evalAsync(function () {
          fn(scope, {$event: e, $channel: dropChannel});
        });
      }

      function onDragEnter(e) {
        if (e.preventDefault) {
          e.preventDefault();
        }

        if (e.stopPropagation) {
          e.stopPropagation();
        }
        dragging++;

        var fn = $parse(attr.uiOnDragEnter);
        scope.$evalAsync(function () {
          fn(scope, {$event: e, $channel: dropChannel});
        });

        $rootScope.$broadcast("ANGULAR_HOVER", dragChannel);
        scope.$evalAsync(function () {
          customDragLeaveEvent(scope, {$event: e});
        });
        element.addClass(dragHoverClass);
      }

      function onDrop(e) {
        if (e.preventDefault) {
          e.preventDefault(); // Necessary. Allows us to drop.
        }
        if (e.stopPropagation) {
          e.stopPropagation(); // Necessary. Allows us to drop.
        }

        var sendData = e.dataTransfer.getData("dataToSend");
        sendData = angular.fromJson(sendData);

        var delta = {
          x: e.pageX - sendData.page.x,
          y: e.pageY - sendData.page.y
        };

        var fn = $parse(attr.rmOnDrop);
        scope.$evalAsync(function () {
          fn(scope, {$data: sendData.data, $event: e, $channel: sendData.channel, $delta: delta});
        });
        element.removeClass(dragEnterClass);
        dragging = 0;
      }

      function isDragChannelAccepted(dragChannel, dropChannel) {
        if (dropChannel === "*") {
          return true;
        }

        var channelMatchPattern = new RegExp("(\\s|[,])+(" + dragChannel + ")(\\s|[,])+", "i");

        return channelMatchPattern.test("," + dropChannel + ",");
      }

      function preventNativeDnD(e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        e.dataTransfer.dropEffect = "none";
        return false;
      }

      var deregisterDragStart = $rootScope.$on("ANGULAR_DRAG_START", function (event, channel) {
        dragChannel = channel;
        if (isDragChannelAccepted(channel, dropChannel)) {
          if (attr.dropValidate) {
            var validateFn = $parse(attr.dropValidate);
            var valid = validateFn(scope, {$data: currentData.data, $channel: currentData.channel});
            if (!valid) {
              element.bind("dragover", preventNativeDnD);
              element.bind("dragenter", preventNativeDnD);
              element.bind("dragleave", preventNativeDnD);
              element.bind("drop", preventNativeDnD);
              return;
            }
          }

          element.bind("dragover", onDragOver);
          element.bind("dragenter", onDragEnter);
          element.bind("dragleave", onDragLeave);

          element.bind("drop", onDrop);
          element.addClass(dragEnterClass);
        }
        else {
          element.bind("dragover", preventNativeDnD);
          element.bind("dragenter", preventNativeDnD);
          element.bind("dragleave", preventNativeDnD);
          element.bind("drop", preventNativeDnD);
        }
      });


      var deregisterDragEnd = $rootScope.$on("ANGULAR_DRAG_END", function (e, channel) {
        dragChannel = "";
        if (isDragChannelAccepted(channel, dropChannel)) {

          element.unbind("dragover", onDragOver);
          element.unbind("dragenter", onDragEnter);
          element.unbind("dragleave", onDragLeave);

          element.unbind("drop", onDrop);
          element.removeClass(dragHoverClass);
          element.removeClass(dragEnterClass);
        }

        element.unbind("dragover", preventNativeDnD);
        element.unbind("dragenter", preventNativeDnD);
        element.unbind("dragleave", preventNativeDnD);
        element.unbind("drop", preventNativeDnD);
      });


      var deregisterDragHover = $rootScope.$on("ANGULAR_HOVER", function (e, channel) {
        if (isDragChannelAccepted(channel, dropChannel)) {
          element.removeClass(dragHoverClass);
        }
      });


      scope.$on('$destroy', function () {
        deregisterDragStart();
        deregisterDragEnd();
        deregisterDragHover();
      });

      attr.$observe('dropChannel', function (value) {
        if (value) {
          dropChannel = value;
        }
      });
    };
  }

  angular.module("rm")
    .directive("rmDraggable", rmDraggable)
    .directive("rmOnDrop", rmOnDrop);

})();