require('dotenv').config();

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
