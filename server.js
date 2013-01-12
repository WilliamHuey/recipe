var tfs = require('tfs')
  , extend = require('./extend')//require('cs-extend');
  , mixin = extend.mixin;

/**
 * Exports is a function.
 * 
 * Examples:
 * 
 *      var generator = require('tgen');
 *      
 *      generator('app', function() {
 *        this.template('README.md');
 *      });
 */

var exports = function(name, options, callback) {
  if (typeof arguments[arguments.length - 1] === 'function') {
    exports.define.apply(exports, arguments);
    return exports;
  } else if (arguments.length === 1) {
    return exports.get(name);
  } else {
    return exports.get(name).create(options, callback);
  }
}

/**
 * All defined generators.
 */

exports.generators = {};

/**
 * Get generator by name.
 */

exports.get = function(name) {
  var generator = exports.generators[name];
  if (!generator) throw new Error('The generator "' + name + '" does not exist');
  return generator;
}

/**
 * Define a generator.
 *
 * Examples:
 *
 *     generator.define('app', process.cwd(), callback)
 *     generator.define('app', {sourcePath: process.cwd(), callback);
 */

exports.define = function(name, options, block) {
  switch (typeof options) {
    case 'string':
      options = {sourcePath: options};
      break;
    case 'function':
      block = options;
      options = {sourcePath: process.cwd()};
      break;
    default:
      options = mixin({}, options);
      break;
  }

  exports.generators[name] = defineGenerator(name, options || {}, block);
}

/**
 * Generator constructor.
 *
 * generator.run('app', {destinationPath: '.'});
 */

function Generator(attributes) {
  this._locals = {};

  this.mixin(attributes);
}

/**
 * Instantiate an run a generator (API).
 *
 * Example:
 *
 *    generator('my-generator').run(callback);
 */

Generator.run = function(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  return this.create(options).run(callback);
}

/**
 * Instantiate a generator (API).
 *
 * Example:
 *
 *    generator('my-generator').create(options).run(callback);
 */

Generator.create = function(options) {
  return new this(options);
}

GeneratorPrototype = Generator.prototype;

/**
 * Adds properties to both the generator and locals.
 *
 * This simplifies passing params between generators that have been
 * invoked inside another generator (cloning generators).
 */

GeneratorPrototype.mixin = function(attributes) {
  if (attributes) {
    mixin(this._locals, attributes);
    mixin(this, attributes);
  }

  return this;
}

/**
 * Create file in the target directory.
 */

GeneratorPrototype.file =
GeneratorPrototype.createFile = function(filePath, content) {
  tfs.createFileSync(this.toTargetPath(filePath), content);
  return this;
}

/**
 * Remove file from the target directory.
 */

GeneratorPrototype.removeFile = function() {
  tfs.removeFile(this.toTargetPath(filePath), content, callback);
  return this;
}

/**
 * Check if file exists.
 */

GeneratorPrototype.fileExists = function(filePath) {
  tfs.fileExistsSync(filePath);
  return this;
}

/**
 * Create directory if it doesn't already exist.
 *
 * Pass a block and all path calculations will be relative
 * to the new directory in the target.
 */

GeneratorPrototype.inside =
GeneratorPrototype.directory =
GeneratorPrototype.createDirectory = function(directoryPath, block) {
  if (block) {
    var previousTargetPath = this.targetPath
      , newTargetPath = this.toTargetPath(directoryPath)
      // TODO
      //, previousSourcePath = this.sourcePath;

    tfs.createDirectorySync(newTargetPath);

    this.targetPath = newTargetPath;

    block.call(this);

    this.targetPath = previousTargetPath;
  } else {
    tfs.createDirectorySync(this.toTargetPath(directoryPath));
  }

  return this;
}

/**
 * Create a new file from a template (ejs currently).
 */

GeneratorPrototype.template = function(templatePath, targetPath) {
  var content = tfs.readFileSync(this.toSourcePath(templatePath))
    , content = require('ejs').render(content.toString(), this.locals());

  return this.createFile(targetPath || templatePath, content);
}

/**
 * Make a file executable (defaults to chmod 755).
 */

GeneratorPrototype.executable = function(filePath, chmod) {
  tfs.chmodSync(this.toTargetPath(filePath), chmod || 0755);
  return this;
}

/**
 * Add variables to use in generator templates.
 */

GeneratorPrototype.locals = function(obj) {
  var locals = this._locals;
  if (obj) mixin(locals, obj);
  return locals;
}

/**
 * Copy a file from source to target path.
 */

GeneratorPrototype.copy = function(fromPath, toPath) {
  tfs.copyFileSync(this.toSourcePath(fromPath), this.toTargetPath(toPath || fromPath));
  return this;
}

/**
 * Create and run a generator from within the currently executing generator.
 */

GeneratorPrototype.invoke = function(name, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else if (!options) {
    options = {};
  }

  options = mixin(options, this.locals());

  return exports.get(name).run(options, callback);
}

/**
 * Run the generator.
 */

GeneratorPrototype.run = function() {
  this._run.apply(this, arguments);
  return this;
}

/**
 * Convert a file path to the absolute path in the source directory.
 */

GeneratorPrototype.toSourcePath = function(filePath) {
  return tfs.join(this.sourcePath, filePath);
}

/**
 * Convert a file path to the absolute path in the target directory.
 */

GeneratorPrototype.toTargetPath = function(filePath) {
  return tfs.join(this.targetPath, filePath);
}

/*
GeneratorPrototype.request = function(url, callback) {
  require('superagent').get(url).end(callback);
}

GeneratorPrototype.injectIntoFile = function() {

}
*/

function defineGenerator(name, options, block) {
  var run = function(options, callback) {
    var _this = this;

    if (typeof options == 'function') {
      callback = options;
      options = undefined;
    }

    if (options)
      mixin(_this, options);

    // this is refactorable; common pattern of two callbacks.
    process.nextTick(function() {
      if (block.length === 0) {
        block.call(_this);
        if (callback)
          callback.call(_this);
      } else {
        block.call(_this, function() {
          if (callback)
            callback.call(_this);
        });
      }
    });
  }

  options._run = run;

  return extend(Generator, name + 'Generator', options);
}

module.exports = exports;
