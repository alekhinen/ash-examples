App.Saved = Ash.SmartCollection.subclass({

  filter: function( model ) {
    return model.get('status') === 'saved';
  },

  sort: function( a, b ) {
    var result = +a.get('start_time') - +b.get('start_time');
    return result;
  }

});
