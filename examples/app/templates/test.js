var <%= strcase.camelCase(projectName) %> = 'undefined' == typeof window
  ? require('..')
  : require('<%= projectName %>'); // how to do this better?

var assert = require('assert');

describe(<%= strcase.camelCase(projectName) %>, function() {
  it('should test', function() {
    assert.equal(1 + 1, 2);
  });
});
