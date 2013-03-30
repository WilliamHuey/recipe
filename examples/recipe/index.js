
/**
 * Example:
 *
 *    tower create recipe my-recipe
 */

exports.create = function(recipe, args){
  var options = parseArgs(args);
  recipe.outputDirectory(options.outputDirectory);
  recipe.set('projectName', args[3]);
  recipe.directory(args[3], function(){
    recipe.template('recipe.js');
    recipe.directory('templates');
  });
}

exports.remove = function(recipe, args){
  var options = parseArgs(args);
  recipe.outputDirectory(options.outputDirectory);
  recipe.removeDirectory(args[3]);
}

function parseArgs(args) {
  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .parse(args);

  return options;
}