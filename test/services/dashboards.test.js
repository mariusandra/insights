const assert = require('assert')
const app = require('../../app/backend/app')

describe('\'dashboards\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/dashboards')

    assert.ok(service, 'Registered the service')
  })
})
