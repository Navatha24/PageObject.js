(function ($, undefined) {

var calculatorPageObjectOptions = {
  template: "tmplCalculator",
  context: {
    caption: "Demo Calculator",
  },
  selectors: {
    buttons: [ ':button', function (el) { return getButtonName(el); } ],
    led: 'p'
  }
}


function getButtonName(el) {
  return $(el).attr('class').replace('calc-','');
}

function Calculator(container) {
  var C = $.PageObject($.extend(true, {}, calculatorPageObjectOptions, { container: container }));
  var history = [];
  var $led = $(C.DOM.led);

  function remember() {
    var current = $led.html();
    if (current == history[history.length-1]) return;
    history.push( $led.html() );
  }

  for (var name in C.DOM.buttons)
    $(C.DOM.buttons[name]).click(function () {
      var name = getButtonName(this);
      if (name == parseInt(name)) {
        remember();
        $led.html( $led.html() + ' ' + name );
      }
      else switch (name) {
        case "cancel":
          history = [];
          $led.html('');
          break;
        case "undo":
          $led.html(history.pop());
          break;
        case "plus":
          remember();
          $led.html( $led.html() + ' + ' );
          break;
        case "minus":
          remember();
          $led.html( $led.html() + ' - ' );
          break;
        case "multiply":
          remember();
          $led.html( $led.html() + ' * ' );
          break;
        case "divide":
          remember();
          $led.html( $led.html() + ' / ' );
          break;
        case "equals":
          var statement = $led.html().replace(/ /g, '');
          var result;
          try {
            result = eval(statement);
          } catch(e) {}
          if (result !== undefined) {
            remember();
            $led.html( (result+"").replace(/./g, "$& ") );
          }
          break;
        case "dot":
          remember();
          $led.html( $led.html() + ' .' );
          break;
      }
    });

  return C;
}


this.Calculator = Calculator;

})(jQuery);
