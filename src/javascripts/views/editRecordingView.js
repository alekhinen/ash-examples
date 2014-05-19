App.module('View.EditRecording', function() {
  return Ash.View.subclass('EditRecordingView', {
    el: '.popup-container',
    template: 'edit-recording-template',

    events: {
      'click .submitter': 'updateRecording'
    },

    helpers: {
      poster_url: function( data ) {
        var cdn = 'https://d26nzsixr14s87.cloudfront.net',
          type = data.series_id ? 'series' : 'ent',
          id = type === 'series' ? data.series_id : data.ent_id,
          size = '90x120';
        return [cdn, type, size, id + '.jpg'].join('/');
      }
    },

    init: function() {
      console.log('Hitting edit recording. ' + this.model.get('title'));
      // This is a bug.
      this.render();
    },

    updateRecording: function() {
      console.log('Updating Recording...'
        + Ash.Dom('input#title')[0].value
        + "\n"
        + Ash.Dom('input#episode_title')[0].value);
      // Set title
      this.model.set('title', Ash.Dom('input#title')[0].value);

      // Set episode title if title is not undefined.
      if (Ash.Dom('input#episode_title')[0].value !== 'Undefined') {
        this.model.set('episode_title',
          Ash.Dom('input#episode_title')[0].value);
      }
    }

  });
});
