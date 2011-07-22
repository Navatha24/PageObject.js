/*
 * PageObject v0.1
 *
 * Copyright 2011, Mykhaylo Gavrylyuk
 * Licensed under the MIT license
 *
 * Date: Fri Jul 22 16:37:50 EEST 2011
 */

(function ($, undefined) {

var defaultOptions = {
  container: undefined,
  containerClass: undefined,
  domElement: 'div',
  templateFunction: undefined,
  template: undefined,
  context: {},
  selectors: {},
  hide: false
}

// check if microtemplating function of John Resig is defined to use it as default
if ($.isFunction(window.tmpl)) defaultOptions.templateFunction = window.tmpl;


// extract jQuery DOM parts from container using a map of selectors
function extract(container, selectors) {
  var domParts = {};
  for (var name in selectors) {
    if (typeof name != 'string' || ! /^[A-z\.]+$/.test(name)) {
      throw "POE10: incorrect selector `"+name+"`";
    }
    if ($.isArray(selectors[name]) && selectors[name].length == 2) {
      domParts[name] = {};
      container.find(selectors[name][0]).each(function () {
        var id = selectors[name][1]($(this));
        domParts[name][id] = $(this);
      });
    }
    else if ($.isPlainObject(selectors[name])) {
      domParts[name] = extract(container, selectors[name]);
    }
    else {
      domParts[name] = container.find(selectors[name]);
      if (domParts[name].length == 0)
        throw "POE11: DOM parts weren't found for selector `"+name+"`";
    }
  }
  return domParts;
}


function turnToPageObject(object, options) {
  if (typeof object != 'object') throw "POE01: invalid object ";
  if (!$.isPlainObject(options)) throw "POE02: options not specified";

  var opts = $.extend(true, {}, defaultOptions, options);

  // cannot proceed without template engine
  if (!$.isFunction(opts.templateFunction)) throw "POE03: templateFunction not configured";

  // template option is mandatory
  if (opts.template == null) throw "POE04: tmpl option not set";

  // template context should be a plain object
  if (!$.isPlainObject(opts.context)) opts.context = {};


  // namespace for jQuery DOM parts which are to be extracted from the rendered template
  object.DOM = {};

  // prepare the container
  // find it in the DOM if selector specified
  if (opts.container) {
    object.DOM.container = $(opts.container);
    if (!object.DOM.container.size()) throw "POE05: container not found";
  }
  // or create the container if selector omitted
  else {
    object.DOM.container = $(document.createElement(opts.domElement));
  }

  // hide it if necessary
  if (opts.hide) object.DOM.container.hide();

  // set the container class if needed
  if (opts.containerClass) object.DOM.container.addClass(opts.containerClass);


  // template should be either a string or a function
  switch (true) {
    case typeof(opts.template) == 'string':
      object.DOM.container.html(opts.templateFunction(opts.template, opts.context));
      break;

    // integration with Jammit JST
    case $.isFunction(opts.template):
      object.DOM.container.html(opts.template(opts.context));
      break;

    default:
      throw "POE06: template is invalid";
  }

  var domParts = extract(object.DOM.container, opts.selectors);
  $.extend(true, object.DOM, domParts);

  return object;
}

function PageObject(options) { return turnToPageObject(this, options); }

$.turnToPageObject = turnToPageObject;
$.PageObject = function (options) { return new PageObject(options); }
$.PageObject.configure = function (options) { $.extend(defaultOptions, options); }

PageObject.prototype = $.PageObject.fn = {
  constructor: PageObject,
  show: function () { jQuery.fn.show.apply(this.DOM.container, arguments); },
  hide: function () { jQuery.fn.hide.apply(this.DOM.container, arguments); }
};

})(jQuery);
