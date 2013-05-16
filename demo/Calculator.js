(function ($) {

  function Calculator() {
    var history = [],
      calc = this,
      $led;

    $.turnToPageObject(calc, {
      template: $('#tmplCalculator').html(),
      containerClass: 'calc',
      context: {
        caption: "Demo Calculator",
      },
      selectors: {
        buttons: [ ':button', Calculator.getButtonName ],
        led: 'p'
      }
    });

    $led = $(calc.DOM.led);

    function remember() {
      var current = $led.html();
      if (current == history[history.length-1]) return;
      history.push( $led.html() );
    }

    for (var name in calc.DOM.buttons)
      $(calc.DOM.buttons[name]).click(function () {
        var name = Calculator.getButtonName(this);
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
            var result,
              statement = $led.html().replace(/ /g, '');
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

    return calc;
  }

  Calculator.getButtonName = function (el) {
    return $(el).attr('class').replace('calc-','');
  }

  window.Calculator = Calculator;

})(jQuery);
