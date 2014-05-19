(function( window ) {

  'use strict';

  var App = new Ash({

    init: function() {
      var self = this;

      this.recordings = new App.Recordings();
      this.recordings.fetch();
      this.recordingsView = new App.View.Recordings({
        collection: this.recordings
      });

      Ash.Dom('.show-all-btn').on('click', function() {
        self.showAll();
      });

      Ash.Dom('.show-saved-btn').on('click', function() {
        self.showSaved();
      });

    },

    // Poor design. Rebuilds the list every single time...
    showAll: function() {
      console.log('display all recordings');
      this.recordingsView = new App.View.Recordings({
        collection: this.recordings
      });

    },

    // Poor design. Rebuilds the list every single time...
    showSaved: function() {
      console.log('display smart collection for saved');
      this.savedRecordings = new App.Saved({
        collection: this.recordings
      });

      this.savedView = new App.View.Saved({
        collection: this.savedRecordings
      });

    }

  });

  // expose the App object so we can debug
  return window.App = App;

})(this);
