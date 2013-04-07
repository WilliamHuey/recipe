# <%= strcase.titleCase(projectName) %>

## Installation
<% if (pkg) { %>
node.js:

```bash
npm install <%= projectName %>
```
<% } %><% if (component) { %>
browser:

```bash
component install <%= componentName %>
```
<% } -%>

## Example

```js
var project = require('<%= projectName %>');
```

## API

Example API methods.

### .on(event, fn, [capture])

Short description of some method:

```js
project.on('event', function(e){

});
```

### .on(event, selector, fn, [capture])

Another description:

```js
project.on('event', 'a.remove', function(e){

});
```

## Notes

## Licence

MIT