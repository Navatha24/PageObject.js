/*global jQuery: false */
/*jslint browser: true, indent: 2, white: true, nomen: true */

/*
 * PageObject v0.14
 *
 * Copyright 2011, Mykhaylo Gavrylyuk, https://github.com/IronGroove
 * Licensed under the MIT license
 *
 * Date: Thu May 16 23:21:14 EEST 2013
 */

(function (window, $) {
  "use strict";

  var priv = {}, POE;

  function PageObjectError(code, message) {
    this.name = "PageObjectError";
    this.code = code < 10 ? "0"+code : code;
    this.message = message;
  }
  PageObjectError.prototype = new Error();
  PageObjectError.prototype.constructor = new PageObjectError;
  PageObjectError.prototype.toString = function () {
    return "POE" + this.code + ": " + this.message;
  }

  POE = PageObjectError;

  priv.defaultOptions = {
    container: undefined,
    containerClass: undefined,
    containerElement: 'div',
    templateEngine: undefined,
    template: undefined,
    context: {},
    selectors: {},
    hide: false
  };

  // Use underscore microtemplating function as default if using underscore.
  if (window._ && $.isFunction(window._.template)) {
    priv.defaultOptions.templateEngine = window._.template;
  }

  // Extract jQuery DOM parts from a container using a map of selectors.
  $.extractParts = function (sourceContainer, selectors) {
    var domParts = {};

    if (!$.isElement(sourceContainer)) {
      throw new POE(10, "arguments should be: 1st — HTML DOM container, 2nd — selectors map");
    }

    if (!$.isPlainObject(selectors)) {
      selectors = {};
    }

    $.each(selectors, function (name, selector) {
      var found,
        findMultiple = false;

      if (!/^[A-z\.]+$/.test(name)) {
        throw new POE(11, "incorrect selector name `" + name + "`");
      }

      if ($.isArray(selector) &&
        selector.length === 2 &&
        $.type(selector[0]) === 'string' &&
        $.isFunction(selector[1])) {

        domParts[name] = {};
        $(sourceContainer).find(selector[0]).each(function () {
          var id = selector[1].call(this, this);
          if (id) {
            if (domParts[name][id]) {
              throw new POE(12, "duplicate identifier `" + id + "` in DOM part namespace `"+ name +"`");
            }
            domParts[name][id] = this;
          }
        });
      }

      else if ($.isPlainObject(selector)) {
        domParts[name] = $.extractParts(sourceContainer, selector);
      }

      else if (typeof selector === 'string') {
        findMultiple = selector.indexOf('[]') === 0;
        if (findMultiple) {
          selector = selector.replace('[]', '');
        }
        found = $(sourceContainer).find(selector);
        if (found.length === 0) {
          throw new POE(13, "DOM parts weren't found for selector `" + name + "`");
        } else if (found.length > 1) {
          if (findMultiple) {
            found = Array.prototype.slice.call(found);
          } else {
            throw new POE(14, "multiple DOM parts found for selector `" + name + "`");
          }
        } else {
          found = found[0];
        }
        domParts[name] = found;
      }

      else {
        throw new POE(15, "invalid selector value");
      }

    });

    return domParts;
  };

  // http://stackoverflow.com/a/384380/133257
  $.isElement = function (o) {
    return  (
      typeof window.HTMLElement === "object" ? o instanceof window.HTMLElement : // DOM2
      typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
  };

  $.isPageObject = function (po) {
    return po && po.DOM && $.isPlainObject(po.DOM) && $.isElement(po.DOM.container);
  }

  $.turnToPageObject = function (target, options) {
    var opts, rendered, domParts;


    //   CHECK IF 1ST ARGUMENT IS OBJECT
    //   -------------------------------

    if ($.type(target) !== 'object') {
      throw new POE(1, "invalid target (1st argument should be an object)!");
    }

    if (!$.isPlainObject(options)) {
      options = {};
    }

    opts = $.extend({}, priv.defaultOptions, options);


    //   CREATE DOM NAMESPACE IF THERE'S NO SUCH
    //   ---------------------------------------

    if (!$.isPlainObject(target.DOM)) {
      target.DOM = {};
    }


    //   PREPARE CONTAINER
    //   -----------------

    if (opts.container !== undefined) {
      if (!$.isElement(opts.container)) {
        throw new POE(2, "container is invalid!");
      }
      target.DOM.container = opts.container;
    } else {
      target.DOM.container = window.document.createElement(opts.containerElement);
    }


    //   SET CONTAINER CLASS WHEN NEEDED
    //   -------------------------------

    if (opts.containerClass) {
      $(target.DOM.container).addClass(opts.containerClass);
    }


    //   ESTABLISH REFERENCE
    //   -------------------

    $(target.DOM.container).data('pageObject', target);


    //   RENDER TEMPLATE
    //   ---------------

    if (opts.template !== undefined) {

      if (typeof opts.template === 'string') {
        if (!$.isFunction(opts.templateEngine)) {
          throw new POE(3, "templateEngine not configured");
        }
      } else if (typeof opts.template !== 'function' ) {
        throw new POE(4, "invalid template");
      }


      if (!$.isPlainObject(opts.context)) {
        opts.context = {};
      }

      try {
        if (typeof opts.template === 'string') {
          rendered = opts.templateEngine(opts.template, opts.context);
        } else {
          rendered = opts.template(opts.context);
        }
      } catch (e) {
        throw new POE(5, "template error: " + e);
      }

      $(target.DOM.container).html(rendered);
    }


    //   EXTRACTING DOM PARTS
    //   --------------------

    if (!$.isPlainObject(opts.selectors)) {
      opts.selectors = {};
    }

    domParts = $.extractParts(target.DOM.container, opts.selectors);
    $.extend(true, target.DOM, domParts);


    //   HIDE THE CONTAINER IF IT IS NECESSARY
    //   -------------------------------------

    if (opts.hide) {
      $(target.DOM.container).hide();
    }

    return target;
  };

  $.turnToPageObject.configure = function (options) {
    if ($.isPlainObject(options)) {
      $.extend(priv.defaultOptions, options);
    }
  };

  // Expose private things for testing.
  // Don't worry, following lines are not included
  // in minimized production version.
  if (window.PAGE_OBJECT_JS_TEST_MODE) {
    $.turnToPageObject.priv = priv;
  }

}(window, jQuery));
