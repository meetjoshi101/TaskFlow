// Shared Karma configuration. Ensures Puppeteer's Chrome binary is used if system Chrome absent.
try {
  const puppeteer = require('puppeteer');
  process.env.CHROME_BIN = process.env.CHROME_BIN || puppeteer.executablePath();
} catch {
  // Fallback: rely on environment-provided CHROME_BIN; will error if none.
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
  require('karma-coverage'),
  // Angular builder injects its own karma plugin; explicit require removed
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      }
    },
    singleRun: true,
    restartOnFileChange: false,
  });
};
