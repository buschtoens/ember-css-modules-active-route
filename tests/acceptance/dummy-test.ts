import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | dummy', function(hooks) {
  setupApplicationTest(hooks);

  test('it works', async function(assert) {
    const rootElement = this.element;

    await visit('/');
    assert.dom(rootElement).hasStyle({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      color: 'rgb(0, 0, 0)'
    });

    await visit('/foo');
    assert.dom(rootElement).hasStyle({
      backgroundColor: 'rgb(200, 200, 0)',
      color: 'rgb(0, 0, 0)'
    });

    await visit('/foo/bar');
    assert.dom(rootElement).hasStyle({
      backgroundColor: 'rgb(200, 0, 0)',
      color: 'rgb(0, 0, 100)'
    });

    await visit('/');
  });
});
