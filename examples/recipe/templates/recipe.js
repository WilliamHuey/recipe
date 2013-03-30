
/**
 * Example:
 *
 *    tower create <%= projectName %> my-<%= projectName %>
 */

exports.create = function(recipe, args){
  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .parse(args);

  recipe.set('projectName', args[3]);

  recipe.outputDirectory(options.outputDirectory);
  recipe.template('recipe.js');
}

exports.remove = function(recipe, args){

}