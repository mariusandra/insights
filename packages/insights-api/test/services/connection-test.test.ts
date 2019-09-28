import app from '../../src/app';

describe('\'connection-test\' service', () => {
  it('registered the service', () => {
    const service = app.service('connection-test');
    expect(service).toBeTruthy();
  });
});
