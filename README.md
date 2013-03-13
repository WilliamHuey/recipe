# Tower Recipe

Fast code **generator**.

## Install

Node:

```
npm install tower-recipe
```

## Usage

This library doesn't require anything on the command line. It's just the barebones functionality common to recipes, and should be easy to build upon.

Define a custom template:

``` javascript
// myTemplateRecipe.js
var recipe = require('tower-recipe')
  , incase = require('tower-incase');

recipe('my-template', function() {
  var projectName = this.projectName;

  this.locals({
      projectName: projectName
    , projectNameTitle: incase.titleCase(projectName)
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
});

module.exports = recipe('my-template');
```

Use the template (one way, you can do it however you want):

``` javascript
var myTemplateRecipe = require('./myTemplateRecipe');

myTemplateRecipe.run(function() {
  console.log('complete');
});
```

Potentially later it will just emit JSON for all the actions it performs. This way you can write your own logger for it.

``` javascript
var template = recipe('my-template').create();

template.on('createFile', function() {
  console.log('created');
});
```

## TODO

Undo feature where it remembers the last state of your app before making changes, and it can reverse it without having to write teardown code.
