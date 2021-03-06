# ember-css-modules-active-route

[![Build Status](https://travis-ci.org/buschtoens/ember-css-modules-active-route.svg)](https://travis-ci.org/buschtoens/ember-css-modules-active-route)
[![npm version](https://badge.fury.io/js/ember-css-modules-active-route.svg)](http://badge.fury.io/js/ember-css-modules-active-route)
[![Download Total](https://img.shields.io/npm/dt/ember-css-modules-active-route.svg)](http://badge.fury.io/js/ember-css-modules-active-route)
[![Ember Observer Score](https://emberobserver.com/badges/ember-css-modules-active-route.svg)](https://emberobserver.com/addons/ember-css-modules-active-route)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![dependencies](https://img.shields.io/david/buschtoens/ember-css-modules-active-route.svg)](https://david-dm.org/buschtoens/ember-css-modules-active-route)
[![devDependencies](https://img.shields.io/david/dev/buschtoens/ember-css-modules-active-route.svg)](https://david-dm.org/buschtoens/ember-css-modules-active-route)

`:app-root` and `:document-root` selectors to apply styles to the root element,
when a route is active.

## Installation

```
ember install ember-css-modules-active-route ember-css-modules
```

This is a plugin for [`ember-css-modules`][ember-css-modules], so you need to
have it installed as well.

[ember-css-modules]: https://github.com/salsify/ember-css-modules

## Usage

- **`:app-root`**: Maps to the [root element][root-element] of your application.
  Usually `<body>`.
- **`:document-root`**: Maps to the [`documentElement`][document-element] /
  [`:root`][css-root], which is the `<html>` element.

[root-element]: https://guides.emberjs.com/release/configuring-ember/embedding-applications/
[document-element]: https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement
[css-root]: https://developer.mozilla.org/en-US/docs/Web/CSS/:root

### Example

```ts
Router.map(function() {
  this.route('foo', function() {
    this.route('bar');
  });
  this.route('qux');
});
```

```css
/* app/foo/styles.css */

:app-root {
  background: green;
}
```

```css
/* app/foo/index/styles.css */

:app-root {
  background: red;
}
```

When the user enters the `foo` route, the `:app-root` pseudo-selector will be
applied to the app's `rootElement` (`<body>`). The background of the page will
be `red`, as `foo.index` overrides `foo`.

When the user navigates to `foo.bar`, the background will turn `green`, as the
user has left the `foo.index` route and the override no longer takes effect.

When the user navigates to `qux`, the background will become transparent again,
as no route styles are active any more.

### Combining Selectors

You can also combine the `:app-root` & `:document-root` selectors with other
regular selectors. For instance, instead of just using `:document-root`, which
targets the `:root` element (`<html>`), you can target child elements instead:

```css
:document-root :global(.some-cookie-banner) {
  display: none;
}
```

In this example, `<div class="some-cookie-banner">` is inserted by the backend
and would be hidden, while the user is on a certain route.

### Specificity

[CSS Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)
can be a tricky thing. This addon tries to make everything work out of the box.
For every level of nesting, the selector specificity will be increased
automatically. This way, overrides in child routes actually override
declarations in parent routes, without the source order being relevant.

You can also manually set the specificity, like so:

```css
:app-root(3) {
  background: red;
}

:app-root(2) {
  background: green;
}
```

The background will be `red`, as `3` is a higher specificity than `2`.

## How does it work?

The `:app-root` / `:app-root(n)` and `:document-root` / `:document-root(n)`
selectors are replaced with "magic" class name selectors by
[`lib/route-plugin.js`](lib/route-plugin.js). These selectors are repeated `n`
times to raise them to the necessary specificity level.

`n` can either be specified explicitly as `:app-root(n)`, or when used as
`:app-root` will be derived from the depth of route nesting by counting the `/`
in the file path of the respective `styles.css`. This ensures that rules in
nested child routes override rules from their parent routes.

```css
:app-root {
  background: yellow;
}
:app-root(3) {
  background: green;
}
:app-document(1) body {
  background: blue;
}

/* becomes */

/* Class name may be repeated more often depending on level of nesting. */
.css-modules-active-route-app.css-modules-active-route-app {
  background: yellow;
}

/* With an explicit `n` provided, the class name is repeated that many times. */
.css-modules-active-route-app.css-modules-active-route-app.css-modules-active-route-app {
  background: green;
}

/* Combining with other selectors is possible. */
.css-modules-active-route-document body {
  background: blue;
}
```

When the a transition is started or finished the
[`CSSModulesActiveRouteService`](addon/services/css-modules-active-route.ts)
resolves the styles for the current route hierarchy via the Ember container
using the route name. This implies, that you cannot render custom / non-default
templates for routes,
[which is deprecated anyway](https://github.com/emberjs/rfcs/blob/master/text/0418-deprecate-route-render-methods.md).
