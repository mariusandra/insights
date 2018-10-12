const assert = require('assert');
const app = require('../../app/app');

describe('\'favourites\' service', () => {
  it('registered the service', () => {
    const service = app.service('favourites');

    assert.ok(service, 'Registered the service');
  });
});
