
/**
 * Module dependencies.
 */

var tower = require('tower')
  , app = tower.app('<%= projectName %>')
  , model = app.model
  , route = app.route
  , stream = app.stream;

route('/', 'index')
  .on('GET', function(context){
    context.render('index', { title: '<%= projectName %>' });
  });

app.listen(app.get('port'), function(){
  console.log("Tower server listening on port " + app.get('port'));
});
