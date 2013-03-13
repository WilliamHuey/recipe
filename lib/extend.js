var mixin = function(obj, props) {
  for (var key in props)
    if (hasProp.call(props, key))
      obj[key] = props[key];
  return obj;
}

var hasProp = {}.hasOwnProperty;

var extend = function(parent, childName, attributes) {
  var child = function() {
    parent.apply(this, arguments);
  }

  mixin(child, parent);

  var fn = function() {};

  fn.prototype = parent.prototype;
  child.prototype = new fn;
  child.prototype.constructor = child;
  child.toString = child.prototype.toString = function() { return childName; }

  if (attributes)
    mixin(child.prototype, attributes);

  return child;
}

extend.mixin = mixin;

module.exports = extend;
