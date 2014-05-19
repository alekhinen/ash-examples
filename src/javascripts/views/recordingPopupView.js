App.module('View.RecordingPopup', function() {
  return Ash.View.subclass('RecordingViewPopup', {
    el: '.popup-container',
    template: 'recording-popup-template',

    events: {
      change: 'render',
      'click .popup-bg': 'hidePopup',
      'click a.closer': 'hidePopup',
      'click a.edit': 'editModel'
    },

    helpers: {

      poster_url: function( data ) {
        var cdn = 'https://d26nzsixr14s87.cloudfront.net',
          type = data.series_id ? 'series' : 'ent',
          id = type === 'series' ? data.series_id : data.ent_id,
          size = '90x120';
        return [cdn, type, size, id + '.jpg'].join('/');
      },

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

    init: function() {
      console.log('Hitting recordingPopup. ' + this.model.get('title'));
      // This is a bug.
      this.render();
    },

    hidePopup: function() {
      Ash.Dom('.popup-bg').hide();
    },

    editModel: function() {
      console.log('About to hit edit recording');
      new App.View.EditRecording({
        model: this.model
      });
    }

  });
});
