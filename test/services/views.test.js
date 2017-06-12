const assert = require('assert');
const app = require('../../app/backend/app');

describe('\'views\' service', () => {
  it('registered the service', () => {
    const service = app.service('views');

    assert.ok(service, 'Registered the service');
  });
});
