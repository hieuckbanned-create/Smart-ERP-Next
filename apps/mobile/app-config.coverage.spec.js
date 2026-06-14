describe('mobile Expo app config', () => {
  const originalEasProjectId = process.env.EAS_PROJECT_ID;
  const originalExpoProjectId = process.env.EXPO_PROJECT_ID;

  afterEach(() => {
    jest.resetModules();
    if (originalEasProjectId === undefined) {
      delete process.env.EAS_PROJECT_ID;
    } else {
      process.env.EAS_PROJECT_ID = originalEasProjectId;
    }
    if (originalExpoProjectId === undefined) {
      delete process.env.EXPO_PROJECT_ID;
    } else {
      process.env.EXPO_PROJECT_ID = originalExpoProjectId;
    }
  });

  it('keeps the app version aligned with the mobile package version', () => {
    const appConfig = require('./app.config')();
    const packageJson = require('./package.json');

    expect(appConfig.expo.version).toBe(packageJson.version);
  });

  it('injects a valid EAS project id from release environment', () => {
    process.env.EAS_PROJECT_ID = '123e4567-e89b-42d3-a456-426614174000';
    const appConfig = require('./app.config')();

    expect(appConfig.expo.extra.eas.projectId).toBe('123e4567-e89b-42d3-a456-426614174000');
  });

  it('does not publish placeholder project ids into Expo config', () => {
    process.env.EAS_PROJECT_ID = 'smart-erp-next';
    const appConfig = require('./app.config')();

    expect(appConfig.expo.extra.eas).toBeUndefined();
  });
});
