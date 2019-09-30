'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: require('./package').name,

  lazyLoading: Object.freeze({
    enabled: true
  }),

  isDevelopingAddon() {
    return true;
  }
});
