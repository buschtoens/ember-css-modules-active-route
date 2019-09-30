import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('foo', function() {
    this.route('bar');
  });
});
