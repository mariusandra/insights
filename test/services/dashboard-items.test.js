const assert = require('assert')
const app = require('../../server/app')

describe('\'dashboard-items\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/dashboard-items')

    assert.ok(service, 'Registered the service')
  })
})
