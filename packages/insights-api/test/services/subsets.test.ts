import app from '../../src/app';

describe('\'subsets\' service', () => {
  it('registered the service', () => {
    const service = app.service('subsets');
    expect(service).toBeTruthy();
  });
});
