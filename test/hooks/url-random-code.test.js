const assert = require('assert')
const urlRandomCode = require('../../app/backend/hooks/url-random-code')

describe('\'url-random-code\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {}
    // Initialize our hook with no options
    const hook = urlRandomCode()

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object')
    })
  })
})
