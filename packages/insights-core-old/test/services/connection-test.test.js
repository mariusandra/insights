const assert = require('assert')
const app = require('../../server/app')

describe('\'connection-test\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/connection-test')

    assert.ok(service, 'Registered the service')
  })
})
