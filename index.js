'use strict';

module.exports = {
  name: require('./package').name,

  createCssModulesPlugin(parent) {
    const RoutePlugin = require('./lib/route-plugin');
    return new RoutePlugin(parent);
  }
};
