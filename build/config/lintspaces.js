module.exports = {
  all: {
    src: [
      'build/**/*.js',
      'Gruntfile.js',
      'src/javascripts/**/*',
      'src/stylesheets/**/*'
    ],
    options: {
      newline: true,
      trailingspaces: true,
      indentation: 'spaces',
      spaces: 2,
      ignores: ['js-comments']
    }
  }
};
