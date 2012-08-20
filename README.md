PageObject is an abstraction meaning a part of a web page maintating its specific logic over its components (DOM elements and other page objects).

While creating rich web applications we used to single out page blocks. We refer to those blocks as objects when we need to repeat them somehow here or there. This is where the utility comes to hand.

PageObject would help you if for such cases you used to render client-side templates and then revive their rendered results.

Though template engine can be easily changed, PageObject out of the start works perfectly with both [underscore templates](http://underscorejs.com/#template) and [microtemplating engine](https://gist.github.com/1092301) by John Resig, determining without assistance if any of them is available.

Please refer to demos and source code to understand how things work. More documentation and examples will follow.

Noteworthy is that currently PageObject utilizes jQuery heavily but isn't a jQuery plugin. That's why it is referred to as `$.PageObject`. Although I'm feeling totally comfortable with jQuery, I guess PageObject might become aware of other popular frameworks as well. So you are welcome to contribute.
