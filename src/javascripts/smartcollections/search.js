App.Search = Ash.SmartCollection.subclass({

  filter: function( model ) {
    var match;
    if (model.get('title')) {
      match = S(model.get('title')).contains(S(this.searchVal).s);
    } else {
      match = false;
    }
    console.log(this.searchVal
      + " SEARCHY ON "
      + model.get('title')
      + " "
      + match);
    return match;
  }

});
