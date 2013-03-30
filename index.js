
/**
 * Module dependencies.
 */

var Emitter = require('emitter-component')
  , fs = require('tower-fs')
  , container = require('tower-container')
  , slice = [].slice
  , noop = function(){};

/**
 * Expose `recipe`.
 */

exports = module.exports = recipe;

function recipe(name, options) {

}

exports.recipes = {};

exports.lookupDirectories = [
    fs.join(process.cwd(), 'recipes')
  , fs.join(process.cwd(), 'lib/recipes')
  , fs.join(process.env.HOME, '.tower/recipes')
  , fs.join(__dirname, 'examples')
];

/**
 * Instantiate a new `Recipe`.
 *
 * @api public
 */

function Recipe(sourcePath) {
  this._locals = {};
  this.context = [];
  this.sourcePath = sourcePath;
  this.targetPath = process.cwd();
}

/**
 * `Emitter` mixin.
 */

Emitter(Recipe.prototype);

/**
 * @api public
 */

Recipe.prototype.set = function(key, val){
  this._locals[key] = val;
  return this;
}

/**
 * @api public
 */

Recipe.prototype.get = function(key){
  return this._locals[key];
}

/**
 * Create file in the target directory.
 *
 * @param {String} filePath
 * @param {String} [content]
 * @api public
 */

Recipe.prototype.file =
Recipe.prototype.createFile = function(filePath, content){
  fs.createFileSync(this.toOutputPath(filePath), content);
  return this;
}

/**
 * Create a new file from a template (ejs currently).
 *
 * @param {String} targetPath
 * @param {String} templatePath
 * @api public
 */

Recipe.prototype.template = function(targetPath, templatePath) {
  var sourcePath = this.toInputPath(templatePath || targetPath)
    , content = fs.readFileSync(sourcePath).toString()
    , locals = this.locals();

  locals.filename = sourcePath;

  content = require('ejs').render(content, locals);

  delete locals.filename;

  this.createFile(targetPath || templatePath, content);
  return this;
}

/**
 * Add variables to use in recipe templates.
 *
 * @param {Object} obj
 * @api public
 */

Recipe.prototype.locals = function(obj) {
  var locals = this._locals;
  if (obj) {
    for (var key in obj) locals[key] = obj[key];
  }
  return locals;
}

/**
 * Set the `sourcePath` in a chainable way.
 *
 * @api public
 */

Recipe.prototype.inputDirectory = function(filePath){
  this.sourcePath = filePath;
  return this;
}

/**
 * Set the `targetPath` in a chainable way.
 *
 * @api public
 */

Recipe.prototype.outputDirectory = function(filePath){
  this.targetPath = filePath;
  return this;
}

/**
 * Convert a file path to the absolute path in the source directory.
 *
 * @param {String} filePath
 * @api public
 */

Recipe.prototype.toInputPath = function(filePath){
  return fs.join(this.sourcePath, filePath);
}

/**
 * Convert a file path to the absolute path in the target directory.
 *
 * @param {String} filePath
 * @api public
 */

Recipe.prototype.toOutputPath = function(filePath){
  return fs.join(this.targetPath, filePath);
}

/**
 * Searches through these directories to find templates:
 *     - ./recipes
 *     - ./lib/recipes
 *     - ~/.tower/recipes
 *
 * Note: this will probably be moved to a separate library.
 */

exports.lookup = function(directories, depth) {
  directories || (directories = exports.lookupDirectories);

  if (depth == null) depth = 2;

  directories.forEach(function(directoryPath, i) {
    directories[i] = fs.absolutePath(directoryPath);
  });

  var recipePath, sourcePath, data;

  function lookup(directoryPath, currentDepth, namespace) {
    var traverseNext = currentDepth < depth;

    if (fs.existsSync(directoryPath)) {
      fs.directoryNamesSync(directoryPath).forEach(function(recipeName) {
        if ('templates' == recipeName) return;

        recipePath = fs.join(directoryPath, recipeName);

        // TODO: somehow handle looking up node_modules
        if (directoryPath.match(/(node_modules)$/))
          return;

        if (namespace)
          recipeName = namespace + ':' + recipeName;

        try {
          sourcePath = fs.join(recipePath, 'index.js'); //fs.join(recipePath, 'templates');

          if (fs.existsSync(sourcePath)) {
            data = require(recipePath);
            if (data) {
              data.sourcePath = fs.join(recipePath, 'templates');
              exports.recipes[recipeName] = data;
            }
          } else {
            if (traverseNext)
              lookup(recipePath, currentDepth + 1, recipeName);
          }
        } catch (error) {
          if (traverseNext)
            lookup(recipePath, currentDepth + 1, recipeName);
          //
        }
      });
    }
  }

  directories.forEach(function(directoryPath) {
    lookup(directoryPath, 0);
  });
}

/**
 * Execute `action` on recipe `name`.
 *
 * @param {String} name Name of the recipe.
 * @param {String} action Action (verb) the recipe implements.
 * @param {Array} args Arguments passed in from the command line (process.argv).
 * @param {Function} [fn] callback.
 * @api public
 */

exports.exec = function(name, action, args, fn){
  var data = exports.recipes[name]
    , method = data[action]
    , recipe = new Recipe(data.sourcePath);

  // TODO: for nested methods, handle callback.
  if (3 == method.length)
    method.call(recipe, recipe, args, fn || noop);
  else
    method.call(recipe, recipe, args);
}
