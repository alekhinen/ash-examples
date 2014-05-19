App.Saved = Ash.SmartCollection.subclass({

  filter: function( model ) {
    return model.get('status') === 'saved';
  }

});
