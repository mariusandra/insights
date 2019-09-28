import app from '../../src/app';

describe('\'views\' service', () => {
  it('registered the service', () => {
    const service = app.service('views');
    expect(service).toBeTruthy();
  });
});
