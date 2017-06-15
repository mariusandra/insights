const assert = require('assert')
const app = require('../../server/app')

describe('\'connections\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/connections')

    assert.ok(service, 'Registered the service')
  })
})
