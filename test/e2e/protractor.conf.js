'use strict';

exports.config = {
  framework: 'jasmine2',
  baseUrl: process.env.APP_URL || 'http://localhost:3000',
  capabilities: {
    browserName: 'phantomjs',
    'phantomjs.binary.path': require('phantomjs-prebuilt').path
  }
};
