App.Recording = Ash.Model.subclass({
  episode_title: function() {
    return this.get('episode_title')
          || this.get('description')
          || 'No info available for this episode';
  },

  air_time: function() {
    var d = new Date(this.get('airing_time'));
    var minu = d.getMinutes(),
      hour = d.getHours() % 12,
      date = d.getDate(),
      mont = d.getMonth() + 1,
      year = d.getYear(),
      meridiem;

    // Set the am/pm
    if (d.getHours() > 12) {
      meridiem = 'pm';
    } else {
      meridiem = 'am';
    }

    // Make sure the minutes display 00 instead of just 0.
    if (minu == 0) {
      minu = "00";
    }

    // If hour displays 0, set it to 1.
    if (hour == 0) {
      hour += 1;
    }

    return hour + ':' + minu + ' ' + meridiem;
  },

  run_time: function() {
    var start = new Date(this.get('start_time'));
    var stop = new Date(this.get('stop_time'));
    // Divide duration by milliseconds in a minute.
    var run = (stop - start) / 60000;

    // Standardize times.
    if (run < 70 && run > 50) {
      run = 60;
    }
    else if (run < 40 && run > 20) {
      run = 30;
    }

    return run + " minutes";
  }
});
