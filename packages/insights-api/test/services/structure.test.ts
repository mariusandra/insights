import app from '../../src/app';

describe('\'structure\' service', () => {
  it('registered the service', () => {
    const service = app.service('structure');
    expect(service).toBeTruthy();
  });
});
