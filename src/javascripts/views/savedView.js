App.module('View.Saved', function() {
  return Ash.CollectionView.subclass('SavedView', {
    el: '.table',
    view: App.View.Recording,
    target: '.recordings-list',
    events: {

    }
  });
});
