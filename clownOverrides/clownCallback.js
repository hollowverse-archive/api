/* eslint-disable import/no-extraneous-dependencies */
const { omit } = require('lodash');

module.exports = clownFs => {
  clownFs.editJson('package.json', json =>
    omit(json, 'dependencies["@hollowverse/utils"]'),
  );
};
