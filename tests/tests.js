function testTemplate(context) {
  var r = document.createElement('i');
  r.innerHTML = context.abc;
  return r;
}

$(document).ready(function() {

  module("$.isElement");

  test("should tell whether provided argument is an HTML DOM element", function () {
    ok( !$.isElement(),          "false if nothing");
    ok( !$.isElement(undefined), "false if undefined");
    ok( !$.isElement(null),      "false if null");
    ok( !$.isElement("str"),     "false if string");
    ok( !$.isElement(/re/),      "false if regexp");
    ok( !$.isElement(12345),     "false if number");
    ok( !$.isElement(12.45),     "false if float number");
    ok( !$.isElement(Infinity),  "false if Infinity");
    ok( !$.isElement([]),        "false if array");
    ok( !$.isElement({}),        "false if object");
    ok( !$.isElement($.noop),    "false if function");
    ok( $('body')[0],   "true if HTML DOM element");
  });


  module("priv.extractParts");

  test("should work only if 1st arg is a valid HTML DOM element", function () {
    var body = $('body')[0], selectors = { qunit: 'div#qunit' };

    throws(function(){  extractParts(); },                     /^POE10/, "fails if given nothing");
    throws(function(){  extractParts(null, selectors); },      /^POE10/, "fails if 2nd arg is valid and 1st is null");
    throws(function(){  extractParts(undefined, selectors); }, /^POE10/, "fails if 2nd arg is valid and 1st is undefined");
    throws(function(){  extractParts(12345, selectors); },     /^POE10/, "fails if 2nd arg is valid and 1st is number");
    throws(function(){  extractParts(12.45, selectors); },     /^POE10/, "fails if 2nd arg is valid and 1st is float number");
    throws(function(){  extractParts(Infinity, selectors); },  /^POE10/, "fails if 2nd arg is valid and 1st is Infinity");
    throws(function(){  extractParts('str', selectors); },     /^POE10/, "fails if 2nd arg is valid and 1st is string");
    throws(function(){  extractParts(/re/, selectors); },      /^POE10/, "fails if 2nd arg is valid and 1st is regexp");
    throws(function(){  extractParts([], selectors); },        /^POE10/, "fails if 2nd arg is valid and 1st is array");
    throws(function(){  extractParts($.noop, selectors); },    /^POE10/, "fails if 2nd arg is valid and 1st is function");
    throws(function(){  extractParts(selectors, selectors); }, /^POE10/, "fails if 2nd arg is valid and 1st is object");
    throws(function(){  extractParts(selectors, body); },      /^POE10/, "fails if both arguments are valid but their places are swapped");

    var e = [], allEmpty = true;
    e.push(extractParts(body, null));
    e.push(extractParts(body, undefined));
    e.push(extractParts(body, 12345));
    e.push(extractParts(body, 12.45));
    e.push(extractParts(body, Infinity));
    e.push(extractParts(body, 'str'));
    e.push(extractParts(body, /re/));
    e.push(extractParts(body, []));
    e.push(extractParts(body, $.noop));
    e.push(extractParts(body, body));

    for (var i = 0; i < e.length; i++) {
      if (!$.isEmptyObject(e[i])) {
        allEmpty = false;
        break;
      }
    }

    ok( allEmpty, "doesn't fail if 1st arg is valid and 2nd is whatsoever, should return {} though");

    deepEqual( {}, extractParts(body, body, 1), "doesn't fail when there are more than 2 arguments, should return {} though");
    deepEqual( {}, extractParts(body),          "doesn't fail if 1st arg is valid and 2nd is omitted, should return {} though");
    deepEqual( {}, extractParts(body, {}),      "doesn't fail when 2nd arg selectors object is empty, should return {} though");

    extractParts(body, selectors);
    ok(true, "works when both arguments are valid");
  });

  test("selector names in selectors object should be alpha only", function () {
    var body = $('body')[0], validSelector = 'div#qunit';

    throws(function(){  extractParts(body, { '123': validSelector }); }, /^POE11/, "fails receiving numeric selector name");
    throws(function(){  extractParts(body, { '!@#': validSelector }); }, /^POE11/, "fails receiving selector name with symbols");

    extractParts(body, { 'abc': validSelector });
    ok( true, 'passes when selector names are alpha only');
  });

  test("selector is string", function () {
    var body = $('body')[0], DOM, validSelector = 'div.qunit';

    DOM = extractParts(body, { 'abc': 'div#qunit' });
    ok( $.isPlainObject(DOM), 'the result should be a plain object');
    ok( objectSize(DOM) === 1, 'and it should have exactly same number of keys as there were in selectors object');
    ok( $.isElement(DOM.abc), "and it should have valid key as selector's name in it");
    ok( DOM.abc == document.getElementById('qunit'), 'and extracted element by selectors should be relevant');

    throws(function(){  DOM = extractParts(body, { abc: 'small' }); }, /^POE13/, "should fail if no elements found for selector");
    throws(function(){  DOM = extractParts(body, { abc: 'div' }); }, /^POE14/, "should fail if more than one element was found for selector");

    DOM = extractParts(body, { divs: '[] > div' });
    ok( true, "shouldn't fail if selector starts with [] and multiple elements found for the selector");
    ok( $.isArray(DOM.divs), "and the result should be an array");
    ok( DOM.divs.length == 2 && DOM.divs[0] == document.getElementById('qunit') && DOM.divs[1] == document.getElementById('qunit-fixture'), "and that array should consist of exactly same number of elements as there are in the DOM within the container");

    throws(function(){  extractParts(body, { divs: '[] small' }); }, /^POE13/, "should fail if selector starts with [] and no elements found for the selector");
  });

  test("selector is object of other selectors", function () {
    var body = $('body')[0], DOM;

    DOM = extractParts(body, { abc: { def: 'div#qunit', ghi: '[] >div' } });
    ok( $.isPlainObject(DOM) );
    ok( objectSize(DOM) === 1 );
    ok( $.isPlainObject(DOM.abc), "should return object corresponding to the object selector filled with the found elements corresponding to its selectors" );
    ok( objectSize(DOM.abc) === 2 );
    ok( $.isElement(DOM.abc.def) && $.isArray(DOM.abc.ghi) );
    ok( DOM.abc.def == document.getElementById('qunit') && DOM.abc.ghi.length == 2 );
  });

  test("selector is array", function () {
    var body = $('body')[0], DOM;

    DOM = extractParts(body, { abc: [ 'ul > li', function () { return $(this).attr('id'); } ] });

    ok( $.isPlainObject(DOM) && objectSize(DOM) === 1, "should work if array consists of 2 elements: 1st is selector and 2nd is a function" );
    ok( $.isPlainObject(DOM.abc) && objectSize(DOM.abc) === 3, "should extract namespace according to selector name provided and have as many items inside as there are elements found" );
    deepEqual( objectKeys(DOM.abc), [ 'red', 'green', 'blue' ], "should extract names from DOM elements according to the result of a function provided" );
    ok( DOM.abc.red == document.getElementById('red') &&
        DOM.abc.green == document.getElementById('green') &&
        DOM.abc.blue == document.getElementById('blue'), "should extract correct elements assign them to corresponding properties");

    throws(function(){  DOM = extractParts(body, { abc: [] }); },                  /^POE15/, "should fail if array is empty");
    throws(function(){  DOM = extractParts(body, { abc: [ 'div' ] }); },           /^POE15/, "should fail if array has only 1 elem");
    throws(function(){  DOM = extractParts(body, { abc: [ 'div', $.noop, 3] }); }, /^POE15/, "should fail if array has only more than 2 elems");
    throws(function(){  DOM = extractParts(body, { abc: [ 1, $.noop ] }); },       /^POE15/, "should fail if 1st array elem is not a string selector");
    throws(function(){  DOM = extractParts(body, { abc: [ 'div', 1 ] }); },        /^POE15/, "should fail if 2nd array elem is not a function");

    DOM = extractParts(body, { abc: [ 'ul > li', $.noop ] });
    ok( objectSize(DOM.abc) === 0, "should not process on which function returns falsy name" );

    var dup = $('<li></li>').insertAfter('#blue').attr('id', 'blue');
    throws(function(){
      DOM = extractParts(body, { abc: [ 'ul > li', function () { return $(this).attr('id'); } ] });
    }, /^POE12/, "should fail if there's a second element found for a single name");
  });

  test("selector is anything else — should always fail", function () {
    var body = $('body')[0], DOM;

    throws(function(){  extractParts(body, { abc: null }); },      /^POE15/, "null");
    throws(function(){  extractParts(body, { abc: undefined }); }, /^POE15/, "undefined");
    throws(function(){  extractParts(body, { abc: true }); },      /^POE15/, "true");
    throws(function(){  extractParts(body, { abc: false }); },     /^POE15/, "false");
    throws(function(){  extractParts(body, { abc: 12345 }); },     /^POE15/, "number");
    throws(function(){  extractParts(body, { abc: 12.45 }); },     /^POE15/, "float number");
    throws(function(){  extractParts(body, { abc: 0 }); },         /^POE15/, "zero");
    throws(function(){  extractParts(body, { abc: Infinity }); },  /^POE15/, "Infinity");
    throws(function(){  extractParts(body, { abc: /re/ }); },      /^POE15/, "regexp");
    throws(function(){  extractParts(body, { abc: $.noop }); },    /^POE15/, "function");
  });


  module("$.turnToPageObject");

  // CHECK IF 1ST ARGUMENT IS OBJECT
  test("1st argument should always be an object", function () {
    throws(function(){  $.turnToPageObject(); },               /^POE01/, "should fail if 1st arg is omitted");
    throws(function(){  $.turnToPageObject(undefined); },      /^POE01/, "should fail if 1st arg is undefined");
    throws(function(){  $.turnToPageObject(null); },           /^POE01/, "should fail if 1st arg is null");
    throws(function(){  $.turnToPageObject(true); },           /^POE01/, "should fail if 1st arg is boolean true");
    throws(function(){  $.turnToPageObject(false); },          /^POE01/, "should fail if 1st arg is boolean false");
    throws(function(){  $.turnToPageObject("str"); },          /^POE01/, "should fail if 1st arg is string");
    throws(function(){  $.turnToPageObject(12345); },          /^POE01/, "should fail if 1st arg is number");
    throws(function(){  $.turnToPageObject(12.45); },          /^POE01/, "should fail if 1st arg is float number");
    throws(function(){  $.turnToPageObject($.noop); },         /^POE01/, "should fail if 1st arg is function");
    throws(function(){  $.turnToPageObject(/re/); },           /^POE01/, "should fail if 1st arg is regexp");
    throws(function(){  $.turnToPageObject([]); },             /^POE01/, "should fail if 1st arg is array");

    $.turnToPageObject({});
    ok( true, "works when 1st arg is a plain object");

    $.turnToPageObject(new $.noop());
    ok( true, "works when 1st arg is a constructed object");
  });


  /*

  TODO TEST OPTIONS MERGE SOMEHOW

  */


  // CREATE DOM NAMESPACE IF THERE'S NO SUCH
  test("should create DOM namespace if there's no DOM namespace yet", function () {
    var a = {};
    $.turnToPageObject(a);
    ok( $.isPlainObject(a.DOM), "creates DOM namespace when there's no such");

    var b = { DOM: { a : 123 } };
    $.turnToPageObject(b);
    ok( b.DOM.a == 123, "does not create new DOM namespace when there is such already");
  });

  // PREPARE CONTAINER
  test("when options.container is specified it should be a valid HTML DOM element or all should fail", function () {
    throws(function(){  $.turnToPageObject({}, { container: null}); },         /^POE02/, "null");
    throws(function(){  $.turnToPageObject({}, { container: true}); },         /^POE02/, "true");
    throws(function(){  $.turnToPageObject({}, { container: false}); },        /^POE02/, "false");
    throws(function(){  $.turnToPageObject({}, { container: 12345}); },        /^POE02/, "number");
    throws(function(){  $.turnToPageObject({}, { container: 123.5}); },        /^POE02/, "float number");
    throws(function(){  $.turnToPageObject({}, { container: Infinity}); },     /^POE02/, "Infinity");
    throws(function(){  $.turnToPageObject({}, { container: 'str'}); },        /^POE02/, "string");
    throws(function(){  $.turnToPageObject({}, { container: /re/}); },         /^POE02/, "regexp");
    throws(function(){  $.turnToPageObject({}, { container: []}); },           /^POE02/, "array");
    throws(function(){  $.turnToPageObject({}, { container: {}}); },           /^POE02/, "object");
    throws(function(){  $.turnToPageObject({}, { container: $.noop}); },       /^POE02/, "function");

    var a = {}, old = $.turnToPageObject.priv.defaultOptions.containerElement;
    $.turnToPageObject.priv.defaultOptions.containerElement = 'strong';
    $.turnToPageObject(a, { container: undefined});
    ok( $(a.DOM.container).parent().length == 0 &&
        $(a.DOM.container)[0].tagName.toUpperCase() == $.turnToPageObject.priv.defaultOptions.containerElement.toUpperCase(),
        "works when container is undefined and creates container of same tag as containerElement");
    $.turnToPageObject.priv.defaultOptions.containerElement = old;

    var b = {};
    $.turnToPageObject(b, { container: $('body')[0]});
    ok( b.DOM.container == $('body')[0], "works when container is an HTML DOM element and does not create new one");
  });

  // SET CONTAINER CLASS WHEN NEEDED
  test("when options.container is specified it should be a valid HTML DOM element or all should fail", function () {
    var a = {};
    $.turnToPageObject(a, { containerClass: 'test' });
    ok( $(a.DOM.container).hasClass('test'), "adds class to contaner when containerClass option is specified" );

    var b = {};
    $.turnToPageObject(b, {});
    ok( !$(b.DOM.container).hasClass('test'), "does not add class to container when containerClass option is not specified" );
  });


  // RENDER TEMPLATE
  test("template is string", function () {
    var body = $('body')[0], a = {};

    throws(function(){
      $.turnToPageObject(a, {
        template: "doesn't matter"
      });
    }, /^POE03/, "fails when there is template but no templateEngine specified or configured");

    throws(function(){
      $.turnToPageObject(a, {
        template: "doesn't matter",
        templateEngine: Infinity
      });
    }, /^POE03/, "also fails when templateEngine is not a function");

    var called = null;
    function tmpl(str, context) { called = { template: str, context: context }; return ""; };
    $.turnToPageObject(a, { templateEngine: tmpl, template: "abcb", context: { abc: 123 } });
    ok( true, "it works when both template and templateEngine are specified" );
    deepEqual( called, { template: "abcb", context: { abc: 123 } }, "templateEngine function is passed correct template and context");
  });

  // RENDER TEMPLATE
  test("template is function", function () {
    var body = $('body')[0], a = {};
    $.turnToPageObject(a, {
      template: testTemplate,
      selectors: { i: 'i' },
      context: { abc: "Hello" }
    });
    ok( $(a.DOM.i).html() == "Hello", "it works with context and template is rendered correctly");
  });

  // RENDER TEMPLATE
  test("template is neither string, nor function — should always fail", function () {
    throws(function(){ $.turnToPageObject({}, { template: null }); },     /^POE04/, "null");
    throws(function(){ $.turnToPageObject({}, { template: true }); },     /^POE04/, "true");
    throws(function(){ $.turnToPageObject({}, { template: false }); },    /^POE04/, "false");
    throws(function(){ $.turnToPageObject({}, { template: 12345 }); },    /^POE04/, "number");
    throws(function(){ $.turnToPageObject({}, { template: 12.45 }); },    /^POE04/, "float number");
    throws(function(){ $.turnToPageObject({}, { template: Infinity }); }, /^POE04/, "Infinity");
    throws(function(){ $.turnToPageObject({}, { template: /re/ }); },     /^POE04/, "regexp");
    throws(function(){ $.turnToPageObject({}, { template: [] }); },       /^POE04/, "array");
    throws(function(){ $.turnToPageObject({}, { template: {} }); },       /^POE04/, "object");
    throws(function(){ $.turnToPageObject({}, { template: $('li')[0]});}, /^POE04/, "HTML DOM element");
  });

  // RENDER TEMPLATE
  test("when context omitted or is not a plain object, empty plain object should be used instead", function () {
    var cntxt;
    $.turnToPageObject({}, {
      template: function (context) { cntxt = context; return ''; }
    });
    deepEqual({}, cntxt, "context passed to template function is empty object when context option is omitted");

    $.turnToPageObject({}, {
      template: function (context) { cntxt = context; return ''; },
      context: 1
    });
    deepEqual({}, cntxt, "context passed to template function is empty object when context option value is not an object");

    $.turnToPageObject({}, {
      template: '',
      templateEngine: function (str, context) { cntxt = context; return ''; }
    });
    deepEqual({}, cntxt, "context passed to templateEngine function is empty object when context option is omitted");

    $.turnToPageObject({}, {
      template: '',
      templateEngine: function (str, context) { cntxt = context; return ''; },
      context: 1
    });
    deepEqual({}, cntxt, "context passed to templateEngine function is empty object when context option value is not an object");
  });

  // RENDER TEMPLATE
  test("template errors should be raised", function () {
    throws(function(){
      $.turnToPageObject({}, {
        template: function () { throw "SHOUT1"; }
      });
    }, /^POE05/, "it raises error when function template is used");

    throws(function(){
      $.turnToPageObject({}, {
        template: '',
        templateEngine: function () { throw "SHOUT2"; }
      });
    }, /^POE05/, "it also raises error when templateEngine is used");
  });


  // EXTRACTING DOM PARTS
  test("should call `extractParts(options.container, options.selectors) and merge returned object into DOM namespace", function () {
    var body = $('body')[0],
      a = {},
      extractParts = $.turnToPageObject.priv.extractParts,
      args;

    $.turnToPageObject.priv.extractParts = function (arg1, arg2) { args = [ arg1, arg2 ]; return {qwerty:123}; };

    $.turnToPageObject(a, { container: body, selectors: { items: '[] ul > li' } });
    deepEqual( args, [ body, { items: '[] ul > li' } ], "it calls when selectors specified");
    deepEqual( a.DOM, { container: body, qwerty: 123 }, "and it merges the result");

    $.turnToPageObject(a, { container: body, selectors: {} });
    deepEqual( args, [ body, {} ], "it calls when selectors not specified providing empty object instead");
    deepEqual( a.DOM, { container: body, qwerty: 123 }, "it merges the result too");

    $.turnToPageObject(a, { container: body, selectors: 123 });
    deepEqual( args, [ body, {} ], "it calls when selectors specified but mistakingly it is not an object, providing empty object instead");
    deepEqual( a.DOM, { container: body, qwerty: 123 }, "it merges the result too");

    $.turnToPageObject.priv.extractParts = extractParts;
  });


  // HIDE THE CONTAINER IF IT IS NECESSARY
  test("should hide container if options.hide", function () {
    var a = {};

    $.turnToPageObject(a, { container: $('ul')[0], selectors: { items: '[] > li' }, hide: true });
    ok( $(a.DOM.container).is(':hidden'), "container is hidden if hide option is false" );

    $.turnToPageObject(a, { container: $('ul')[0], selectors: { items: '[] > li' } });
    ok( $(a.DOM.container).not(':hidden'), "container is not hidden if hide option is omitted" );

    $.turnToPageObject(a, { container: $('ul')[0], selectors: { items: '[] > li' }, hide: false });
    ok( $(a.DOM.container).not(':hidden'), "container is not hidden if hide option is false" );
  });



  module("$.turnToPageObject.configure");

  test("should extend priv.defaultOptions with 1st arg object if it is a plain object", function () {
    var defopts = $.extend({}, defaultOptions),
      expected = $.extend({}, defaultOptions);
    $.turnToPageObject.configure(121313);
    deepEqual(defopts, expected, "it does nothing when argument is not a plain object");

    var conf = { a: Infinity, b: 'some', c: 0 },
      expected = $.extend({}, defaultOptions, conf);
    $.turnToPageObject.configure(conf);
    defopts = $.extend({}, defaultOptions);
    deepEqual(defopts, expected, "it does nothing when argument is not a plain object");
  });

});
