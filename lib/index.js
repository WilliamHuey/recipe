
/**
 * Module dependencies.
 */

var fs = require('tower-fs')
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
  , fs.join(__dirname, '../examples')
];

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
              data.sourcePath = sourcePath;
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

exports.run = function(name, action, args, fn){
  var method = exports.recipes[name][action]
    , recipe = new Recipe;

  // TODO: for nested methods, handle callback.
  if (3 == method.length)
    method.call(recipe, recipe, args, fn || noop);
  else
    method.call(recipe, recipe, args);
}

/**
 * Instantiate a new `Recipe`.
 *
 * @api public
 */

function Recipe() {
  this._locals = {};
  this.context = [];
}

/**
 * Create file in the target directory.
 *
 * @param {String} filePath
 * @param {String} [content]
 * @api public
 */

Recipe.prototype.file =
Recipe.prototype.createFile = function(filePath, content) {
  fs.createFileSync(this.toTargetPath(filePath), content);
  return this;
}

/**
 * Convert a file path to the absolute path in the source directory.
 *
 * @param {String} filePath
 * @api public
 */

Recipe.prototype.toSourcePath = function(filePath) {
  return fs.join(this.sourcePath, filePath);
}

/**
 * Convert a file path to the absolute path in the target directory.
 *
 * @param {String} filePath
 * @api public
 */

Recipe.prototype.toTargetPath = function(filePath) {
  return fs.join(this.targetPath, filePath);
}
