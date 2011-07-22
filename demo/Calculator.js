(function ($, undefined) {

var calculatorPageObjectOptions = {
  template: "tmplCalculator",
  context: {
    caption: "Demo Calculator",
  },
  selectors: {
    buttons: [ ':button', function (jQ) { return getButtonName(jQ); } ],
    led: 'p'
  }
}


function getButtonName(jQ) {
  return jQ.attr('class').replace('calc-','');
}

function Calculator(container) {
  var C = $.PageObject($.extend(true, {}, calculatorPageObjectOptions, { container: container }));
  var history = [];

  function remember() {
    var current = C.DOM.led.html();
    if (current == history[history.length-1]) return;
    history.push(C.DOM.led.html());
  }

  for (var name in C.DOM.buttons)
    C.DOM.buttons[name].click(function () {
      var name = getButtonName($(this));
      if (name == parseInt(name)) {
        remember();
        C.DOM.led.html(C.DOM.led.html()+' '+name);
      }
      else switch (name) {
        case "cancel":
          history = [];
          C.DOM.led.html('');
          break;
        case "undo":
          C.DOM.led.html(history.pop());
          break;
        case "plus":
          remember();
          C.DOM.led.html(C.DOM.led.html()+' + ');
          break;
        case "minus":
          remember();
          C.DOM.led.html(C.DOM.led.html()+' - ');
          break;
        case "multiply":
          remember();
          C.DOM.led.html(C.DOM.led.html()+' * ');
          break;
        case "divide":
          remember();
          C.DOM.led.html(C.DOM.led.html()+' / ');
          break;
        case "equals":
          var statement = C.DOM.led.html().replace(/ /g, '');
          var result;
          try {
            result = eval(statement);
          } catch(e) {}
          if (result !== undefined) {
            remember();
            C.DOM.led.html((result+"").replace(/./g, "$& "));
          }
          break;
        case "dot":
          remember();
          C.DOM.led.html(C.DOM.led.html()+' .');
          break;
      }
    });

  return C;
}


this.Calculator = Calculator;

})(jQuery);
