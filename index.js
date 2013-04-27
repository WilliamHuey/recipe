
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , program = require('commander')
  , fs = require('tower-fs')
  , ansi = require('ansi')
  , cursor = ansi(process.stdout)
  , slice = [].slice
  , noop = function(){};

/**
 * Expose `Recipe`.
 */

module.exports = Recipe;

Recipe.logging = true;

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
  // program.confirm('destination is not empty, continue? ', function(ok){
  //   process.exit();
  // });
  filePath = this.toOutputPath(filePath);
  fs.createFileSync(filePath, content);
  this.log('create', filePath);
  return this;
}

/**
 * Remove file from the target directory.
 *
 * @param {String} filePath
 * @api public
 */

Recipe.prototype.removeFile = function(filePath){
  filePath = this.toOutputPath(filePath)
  fs.removeFileSync(filePath);
  this.log('remove', filePath);
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
  toPath = this.toOutputPath(toPath || fromPath);
  fs.copyFileSync(this.toInputPath(fromPath), toPath);
  this.log('create', toPath);
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
      // XXX
      //, previousSourcePath = this.sourcePath;
    // program.confirm('destination is not empty, continue? ', function(ok){});

    fs.createDirectorySync(newTargetPath);
    this.log('create', newTargetPath);

    this.targetPath = newTargetPath;

    block.call(this);

    this.targetPath = previousTargetPath;
  } else {
    directoryPath = this.toOutputPath(directoryPath);
    fs.createDirectorySync(directoryPath);
    this.log('create', directoryPath);
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

  if (fs.existsSync(directoryPath)) {
    fs.removeDirectoryRecursiveSync(directoryPath); 
    this.log('remove', directoryPath);
  }

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

Recipe.prototype.exec = function(name, action, args, fn){
  // XXX: pass the locals through
  require('child_process')
    .spawn('tower', [action, name].concat(args), { stdio: 'inherit' })
    .on('exit', fn);

  return this;
}

Recipe.prototype.download = function(){
  
}

Recipe.prototype.upload = function(){

}

// http://reiddraper.com/first-chef-recipe/
Recipe.prototype.package = function(){
  return this;
}

Recipe.prototype.service = function(name, fn){
  return this;
}

Recipe.prototype.path = function(){
  return this;
}

Recipe.prototype.source = function(){
  return this;
}

Recipe.prototype.owner = function(){
  return this;
}

Recipe.prototype.group = function(){
  return this;
}

Recipe.prototype.mode = function(){
  return this;
}

Recipe.prototype.notifies = function(){
  return this;
}

Recipe.prototype.bash = function(){
  return this;  
}

Recipe.prototype.cwd = function(){
  return this;
}

Recipe.prototype.recursive = function(){
  return this;
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

/**
 * Invoke another recipe.
 */

Recipe.prototype.include = function(name){
  //this.invoke
  return this;
}

/**
 * Create a system user.
 */

Recipe.prototype.user = function(){
  return this;
}

Recipe.prototype.gid = function(){
  return this;
}

Recipe.prototype.home = function(){
  return this;
}

Recipe.prototype.shell = function(){
  return this;
}

Recipe.prototype.comment = function(){
  return this;
}

Recipe.prototype.supports = function(){
  return this;
}

// http://docs.opscode.com/resource_remote_file.html
Recipe.prototype.rights = function(){

}

Recipe.prototype.checksum

Recipe.prototype.content = function(){

}

// get or set data from ~/.tower/config/data
Recipe.prototype.data = function(obj){
  //if ('string' === obj)
  return this;
}

Recipe.prototype.log = function(action, filePath){
  if (!Recipe.logging) return;

  cursor
    .write('  ')
    [colors[action]]()
    .write(action)
    .reset()
    .write(' : ' + fs.relativePath(filePath, process.cwd()))
    .write('\n')
    .reset();
}

/**
 * Colors for actions.
 */

var colors = {
    create: 'cyan'
  , remove: 'red'
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