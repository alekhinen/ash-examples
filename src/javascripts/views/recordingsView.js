App.module('View.Recordings', function() {
  return Ash.CollectionView.subclass('RecordingsView', {
    el: '.table',
    view: App.View.Recording,
    target: '.recordings-list',
    events: {

    }
  });
});
