const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = Array.from(
  new Set([...(config.watchFolders || []), workspaceRoot, path.join(workspaceRoot, 'node_modules')])
);

config.resolver.nodeModulesPaths = Array.from(
  new Set([
    path.join(projectRoot, 'node_modules'),
    path.join(workspaceRoot, 'node_modules'),
    ...(config.resolver.nodeModulesPaths || []),
  ])
);

config.server = {
  ...config.server,
  unstable_serverRoot: projectRoot,
};

module.exports = config;
