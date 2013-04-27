# Tower Recipe

It's a generator, among other things.

TODO:

- be able to save local generators to global (home directory).

## Install

Node:

```
npm install tower-recipe
```

## Usage

This library doesn't require anything on the command line. It's just the barebones functionality common to recipes, and should be easy to build upon.

Define a custom template (`./my-recipe/index.js`):

```js

/**
 * Example:
 *
 *    tower create app my-app
 */

exports.create = function(recipe, args, fn){
  var strcase = require('tower-strcase')
    , tinfo = require('tinfo')
    , now = new Date()
    , projectName = args[3];

  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .option('-b --bin', 'include executable', false)
    .option('--component', 'Add component.json', false)
    .option('--package', 'Add package.json', true)
    .option('--travis', 'Include travis.yml', false)
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

      if (options.travis)
        recipe.copy('.travis.yml');

      recipe.template('app.js')
        .directory('models')
        .directory('routes')
        .directory('templates')
        .directory('views')
        .directory('public', function(){
          recipe.directory('images')
            .directory('javascripts')
            .directory('stylesheets');
        });

      recipe.directory('test', function(){
        recipe.template('index.js', 'test.js');
        recipe.template('index.html', 'test.html');
      });
    });

    fn();
  }, this);
}
```

In addition to `create`, you can use:

```
remove // to undo create
watch  // to do something on watch
update // to update to the latest app structure, for example
list
install
uninstall
build
```

## Notes

- https://github.com/sprinkle-tool/sprinkle