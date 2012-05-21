/*global jQuery: false */
/*jslint browser: true, indent: 2, unparam: true, white: true, forin: true */

/*
 * PageObject v0.9
 *
 * Copyright 2011, Mykhaylo Gavrylyuk
 * Licensed under the MIT license
 *
 * Date: Mon May 21 15:51:08 EEST 2012
 */
(function (window, $, undefined) {
  "use strict";

  var defaultOptions = {
    container: undefined,
    containerClass: undefined,
    domElement: 'div',
    templateFunction: undefined,
    template: undefined,
    context: {},
    selectors: {},
    hide: false
  };

  // Use underscore microtemplating function as default if using underscore.
  if (window._ && $.isFunction(window._.template)) {
    defaultOptions.templateFunction = window._.template;
  }

  // Use microtemplating function of John Resig as default if it's defined.
  else if ($.isFunction(window.tmpl)) {
    defaultOptions.templateFunction = window.tmpl;
  }

  // Extract jQuery DOM parts from a container using a map of selectors.
  function extract(container, selectors) {
    var domParts = {};

    $.each(selectors, function (name) {
      var found, selector, findMultiple = false;

      if (typeof name !== 'string' || !/^[A-z\.]+$/.test(name)) {
        throw "POE10: incorrect selector name `" + name + "`";
      }

      selector = selectors[name];

      if ($.isArray(selector) &&
        selector.length === 2 &&
        $.type(selector[0]) === 'string' &&
        $.isFunction(selector[1])) {

        domParts[name] = {};
        $(container).find(selector[0]).each(function () {
          var id = selector[1](this);
          domParts[name][id] = this;
        });
      }

      else if ($.isPlainObject(selector)) {
        domParts[name] = extract(container, selector);
      }

      else if ($.type(selector) === 'string') {
        findMultiple = selector.indexOf('[]') === 0;
        if (findMultiple) selector = selector.replace('[]', '');
        found = $(container).find(selector);
        if (found.length === 0) {
          throw "POE11: DOM parts weren't found for selector `" + name + "`";
        } else if (found.length > 1) {
          if (findMultiple) {
            found = Array.prototype.slice.call(found);
          } else {
            throw "POE12: multiple DOM parts found for selector `" + name + "`";
          }
        } else {
          found = found[0];
        }
        domParts[name] = found;
      }

      else {
        throw "POE13: invalid selector value";
      }

    });

    return domParts;
  }

  // Returns true if it is a DOM element,
  // http://stackoverflow.com/a/384380/133257
  function isElement(o) {
    return (
      typeof window.HTMLElement === "object" ? o instanceof window.HTMLElement : // DOM2
      typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string"
    );
  }

  function turnToPageObject(object, options) {
    if (typeof object !== 'object') {
      throw "POE01: invalid object";
    }

    if (!$.isPlainObject(options)) {
      throw "POE02: options not specified";
    }

    var opts = $.extend(true, {}, defaultOptions, options),
      domParts,
      $container;

    // Cannot proceed without template engine.
    if (!$.isFunction(opts.templateFunction)) {
      throw "POE03: templateFunction not configured";
    }

    // Template option is mandatory.
    if (opts.template === undefined) {
      throw "POE04: template option not set";
    }

    // Template context should be a plain object.
    if (!$.isPlainObject(opts.context)) {
      opts.context = {};
    }

    // Namespace for jQuery DOM parts which are to be extracted
    // from the rendered template.
    if (!$.isPlainObject(object.DOM)) {
      object.DOM = {};
    }


    // PREPARE THE CONTAINER.

    if ($.isPlainObject(object.DOM) && isElement(object.DOM.container)) {
      // Just leave it alone untouched.
    }

    // All we need is a DOM element.
    else if (isElement(opts.container)) {
      object.DOM.container = opts.container;
    }

    // Find it in the DOM if selector specified.
    else if (typeof opts.container === 'string') {
      $container = $(opts.container);
      if (!$container.size()) {
        throw "POE05: container not found";
      }
      object.DOM.container = $container[0];
    }

    // Or create it using a constructor function if specified.
    else if ($.isFunction(opts.container)) {
      object.DOM.container = opts.container();
      if (!isElement(object.DOM.container)) {
        throw "POE6: returned container should be a DOM element";
      }
    }

    // Or create it if selector omitted.
    else {
      object.DOM.container = window.document.createElement(opts.domElement);
    }

    // Hide it if necessary.
    if (opts.hide) {
      $(object.DOM.container).hide();
    }

    // Set the container class if needed.
    if (opts.containerClass) {
      $(object.DOM.container).addClass(opts.containerClass);
    }


    // RENDER TEMPLATE.

    // Template should be either a string or a function.
    switch (true) {

    case typeof opts.template === 'string':
      if (!opts.template.length) {
        throw "POE20: template string is empty";
      }
      try {
        var rendered = opts.templateFunction(opts.template, opts.context);
        $(object.DOM.container).html(rendered);
      } catch (e) {
        throw "POE21: template error: " + e;
      }
      break;

    // Integration with Jammit JST.
    case $.isFunction(opts.template):
      try {
        var rendered = opts.template(opts.context);
        $(object.DOM.container).html(rendered);
      } catch (e) {
        throw "POE22: template error: " + e;
      }
      break;

    default:
      throw "POE07: template is invalid";
    }


    // EXTRACT DOM PARTS.

    domParts = extract(object.DOM.container, opts.selectors);
    $.extend(true, object.DOM, domParts);

    return object;
  }

  function PageObject(options) { return turnToPageObject(this, options); }

  $.turnToPageObject = turnToPageObject;
  $.PageObject = function (options) { return new PageObject(options); };
  $.PageObject.configure = function (options) { $.extend(defaultOptions, options); };

  PageObject.prototype = $.PageObject.fn = {
    constructor: PageObject,
    show: function () { jQuery.fn.show.apply(this.DOM.container, arguments); },
    hide: function () { jQuery.fn.hide.apply(this.DOM.container, arguments); }
  };

}(window, jQuery));
