module.exports = function(grunt) {

  grunt.initConfig({

    // linting
    jshint: require('./build/config/jshint'),

    // whitespace rules
    lintspaces: require('./build/config/lintspaces'),

  });

  // load npm plugins (all dependencies that match /^grunt/)
  require('load-grunt-tasks')(grunt);

  // default task
  grunt.registerTask('default', require('./build/tasks/default'));
};
