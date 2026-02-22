require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

module.exports = ({ config }) => ({
  ...config,
  extra: {
    eas: {
      projectId: process.env.EXPO_PROJECT_ID,
    },
  },
  updates: {
    url: process.env.EXPO_UPDATES_URL,
  },
});
