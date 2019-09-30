'use strict';

module.exports = function(environment) {
  const ENV = {
    modulePrefix: require('../package').name,
    environment
  };

  return ENV;
};
