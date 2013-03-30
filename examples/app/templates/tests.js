var <%= strcase.camelCase(projectName) %> = 'undefined' == typeof window
  ? require('../lib')
  : require('<%= projectName %>'); // how to do this better?

var assert = 'undefined' == typeof window
  ? require('chai').assert
  : require('chaijs-chai').assert;

describe(<%= strcase.camelCase(projectName) %>, function() {
  it('should test', function() {
    assert.equal(1 + 1, 2);
  });
});
