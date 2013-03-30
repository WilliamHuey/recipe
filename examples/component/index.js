exports.create = function(recipe, argv, done){
  var projectName = this.projectName
    , strcase = require('tower-strcase')
    , tinfo = require('tinfo')
    , now = new Date();

  var options = require('commander')
    .option('-b --bin', 'include executable', false)
    .option('--both', 'include both', false)
    .parse(argv);

  tinfo(function(info) {
    this.locals({
        projectName: projectName
      , userRealName: info.name
      , userTwitterName: info.username
      , userGitHubName: info.username
      , userEmail: info.email
      , date: {
          year: now.getFullYear()
      }
      , strcase: strcase
    });

    this.directory(projectName, function() {
      if (options.bin) {
        this.directory('bin', function() {
          this.file(projectName);
          this.executable(projectName);
        });
      }

      this.template('README.md');
      this.template('component.json');
      this.template('package.json');
      this.copy('.gitignore');
      this.copy('.npmignore');
      this.copy('.travis.yml');
      this.template('index.js');

      this.directory('test', function() {
        this.template('tests.js');
        this.template('index.html');
      });
    });

    done();
  }, this);
}