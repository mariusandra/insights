const assert = require('assert');
const app = require('../../app/backend/app');

describe('\'url\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/url');

    assert.ok(service, 'Registered the service');
  });
});
