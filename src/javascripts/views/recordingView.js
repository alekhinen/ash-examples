App.module('View.Recording', function() {
  return Ash.View.subclass('RecordingView', {
    template: 'recording-template',
    tagName: 'tr',
    className: 'recording',

    events: {
      'change': 'render',
      'click *': 'displayPopup'
    },

    helpers: {

      episode_title: function() {
        return this.model.episode_title();
      },

      air_time: function() {
        return this.model.air_time();
      },

      run_time: function() {
        return this.model.run_time();
      },

    },

    // init: function() {
    //   var self = this;
    //   this.el.on('click', function() {
    //     return self.alertMe();
    //   });
    // },

    displayPopup: function() {
      console.log('You clicked a recording');
      new App.View.RecordingPopup({model: this.model});
    }

  });
});
