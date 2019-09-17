# ember-css-modules-active-route

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
