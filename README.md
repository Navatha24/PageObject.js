_PageObject_ is an abstraction meaning part of a web page maintating its specific logic over its components (DOM elements and other page objects when necessary).

While creating rich web applications we usually single out page blocks. We refer to those blocks as objects when we need to repeat them somehow here or there. This is where the utility comes to hand. **PageObject.js** would help you if for such cases you used to render client-side templates and then revive their rendered results.

**PageObject.js** is a jQuery utility and there are actually only two functions:

- `$.turnToPageObject`and
- `$.turnToPageObject.configure`.

---

## $.turnToPageObject( _[object]_ target, _[object]_ options )

The idea is that `target` should get `target.DOM` namespace filled with HTML DOM elements according to `options.selectors` taken from `options.template` rendered  with `options.context`.

```javascript
function LoginForm(successCallback) {
  var lf = this;
  $.turnToPageObject(lf, {
    template: '<form>'+
              '<h1><%= caption %></h1>'+
              '<input type="text" name="email" />'+
              '<input type="password" name="password" />'+
              '<input type="submit" name="submit" />'
              '</form',
    context: {
      caption: I18n.t("Please enter your credentials below")
    },
    selectors: {
      form: 'form',
      email: 'input[name=email]',
      password: ':password'
    }
  });

  $(lf.DOM.form).submit(function (e) {
    e.preventDefault();
    var email = $(lf.DOM.email).val(),
      password = $(lf.DOM.password).val(),
      ok = authenticate(email, password);
      if (!ok) {
        alert("No way, buddy!");
      } else {
        success();
      }
  });
}

var loginForm = new LoginForm(function () {
  // render some other view
});

$('body').append(loginForm.DOM.container);
```

### $.turnToPageObject options

#### Container related

If you ommit `container` _DOM element_ it will be created for you from `containerElement` which is **DIV** by default.

If you provide `containerClass` _string_ option, your `target.DOM.container` will get that class.

If you set `hide` to `true` option, `target.DOM.container` will be hidden. This has proved to be useful.

#### Template related

if you provide `template` option, the rendered template will be placed inside `target.DOM.container`.

If you omit `context` option, template will be rendered with empty context `{}`.

`template` can be either a function or a string.

- Function `template` takes single argument, a `context` object, and returns string. This is made for integration with [Jammit JST](http://documentcloud.github.io/jammit/#jst).
- String templates are rendered with `templateEngine` which takes two arguments, `template` string and `context` object. `templateEngine` function also returns string.

`templateEngine` is being automatically configured to use `_.template` if [Underscore](http://documentcloud.github.io/underscore) is present.

If there's no _Underscore_ in your project, you'll need to configure `templateEngine`.

This is how to set defaults:
```javascript
$.turnToPageObject.configure({
  templateEngine: window.tmpl, // http://ejohn.org/blog/javascript-micro-templating
  containerElement: 'strong'
});
```

#### Selectors

If you provide `selectors` _object_ option, HTML DOM elements will be found within `target.DOM.container` and placed in `target.DOM` under corresponding keys. If `template` option was specified, `selectors` will be searching after it is rendered into the container.

If a selector fails to find any element it will throw an exception. If it finds multiple elements it will shout too. If you do really need to find multiple selectors and store them in array under the corresponding key, just prepend `[]` (square brackets) to a selector, e.g. '[] ul > li'.

If you need to collect some elements into an object having their keys determined from HTML DOM elements found, like in the [Calculator](http://j.mp/Z1roQS) demo, write selector as a two elements array `[ realSelector, functionToDetermineElementsKey ]`.

Namespaces in `selectors` result in same namespaces in `target.DOM`.

---

Please check out [the demo](http://j.mp/Z1roQS), [the source code](https://github.com/IronGroove/PageObject.js) and tests to learn more about how things work.
