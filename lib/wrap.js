var sw = require('spawn-wrap');

if (process.env.coverage === 'enable') {
  var NYC = require('nyc');

  var nyc = new NYC({
    extension: ['.js', '.jsx'],
    enableCache: false,
    exclude: ['dist', 'test', 'coverage']
  });
  nyc._wrapRequire();
  nyc._wrapExit();
}
var babel = require('babel-register')(JSON.parse(process.env.babelConfig));
require('ignore-styles');

sw.runMain();
