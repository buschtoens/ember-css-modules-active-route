/* eslint-disable no-param-reassign */
const Plugin = require('ember-css-modules/lib/plugin');

module.exports = class RoutePlugin extends Plugin {
  config(environment, baseConfig) {
    const selectorRegExp = /:(app|document)-root(?:\((\d+)\))?/g;
    const className = 'css-modules-active-route';

    this.addPostcssPlugin(baseConfig, 'before', (root, { opts }) => {
      // Increase selector specificity for each level of route nesting.
      const defaultSpecificity = opts.relativeFrom.match(/\//g).length;

      root.walkRules(selectorRegExp, rule => {
        rule.selector = rule.selector.replace(
          selectorRegExp,
          (_, element, specificity = defaultSpecificity) =>
            `.${className}-${element}`.repeat(Number.parseInt(specificity, 10))
        );
      });
    });
  }
};
