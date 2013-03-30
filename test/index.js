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

    assert(recipes.hasOwnProperty('component'));
    assert(recipes.hasOwnProperty('recipe'));

    assert(recipes.component.create);
    assert(recipes.recipe.create);
    assert(recipes.recipe.remove);
    assert(!recipes.recipe.list);
  });

  it('should create a file', function(){
    recipe.exec('recipe', 'create'
      , ['tower', 'recipe', 'create', 'awesome-recipe', '-o', 'tmp']);
    assert(fs.existsSync('tmp/recipe.js'));
  });

  it('should remove a file', function(){
    recipe.exec('recipe', 'create'
      , ['tower', 'recipe', 'create', 'awesome-recipe', '-o', 'tmp']);
    assert(fs.existsSync('tmp/recipe.js'));

    recipe.exec('recipe', 'remove'
      , ['tower', 'recipe', 'remove', 'awesome-recipe', '-o', 'tmp']);
    assert(!fs.existsSync('tmp/recipe.js'));
  });
});

function argv(args) {
  return ['tower', 'recipe', 'create'].concat(args);
}

function clearTmp() {
  if (fs.existsSync('tmp'))
    fs.removeDirectoryRecursiveSync('tmp');
  
  fs.mkdirSync('tmp');
}