const assert = require('assert')
const app = require('../../app/backend/app')

describe('\'structure\' service', () => {
  it('registered the service', () => {
    const service = app.service('structure')

    assert.ok(service, 'Registered the service')
  })
})
