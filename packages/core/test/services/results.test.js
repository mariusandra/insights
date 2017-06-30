const assert = require('assert')
const app = require('../../app/backend/app')

describe('\'results\' service', () => {
  it('registered the service', () => {
    const service = app.service('api/results')

    assert.ok(service, 'Registered the service')
  })
})
