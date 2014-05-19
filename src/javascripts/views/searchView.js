App.module('View.Search', function() {
  return Ash.CollectionView.subclass('SearchView', {
    el: '.table',
    view: App.View.Recording,
    target: '.recordings-list',
    events: {

    }
  });
});
