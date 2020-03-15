import app from '../../src/app';

describe('\'setup\' service', () => {
  it('registered the service', () => {
    const service = app.service('setup');
    expect(service).toBeTruthy();
  });
});
