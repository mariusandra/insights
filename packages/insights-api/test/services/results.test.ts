import app from '../../src/app';

describe('\'results\' service', () => {
  it('registered the service', () => {
    const service = app.service('results');
    expect(service).toBeTruthy();
  });
});
