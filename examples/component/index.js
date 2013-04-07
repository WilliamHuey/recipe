
/**
 * Example:
 *
 *    tower create component my-component
 */

exports.create = function(recipe, args, done){
  var strcase = require('tower-strcase')
    , tinfo = require('tinfo')
    , now = new Date()
    , projectName = args[4];

  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .option('-b --bin [value]', 'include executable', false)
    .option('--component [value]', 'Add component.json', false)
    .option('--package [value]', 'Add package.json', true)
    .option('--travis [value]', 'Add travis.yml', false)
    .option('--namespace [value]', 'Namespace for component');
    .parse(args);
  
  recipe.outputDirectory(options.outputDirectory);

  recipe
    .set('projectName', projectName)
    .set('namespace', options.namespace)
    .set('date', { year: now.getFullYear() })
    .set('strcase', strcase)
    .set('component', options.component)
    .set('componentName', options.namespace ? [options.namespace, projectName].join('/') : projectName)
    .set('pkg', options.package);

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

      if (options.travis)
        recipe.copy('.travis.yml');

      recipe.template('index.js');

      recipe.directory('test', function(){
        recipe.template('index.js', 'test.js');
        if (options.component)
          recipe.template('index.html', 'test.html');
      });
    });

    done();
  }, this);
}