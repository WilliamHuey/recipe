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

``` js
/**
 * Expose `create`.
 */

exports.create = function(argv, done){
  var options = require('commander')
    .parse(argv);

  var strcase = require('tower-strcase')
    , projectName = options.args[0];

  this.locals({
      projectName: projectName
    , projectNameTitle: strcase.titleCase(projectName)
    , userRealName: 'Lance Pollard'
    , userTwitterName: 'viatropos'
    , userGitHubName: 'viatropos'
  });

  this.directory(projectName, function() {
    this.directory('bin', function() {
      this.file(projectName);
      this.executable(projectName);
    });

    this.template('README.md');
    this.template('package.json');
    this.copy('.gitignore');
    this.copy('.npmignore');
    this.copy('.travis.yml');
    this.template('client.js');
    this.template('server.js');

    this.directory('test', function() {
      this.file('clientTest.js');
      this.file('serverTest.js');
    });
  });

  done();
}

/**
 * Expose `remove`.
 */

exports.remove = function(argv, done){
  
}
```

In addition to `create` and `remove`, you can use:

```
watch  // to do something on watch
update // to update to the latest app structure, for example
```

Use the template (one way, you can do it however you want):

``` javascript
var recipe = require('tower-recipe')
  , myRecipe = recipe('my-recipe');

myRecipe.run(function() {
  console.log('complete');
});
```

Potentially later it will just emit JSON for all the actions it performs. This way you can write your own logger for it.

``` javascript
var template = recipe('my-recipe').create();

template.on('createFile', function() {
  console.log('created');
});
```

## TODO

Undo feature where it remembers the last state of your app before making changes, and it can reverse it without having to write teardown code.
