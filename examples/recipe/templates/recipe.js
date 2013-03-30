
/**
 * Example:
 *
 *    tower create <%= projectName %> my-<%= projectName %>
 */

exports.create = function(recipe, args){
  var options = parseArgs(args);
  recipe.outputDirectory(options.outputDirectory);
  recipe.set('projectName', args[3]);
  recipe.template('recipe.js');
}

exports.remove = function(recipe, args){
  var options = parseArgs(args);
  recipe.outputDirectory(options.outputDirectory);
  recipe.removeFile('recipe.js');
}

function parseArgs(args) {
  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .parse(args);

  return options;
}