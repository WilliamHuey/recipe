module.exports = function(argv) {
  var generator = require('./index');
    , templateName = argv[0]
    , options = {
        targetPath: process.cwd()
      , templateName: templateName
      , projectName: argv[1] }

  if (!templateName || templateName.match(/(?:-h|--help)/)) {
      console.log([
          ''
        , 'Usage:'
        , ''
        , '  tower-generate <template> <name>'
        , ''
      ].join("\n"));

      process.exit(); 
    }
  }

  generator('template', {sourcePath: __dirname}, function() {
    var projectName = this.projectName;

    this.directory(projectName, function() {
      this.template('template.js');
      this.directory('templates', function() {
        this.file('README.md', '# <%= projectName %>');
      });
    });
  });

  generator.lookup();

  switch (templateName) {
    case 'edit':
      generator.edit(options.projectName);
      break;
    case 'save':
      generator.save(options.projectName);
      break;
    case 'list':
      generator.list();
      break;
    default:
      generator(options.templateName).run(options);
  }

}
