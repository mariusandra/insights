import app from '../../src/app';

describe('\'connections\' service', () => {
  it('registered the service', () => {
    const service = app.service('connections');
    expect(service).toBeTruthy();
  });
});
