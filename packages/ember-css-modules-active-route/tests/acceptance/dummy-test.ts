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

  test('it works with engines', async function(assert) {
    const rootElement = this.element;

    await visit('/');
    assert.dom(rootElement).hasStyle({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      color: 'rgb(0, 0, 0)'
    });

    await visit('/dummy-engine');
    assert.dom(rootElement).hasStyle({
      backgroundColor: 'rgb(200, 100, 100)',
      color: 'rgb(0, 0, 0)'
    });

    await visit('/dummy-engine/foo');
    assert.dom(rootElement).hasStyle({
      backgroundColor: 'rgb(200, 200, 100)',
      color: 'rgb(0, 0, 0)'
    });

    await visit('/dummy-engine/foo/bar');
    assert.dom(rootElement).hasStyle({
      backgroundColor: 'rgb(200, 0, 100)',
      color: 'rgb(0, 100, 100)'
    });

    await visit('/');
    assert.dom(rootElement).hasStyle({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      color: 'rgb(0, 0, 0)'
    });
  });
});
