
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
 * Check if file exists.
 *
 * @param {String} filePath
 * @api public
 */

Recipe.prototype.exists = function(filePath){
  return fs.existsSync(filePath);
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
 * Remove file from the target directory.
 *
 * @param {String} filePath
 * @api public
 */

Recipe.prototype.removeFile = function(filePath){
  fs.removeFileSync(this.toOutputPath(filePath));
  return this;
}

/**
 * Copy a file from source to target path.
 *
 * @param {String} fromPath
 * @param {String} [toPath]
 * @api public
 */

Recipe.prototype.cp =
Recipe.prototype.copy = function(fromPath, toPath){
  fs.copyFileSync(this.toInputPath(fromPath), this.toOutputPath(toPath || fromPath));
  return this;
}

/**
 * Create a new file from a template (ejs currently).
 *
 * @param {String} targetPath
 * @param {String} templatePath
 * @api public
 */

Recipe.prototype.template = function(targetPath, templatePath){
  var sourcePath = this.toInputPath(templatePath || targetPath)
    , content = fs.readFileSync(sourcePath).toString()
    , locals = this._locals;

  locals.filename = sourcePath;

  content = require('ejs').render(content, locals);

  delete locals.filename;

  this.createFile(targetPath || templatePath, content);
  return this;
}

/**
 * Create directory if it doesn't already exist.
 *
 * Pass a block and all path calculations will be relative
 * to the new directory in the target.
 *
 * @param {String} directoryPath
 * @api public
 */

Recipe.prototype.inside =
Recipe.prototype.directory =
Recipe.prototype.createDirectory = function(directoryPath, block){
  if (block) {
    var previousTargetPath = this.targetPath
      , newTargetPath = this.toOutputPath(directoryPath)
      // TODO
      //, previousSourcePath = this.sourcePath;

    fs.createDirectorySync(newTargetPath);

    this.targetPath = newTargetPath;

    block.call(this);

    this.targetPath = previousTargetPath;
  } else {
    fs.createDirectorySync(this.toOutputPath(directoryPath));
  }

  return this;
}

/**
 * Remove directory recursively if it exists.
 *
 * @param {String} directoryPath
 * @api public
 */

Recipe.prototype.removeDirectory = function(directoryPath){
  directoryPath = this.toOutputPath(directoryPath);
  
  if (fs.existsSync(directoryPath))
    fs.removeDirectoryRecursiveSync(directoryPath);

  return this;
}

/**
 * Make a file executable (defaults to chmod 755).
 *
 * @param {String} filePath
 * @param {Number} chmod 0755
 * @api public
 */

Recipe.prototype.executable = function(filePath, chmod){
  fs.chmodSync(this.toOutputPath(filePath), chmod || 0755);
  return this;
}

/**
 * Create and run a recipe from within the currently executing recipe.
 *
 * @param {String} name
 * @api public
 */

Recipe.prototype.invoke = function(name, action, args, fn){
  // TODO: pass the locals through
  exports.exec(name, action, args, fn);
  return this;
}

Recipe.prototype.download = function(){
  
}

Recipe.prototype.upload = function(){

}

// http://reiddraper.com/first-chef-recipe/
Recipe.prototype.package = function(){

}

Recipe.prototype.service = function(name, fn){

}

Recipe.prototype.path = function(){

}

Recipe.prototype.source = function(){

}

Recipe.prototype.owner = function(){

}

Recipe.prototype.group = function(){

}

Recipe.prototype.mode = function(){

}

Recipe.prototype.notifies = function(){

}

Recipe.prototype.bash = function(){

}

Recipe.prototype.cwd = function(){

}

Recipe.prototype.cwd = Recipe.prototype.cd;

Recipe.prototype.code = function(){

}

Recipe.prototype.env = function(){

}

Recipe.prototype.action = function(){

}

Recipe.prototype.platform = function(){

}

// http://docs.opscode.com/resource_remote_file.html
Recipe.prototype.rights = function(){

}

Recipe.prototype.checksum

Recipe.prototype.content = function(){

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

exports.lookup = function(directories, depth){
  directories || (directories = exports.lookupDirectories);
  
  if (depth == null) depth = 2;

  directories.forEach(function(directoryPath, i){
    directories[i] = fs.absolutePath(directoryPath);
  });

  var recipePath, sourcePath, data;

  function lookup(directoryPath, currentDepth, namespace) {
    var traverseNext = currentDepth < depth;

    if (fs.existsSync(directoryPath)) {
      fs.directoryNamesSync(directoryPath).forEach(function(recipeName){
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
          // self.emit('error', error);
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

  return exports;
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
