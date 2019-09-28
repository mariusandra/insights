import app from '../../src/app';

describe('\'favourites\' service', () => {
  it('registered the service', () => {
    const service = app.service('favourites');
    expect(service).toBeTruthy();
  });
});
