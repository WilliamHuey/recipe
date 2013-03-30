var recipe = require('..')
  , fs = require('tower-fs')
  , assert = require('assert');

describe('recipe', function() {
  before(clearTmp);
  before(function(){
    recipe.lookup();
  });

  it('should lookup recipe', function(){
    var recipes = recipe.recipes;

    assert(recipes.hasOwnProperty('app'));
    assert(recipes.hasOwnProperty('component'));
    assert(recipes.hasOwnProperty('recipe'));

    assert(recipes.component.create);
    assert(recipes.recipe.create);
    assert(recipes.recipe.remove);
    assert(!recipes.recipe.list);
  });

  it('should create a file', function(){
    recipe.exec('recipe', 'create'
      , args('recipe', 'create', 'awesome-recipe', '-o', 'tmp'));
    assert(fs.existsSync('tmp/awesome-recipe/recipe.js'));
  });

  it('should remove a file', function(){
    recipe.exec('recipe', 'create'
      // TODO: reverse recipe/create (verb first)
      , args('recipe', 'create', 'awesome-recipe', '-o', 'tmp'));
    assert(fs.existsSync('tmp/awesome-recipe/recipe.js'));

    recipe.exec('recipe', 'remove'
      , args('recipe', 'remove', 'awesome-recipe', '-o', 'tmp'));
    assert(!fs.existsSync('tmp/awesome-recipe'));
  });

  it('should create a directory', function(done){
    recipe.exec('component', 'create'
      , args('component', 'create', 'awesome-component', '-o', 'tmp')
      , function(){
        assert(fs.existsSync('tmp/awesome-component/README.md'));
        done();
      });
  });
});

function args() {
  return ['node', 'tower'].concat(Array.prototype.slice.call(arguments));
}

function clearTmp() {
  if (fs.existsSync('tmp'))
    fs.removeDirectoryRecursiveSync('tmp');
  
  fs.mkdirSync('tmp');
}