import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | css-modules-active-route', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const service = this.owner.lookup('service:css-modules-active-route');
    assert.ok(service);
  });
});
