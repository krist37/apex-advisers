import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: '05jvwhqa',
    dataset: 'production',
  },
  studioHost: 'apex-advisers',
  deployment: {
    appId: 'pzn9oxrp2amz9g2lg4b5qsjj',
    autoUpdates: true,
  },
});
