var recipe = require('tower-recipe');

recipe('<%= projectName %>', function() {
  var projectName = this.projectName;

  this.locals({
      projectName: projectName
  });

  this.directory(projectName, function() {
    this.directory('bin', function() {
      this.file(projectName);
      this.executable(projectName);
    });

    this.template('README.md');
    this.template('package.json');
    this.copy('.gitignore');
    this.copy('.npmignore');
    this.copy('.travis.yml');
    this.template('client.js');
    this.template('server.js');

    this.directory('test', function() {
      this.file('clientTest.js');
      this.file('serverTest.js');
    });
  });
});
