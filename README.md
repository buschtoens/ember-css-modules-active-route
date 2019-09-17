# ember-css-modules-active-route

[![Build Status](https://travis-ci.org/buschtoens/ember-css-modules-active-route.svg)](https://travis-ci.org/buschtoens/ember-css-modules-active-route)
[![npm version](https://badge.fury.io/js/ember-css-modules-active-route.svg)](http://badge.fury.io/js/ember-css-modules-active-route)
[![Download Total](https://img.shields.io/npm/dt/ember-css-modules-active-route.svg)](http://badge.fury.io/js/ember-css-modules-active-route)
[![Ember Observer Score](https://emberobserver.com/badges/ember-css-modules-active-route.svg)](https://emberobserver.com/addons/ember-css-modules-active-route)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![dependencies](https://img.shields.io/david/buschtoens/ember-css-modules-active-route.svg)](https://david-dm.org/buschtoens/ember-css-modules-active-route)
[![devDependencies](https://img.shields.io/david/dev/buschtoens/ember-css-modules-active-route.svg)](https://david-dm.org/buschtoens/ember-css-modules-active-route)

`:route` selector to apply styles to the root element, when a route is active.

## Installation

```
ember install ember-css-modules-active-route ember-css-modules
```

## Usage

```css
/* app/foo/styles.css */

:route {
  background: green;
}
```

When the user enters the `foo` route, the `:route` pseudo-selector will be
applied to the root element (`<html>`).
