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

      Ash.Dom('.search-btn').on('click', function() {
        self.search(Ash.Dom('#search')[0].value);
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

    },

    // Only searches all recordings. Should search based on which collection
    // is viewed.
    search: function( searchValue ) {
      console.log('commencing search on ' + searchValue);
      this.searchedRecordings = new App.Search({
        collection: this.recordings,
        searchVal: searchValue
      });

      this.searchedView = new App.View.Search({
        collection: this.searchedRecordings
      });
    }

  });

  // expose the App object so we can debug
  return window.App = App;

})(this);
