const appJson = require('./app.json');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function buildExpoConfig() {
  const projectId =
    process.env.EAS_PROJECT_ID ||
    process.env.EXPO_PROJECT_ID ||
    appJson.expo.extra?.eas?.projectId;
  const expo = {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
    },
  };

  if (UUID_PATTERN.test(String(projectId || ''))) {
    expo.extra.eas = { projectId };
  } else {
    delete expo.extra.eas;
  }

  return { expo };
}

module.exports = buildExpoConfig;
