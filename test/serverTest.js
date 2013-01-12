var generator = require('../server')
  , csfs = require('cs-fs')
  , chai = require('chai')
  , assert = chai.assert;

describe('cs-generator', function() {
  test('define and run a generator', function(done) {
    var called = 0;

    generator('app', process.cwd(), function(complete) {
      called++;
      complete();
    });

    generator('app').run(function() {
      assert.equal(called, 1);
      done();
    });
  });

  test('run generator and pass arguments', function(done) {
    var called = 0;

    generator('app', process.cwd(), function(complete) {
      if (this.foo === 'bar')
        called++;

      complete();
    });

    generator('app').run({foo: 'bar'}, function() {
      assert.equal(called, 1);
      done();
    });
  });

  test('createFile from source to target destination', function(done) {
    generator('app', process.cwd(), function(complete) {
      this.createFile('file.txt', 'x');
      complete();
    });

    generator('app').run({targetPath: 'tmp'}, function() {
      assert.isTrue(this.fileExists('tmp/file.txt'));
      done();
    });
  });

  test('nested file creation', function(done) {
    generator('app', process.cwd(), function() {
      this.createFile('README.md', '# Client/Server Generator');

      this.inside('lib', function() {
        this.createFile('index.js', 'module.exports = {};');
      });

      this.createFile('outside.js', '"asdf"');
    });

    generator('app').run({targetPath: 'tmp'}, function() {
      assert.isTrue(this.fileExists('tmp/README.md'));
      assert.isTrue(this.fileExists('tmp/lib/index.js'), 'tmp/lib/index.js');
      assert.isTrue(this.fileExists('tmp/outside.js'), 'tmp/outside.js');
      done();
    });

    // generator.create('app', {targetPath: 'tmp'}).on('create').run()
  });

  test('invoking sub-generators (with async)', function(done) {
    var invoked = {
        'model': 0
      , 'test:model': 0
    }

    generator('model', function(callback) {
      var _this = this;

      process.nextTick(function() {
        invoked['model']++;
        _this.invoke('test:model', callback);
      });
    });

    generator('test:model', function() {
      invoked['test:model']++;
      this.createFile('modelTest.js', 'describe("App.Model")');
    });

    generator('model').run(function() {
      assert.equal(invoked['model'], 1);
      assert.equal(invoked['test:model'], 1);

      done();
    });
  });
});
