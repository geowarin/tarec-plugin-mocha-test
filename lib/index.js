module.exports = function mochaPlugin (context, operations) {

    var chalk = operations.resolve('chalk');
    operations.addCommandHelp('mochaTest', `Run tests with mocha. Your tests should be in the ${chalk.magenta('/test')} directory`);

    operations.addPreCommand('mochaTest', (context, args) => {
        process.env['NODE_ENV'] = 'test';
    });

    operations.addCommand('mochaTest', (context, args) => {

        var babel = require('babel-register')(
            context.babelConfig
        );
        var Mocha = require('mocha');

        var mocha = new Mocha();
        mocha.files = Mocha.utils.lookupFiles('test', ['js', 'jsx'], true);

        mocha.run(failures => {
            process.on('exit', () => {
                process.exit(failures);
            });
        });

    });
};
