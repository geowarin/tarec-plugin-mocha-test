module.exports = function mochaPlugin (context, operations) {

    var chalk = operations.resolve('chalk');
    var open = operations.resolve('open');
    var path = require('path');
    var fs = require('fs');

    operations.addCommandHelp('mochaTestReport', `Display a previously generated coverage report.`);

    operations.addCommand('mochaTestReport', (context, args) => {

      if (args.help || args.h) {
        console.log(`\nCommand: ${chalk.blue('mochaTestReport')}
  Options:
    --reporter, -r : Choose coverage reporter. Accepted values: text, clover, lcov. Default: lcov
    --open, -o     : Open the report if possible
`);
        process.exit(0);
      }

      var reporter = args.reporter || args.r || 'lcov';
      var shouldOpen = args.open || args.o || false;

      showCoverage(context, reporter, shouldOpen);
    });

    operations.addCommandHelp('mochaTest', `Run tests with mocha. Your tests should be in the ${chalk.magenta('/test')} directory`);

    operations.addPreCommand('mochaTest', (context, args) => {
        process.env['NODE_ENV'] = 'test';
    });

    operations.addCommand('mochaTest', (context, args) => {

      if (args.help || args.h) {
        console.log(`\nCommand: ${chalk.blue('mochaTest')}
  Options:
    --coverage     : Generate coverage
    --reporter, -r : Choose coverage reporter. Accepted values: text, clover, lcov. Default: text
    --open, -o     : Open the report if possible
`);
        process.exit(0);
      }

        var coverage = args.coverage;
        var reporter = args.reporter || args.r || 'text';
        var shouldOpen = args.open || args.o || false;

        var env = {
          babelConfig: JSON.stringify(context.babelConfig),
          coverage: coverage ? 'enable' : 'disable'
        }
        var NYC = require('nyc');

        if (coverage) {
          require('babel-register')(context.babelConfig);
          var nyc = new NYC({
            extensions: ['.js', '.jsx'],
            exclude: ['dist', 'test', 'coverage']
          });
          nyc.reset();
          nyc.addAllFiles();
        }

        var sw = require('spawn-wrap');
        var foreground = require('foreground-child');
        var testDir = path.join(context.projectDir, 'test');
        var wrapper = require.resolve('./wrap.js');

        sw([wrapper], env);
        foreground(['./node_modules/.bin/mocha', '--recursive', testDir], done => {
          if (coverage) {
            showCoverage(context, reporter, shouldOpen);
          }
          done();
        });
    });

    function showCoverage(context, reporter, shouldOpen) {
      var NYC = require('nyc');
      new NYC({
        reporter: reporter
      }).report();

      if (reporter === 'lcov' || reporter === 'clover') {
        console.log(`Coverage report written to ${chalk.magenta('/coverage')}`);
      }

      if (shouldOpen && reporter === 'lcov') {
        open(path.join(context.projectDir, 'coverage/lcov-report/index.html'));
      }
    }
};
