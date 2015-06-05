'use strict';

(function () {

  function virtualKeyboardDirective(virtualKeyService) {

    var cachedTemplate = null;

    return {
      scope: {},
      restrict: 'EA',
      replace:true,
      link: {
        pre: function preLink(scope,elem, attr) {
          scope.layouts = defaultKeyboard;

          scope.visible = function() {
            return virtualKeyService.visible;
          };
        },

        post: function(scope, elem) {
          cachedTemplate = elem.contents();
        }
      },
      template:
        '<div class="virtual-keyboard" ng-show="visible()">'+
        '  <div key-layout="lowerCase"></div>'+
        '  <div key-layout="upperCase"></div>'+
        '  <div key-layout="numeric"></div>'+
        '</div>'
    };
  }

  function keyLayoutDirective(virtualKeyService) {
    return {
      scope: true, //inherit from parent scope
      replace:true,
      restrict: 'EA',
      link: {
        pre:function(scope, element, attr) {

          var name = attr.keyLayout;
          var layout = scope.layouts[name];

          if(!layout) {
            throw "Invalid layout name "+name;
          }

          scope.layout = layout;
          scope.name = name;

          scope.enabled = function() {
            return virtualKeyService.activeLayout == name;
          }
        }
      },

      template: '<div ng-show="enabled()" class="layout {{::name}}">' +
                '  <div class="key-row" ng-repeat="row in ::layout">' +
                '    <div ng-repeat="item in ::row" key="::item"></div>'     +
                '  </div>' +
                '</div>'
    };
  }

  function keyDirective(virtualKeyService, $interpolate, $compile) {

    var template =
      '<div class="button {{::class}}" rm-tap="press()" data-repeatable="{{::repeatable}}">' +
      '  <div class="key">{{::label}}</div>' +
      '</div>';

    var interp = $interpolate(template);

    var templateCache = {};

    function buildTemplate(item) {

        //transform string items
        if(typeof item == 'string' || item instanceof String)
        {
          //check if key is single char
          if(item.length != 1)
          {
            throw "Invalid key string "+item;
          }

          item = {
            key:item.charCodeAt(0),
            label: item
          }
        }

        //create interpolation data object
        var data = {
          class: item.class || "default",
          label: item.label || " ",
          repeatable: item.repeatable || false
        };

        return {
          key: item.key,
          html: interp(data)
        }
    }

    return {
      scope: {
        item: '=key'
      },
      restrict: 'EA',
      replace:true,
      link:function(scope, element) {

        if(!scope.item)
        {
          throw "Key item is undefined";
        }

        var template = buildTemplate(scope.item);

        //compile the template
        element.html(template.html);
        $compile(element.contents())(scope);

        //define the press handler
        scope.press = function() {
          virtualKeyService.pressKey(template.key);
        };

        //this is required to prevent the click bubbling up to document scope
        //and resetting typeahead
        element.bind('click',function(e) {
          e.stopPropagation();
        });

      }
    };
  }

  var virtualKeyModelDirective = function(virtualKeyService) {
    return {
      scope: {},
      restrict: 'A',
      require: 'ngModel',
      link:function(scope, element, attr, ngModel) {

        function callback(key) {
          var val = virtualKeyService.updateString(key, ngModel.$viewValue);

          ngModel.$setViewValue(val);
          ngModel.$render();
        }

        function bind() {
          virtualKeyService.setCallback(callback);
          virtualKeyService.setElement(element);
        }

        //element[0].ontouchstart = bind;
        element[0].onfocus = bind;
      }
    };
  };

  var VirtualKeyService = function ($rootScope, $timeout) {

      function createDummyEvent(type) {
        return {
          preventDefault: function () {},
          isDefaultPrevented: function () {},
          stopPropagation: function () {},
          type: type
        };
      }

      var service = {
        model: null
      };

      var callback = null;
      var element = null;

      service.activeLayout = "lowerCase";

      function setLayout(value) {
        service.activeLayout = value;
        console.debug("layout set to %s", value);
      }

      //this function simulates a key down event for the typeahead plugin
      function triggerKeyDown(key) {
        if(!element) {
          return;
        }

        //this must be wrapped in a timeout to prevent clash with current digest cycle
        $timeout(function() {
          //var event = new jQuery.Event('keydown');
          var event = createDummyEvent('keydown');
          event.which = key;
          element.triggerHandler(event);
        },1);
      }

      service.visible = false;

      service.hide = function() {
        console.debug("Hiding virtual keyboard");
        service.visible  = false;
        service.element  = null;
        service.callback = null;
      };

      service.pressKey = function(key) {
        switch(key) {
          case KeyCode.Uppercase:
            return setLayout("upperCase");

          case KeyCode.Lowercase:
            return setLayout("lowerCase");

          case KeyCode.Numeric:
            return setLayout("numeric");

          case KeyCode.Enter:
            return triggerKeyDown(key);

          case KeyCode.Close:
            return service.hide();
        }

        if(callback) {
          callback(key);
        }

        if(element) {
          setTimeout(function () { element[0].focus(); }, 20);
        }
      };

      service.setCallback = function(fn) {
        callback = fn;
      };

      service.setElement = function(el) {
        if(service.visible && element == el) {
          return;
        }

        element = el;

        $rootScope.$apply(function() {
          service.visible = true;
        });
      };

      service.updateString = function(key, str) {

        str = str || "";

        switch(key)
        {
          case KeyCode.Backspace:
            if(str.length) {
              str =str.substring(0, str.length - 1);
            }
            break;

          default:
            str += String.fromCharCode(key);
            break;
        }

        return str;
      };

      return service;
    };

  angular
    .module("rm")
    .service('virtualKeyService', VirtualKeyService)
    .directive('virtualKeyModel', virtualKeyModelDirective)
    .directive('virtualKeyboard', virtualKeyboardDirective)
    .directive('keyLayout', keyLayoutDirective)
    .directive('key', keyDirective);

  var KeyCode = {
    None:0,
    Backspace:8,
    Tab:9,
    Enter:13,
    Shift:16,
    Ctrl:17,
    Alt:18,
    CapsLock:20,
    Esc:27,
    Space:32,
    PageUp:33,
    PageDown:34,
    End:35,
    Home:36,
    Left:37,
    Up:38,
    Right:39,
    Down:40,
    Uppercase:41,
    Lowercase:42,
    Numeric:43,
    Symbols:44,
    Close: 45
  };

  var Keys = {
    Backspace:  {key: KeyCode.Backspace, label: "Del",   class: "text del-key", repeatable: true},
    Enter:      {key: KeyCode.Enter,     label: "Enter", class: "text enter-key"},
    LowerCaseL: {key: KeyCode.Lowercase, label: "abc",   class: "text"},
    LowerCaseR: {key: KeyCode.Lowercase, label: "abc",   class: "text right-key"},
    UpperCaseL: {key: KeyCode.Uppercase, label: "ABC",   class: "text"},
    UpperCaseR: {key: KeyCode.Uppercase, label: "ABC",   class: "text right-key"},
    Numeric:    {key: KeyCode.Numeric,   label: "123",   class: "text numeric-key"},
    NumericExit:{key: KeyCode.Lowercase, label: "abc",   class: "text numeric-key"},
    Symbols:    {key: KeyCode.Symbols,   label: "#$+",   class: "text"},
    Space:      {key: KeyCode.Space,     label: "Space", class: "text space-key"},
    Close:      {key: KeyCode.Close,     label: "Close", class: "text close-key"},
    BlankL:     {key: KeyCode.None,      label: "", class: "text blank-key"},
    BlankR:     {key: KeyCode.None,      label: "", class: "text blank-key"}
  };

  var defaultKeyboard = {
    upperCase: [
      // 1st row
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", Keys.Backspace],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", Keys.Enter],
      [Keys.LowerCaseL, "Z", "X", "C", "V", "B", "N", "M", ",", ".", Keys.LowerCaseR],
      [Keys.Numeric, Keys.Space, Keys.Close]
    ],
    lowerCase: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", Keys.Backspace],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", Keys.Enter],
      [Keys.UpperCaseL, "z", "x", "c", "v", "b", "n", "m", ",", ".",Keys.UpperCaseR],
      [Keys.Numeric, Keys.Space, Keys.Close]
    ],
    numeric: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", Keys.Backspace],
      ["!", "@", "£", "$", "%", "&", "*", "(", ")", Keys.Enter],
      [Keys.UpperCaseL, "-", "+", "=", "[", "]", ";", ":", "?", "/",Keys.UpperCaseR],
      [Keys.NumericExit, Keys.Space, Keys.Close]
    ]
  };
})();
