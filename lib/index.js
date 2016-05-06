module.exports = function myPlugin (context, operations) {

    operations.addPreCommand('test', (context, args) => {
        process.env['NODE_ENV'] = 'test';
    });

    operations.addCommand('test', (context, args) => {

        var babel = require('babel-register')(
            context.babelConfig
        );
        var Mocha = require('mocha');

        var mocha = new Mocha();
        mocha.files = Mocha.utils.lookupFiles('test', ['js'], true);

        mocha.run(failures => {
            process.on('exit', () => {
                process.exit(failures);
            });
        });

    });
};
