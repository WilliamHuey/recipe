# Tower Generator

[![Build Status](https://travis-ci.org/tower/generator.png)](https://travis-ci.org/tower/generator)

Fast code generator.

## Install

Node:

```
npm install tower-generator
```

You can also install it globally and use a simple command-line version of it:

```
npm install tgen -g
```

## Usage

This library doesn't require anything on the command line. It's just the barebones functionality common to generators, and should be easy to build upon.

Define a custom template:

``` javascript
// myTemplateGenerator.js
var generator = require('tower-generator')
  , incase = require('tower-incase');

generator('my-template', function() {
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

module.exports = generator('my-template');
```

Use the template (one way, you can do it however you want):

``` javascript
var myTemplateGenerator = require('./myTemplateGenerator');

myTemplateGenerator.run(function() {
  console.log('complete');
});
```

Potentially later it will just emit JSON for all the actions it performs. This way you can write your own logger for it.

``` javascript
var template = generator('my-template').create();

template.on('createFile', function() {
  console.log('created');
});
```

## Contribute

```
git clone git://github.com/tower/generator.git
cd generator
npm install
```

### Test

Requires `mocha`, `chai` (and, todo, `phantomjs`):

```
brew install phantomjs
npm install mocha -g
npm install phantomjs chai
```

## TODO

Undo feature where it remembers the last state of your app before making changes, and it can reverse it without having to write teardown code.

## Other interesting stuff

- https://github.com/flatiron/nconf

## MIT License

Copyright &copy; 2013 [Lance Pollard](http://lancepollard.com) <lancejpollard@gmail.com>
 
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
