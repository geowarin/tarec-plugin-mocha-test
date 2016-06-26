module.exports = function mochaPlugin (context, operations) {

    var chalk = operations.dependencies.resolve('chalk');
    var open = operations.dependencies.resolve('open');
    var path = require('path');
    var fs = require('fs');

    operations.commands.add('mochaTestReport')
        .summary(`Display a previously generated coverage report.`)
        .option('reporter', {
            alias: 'r',
            default: 'lcov',
            describe: 'Choose coverage reporter. Accepted values: text, clover, lcov. Default: lcov'
        })
        .option('open', {alias: 'o', default: 'lcov', describe: 'Open the report if possible'})
        .apply((context, args) => {
            showCoverage(context, args.reporter, args.open);
        });


    operations.commands.add('mochaTest')
        .summary(`Run tests with mocha. Your tests should be in the ${chalk.magenta('/test')} directory`)
        .option('coverage', {default: false, describe: 'Generate coverage'})
        .option('reporter', {alias: 'r', default: 'text', describe: 'Choose coverage reporter (lcov, text, clover...)'})
        .option('open', {alias: 'o', default: false, describe: 'Open the report if possible'})
        .example(`Pass options to mocha: ${chalk.green('tarec mochaTest -- -w')}`)
        .example(`Open html report: ${chalk.green('tarec mochaTest --coverage -r lcov -o')}`)
        .before(() => {
            process.env['NODE_ENV'] = 'test';
        })
        .apply((context, args) => {

            var coverage = args.coverage;
            var reporter = args.reporter;
            var shouldOpen = args.open;

            var moreOptions = args._.slice(1);

            var env = {
                babelConfig: JSON.stringify(context.babelConfig),
                coverage: coverage ? 'enable' : 'disable'
            };
            var NYC = require('nyc');

            if (coverage) {
                require('babel-register')(context.babelConfig);
                var nyc = new NYC({
                    extensions: ['.js', '.jsx'],
                    exclude: ['dist', 'test', 'coverage'],
                    include: ['src']
                });
                nyc.reset();
                nyc.addAllFiles();
            }

            var sw = require('spawn-wrap');
            var foreground = require('foreground-child');
            var testDir = path.join(context.projectDir, 'test');
            var wrapper = require.resolve('./wrap.js');

            var mochaCmd = ['./node_modules/.bin/mocha', '--recursive'];
            if (moreOptions.length > 0) {
                mochaCmd.push(...moreOptions);
            }
            mochaCmd.push(testDir);

            sw([wrapper], env);
            foreground(mochaCmd, done => {
                if (coverage) {
                    showCoverage(context, reporter, shouldOpen);
                }
                done();
            });
        });

    function showCoverage (context, reporter, shouldOpen) {
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
