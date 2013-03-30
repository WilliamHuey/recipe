
/**
 * Example:
 *
 *    tower create component my-component
 */

exports.create = function(recipe, args, done){
  var strcase = require('tower-strcase')
    , tinfo = require('tinfo')
    , now = new Date()
    , projectName = args[3];

  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .option('-b --bin', 'include executable', false)
    .option('--component', 'Add component.json', false)
    .option('--package', 'Add package.json', true)
    .option('--both', 'include both', false)
    .parse(args);
  
  recipe.outputDirectory(options.outputDirectory);

  recipe
    .set('projectName', projectName)
    .set('date', { year: now.getFullYear() })
    .set('strcase', strcase);

  tinfo(function(info){
    recipe
      .set('userRealName', info.name)
      .set('userTwitterName', info.username)
      .set('userGitHubName', info.username)
      .set('userEmail', info.email);

    recipe.directory(projectName, function(){
      if (options.bin) {
        recipe.directory('bin', function(){
          recipe.file(projectName);
          recipe.executable(projectName);
        });
      }

      recipe.template('README.md');

      if (options.component)
        recipe.template('component.json');

      if (options.package)
        recipe.template('package.json');

      recipe.copy('.gitignore');
      recipe.copy('.npmignore');
      recipe.copy('.travis.yml');

      recipe.template('index.js');

      recipe.directory('test', function(){
        recipe.template('index.js');
        recipe.template('index.html');
      });
    });

    done();
  }, this);
}