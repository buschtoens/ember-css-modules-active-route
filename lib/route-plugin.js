/* eslint-disable no-param-reassign */
const Plugin = require('ember-css-modules/lib/plugin');

module.exports = class RoutePlugin extends Plugin {
  config(environment, baseConfig) {
    const selectorRegExp = /:route/g;
    const className = 'css-modules-active-route';

    this.addPostcssPlugin(baseConfig, 'before', root => {
      root.walkRules(selectorRegExp, rule => {
        rule.selector = rule.selector.replace(selectorRegExp, `.${className}`);
      });
    });
  }
};
