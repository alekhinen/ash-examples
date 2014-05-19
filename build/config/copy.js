module.exports = {
  main: {
    files: [
      // include stylesheets
      {
        expand: true,
        src: ['src/stylesheets/*'],
        flatten: true,
        dest: 'dist/stylesheets/',
        filter: 'isFile'
      },

      // include images
      {
        expand: true,
        src: ['src/images/*'],
        flatten: true,
        dest: 'dist/images/',
        filter: 'isFile'
      },

      // include unminified bootstrap stylesheet
      {
        expand: true,
        src: ['lib/bootstrap/css/bootstrap.css'],
        flatten: true,
        dest: 'dist/stylesheets/',
        filter: 'isFile'
      },

      // include Ash
      {
        expand: true,
        src: ['lib/Ash.js'],
        flatten: true,
        dest: 'dist/javascripts/',
        filter: 'isFile'
      },

      // include javascripts
      {
        expand: true,
        src: ['src/javascripts/**/*'],
        flatten: true,
        dest: 'dist/javascripts/',
        filter: 'isFile'
      },

      // include recordings.json
      {
        expand: true,
        src: ['src/recordings.json'],
        flatten: true,
        dest: 'dist/',
        filter: 'isFile'
      },

      // include index
      {
        expand: true,
        src: ['src/index.html'],
        flatten: true,
        dest: 'dist/',
        filter: 'isFile'
      },

    ]
  }
};
