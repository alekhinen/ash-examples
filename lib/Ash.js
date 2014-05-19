/* exported Ash */
var Ash = (function( window, undefined ) {

  'use strict';

  // mother class and namespace
  var Ash = _subclass.call('Ash', Object, {
    extend: _extend,
    construct: function( props ){
      this.extend( props );
    }
  });
  
  // create a subclass
  function _subclass ( name ) {
    /* jshint evil:true */
    // save a reference to the parent class's prototype
    var _super = _type(this) === 'function' ? this.prototype : {},
      slice = Array.prototype.slice,
      args = slice.call(arguments, _type(name) === 'string' ? 1 : 0),
      Class;
  
    // class name provided? use it
    name = _type(name) === 'string' ? name :
      // can we inherit a class name from the superclass?
      this && this.name ? this.name
      // fall back to 'Ash'
      : 'Ash';
  
    // no way of around it. this would break the generated Class constructor
    if ( name === 'arguments' || name === 'øbj' ) {
      throw new Error('Invalid class name');
    }
  
    // create a constructor with a legit name
    Class = new Function('x',
      'return function ' + name + '() { ' +
        // use a weird var name to avoid collisions with the class name
        'var øbj = this instanceof ' + name + ' ? ' +
          // avoid using Object.create directly in case our class name is
          // 'Object', which would overshadow the real Object constructor
          'this : ({}).constructor.create(' + name + '.prototype);' +
        'return øbj.construct.apply(øbj, arguments) || øbj;' +
      '};'
    )();
  
    // if the current scope is a constructor, instantiate it
    // and set it as the subclass prototype, for inheritance
    Class.prototype = _type( this ) === 'function' ?
      Object.create(this.prototype) : {};
    // extend the prototype with any arguments, as mixins
    _extend.apply( Class.prototype, args );
    // define the correct constructor
    Class.prototype.constructor = Class;
    // add a reference to the parent class's prototype
    Class.prototype._super = _super;
    // static method for reproduction
    Class.subclass = _subclass;
    return Class;
  }
  
  Ash.def = Ash.prototype.def = _def;
  
  function _def ( name, value ){
  
    // if name is undefined, it is also not a string
    if ( typeof name !== 'string' ){
      throw new TypeError('def `name` must be of type string.');
    }
  
    // indented variables, oh me oh my
    var setter = ( arguments.length > 1 ),
      keys = name.split('.'),
      last = keys.pop(),
      len = keys.length,
      node = this,
      i = 0,
      key = keys[i];
  
    // traverse the namespace
    for ( i; i < len; key = keys[ ++i ] ){
      // getter mode, bail when any node is undefined
      if ( !setter && !node[ key ] ) {
        return;
      }
      // setter mode, define any node that's undefined
      node = node[ key ] = node[ key ] || {};
    }
  
    if ( setter ){
      node[ last ] = value;
    }
  
    return node[ last ];
  
  }
  
  Ash.undef = Ash.prototype.undef = _undef;
  
  function _undef ( name ) {
    return _def.call( this, name, null );
  }
  
  Ash.module = Ash.prototype.module = _module;
  
  function _module( name, obj ){
  
    if (name === 'module') {
      throw new Error('`module` is a reserved namespace.');
    }
    if (!name) {
      throw new Error('Module name required.');
    }
    if ( _type(name) !== 'string') {
      throw new TypeError('Module name must be of type string.');
    }
  
    if ( _type(obj) === 'function') {
      obj = obj(this);
    }
  
    return _def.call( this, name, obj );
  
  }
  

  function _contains( value ) {
    var indexOf = Array.prototype.indexOf,
      list = this,
      index;
  
    // Delegate to Array.prototype.indexOf
    if ( _type(list) === 'array' && indexOf ) {
      index = indexOf.call(list, value);
      return index === -1 ? false : true;
    }
  
    return _some.call(list, function( element ){
      return element === value;
    });
  }
  
  Ash.def('array.contains', function( list, value ){
    return _contains.call(list, value);
  });
  
  Ash.def('array.each', function( subject, callback, context ){
    return _each.call( subject, callback, context );
  });
  
  function _each ( callback, context ){
    var key,
      keys,
      i = 0,
      subject = this,
      len = subject.length,
      ctx = context || subject,
      isArray = _type(len) === 'number';
  
    if ( !isArray ) {
      keys = _keys(subject);
      len = keys.length;
    }
  
    for ( ; i < len; ++i ) {
      key = isArray ? i : keys[i];
      if ( callback.call(ctx, subject[key], key, subject) === false ) {
        break;
      }
    }
  
    return subject;
  }
  
  function _every( iterator, context ) {
    // Delegate to Array.prototype.every (ES5)
    var every = Array.prototype.every,
      list = this,
      subject = context || this,
      pass = true;
  
    if ( Ash.util.type.array(list) && every ) {
      return every.call(list, function(){
        return iterator.apply(subject, arguments);
      });
    }
  
    _each.call(list, function( item, index, list ){
      if ( !iterator.call(subject, item, index, list) ) {
        return pass = false;
      }
    });
  
    return pass;
  }
  
  Ash.def('array.every', function( list, iterator, context ) {
    return _every.call(list, iterator, context);
  });
  
  function _filter( callback, context ) {
    return Ash.array.map(this, function( val, k, s ) {
      return callback.call(this, val, k, s) ? val : undefined;
    }, context);
  }
  
  Ash.def('array.filter', function( subject, callback, context ) {
    return _filter.call(subject, callback, context);
  });
  
  Ash.def('array.map',function( subject, callback, context ){
    return _map.call( subject, callback, context );
  });
  
  function _map ( callback, context ){
    var subject = this,
      copy = new ( subject.constructor )();
    _each.call( subject, function( val, key ){
      val = callback.call( this, val, key, subject );
      if ( val !== undefined ){
        copy.push ? copy.push( val ) : ( copy[ key ] = val );
      }
    }, context || copy );
    return copy;
  }
  
  function _pluck( list, propName ) {
    var results;
  
    if ( _type(list) !== 'array' ) {
      return [];
    }
  
    results = [];
    _each.call(list, function(item){
      if ( _type(item) === 'object' && item[propName] ) {
        results.push(item[propName]);
      }
    });
  
    return results;
  }
  
  Ash.def('array.pluck', _pluck);
  
  function _some( iterator, context ) {
    var list = this,
      subject = context || list,
      pass = false;
  
    // Delegate to native Array.prototype.some (ES5)
    if ( _type(list) === 'array' && Array.prototype.some ) {
      return Array.prototype.some.call(list, function(){
        return iterator.apply(subject, arguments);
      });
    }
  
    _each.call(subject, function( item, i ,list ){
      if ( iterator.call(this, item, i, list) ) {
        return !( pass = true );
      }
    });
  
    return pass;
  }
  
  Ash.def('array.some', function( list, iterator, context ){
    return _some.call(list, iterator, context);
  });
  
  Ash.def('array.like',function( obj ){
    var type = _type( obj );
    return type === 'object' && obj !== window ?
      _type.number( obj.length ) : type === 'array';
  });
  

  Ash.def('object.extend', function( target ) {
    return _extend.apply( target, Array.prototype.slice.call( arguments, 1 ) );
  });
  
  // object property extension
  function _extend (){
    // local vars, grumble grumble
    var args = arguments,
      len = args.length,
      target = this,
      key,
      obj,
      i;
    // iterate each argument
    for ( i = 0; i < len; i++ ){
      // ensure truthiness
      if ( obj = args[i] ){
        // iterate the props of each arg
        for ( key in obj ){
          // only take local properties
          if ( !obj.hasOwnProperty || obj.hasOwnProperty( key ) ){
            if ( obj[key] != null ) {
              // copy over the key/value
              target[ key ] = obj[ key ];
            }
          }
        }
      }
    }
    // the extended object
    return target;
  }
  
  Ash.def('object.each', function( subject, callback, context ){
    return _each.call( subject, callback, context );
  });
  
  function _keys( obj ) {
    var keys, key;
    if ( Object.keys ) {
      return Object.keys(obj);
    }
    if ( _type( obj ) !== 'function' && _type( obj ) !== 'object' ) {
      throw new TypeError('Object.keys called on a non-object');
    }
    keys = [];
    for ( key in obj ) {
      // DOM nodes in old IE don't have `hasOwnProperty`,
      // so steal it from Object.prototype
      if ( Object.prototype.hasOwnProperty.call(obj, key) ) {
        keys.push(key);
      }
    }
    return keys;
  }
  
  Ash.def('object.keys', _keys);
  
  function _size( obj ) {
    var type = Ash.util.type;
    if ( !( type.object(obj) || type.array(obj) ) ) {
      return 0;
    }
    return (obj.length === +obj.length) ? obj.length : _keys(obj).length;
  }
  
  Ash.def('object.size', _size);
  

  /* jshint -W101 */
  Ash.module('string.template', function() {
  
    var valRe = (/\{\{\s*([a-z0-9_\$][\.a-z0-9_\$]*)\s*\}\}/gi),
      blockRe = (/\{\{(\?|!)([a-z0-9_\$][\.a-z0-9_\$]*)\s*\}\}([\s\S]+?)\{\{\/\2\}\}/gi);
  
    function cache ( id ) {
      return cache[id] ? cache[id]
        : ( cache[id] = ( document.getElementById(id) || {} ).innerHTML || '');
    }
  
    return function template ( id, data ) {
      return cache( id ).replace(blockRe, function( match, op, key, content ) {
        var val = _def.call(data, key), output = '';
        if ( Ash.array.like(val) && op === '?' ) {
          _each.call(val, function( value ) {
            output += content.replace(/\{\{\.\}\}/gi, value);
          });
        }
        else if ( op === '?' && val || op === '!' && !val ) {
          output = content;
        }
        return output;
      })
      .replace(valRe, function( tag, ns ) {
        // optimize for the common case (not namespaces)
        if ( ns.indexOf('.') === -1 ) {
          return data[ns];
        }
        return _def.call( data, ns ) || '';
      });
    };
  
  });
  

  Ash.module('util.async', function() {
  
    var queue = [], scheduleFlush;
  
    // call each queued function
    function flush() {
      // can't cache length here because a queued function
      // can schedule another task and mutate the length
      for ( var i = 0; i < queue.length; ++i ) {
        try {
          queue[i]();
        }
        catch ( e ) {}
      }
      queue = [];
    }
  
    // use a MutationObserver as the method for
    // scheduling a flush
    function useMutationObserver() {
      var iterations = 0,
        observer = new MutationObserver(flush),
        el = document.createTextNode('');
      observer.observe(el, {characterData: true});
  
      return function() {
        // make sure the data definitely changes each time
        el.data = ( iterations = ++iterations % 2 );
      };
    }
  
    // use postMessage as the method for
    // scheduling a flush
    function usePostMessage() {
      window.addEventListener('message', function( e ) {
        if ( e.source === window && e.data === 'ash-tick' ) {
          if ( e.stopPropagation ) {
            e.stopPropagation();
          }
          flush();
        }
      });
  
      return function() {
        window.postMessage('ash-tick', '*');
      };
    }
  
    // use setTimeout as the method for
    // scheduling a flush
    function useSetTimeout() {
      return function() {
        setTimeout(flush, 0);
      };
    }
  
    // determine the method of flush scheduling
    scheduleFlush = window.MutationObserver ? useMutationObserver() :
      window.postMessage ? usePostMessage() :
      useSetTimeout();
  
    // public API
    return function( fn ) {
      if ( !_type.function(fn) ) {
        throw new TypeError('Ash.util.async argument must be a function');
      }
      if ( queue.push(fn) === 1 ) {
        scheduleFlush();
      }
    };
  
  });
  
  Ash.module('util.guid', function() {
    var counter = 0;
    return function( str ) {
      return ( str || '' ) + '#' + ( ++counter );
    };
  });
  
  Ash.def('util.type', _type );
  
  _each.call([
      'array',
      'boolean',
      'date',
      'error',
      'function',
      'null',
      'number',
      'object',
      'regexp',
      'string',
      'undefined'
    ], function( type ){
      _type[ type ] =  function( arg ){
        return ( _type( arg ) === type );
      };
    }
  );
  
  function _type ( arg ){
    var type = ( typeof arg ), types;
    // optimize for common primitives
    switch ( type ) {
      case 'boolean':
      case 'string':
      case 'number':
      case 'undefined':
        return type;
    }
    types = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regexp',
      '[object Error]': 'error'
    };
    return arg === null ?
      String( arg ) :
      ( types[ types.toString.call( arg ) ] || 'object' );
  }
  
  Ash.module('util.storage', function() {
  
    // only use stored data for this long
    var _maxage = 144e5, // ms
      // test if localStorage is supported
      _storage,
      // holds storage keys in order of most recently used
      _manifest = [];
  
    // test support, set vars
    // accepts a "obj" object to allow for testing
    function _init( obj ) {
      var global = obj || window, key = 'ash';
      _storage = ( 'localStorage' in global &&
        _set(key, 1) &&
        _get(key) &&
        _unset(key)
      );
      _manifest.length = 0;
      if ( _storage ) {
        Array.prototype.push.apply(_manifest, _keys(global.localStorage));
      }
    }
  
    // get a localStorage value, or undefined
    function _get ( key ) {
      var str, data, age;
      try {
        str = window.localStorage.getItem( key );
        data = JSON.parse( str || '[]' );
        age = Date.now() - data[1] || 0;
        if ( age < _maxage ) {
          return data[0];
        } else {
          _unset( key );
        }
      }
      catch ( ex ){
        return;
      }
    }
  
    // set a localStorage value, true on success
    function _set ( key, value ) {
      // wrapper around value to include timestamp
      var data = [ value, Date.now() ],
        // serialize the value
        str = JSON.stringify( data );
      try { // attempt to set it...
        window.localStorage.setItem( key, str );
      }
      catch ( ex ) { // failed...
        // make some room in the cache...
        _flush( str.length );
        try { // re-attempt to set it...
          window.localStorage.setItem( key, str );
        }
        catch ( e ) {
          return false;
        }
      }
      // success
      return true;
    }
  
    // remove a localStorage value, true on success
    function _unset ( key ) {
      try {
        var str = window.localStorage.getItem( key );
        window.localStorage.removeItem( key );
        return str.length; // chars removed
      }
      catch ( ex ) {
        //B2.log('B2.storage _unset ~ ', ex );
        return 0;
      }
    }
  
    // flush least recently accessed items from storage
    // to a length of characters
    function _flush ( chars ) {
      var removed = 0;
      if ( _type.number(chars) ) {
        // loop through the manifest
        while ( removed < chars && _manifest.length ) {
          // remove the first item of the array
          removed += _unset( _manifest.shift() );
        }
      }
      // the number of characters removed
      return removed;
    }
  
    // clean out everything
    function _clear () {
      // loop through the manifest
      while ( _manifest.length ) {
        // remove the first item of the array
        _unset( _manifest.shift() );
      }
    }
  
    // add a key to the manifest
    function _add ( key ) {
      // filter out old position
      _remove( key );
      // put in the back of the array
      _manifest.push( key );
    }
  
    // remove a key from the manifest
    function _remove ( key ) {
      var i = 0, len = _manifest.length;
      // iterate the manifest
      for ( ; i < len; ++i ) {
        // matched a key (allow type coercion)
        /*jshint eqeqeq:false */
        if ( key == _manifest[i] ) {
          // remove it from the array
          _manifest.splice( i, 1 );
          break;
        }
      }
    }
  
    _init();
  
    // set the public storage api
    return {
      init: _init,
      index: _manifest,
      get: function( key ) {
        var value;
        if ( !_storage ) {
          return;
        }
        // fetch the data
        value = _get( key );
        // not null or undefined
        if ( value != null ) {
          // put in the front
          _add( key );
        }
        return value;
      },
      set: function( key, value ) {
        if ( !_storage ) {
          return;
        }
        // set succeeded
        if ( _set( key, value ) ) {
          // put in the front
          _add( key );
        }
      },
      unset: function( key ) {
        if ( !_storage ) {
          return;
        }
        // something was removed
        if ( _unset( key ) ) {
          // update the manifest
          _remove( key );
        }
      },
      flush: function( chars ) {
        if ( !_storage ) {
          return;
        }
        return chars === true ? _clear() : _flush( chars );
      }
    };
  
  });
  

  Ash.expando = 'Ash' + Date.now();
  
  function _cache( obj, remove ) {
    if ( !obj[Ash.expando] ) {
      obj[Ash.expando] = Ash.util.guid();
    }
    if ( remove === true ) {
      delete _cache[obj[Ash.expando]];
      return;
    }
    if ( _cache[obj[Ash.expando]] ) {
      return _cache[obj[Ash.expando]];
    }
    return _cache[obj[Ash.expando]] = {events: {}, data: {}};
  }
  
  // cache split arrays of event types
  // e.g. typecache['click touchend'] = ['click', 'touchend']
  // used internally by event.on, event.off, and event.emit for
  // faster lookups of previously-encountered event strings
  var _typecache = {};
  
  Ash.module('event.on', function() {
  
    // create a single "master" handler for all DOM events
    // of a given type
    function bind( type, cache ) {
      cache.events[type].handler = handler;
      this.addEventListener(type, cache.events[type].handler, false);
    }
  
    // generic event handler for DOM nodes
    function handler( ev ) {
      var events = _cache(ev.currentTarget).events[ev.type],
        len = events.length, selector, i = 0;
      for ( ; i < len; ++i ) {
        selector = events[i].selector;
        if ( !selector || _matches(ev.target, selector) ) {
          events[i].callback.call(events[i].context || ev.target, ev);
        }
      }
    }
  
    // add a new event to the object cache
    function add( self, type, selector, handler, context, cache ) {
      var evts = cache.events[type] || ( cache.events[type] = [] );
      evts.push({
        callback: handler,
        ctx: context || self,
        context: context,
        selector: selector
      });
      if ( ( self.addEventListener ) && !evts.handler ) {
        bind.call(self, type, cache);
      }
    }
  
    // listen to an event on `this`
    function internal( type, selector, handler, context ) {
      var types, cache, len, i;
  
      // not a DOM node, or DOM node not using delegation
      if ( typeof selector !== 'string' ) {
        context = handler;
        handler = selector;
        selector = null;
      }
  
      cache = _cache(this);
  
      // avoid split and looping if we only have 1 event type
      if ( type.indexOf(' ') === -1 ) {
        add(this, type, selector, handler, context, cache);
        return;
      }
  
      // skip a costly split operation (and the associated allocation)
      // if we've already seen this event string
      types = _typecache[type] || ( _typecache[type] = type.split(' ') );
  
      for ( i = 0, len = types.length; i < len; ++i ) {
        add(this, types[i], selector, handler, context, cache);
      }
    }
  
    // listen to an event somewhere else, but store a reference
    // to the binding on `this` so it's easy to unbind later
    function external( obj, type, handler ) {
      var listeners, id;
      listeners = this._listeners || ( this._listeners = {} );
      id = obj._listenerId || (obj._listenerId = Ash.util.guid());
      listeners[id] = obj;
      obj.on(type, handler, this);
    }
  
    // public interface
    return function ( type, handler ) {
      // simple event binding
      if ( typeof type === 'string' ) {
        // optimize for the common case
        if ( arguments.length === 2 ) {
          internal.call(this, type, handler);
        }
        else {
          internal.apply(this, arguments);
        }
      // external event binding
      } else {
        external.apply(this, arguments);
      }
      return this;
    };
  
  });
  
  Ash.module('event.off', function() {
  
    // split on event type string or return the names of all
    // bound events if no arg is passed
    function getEventKeys( type, cache ) {
      // skip a costly split operation (and the associated allocation)
      // if we've already seen this event string
      return type ? _typecache[type] || ( _typecache[type] = type.split(' ') ) :
        _keys(cache.events);
    }
  
    // does an event match the supplied callback, context, and selector?
    function evtMatch( evt, handler, context, selector ) {
      return !(
        handler && evt.callback !== handler ||
        context && evt.context !== context ||
        selector && evt.selector !== selector
      );
    }
  
    // unbind events bound to `this`
    function internal( type, selector, handler, context ) {
      var types, cache, i, len, copy, evts, j, len2;
  
      // not a DOM node, or DOM node not using delegation
      if ( typeof selector !== 'string' ) {
        context = handler;
        handler = selector;
        selector = null;
      }
  
      cache = _cache(this);
      types = getEventKeys(type, cache);
  
      for ( i = 0, len = types.length; i < len; ++i ) {
  
        // we want to keep the original array in tact, since
        // DOM event handlers maintain a reference to it.
        // so we copy it, empty it, iterate over the copy,
        // and add events we're keeping back to the original
        evts = cache.events[types[i]] || [];
        copy = evts.slice();
        evts.length = 0;
  
        if ( copy.length ) {
          for ( j = 0, len2 = copy.length; j < len2; ++j ) {
            if ( !evtMatch(copy[j], handler, context, selector) ) {
              evts.push(copy[j]);
            }
          }
          // unbind DOM events
          if ( !evts.length && evts.handler ) {
            this.removeEventListener(types[i], evts.handler);
            delete cache.events[types[i]];
          }
        }
  
      }
    }
  
    // unbind events bound to another object
    function external( obj, type, handler ) {
      if ( this._listeners && this._listeners[obj._listenerId] ) {
        this._listeners[obj._listenerId].off(type, handler, this);
        // if we're unbinding all events for this object,
        // delete the reference
        if ( !type && !handler ) {
          delete this._listeners[obj._listenerId];
        }
      }
    }
  
    // unbind everything (internal + external)
    function all() {
      var listeners, id;
      internal.call(this);
      // loop through externally-bound events and remove 'em all
      if ( listeners = this._listeners ) {
        for ( id in listeners ) {
          this.off(listeners[id]);
        }
      }
    }
  
    // public interface
    return function( type, handler, context ) {
      // unbind all
      if ( !type && !handler && !context ) {
        all.call(this);
      }
      // unbind an event from another object that was bound by this one
      else if ( type && typeof type !== 'string' ) {
        external.apply(this, arguments);
      // simple event unbinding
      } else {
        internal.apply(this, arguments);
      }
      return this;
    };
  
  });
  
  Ash.module('event.emit', function( type ) {
  
    var slice = Array.prototype.slice, empty = [];
  
    // dispatch a native DOM event
    function dispatch( target, type ) {
      var event;
      try {
        event = new window.Event(type, {
          bubbles: true,
          cancelable: true
        });
      }
      catch ( e ) {
        event = document.createEvent('Event');
        event.initEvent(type, true, true);
      }
      target.dispatchEvent(event);
    }
  
    // choose between DOM events or Ash events
    function choose( context, type, events, args ) {
      var evts;
      // native DOM node? dispatch a real event
      if ( context.addEventListener ) {
        dispatch(context, type);
      }
      // otherwise, invoke callbacks manually
      else if ( evts = events[type] ) {
        callEach(evts, args);
      }
    }
  
    // call each event in an array with optional args
    function callEach( events, args ) {
      var i = 0, len = events.length, ev;
      for ( ; i < len; ++i ) {
        ev = events[i];
        // call is faster than apply, so optimize for the most common case
        if ( ev && !args.length ) {
          ev.callback.call(ev.ctx);
        }
        else if ( ev ) {
          ev.callback.apply(ev.ctx, args);
        }
      }
    }
  
    // public interface
    return function( type ) {
      var args, types, cache, len, i;
  
      if ( !type ) {
        return this;
      }
  
      cache = _cache(this);
  
      // avoid the slice call if we don't have extra args
      // and use a preallocated empty array to avoid an instantiation
      args = arguments.length < 2 ? empty : slice.call(arguments, 1);
  
      // avoid split and looping if we only have 1 event type
      if ( type.indexOf(' ') === -1 ) {
        choose(this, type, cache.events, args);
        return this;
      }
  
      // skip a costly split operation (and the associated allocation)
      // if we've already seen this event string
      types = _typecache[type] || ( _typecache[type] = type.split(' ') );
  
      for ( i = 0, len = types.length; i < len; ++i ) {
        choose(this, types[i], cache.events, args);
      }
      return this;
    };
  
  });
  

  Ash.module('View', function() {
  
    // splitter for delegateEvents keys
    var splitter = /^(\S+)\s*(.*)$/;
  
    return Ash.subclass('View', Ash.event, {
  
      construct: function( opts ) {
        this.bindKey = 'model';
        this.extend(opts);
        this.setElement();
        this.bindEvents();
        this.on('render', this.addUIRefs.bind(this));
        this.init();
        return this;
      },
  
      // options init function
      init: function() {
  
      },
  
      // create `this.el` if `el` is not supplied on opts param
      // also adds classes from optional `className` string
      setElement: function() {
        if ( !this.el ) {
          this.el = Ash.Dom(document.createElement(this.tagName || 'div' ));
        } else if ( !( this.el instanceof Ash.Dom ) ) {
          this.el = Ash.Dom(this.el);
        }
        if ( this.className ) {
          this.el.addClass(this.className);
        }
        return this;
      },
  
      // automatically set up event binding on construct
      // from the optional `events` hash
      bindEvents: function() {
        var key, matches, method, ui;
        if ( this.events ) {
          for ( key in this.events ) {
            matches = key.match(splitter);
            method = ( _type(this.events[key]) === 'function' ?
              this.events[key] : this[this.events[key]] ).bind(this);
            if ( matches[2] ) {
              if ( matches[2].charAt(0) === '@' ) {
                ui = ( this._ui || this.ui || {} );
                if ( !( matches[2] = ui[matches[2].substr(1)] ) ) {
                  continue;
                }
              }
              this.el.on(matches[1], matches[2], method);
            } else if ( this[this.bindKey] ) {
              this.on(this[this.bindKey], matches[1], method);
            }
          }
        }
        return this;
      },
  
      // automatically create Ash.Dom refs on render
      // from the optional `ui` hash
      addUIRefs: function() {
        var key;
        if ( this.ui ) {
          if ( !this._ui ) {
            this._ui = this.ui;
          }
          this.ui = {};
          for ( key in this._ui ) {
            this.ui[key] = this.el.find(this._ui[key]);
          }
        }
        return this;
      },
  
      // serialize the bound model
      serialize: function() {
        var data = {};
        if ( this.model ) {
          data = this.model.toJSON();
        }
        return this.runHelpers(data);
      },
  
      // automatically run helper functions and add their
      // return values to the model's serialized data
      runHelpers: function( data ) {
        var key;
        if ( this.helpers ) {
          for ( key in this.helpers ) {
            data[key] = this.helpers[key].call(this, data);
          }
        }
        return data;
      },
  
      // append `el` to an Ash.Dom object, selector, or DOM node
      appendTo: function( target ) {
        this.el.appendTo(target);
        return this;
      },
  
      // prepend `el` to an Ash.Dom object, selector, or DOM node
      prependTo: function( target ) {
        this.el.prependTo(target);
        return this;
      },
  
      // render the template
      render: function() {
        var data;
        if ( this.template && this.el ) {
          data = this.serialize();
          this.el.html(Ash.string.template(this.template, data));
        }
        this.emit('render');
        return this;
      },
  
      show: function() {
        this.el.show();
        return this;
      },
  
      hide: function() {
        this.el.hide();
        return this;
      },
  
      // destroy the view and remove any bound events
      destroy: function() {
        this.el.off();
        this.el.remove();
        this.off();
        return this;
      }
  
    });
  
  });
  
  Ash.module('CollectionView', function() {
  
    // comparator to sort models according to their index
    // within a collection
    function sortModels( a, b ) {
      return this.indexOf(a) - this.indexOf(b);
    }
  
    return Ash.View.subclass('CollectionView', {
  
      construct: function( opts ) {
        this.bindKey = 'collection';
        this.extend(opts);
        if ( !this.collection ) {
          throw new Error('no collection specified');
        }
        if ( !this.view ) {
          throw new Error('no view class specified');
        }
        this.setElement();
        this.bindEvents();
        this.createViews();
        this.on('render', this.addUIRefs.bind(this));
        this.on('render', this.appendCollection.bind(this));
        this.on(this.collection, 'add', this.addViews.bind(this));
        this.on(this.collection, 'remove', this.removeViews.bind(this));
        this.on(this.collection, 'sort', this.sortViews.bind(this));
        this.init();
        return this;
      },
  
      // optional init function
      init: function() {
  
      },
  
      // run any registered helpers to create
      // template data
      serialize: function() {
        var data = {};
        data.total = this.collection.length;
        return this.runHelpers(data);
      },
  
      createViews: function() {
        this.views = [];
        this.collection.each(function( model ) {
          var view = new this.view({model: model}).render();
          this.views.push(view);
        }.bind(this));
        this.appendCollection();
      },
  
      addViews: function( models ) {
        var view, index, target, len;
        // single view? append it directly
        if ( models.length === 1 ) {
          view = new this.view({model: models[0]}).render(),
          index = this.collection.indexOf(models[0]);
          target = this.el.find(this.target);
          this.views.splice(index, 0, view);
          len = this.views.length;
          if ( index === len - 1 ) {
            target.append(view.el);
          }
          else {
            target[0].insertBefore(view.el[0], this.views[index + 1].el[0]);
          }
          return;
        }
        // otherwise, do a full reflow
        // (models need to be sorted for splice inserts to work correctly)
        models.sort(sortModels.bind(this.collection));
        _each.call(models, function( model ) {
          view = new this.view({model: model}).render();
          index = this.collection.indexOf(model);
          this.views.splice(index, 0, view);
        }, this);
        this.appendCollection();
      },
  
      removeViews: function( models ) {
        _each.call(models, function( model ) {
          var deadView;
          this.views = _filter.call(this.views, function( view ) {
            if ( view.model === model ) {
              deadView = view;
              return false;
            }
            return true;
          }, this);
          if ( deadView ) {
            deadView.destroy();
          }
        }, this);
      },
  
      sortViews: function() {
        var changed = false,
          collection = this.collection,
          sorted = new Array(this.views.length);
        _each.call(this.views, function( view ) {
          var index = collection.indexOf(view.model);
          sorted[index] = view;
          changed = changed || view !== this.views[index];
        }, this);
        this.views = sorted;
        if ( changed ) {
          this.appendCollection();
        }
      },
  
      appendCollection: function() {
        var target = this.el.find(this.target).html('');
        _each.call(this.views, function( view ) {
          view.el.appendTo(target);
        }, this);
      },
  
      destroy: function() {
        _each.call(this.views, function( view ) {
          view.destroy();
        });
        this.views = [];
        this.el.off();
        this.el.remove();
        this.off();
        return this;
      }
  
    });
  
  });
  
  Ash.module('Router', function() {
  
    var trail = /\/$/, any = '\\S+';
  
    return Ash.subclass('Router', Ash.event, {
  
      construct: function( opts ) {
        this.extend(opts);
        this.routes = this.routes || {};
        this.params = this.params || {};
        this.listen();
      },
  
      // start listening to hashchange events
      listen: function() {
        Ash.Dom(window).on('hashchange', function() {
          this.navigate(location.hash.substr(1));
        }.bind(this), false);
      },
  
      // define a new parameter regex
      param: function( param, regex ) {
        if ( _type.string(param) && _type.regexp(regex) ) {
          this.params[param] = regex;
        }
        return this;
      },
  
      // add a route callback
      route: function( url, callback, ctx ) {
        var segments, params;
        if ( _type.string(url) && _type.function(callback) ) {
          url = url.replace(trail, '');
          segments = url.split('/');
          params = _map.call(segments, function( segment, i ) {
            if ( segment === '**' ) {
              segments[i] = any;
            }
            if ( segment.charAt(0) === ':' ) {
              segments[i] = '(' + any + ')';
              return segment.substr(1);
            }
          });
          if ( segments[segments.length - 1] === '*' ) {
            segments.splice(-1, 1, any);
          }
          (this.routes[url] || (this.routes[url] = {
            pattern: new RegExp(segments.join('\\/') + '$'),
            params: params,
            callbacks: []
          })).callbacks.push({fn: callback, ctx: ctx});
        }
        return this;
      },
  
      // remove all callbacks for a given route
      unroute: function( url, fn, ctx ) {
        var route;
        if ( _type.string(url) ) {
          url = url.replace(trail, '');
          // rm all
          if ( !fn && !ctx ) {
            delete this.routes[url];
          // match callbacks/contexts
          } else {
            route = this.routes[url];
            route.callbacks = _filter.call(route.callbacks, function( evt ) {
              return fn && evt.fn !== fn || ctx && evt.ctx !== ctx;
            });
          }
        }
        return this;
      },
  
      // trigger callbacks for a url
      navigate: function( url ) {
        url = url.replace(trail, '');
        _each.call(this.routes, function( route ) {
          var matches, params = {}, paramsMatch = true;
          matches = url.match(route.pattern);
          if ( matches && matches.length ) {
            // map params
            _each.call(route.params, function( param, i ) {
              var regex = this.params[param];
              if ( regex && !regex.test(matches[i + 1])  ) {
                paramsMatch = false;
              }
              params[param] = matches[i + 1];
            }, this);
            if ( paramsMatch ) {
              // execute callbacks
              _each.call(route.callbacks, function( callback ) {
                callback.fn.call(callback.ctx || window, url, params);
              });
            }
          }
        }, this);
        return this;
      }
  
    });
  
  });
  
  /* jshint -W101 */
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  
  Ash.module('Map', function() {
  
    // set a single value
    function setOne( key, val ) {
      var changed = false;
      key = String(key);
      if ( !this.has(key) ) {
        this.size++;
      }
      if ( this._internal[key] !== val ) {
        if ( !this._changing ) {
          this._previous = {};
          this._changed = {};
        }
        this._changing = true;
        this._previous[key] = this._internal[key];
        this._internal[key] = val;
        this._changed[key] = val;
        changed = true;
        this.emit('change:' + key, val, this._previous[key]);
      }
      return changed;
    }
  
    // set multiple values
    function setBatch( props ) {
      var changed = false, prop;
      for ( prop in props ) {
        changed = setOne.call(this, prop, props[prop]) || changed;
      }
      return changed;
    }
  
    return Ash.subclass('Map', Ash.event, {
      construct: function( arg ){
        // set internal values directly for speed
        if ( typeof arg === 'object' ) {
          this._internal = _extend.call(Object.create(null), arg);
          this.size = _keys(this._internal).length;
        }
        else {
          // reset internals
          this.clear();
        }
      },
      get: function( key ){
        if ( this.has(key) ) {
          return this._internal[key];
        }
        else if ( this.defaults ) {
          return this.defaults[key];
        }
        return undefined;
      },
      set: function( key, val ){
        var changed = false, changing = this._changing;
        if ( typeof key === 'string' || typeof key === 'number' ) {
          changed = setOne.call(this, key, val);
        }
        else if ( typeof key === 'object' ) {
          changed = setBatch.call(this, key);
        }
        else {
          throw new TypeError('Invalid arguments');
        }
        if ( changed && !changing ) {
          this._changing = false;
          this.emit('change', this._changed, this._previous);
        }
        return this;
      },
      has: function( key ) {
        // ownproperty checks are slow, so try the fast way first for
        // truthy values
        return !!this._internal[key] || !!( key in this._internal );
      },
      delete: function( key ){
        if ( this.has( key ) ) {
          // call set with undefined to take advantage of
          // the event emitting already done in Map.set()
          this.set(key, undefined);
          delete this._internal[key];
          this.size--;
        }
      },
      clear: function(){
        this.size = 0;
        // make sure there is no prototype
        this._internal = Object.create( null );
      },
      each: function( callback ){
        _each.call( this._internal, callback, this );
      },
      toJSON: function() {
        var result = {};
        _each.call(this.defaults || {}, function( val, key ) {
          result[key] = val;
        });
        return _extend.call(result, this._internal);
      }
    });
  
  });
  
  Ash.module('List', function() {
  
    var slice = Array.prototype.slice;
  
    return Ash.subclass('List', Ash.event, {
  
      construct: function( arr ) {
        this.clear();
        // array or array-like
        this.push.apply(this, arr);
      },
  
      push: function() {
        var args = slice.apply(arguments);
        this.length = Array.prototype.push.apply(this._internal, args);
        if ( args.length ) {
          this.emit('add', args);
        }
        return this;
      },
  
      pop: function() {
        var len = this.length, val = this._internal.pop();
        this.length = this._internal.length;
        if ( this.length !== len ) {
          this.emit('remove', [val]);
        }
        return val;
      },
  
      unshift: function() {
        var args = slice.apply(arguments);
        this.length = Array.prototype.unshift.apply(this._internal, args);
        if ( args.length ) {
          this.emit('add', args);
        }
        return this;
      },
  
      shift: function() {
        var len = this.length, val = this._internal.shift();
        this.length = this._internal.length;
        if ( this.length !== len ) {
          this.emit('remove', [val]);
        }
        return val;
      },
  
      indexOf: function( val ) {
        return this._internal.indexOf(val);
      },
  
      slice: function() {
        var out = new this.constructor(), arr;
        arr = slice.apply(this._internal, arguments);
        // set directly to avoid the cost of events and another push
        out._internal = arr;
        out.length = arr.length;
        return out;
      },
  
      nth: function( n ) {
        var length = this.length, mod = n % length;
        return isNaN( mod ) ? false :
          this._internal[mod < 0 ? mod + length : mod];
      },
  
      remove: function( val ) {
        var keep = _filter.call(this._internal, function( obj ) {
          return obj !== val;
        });
        if ( keep.length !== this.length ) {
          this.length = ( this._internal = keep ).length;
          this.emit('remove', val);
        }
        return this;
      },
  
      clear: function() {
        this.length = ( this._internal = [] ).length;
        return this;
      },
  
      each: function( callback ) {
        _each.call(this._internal, callback, this);
        return this;
      },
  
      map: function( fn ) {
        return Array.prototype.map.call(this._internal, fn);
      },
  
      sort: function( fn ) {
        Array.prototype.sort.call(this._internal, fn);
        this.emit('sort');
        return this;
      },
  
      filter: function( fn ) {
        var out = new this.constructor(), arr;
        arr = _filter.call(this._internal, fn);
        // set directly to avoid the cost of events and another push
        out._internal = arr;
        out.length = arr.length;
        return out;
      },
  
      toJSON: function() {
        return _map.call(this._internal, function( val ) {
          return val && val.toJSON ? val.toJSON() : val;
        });
      }
  
    });
  
  });
  
  Ash.module('Dom', function () {
  
    var htmlRegex = /^<[\w\W]+>$/;
  
    // create an array of DOM nodes from an HTML string
    function createDOMFromString( str ) {
      var elem = document.createElement('div');
      elem.innerHTML = str;
      return Array.prototype.slice.call(elem.children);
    }
  
    return Ash.subclass('Dom', {
      construct: function( selector, ctx ) {
        var elems = [];
        if ( !selector ) {
          return this;
        }
        if ( selector instanceof Ash.Dom ) {
          return selector;
        }
        // HTML string
        if ( _type.string(selector) && htmlRegex.test(selector) ) {
          elems = createDOMFromString(selector);
        // CSS selector
        } else if ( _type.string(selector) ) {
          this.selector = selector;
          elems = _find(selector, ctx);
        // arrays of elements and NodeLists
        } else if ( Ash.array.like(selector) ) {
          elems = selector;
        // err'thang else (DOM Nodes, window, XHR, etc.)
        } else {
          elems = [selector];
        }
        // add elements to the collection
        Array.prototype.push.apply(this, elems);
      },
      // force dev tools to log Ash.Dom instances as arrays
      splice: Array.prototype.splice,
      // on the prototype so instances ALWAYS have a length
      length: 0
    });
  
  });
  
  function _find( selector, ctx ) {
    var idRegex = /^(?:#[\w-]+)$/, el;
    // !ctx because HTMLElement doesn't have getElementById
    if ( !ctx && idRegex.test(selector) ) {
      return ( el = document.getElementById(selector.substr(1)) ) ? [el] : [];
    } else {
      return [].slice.call(( ctx || document ).querySelectorAll(selector));
    }
  }
  
  Ash.Dom.prototype.find = function( selector ) {
    var matches = [];
    this.each(function() {
      matches = matches.concat(_find(selector, this));
    });
    return Ash.Dom(matches);
  };
  
  Ash.Dom.prototype.each = function( callback ) {
    return _each.call(this, function( el, i ) {
      return callback.call(el, i, el);
    });
  };
  
  Ash.Dom.prototype.on = function() {
    var args = [].slice.apply(arguments);
    return this.each(function() {
      Ash.event.on.apply(this, args);
    });
  };
  
  Ash.Dom.prototype.off = function () {
    var args = [].slice.apply(arguments);
    return this.each(function() {
      Ash.event.off.apply(this, args);
    });
  };
  
  Ash.Dom.prototype.emit = function( type ) {
    var args = [].slice.apply(arguments);
    return this.each(function() {
      Ash.event.emit.apply(this, args);
    });
  };
  
  Ash.Dom.prototype.append = function( child ) {
  
    child = Ash.Dom(child);
  
    this.each(function( i , el ) {
      child.each(function() {
        el.appendChild(this);
      });
    });
  
    return this;
  };
  
  Ash.Dom.prototype.prepend = function( child ) {
  
    child = Ash.Dom(child);
  
    this.each(function( i , el ) {
      child.each(function() {
        el.insertBefore(this, el.firstChild);
      });
    });
  
    return this;
  };
  
  Ash.Dom.prototype.appendTo = function( target ) {
  
    Ash.Dom(target).each(function( i, el ) {
      this.each(function() {
        el.appendChild(this);
      });
    }.bind(this));
  
    return this;
  };
  
  Ash.Dom.prototype.prependTo = function( target ) {
  
    Ash.Dom(target).each(function( i, el ) {
      this.each(function() {
        el.insertBefore(this, el.firstChild);
      });
    }.bind(this));
  
    return this;
  };
  
  Ash.Dom.prototype.html = function( markup ) {
    if ( !_type.string(markup) ) {
      return this[0] ? this[0].innerHTML : '';
    }
    return this.each(function() {
      this.innerHTML = markup;
    });
  };
  
  Ash.Dom.prototype.remove = function() {
    return this.each(function() {
      if ( this.parentNode ) {
        this.parentNode.removeChild(this);
        // uncache
        _cache(this, true);
      }
    });
  };
  
  function _matches( el, selector ) {
    var matcher = el.matches ||
      el.webkitMatchesSelector ||
      el.mozMatchesSelector ||
      el.msMatchesSelector ||
      el.oMatchesSelector ||
      function ( selector ) {
        if ( selector.charAt(0) === '#' ) {
          return this.id === selector.substr(1);
        }
        if ( selector.charAt(0) === '.' ) {
          return !!~this.className.split(' ').indexOf(selector.substr(1));
        }
        return this.tagName === selector.toUpperCase();
      };
    return matcher.call(el, selector);
  }
  
  Ash.Dom.prototype.is = function( selector ) {
    return _some.call(this, function( el ) {
      return _matches(el, selector);
    });
  };
  
  Ash.Dom.prototype.addClass = function( className ) {
    var classes = className.split(/\s+/);
    return this.each(function() {
      var add = [];
      if ( this.classList ) {
        classes.forEach(function( className ) {
          this.classList.add(className);
        }.bind(this));
      } else {
        add = this.className.split(/\s+/).concat(classes);
        this.className = add.join(' ').trim();
      }
    });
  };
  
  Ash.Dom.prototype.removeClass = function( className ) {
    var classes = className.split(/\s+/);
    return this.each(function() {
      var keep;
      if ( this.classList) {
        classes.forEach(function( className ) {
          this.classList.remove(className);
        }.bind(this));
      } else {
        keep = this.className.split(/\s+/).filter(function( className ) {
          return classes.indexOf(className) === -1;
        });
        this.className = keep.join(' ').trim();
      }
    });
  };
  
  Ash.Dom.prototype.show = function() {
  
    return this.each(function() {
  
      if ( this.style.display === 'none' ) {
        this.style.display = '';
      }
  
      if ( this.style.display === '' && _isHidden(this) ) {
        this.style.display = _defaultDisplay(this.nodeName);
      }
  
    });
  
  };
  
  // cache default display values for element types
  var _displayCache = {};
  
  // is the computed display of an element 'none'?
  function _isHidden( elem ) {
    return window.getComputedStyle(elem).display === 'none';
  }
  
  // inject an element into the document and get its computed display value
  function _actualDisplay( nodeName, doc ) {
    var elem = Ash.Dom(doc.createElement(nodeName)), display;
    elem.appendTo(doc.body);
    display = window.getComputedStyle(elem[0]).display;
    elem.remove();
    return display;
  }
  
  // get the default display value for an element type
  function _defaultDisplay( nodeName ) {
    var display = _displayCache[nodeName], iframe, doc;
    if ( !display ) {
      display = _actualDisplay(nodeName, document);
      // if _actualDisplay didn't work, try the more bulletproof
      // method of using an iframe
      if ( display === 'none' || !display ) {
        iframe = Ash.Dom('<iframe frameborder="0" width="0" height="0"/>');
        iframe.appendTo(document.body);
        doc = iframe[0].contentDocument;
        doc.write();
        doc.close();
        display = _actualDisplay(nodeName, doc);
        iframe.remove();
      }
      _displayCache[nodeName] = display;
    }
    return display;
  }
  
  Ash.Dom.prototype.hide = function() {
  
    return this.each(function() {
      var hidden = _isHidden(this),
        display = this.style.display;
  
      if ( display && display !== 'none' || !hidden ) {
        this.style.display = 'none';
      }
  
    });
  
  };
  
  Ash.Dom.prototype.data = function( key, val ) {
    /* jshint -W101 */
  
    // get the entire data object
    if ( !key ) {
      return this.length ? _cache(this[0]).data : null;
    }
  
    // get the value for a particular key
    //
    // check arg length instead of falsiness of val
    // because we want to be able to set falsy values
    if ( arguments.length === 1 && typeof key === 'string' ) {
      return this.length ? _cache(this[0]).data[key] : null;
    }
  
    // invalid setter object or invalid getter key
    if ( arguments.length === 1 && ( typeof key !== 'object' || key === null ) ) {
      return null;
    }
  
    // setter
    return this.each(function() {
      var data = _cache(this).data;
      // key/val pair
      if ( typeof key === 'string' ) {
        data[key] = val;
      // bulk set via object
      } else {
        _extend.call(data, key);
      }
    });
  
  };
  
  
  Ash.module('Promise', function() {
  
    /* jshint newcap: false */
  
    var $$iterator, ArrayIteratorPrototype;
  
    // set a value as non-configurable and non-enumerable
    function defineInternal ( obj, key, val ) {
      Object.defineProperty(obj, key, {
        configurable: false,
        enumerable: false,
        writable: true,
        value: val
      });
    }
  
    // From the ES6 spec (http://people.mozilla.org/~jorendorff/es6-draft.html)
  
    // 6 ECMAScript Data Types and Values
    function Type ( x ) {
      switch ( typeof x ) {
        case 'undefined':
        case 'boolean':
        case 'string':
        case 'number':
          return typeof x;
        default:
          return x === null ? 'null' :
            typeof Symbol === 'function' && x instanceof Symbol ? 'symbol' :
            'object';
      }
    }
  
    // 6.1.5.1 Well-Known Symbols (iterator key)
    $$iterator = typeof Symbol !== 'undefined' && Symbol.iterator ||
      '_shim_iterator_';
  
    // 7.1.4 ToInteger
    function ToInteger ( argument ) {
      var number = +argument;
      return number !== number ? 0 :
        number === 0 || number === Infinity || number === -Infinity ? number :
        ( number >= 0 ? 1 : -1 ) * Math.floor(Math.abs(number));
    }
  
    // 7.1.12 ToString
    function ToString ( argument ) {
      return _type.string(argument) ? argument : String(argument);
    }
  
    // 7.1.13 ToObject
    function ToObject ( argument ) {
      if ( argument == null ) {
        throw TypeError();
      }
      return Object(argument);
    }
  
    // 7.1.15 ToLength
    function ToLength ( argument ) {
      var len = ToInteger(argument);
      return len <= 0 ? 0 : Math.min(len, Math.pow(2, 53) - 1);
    }
  
    // 7.2.2 IsCallable
    function IsCallable ( argument ) {
      return _type.function(argument);
    }
  
    // 7.2.3 SameValue( x, y )
    function SameValue ( x, y ) {
      if ( typeof x !== typeof y ) {
        return false;
      }
      if ( Type(x) === 'undefined' ) {
        return true;
      }
      if ( Type(x) === 'number' ) {
        if ( x !== x && y !== y ) {
          return true;
        }
        if ( x === 0 ) {
          return 1 / x === 1 / y;
        }
      }
      return x === y;
    }
  
    // 7.2.5 IsConstructor
    // this is an ES6 abstract operation, and it's not really
    // possible in JS, but this should be good enough
    function IsConstructor ( obj ) {
      return _type.function(obj);
    }
  
    // 7.4.1 GetIterator ( obj )
    // not a real shim, but it works
    function GetIterator ( obj ) {
      if ( Type(obj) !== 'object' ) {
        throw TypeError();
      }
      return obj[$$iterator]();
    }
  
    // 7.4.2 IteratorNext ( iterator, value )
    function IteratorNext ( iterator, value ) {
      var result = iterator.next(value);
      if ( Type(result) !== 'object' ) {
        throw TypeError();
      }
      return result;
    }
  
    // 7.4.3 IteratorComplete ( iterResult )
    function IteratorComplete ( iterResult ) {
      if ( Type(iterResult) !== 'object' ) {
        throw TypeError();
      }
      return !!iterResult.done;
    }
  
    // 7.4.4 IteratorValue ( iterResult )
    function IteratorValue ( iterResult ) {
      if ( Type(iterResult) !== 'object' ) {
        throw TypeError();
      }
      return iterResult.value;
    }
  
    // 7.4.5 IteratorStep ( iterator )
    function IteratorStep ( iterator ) {
      var result = IteratorNext(iterator);
      return IteratorComplete(result) === true ? false : result;
    }
  
    // 7.4.6 CreateIterResultObject ( value, done )
    function CreateIterResultObject ( value, done ) {
      if ( Type(done) !== 'boolean' ) {
        throw TypeError();
      }
      return {value: value, done: done};
    }
  
    // 8.4.1 EnqueueTask ( queueName, task, arguments)
    function EnqueueTask ( task, args ) {
      Ash.util.async(function() {
        task.apply(null, args);
      });
    }
  
    // 22.1.5.1 CreateArrayIterator Abstract Operation
    function CreateArrayIterator ( array, kind ) {
      var O = ToObject(array),
        iterator = Object.create(ArrayIteratorPrototype);
      defineInternal(iterator, '[[IteratedObject]]', O);
      defineInternal(iterator, '[[ArrayIteratorNextIndex]]', 0);
      defineInternal(iterator, '[[ArrayIteratorKind]]', kind);
      return iterator;
    }
  
    // 22.1.3.29 Array.prototype.values ( )
    Array.prototype.values = function () {
      return CreateArrayIterator(ToObject(this), 'value');
    };
  
    // 22.1.3.30 Array.prototype [ @@iterator ] ( )
    Array.prototype[$$iterator] = Array.prototype.values;
  
    // 22.1.5.2 The %ArrayIteratorPrototype% Object
    ArrayIteratorPrototype = {};
  
    // 22.1.5.2.1 %ArrayIteratorPrototype%. next()
    ArrayIteratorPrototype.next = function () {
      var O = this, a, index, itemKind, len,
        elementKey, elementValue, result;
      if ( Type(O) !== 'object' ) {
        throw TypeError();
      }
      a = O['[[IteratedObject]]'];
      if ( Type(a) === 'undefined' ) {
        return CreateIterResultObject(undefined, true);
      }
      index = O['[[ArrayIteratorNextIndex]]'];
      itemKind = O['[[ArrayIteratorKind]]'];
      len = ToLength(a.length);
      if ( index >= len ) {
        defineInternal(O, '[[IteratedObject]]', undefined);
        return CreateIterResultObject(undefined, true);
      }
      defineInternal(O, '[[ArrayIteratorNextIndex]]', index + 1);
      if ( itemKind.indexOf('value') !== -1 ) {
        elementKey = ToString(index);
        elementValue = a[elementKey];
      }
      if ( itemKind.indexOf('key+value') !== -1 ) {
        result = [index, elementValue];
        return CreateIterResultObject(result, false);
      } else if ( itemKind.indexOf('key') !== -1 ) {
        return CreateIterResultObject(index, false);
      }
      if ( itemKind.indexOf('value') === -1 ) {
        throw TypeError();
      }
      return CreateIterResultObject(elementValue, false);
    };
  
    // 22.1.5.2.2 %ArrayIteratorPrototype% [ @@iterator ] ( )
    ArrayIteratorPrototype[$$iterator] = function () {
      return this;
    };
  
    // 25.4.1.1.1 IfAbruptRejectPromise (value, capability)
    function IfAbruptRejectPromise ( value, capability ) {
      try {
        capability['[[Reject]]'].call(undefined, [value]);
      } catch ( e ) {
        return e;
      }
      return capability;
    }
  
    // 25.4.1.3 CreateRejectFunction ( promise )
    function CreateRejectFunction ( promise ) {
      var reject = new PromiseReject();
      defineInternal(reject, '[[Promise]]', promise);
      return reject;
    }
  
    // 25.4.1.3.1 Promise Reject Functions
    function PromiseReject () {
      return function F ( reason ) {
        var promise = F['[[Promise]]'], reactions;
        if ( Type(promise) !== 'object' ) {
          throw TypeError();
        }
        if ( promise['[[PromiseStatus]]'] !== 'unresolved' ) {
          return undefined;
        }
        reactions = promise['[[PromiseRejectReactions]]'];
        defineInternal(promise, '[[PromiseResult]]', reason);
        defineInternal(promise, '[[PromiseResolveReactions]]', undefined);
        defineInternal(promise, '[[PromiseRejectReactions]]', undefined);
        defineInternal(promise, '[[PromiseStatus]]', 'has-rejection');
        return TriggerPromiseReactions(reactions, reason);
      };
    }
  
    // 25.4.1.4 CreateRejectFunction ( promise )
    function CreateResolveFunction ( promise ) {
      var resolve = new PromiseResolve();
      defineInternal(resolve, '[[Promise]]', promise);
      return resolve;
    }
  
    // 25.4.1.4.1 Promise Resolve Functions
    function PromiseResolve () {
      return function F ( resolution ) {
        var promise = F['[[Promise]]'], reactions;
        if ( Type(promise) !== 'object' ) {
          throw TypeError();
        }
        if ( promise['[[PromiseStatus]]'] !== 'unresolved' ) {
          return undefined;
        }
        reactions = promise['[[PromiseResolveReactions]]'];
        defineInternal(promise, '[[PromiseResult]]', resolution);
        defineInternal(promise, '[[PromiseResolveReactions]]', undefined);
        defineInternal(promise, '[[PromiseRejectReactions]]', undefined);
        defineInternal(promise, '[[PromiseStatus]]', 'has-resolution');
        return TriggerPromiseReactions(reactions, resolution);
      };
    }
  
    // 25.4.1.5 NewPromiseCapability ( C )
    function NewPromiseCapability ( C ) {
      var promise;
      if ( !IsConstructor(C) ) {
        throw TypeError();
      }
      try {
        promise = Object.create(C.prototype);
      } catch ( e ) {
        return e;
      }
      return CreatePromiseCapabilityRecord(promise, C);
    }
  
    // 25.4.1.5.1 CreatePromiseCapabilityRecord( promise, constructor )
    function CreatePromiseCapabilityRecord ( promise, constructor ) {
      var promiseCapability = {}, executor, constructorResult;
      defineInternal(promiseCapability, '[[Promise]]', promise);
      defineInternal(promiseCapability, '[[Resolve]]', undefined);
      defineInternal(promiseCapability, '[[Reject]]', undefined);
      executor = new GetCapabilitiesExecutor();
      defineInternal(executor, '[[Capability]]', promiseCapability);
      try {
        constructorResult = constructor.call(promise, executor);
      } catch ( e ) {
        return e;
      }
      if ( !IsCallable(promiseCapability['[[Resolve]]']) ) {
        throw TypeError();
      }
      if ( !IsCallable(promiseCapability['[[Reject]]']) ) {
        throw TypeError();
      }
      if ( typeof constructorResult === 'object' &&
        !SameValue(promise, constructorResult) ) {
        throw TypeError();
      }
      return promiseCapability;
    }
  
    // 25.4.1.5.2 GetCapabilitiesExecutor Functions
    function GetCapabilitiesExecutor () {
      return function F ( resolve, reject ) {
        var promiseCapability = F['[[Capability]]'];
        if ( Type(promiseCapability['[[Resolve]]']) !== 'undefined' ) {
          throw TypeError();
        }
        if ( Type(promiseCapability['[[Reject]]']) !== 'undefined' ) {
          throw TypeError();
        }
        defineInternal(promiseCapability, '[[Resolve]]', resolve);
        defineInternal(promiseCapability, '[[Reject]]', reject);
      };
    }
  
    // 25.4.1.6 IsPromise ( x )
    function IsPromise ( x ) {
      if ( Type(x) !== 'object' ) {
        return false;
      }
      if ( Type(x['[[PromiseStatus]]']) === 'undefined' ) {
        return false;
      }
      return true;
    }
  
    // 25.4.1.7 TriggerPromiseReactions ( reactions, argument )
    function TriggerPromiseReactions ( reactions, argument ) {
      reactions.forEach(function( reaction ) {
        EnqueueTask(PromiseReactionTask, [reaction, argument]);
      });
    }
  
    // 25.4.1.8 UpdatePromiseFromPotentialThenable ( x, promiseCapability )
    function UpdatePromiseFromPotentialThenable ( x, promiseCapability ) {
      var then, rejectResult, thenCallResult;
      if ( Type(x) !== 'object' ) {
        return 'not a thenable';
      }
      try {
        then = x.then;
      } catch ( e ) {
        rejectResult = promiseCapability['[[Reject]]'].call(undefined, e);
        return null;
      }
      if ( !IsCallable(then) ) {
        return 'not a thenable';
      }
      try {
        thenCallResult = then.call(x, promiseCapability['[[Resolve]]'],
          promiseCapability['[[Reject]]']
        );
      } catch ( e ) {
        rejectResult = promiseCapability['[[Reject]]'].call(undefined, e);
        return null;
      }
      return null;
    }
  
    // 25.4.2.1 PromiseReactionTask( reaction, argument )
    function PromiseReactionTask ( reaction, argument ) {
      var promiseCapability = reaction['[[Capabilities]]'],
        handler = reaction['[[Handler]]'],
        handlerResult, selfResolutionError, updateResult;
      try {
        handlerResult = handler.call(undefined, argument);
      } catch ( e ) {
        return promiseCapability['[[Reject]]'].call(undefined, e);
      }
      if ( SameValue(handlerResult, promiseCapability['[[Promise]]']) ) {
        selfResolutionError = TypeError();
        return promiseCapability['[[Reject]]']
          .call(undefined, selfResolutionError);
      }
      updateResult = UpdatePromiseFromPotentialThenable(handlerResult,
        promiseCapability
      );
      if ( updateResult === 'not a thenable' ) {
        return promiseCapability['[[Resolve]]'].call(undefined, handlerResult);
      }
      return undefined;
    }
  
    // 25.4.3.1 Promise ( executor )
    function Promise ( executor ) {
      var promise = this;
      if ( !IsCallable(executor) ) {
        throw TypeError('Invalid executor');
      }
      if ( Type(promise) !== 'object' ) {
        throw TypeError('Invalid promise');
      }
      if ( Type(promise['[[PromiseStatus]]']) !== 'undefined' ) {
        throw TypeError();
      }
      defineInternal(this, '[[PromiseConstructor]]', Promise);
      return InitializePromise(promise, executor);
    }
  
    // 25.4.3.1.1 InitializePromise( promise, executor )
    function InitializePromise ( promise, executor) {
      var resolve, reject, completion, status;
      if ( Type(promise['[[PromiseStatus]]']) !== 'undefined' ) {
        throw TypeError();
      }
      if ( !IsCallable(executor) ) {
        throw TypeError();
      }
      defineInternal(promise, '[[PromiseStatus]]', 'unresolved');
      defineInternal(promise, '[[PromiseResolveReactions]]', []);
      defineInternal(promise, '[[PromiseRejectReactions]]', []);
      resolve = CreateResolveFunction(promise);
      reject = CreateRejectFunction(promise);
      try {
        completion = executor.call(undefined, resolve, reject);
      } catch ( e ) {
        try {
          status = reject.call(undefined, e);
        } catch ( err ) {
          return err;
        }
      }
      return promise;
    }
  
    // 25.4.4.1 Promise.all ( iterable )
    Promise.all = function ( iterable ) {
      var C = this, promiseCapability, iterator, values,
        remainingElementsCount, index, next, resolveResult,
        nextValue, nextPromise, resolveElement, result;
      try {
        promiseCapability = NewPromiseCapability(C);
      } catch ( e ) {
        return e;
      }
      try {
        iterator = GetIterator(iterable);
      } catch ( e ) {
        return IfAbruptRejectPromise(e, promiseCapability);
      }
      values = [];
      remainingElementsCount = {'[[value]]': 0};
      index = 0;
      while ( true ) {
        try {
          next = IteratorStep(iterator);
        } catch ( e ) {
          return IfAbruptRejectPromise(e, promiseCapability);
        }
        if ( next === false ) {
          if ( index === 0 ) {
            try {
              resolveResult = promiseCapability['[[Resolve]]']
                .call(undefined, values);
            } catch ( e ) {
              return e;
            }
          }
          return promiseCapability['[[Promise]]'];
        }
        try {
          nextValue = IteratorValue(next);
        } catch ( e ) {
          return IfAbruptRejectPromise(e, promiseCapability);
        }
        try {
          nextPromise = C.cast(nextValue);
        } catch ( e ) {
          return IfAbruptRejectPromise(e, promiseCapability);
        }
        resolveElement = new PromiseAllResolveElementFunction();
        defineInternal(resolveElement, '[[Index]]', index);
        defineInternal(resolveElement, '[[Values]]', values);
        defineInternal(resolveElement, '[[Capabilities]]', promiseCapability);
        defineInternal(resolveElement, '[[RemainingElements]]',
          remainingElementsCount
        );
        try {
          result = nextPromise.then(resolveElement,
            promiseCapability['[[Reject]]']
          );
        } catch ( e ) {
          return IfAbruptRejectPromise(e, promiseCapability);
        }
        index++;
        remainingElementsCount['[[value]]']++;
      }
    };
  
    // 25.4.4.1.1 Promise.all Resolve Element Functions
    function PromiseAllResolveElementFunction () {
      return function F ( x ) {
        var index = F['[[Index]]'],
          values = F['[[Values]]'],
          promiseCapability = F['[[Capabilities]]'],
          remainingElementsCount = F['[[RemainingElements]]'];
        try {
          values[index] = x;
        } catch ( e ) {
          return IfAbruptRejectPromise(e, promiseCapability);
        }
        remainingElementsCount['[[value]]']--;
        if ( remainingElementsCount['[[value]]'] === 0 ) {
          promiseCapability['[[Resolve]]'].call(undefined, values);
        }
        return undefined;
      };
    }
  
    // 25.4.4.2 Promise.cast ( x )
    Promise.cast = function ( x ) {
      var C = this,
        promiseCapability,
        resolveResult,
        constructor;
      if ( IsPromise(x) ) {
        constructor = x['[[PromiseConstructor]]'];
        if ( SameValue(constructor, C) ) {
          return x;
        }
      }
      try {
        promiseCapability = NewPromiseCapability(C);
      } catch ( e ) {
        return e;
      }
      try {
        resolveResult = promiseCapability['[[Resolve]]'].call(undefined, x);
      } catch ( e ) {
        return e;
      }
      return promiseCapability['[[Promise]]'];
    };
  
    // 25.4.4.4 Promise.race ( iterable )
    Promise.race = function ( iterable ) {
      var C = this, promiseCapability, iterator, nextValue, nextPromise, next;
      try {
        promiseCapability = NewPromiseCapability(C);
      } catch ( e ) {
        return e;
      }
      try {
        iterator = GetIterator(iterable);
      } catch ( e ) {
        return IfAbruptRejectPromise(e, promiseCapability);
      }
      while ( true ) {
        try {
          next = IteratorStep(iterator);
        } catch ( e ) {
          return IfAbruptRejectPromise(e, promiseCapability);
        }
        if ( next === false ) {
          return promiseCapability['[[Promise]]'];
        }
        try {
          nextValue = IteratorValue(next);
        } catch ( e ) {
          return IfAbruptRejectPromise(e, promiseCapability);
        }
        try {
          nextPromise = C.cast(nextValue);
        } catch ( e ) {
          return IfAbruptRejectPromise(e, promiseCapability);
        }
        try {
          nextPromise.then(promiseCapability['[[Resolve]]'],
            promiseCapability['[[Reject]]']
          );
        } catch ( e ) {
          return IfAbruptRejectPromise(e, promiseCapability);
        }
      }
    };
  
    // 25.4.4.5 Promise.reject ( r )
    Promise.reject = function ( r ) {
      var C = this, promiseCapability, rejectResult;
      try {
        promiseCapability = NewPromiseCapability(C);
      } catch ( e ) {
        return e;
      }
      try {
        rejectResult = promiseCapability['[[Reject]]'].call(undefined, r);
      } catch ( e ) {
        return e;
      }
      return promiseCapability['[[Promise]]'];
    };
  
    // 25.4.4.6 Promise.resolve ( x )
    Promise.resolve = function ( x ) {
      var C = this, promiseCapability, resolveResult;
      try {
        promiseCapability = NewPromiseCapability(C);
      } catch ( e ) {
        return e;
      }
      try {
        resolveResult = promiseCapability['[[Resolve]]'].call(undefined, x);
      } catch ( e ) {
        return e;
      }
      return promiseCapability['[[Promise]]'];
    };
  
    // 25.4.5.1 Promise.prototype.catch ( onRejected )
    Promise.prototype['catch'] = function ( onRejected ) {
      var promise = this;
      return promise.then(undefined, onRejected);
    };
  
    // 25.4.5.3 Promise.prototype.then ( onFulfilled , onRejected )
    Promise.prototype.then = function ( onFulfilled , onRejected ) {
      var promise = this,
        C, promiseCapability, rejectionHandler, fulfillmentHandler,
        resolutionHandler, resolveReaction, rejectReaction, resolution;
      if ( !IsPromise(promise) ) {
        throw TypeError();
      }
      try {
        C = promise.constructor;
      } catch ( e ) {
        return e;
      }
      try {
        promiseCapability = NewPromiseCapability(C);
      } catch ( e ) {
        return e;
      }
      if ( IsCallable(onRejected) ) {
        rejectionHandler = onRejected;
      } else {
        rejectionHandler = new ThrowerFunction();
      }
      if ( IsCallable(onFulfilled) ) {
        fulfillmentHandler = onFulfilled;
      } else {
        fulfillmentHandler = new IdentityFunction();
      }
      resolutionHandler = new PromiseResolutionHandlerFunction();
      defineInternal(resolutionHandler, '[[Promise]]', promise);
      defineInternal(resolutionHandler, '[[FulfillmentHandler]]',
        fulfillmentHandler
      );
      defineInternal(resolutionHandler, '[[RejectionHandler]]',
        rejectionHandler
      );
      resolveReaction = {
        '[[Capabilities]]': promiseCapability,
        '[[Handler]]': resolutionHandler
      };
      rejectReaction = {
        '[[Capabilities]]': promiseCapability,
        '[[Handler]]': rejectionHandler
      };
      if ( promise['[[PromiseStatus]]'] === 'unresolved' ) {
        promise['[[PromiseResolveReactions]]'].push(resolveReaction);
        promise['[[PromiseRejectReactions]]'].push(rejectReaction);
      }
      if ( promise['[[PromiseStatus]]'] === 'has-resolution' ) {
        resolution = promise['[[PromiseResult]]'];
        EnqueueTask(PromiseReactionTask, [resolveReaction, resolution]);
      }
      if ( promise['[[PromiseStatus]]'] === 'has-rejection' ) {
        resolution = promise['[[PromiseResult]]'];
        EnqueueTask(PromiseReactionTask, [rejectReaction, resolution]);
      }
      return promiseCapability['[[Promise]]'];
    };
  
    // 25.4.5.3.1 Identity Functions
    function IdentityFunction () {
      return function F ( x ) {
        return x;
      };
    }
  
    // 25.4.5.3.2 PromiseResolutionHandlerFunctions
    function PromiseResolutionHandlerFunction () {
      return function F ( x ) {
        var promise = F['[[Promise]]'],
          fulfillmentHandler = F['[[FulfillmentHandler]]'],
          rejectionHandler = F['[[RejectionHandler]]'],
          selfResolutionError, C, promiseCapability, updateResult;
        if ( SameValue(x, promise) ) {
          selfResolutionError = TypeError();
          return rejectionHandler.call(undefined, selfResolutionError);
        }
        C = promise['[[PromiseConstructor]]'];
        try {
          promiseCapability = NewPromiseCapability(C);
        } catch ( e ) {
          return e;
        }
        try {
          updateResult = UpdatePromiseFromPotentialThenable(x,
            promiseCapability
          );
        } catch ( e ) {
          return e;
        }
        if ( updateResult !== 'not a thenable') {
          return promiseCapability['[[Promise]]'].then(fulfillmentHandler,
            rejectionHandler
          );
        }
        return fulfillmentHandler.call(undefined, x);
      };
    }
  
    // 25.4.5.3.3 Thrower Functions
    function ThrowerFunction () {
      return function F ( e ) {
        throw e;
      };
    }
  
    // export the Promise constructor
    return Promise;
  
  });
  
  Ash.module('Model', function() {
  
    // event names by HTTP method
    var events = {
      GET: 'fetch',
      PUT: 'save',
      POST: 'save',
      DELETE: 'destroy'
    };
  
    // util for AJAX persistence
    function sync( type, url, data ) {
      var self = this;
      Ash.ajax(url, {
        type: type,
        data: data,
      })
      .then(function( response ) {
        self.parse(response);
        self.emit(events[type]);
      }, function ( err ) {
        self.emit(events[type] + 'error', err);
      });
      return this;
    }
  
    return Ash.Map.subclass('Model', {
  
      // default primary key
      key: 'id',
  
      // should we automatically fetch when an instance is created
      // with an ID ( `new Ash.Model(id)` ) ?
      autoFetch: false,
  
      // constructor
      construct: function( props, opts ) {
        var passedID, id, orig, cache;
        // get a reference to the class-wide cache
        cache = this.constructor.cache || ( this.constructor.cache = {} );
        // extend with options
        _extend.call(this, opts || {});
        // re-map args
        if ( _type.string(props) || _type.number(props) ) {
          passedID = true;
          id = props;
          props = {};
          props[this.key] = id;
        }
        else if ( _type.object(props) ) {
          id = props[this.key];
        }
        else {
          props = {};
        }
        // already exists? send it back
        if ( id && ( orig = cache[id] ) ) {
          return orig.set(props);
        }
        // otherwise cache it
        else if ( id ) {
          cache[id] = this;
        }
        // guid
        this.guid = Ash.util.guid();
        // add props, do parent class setup routine
        Ash.Map.prototype.construct.call(this, props);
        // if we were only passed an ID and autoFetch is on, fetch
        if ( passedID === true && this.autoFetch === true ) {
          this.fetch();
        }
        // update cache when ID changes
        this.on('change:' + this.key, function( id, prev ) {
          delete cache[prev];
          cache[id] = this;
        });
        // initialize
        this.init();
      },
  
      // optional init function
      init: function() {
  
      },
  
      // is this a "new" instance (i.e. not represented on the server)?
      isNew: function() {
        return !this.get(this.key);
      },
  
      // get the endpoint for AJAX requests
      url: function() {
        var id = encodeURIComponent(this.get(this.key) || '');
        if ( this.baseURL ) {
          // for POST, we only need the base. otherwise, add the ID
          return this.isNew() ? this.baseURL :
            this.baseURL.replace(/\/+$/, '') + '/' + id;
        }
        throw new Error('baseURL and a primary key required');
      },
  
      // refresh model data from the server
      fetch: function() {
        return sync.call(this, 'GET', this.url());
      },
  
      // persist model data to the server
      save: function() {
        var type = this.isNew() ? 'POST' : 'PUT',
          data = this.toJSON();
        return sync.call(this, type, this.url(), data);
      },
  
      // delete model data on the server
      destroy: function() {
        return sync.call(this, 'DELETE', this.url());
      },
  
      // parse response data (broken out to allow for easy overriding)
      parse: function( data ) {
        this.set(data);
        return this;
      }
  
    });
  
  });
  
  Ash.module('Collection', function() {
  
    // convert an arguments object to an array of Model instances
    function convert() {
      var args = Array.prototype.slice.apply(arguments),
        Model = this.model;
      return _map.call(args, function( obj ) {
        return obj instanceof Model ? obj : new Model(obj);
      });
    }
  
    // add multiple elements (method = push || unshift)
    function add( method, args ) {
      var models = convert.apply(this, args), changed = [];
      _each.call(models, function( model ) {
        var id = model.get(model.key);
        // add new
        if ( !this._lookup[id] && !this._lookup[model.guid] ) {
          this._lookup[model.guid] = model;
          if ( id ) {
            this._lookup[id] = model;
          }
          changed.push(model);
          // if the ID changes, we need to update our lookup table
          this.on(model, 'change:' + model.key, function( id, prev ) {
            delete this._lookup[prev];
            if ( id ) {
              this._lookup[id] = model;
            }
          }.bind(this));
          // listen to destroy
          this.on(model, 'destroy', function() {
            this.remove(model);
          });
          this.length = this._internal[method](model);
        }
      }, this);
      if ( changed.length ) {
        this.emit('add', changed);
      }
      return this;
    }
  
    // remove an element
    function remove( method ) {
      var len = this._internal.length,
        model = this._internal[method](),
        id = model.get(model.key);
      delete this._internal[id];
      delete this._internal[model.guid];
      // unbind any events we might have been listening to
      this.off(model);
      if ( ( this.length = this._internal.length ) !== len ) {
        this.emit('remove', [model]);
      }
      return model;
    }
  
    return Ash.List.subclass('Collection', {
  
      // default model
      model: Ash.Model,
  
      construct: function( list, opts ) {
        // extend with options
        _extend.call(this, opts || {});
        // initialize with list and do parent class setup
        Ash.List.prototype.construct.call(this, list || []);
        this.init();
      },
  
      // optional init function
      init: function() {
  
      },
  
      get: function( id ) {
        var model;
        if ( model = this._lookup[id] ) {
          return model;
        }
        model = new this.model(id);
        this.push(model);
        return model;
      },
  
      push: function() {
        return add.call(this, 'push', arguments);
      },
  
      pop: function() {
        return remove.call(this, 'pop');
      },
  
      unshift: function() {
        return add.call(this, 'unshift', arguments);
      },
  
      shift: function() {
        return remove.call(this, 'shift');
      },
  
      indexOf: function( id ) {
        var model = id instanceof this.model ? id : this._lookup[id];
        return this._internal.indexOf(model);
      },
  
      slice: function() {
        var arr = Array.prototype.slice.apply(this._internal, arguments);
        return new this.constructor(arr, {model: this.model});
      },
  
      remove: function( id ) {
        var model, index;
        if ( id instanceof this.model ) {
          model = id;
          id = model.get(model.key);
        }
        index = this.indexOf(id);
        if ( index > -1 ) {
          model = this._lookup[id];
          delete this._lookup[id];
          delete this._lookup[model.guid];
          this.off(model);
          this._internal.splice(index, 1);
          this.length = this._internal.length;
          this.emit('remove', [model]);
        }
        return this;
      },
  
      clear: function() {
        this.length = ( this._internal = [] ).length;
        this._lookup = {};
        return this;
      },
  
      filter: function( fn ) {
        var arr = _filter.call(this._internal, fn);
        return new this.constructor(arr, {model: this.model});
      },
  
      fetch: function() {
        var self = this;
        if ( !this.url ) {
          throw new Error('this.url is required');
        }
        Ash.get(this.url)
          .then(function( response ) {
            self.parse(response);
            self.emit('fetch');
          }, function( err ) {
            self.emit('fetcherror', err);
          });
        return this;
      },
  
      parse: function( results ) {
        this.push.apply(this, results);
        return this;
      }
  
    });
  
  });
  
  Ash.module('SmartCollection', function() {
  
    function hashModels( models ) {
      return models.map(function( model ) {
        return model.guid;
      }).join(',');
    }
  
    return Ash.Collection.subclass('SmartCollection', {
  
      construct: function( opts ) {
        _extend.call(this, opts || {});
        if ( !this.collection ) {
          throw new Error('No collection provided');
        }
        this.model = this.collection.model;
        this.on(this.collection, 'add', this._onAdd.bind(this));
        this.on(this.collection, 'remove', this._onRemove.bind(this));
        Ash.Collection.prototype.clear.call(this);
        this._onAdd(this.collection._internal);
        this.init();
      },
  
      alwaysRefilter: false,
  
      // respond to parent collection `add` events
      _onAdd: function( models ) {
        var adds = [];
        _each.call(models, function( model ) {
          this.off(model);
          this.on(model, 'change', this._onChange.bind(this, model));
          // delete prior key from lookup on change
          this.on(model, 'change:' + model.key, function( id, prev ) {
            delete this._lookup[prev];
          }.bind(this));
          if ( this.indexOf(model) === -1 && this.filter(model) ) {
            adds.push(model);
          }
        }, this);
        if ( adds.length && !this.alwaysRefilter ) {
          this._insert(adds);
          this.emit('add', adds);
        }
        else {
          this._checkAll();
        }
      },
  
      // respond to parent collection `remove` events
      _onRemove: function( models ) {
        var deletes = [];
        _each.call(models, function( model ) {
          this.off(model);
          if ( this.indexOf(model) !== -1 ) {
            deletes.push(model);
          }
        }, this);
        if ( deletes.length && !this.alwaysRefilter ) {
          this._remove(deletes);
          this.emit('remove', deletes);
        }
        else {
          this._checkAll();
        }
      },
  
      // respond to model `change` events
      _onChange: function( model ) {
        var pass, index, oldHash, newHash;
        if ( this.alwaysRefilter ) {
          return this._checkAll();
        }
        pass = this.filter(model);
        index = this.indexOf(model);
        // add
        if ( pass && index === -1 ) {
          this._insert([model]);
          this.emit('add', [model]);
        }
        // change (re-sort)
        else if ( pass && index !== -1 ) {
          oldHash = hashModels(this._internal);
          this._internal.sort(this.sort.bind(this));
          newHash = hashModels(this._internal);
          if ( oldHash !== newHash ) {
            this.emit('sort');
          }
        }
        // remove
        else if ( !pass && index !== -1 ) {
          this._remove([model]);
          this.emit('remove', [model]);
        }
      },
  
      _checkAll: function() {
        var all = this.collection._internal.slice(),
          oldHash = hashModels(this._internal),
          valid = all.filter(this.filter),
          deletes,
          adds,
          newHash;
        deletes = _filter.call(this._internal, function( model ) {
          return valid.indexOf(model) === -1;
        });
        this._remove(deletes);
        adds = _filter.call(valid, function( model ) {
          return this.indexOf(model) === -1;
        }, this);
        this._insert(adds);
        newHash = hashModels(this._internal);
        if ( adds.length ) {
          this.emit('add', adds);
        }
        if ( deletes.length ) {
          this.emit('remove', deletes);
        }
        if ( oldHash !== newHash ) {
          this.emit('sort');
        }
      },
  
      // insert a model into the SmartCollection
      _insert: function( models ) {
        _each.call(models, function( model ) {
          var id = model.get(model.key);
          this._lookup[model.guid] = model;
          if ( id ) {
            this._lookup[id] = model;
          }
          this._internal.push(model);
        }, this);
        this.length = this._internal.length;
        this._internal.sort(this.sort.bind(this));
      },
  
      // remove a model from the SmartCollection
      _remove: function( models ) {
        _each.call(models, function( model ) {
          var id = model.get(model.key),
            index = this.indexOf(model);
          delete this._lookup[model.guid];
          this._internal.splice(index, 1);
          if ( id ) {
            delete this._lookup[id];
          }
        }, this);
        this.length = this._internal.length;
      },
  
      // optional user init method called on construct
      init: function() {
  
      },
  
      // get a model by ID (but don't add it to the SmartCollection)
      get: function( id ) {
        return this.collection.get(id);
      },
  
      // kill non-applicable inherited methods
      push: undefined,
      pop: undefined,
      unshift: undefined,
      shift: undefined,
      remove: undefined,
      fetch: undefined,
      parse: undefined,
      clear: undefined,
  
      slice: function() {
        var arr = Array.prototype.slice.apply(this._internal, arguments);
        return new this.collection.constructor(arr, {
          model: this.collection.model
        });
      },
  
      // filter function
      filter: function( model ) {
        return true;
      },
  
      // sort function
      sort: function( a, b ) {
        return 0;
      }
  
    });
  
  });
  

  Ash.module('ajax', function() {
  
    var defaults, types, getCallbackName, noop = function(){};
  
    // default AJAX settings
    defaults = Ash.def('ajaxSettings', {
      type: 'GET',
      timeout: 0,
      processData: true,
      success: noop,
      error: noop,
      complete: noop
    });
  
    // content types
    types = {
      form: 'application/x-www-form-urlencoded',
      json: 'application/json',
      text: 'text/html'
    };
  
    // generate a new unique callback name
    getCallbackName = (function() {
      var count = 0;
      return function() {
        return 'jsonpCallback' + (++count);
      };
    }());
  
    // take the options object for a request and decide
    // how to serialize the payload
    function serializePayload( opts ) {
      // form-urlencode an object
      if ( opts.processData && opts.data && !_type.string(opts.data) ) {
        opts.data = parameterize(opts.data);
      }
      // urlencode GET
      if ( opts.data && opts.type === 'GET' ) {
        opts.url = appendQuery(opts.url, opts.data);
        opts.data = undefined;
      }
      // JSON serialize an object
      if ( !opts.processData && _type.object(opts.data) ) {
        opts.data = JSON.stringify(opts.data);
      }
    }
  
    // append GET query to url
    function appendQuery( url, query ) {
      return ( url + '&' + query ).replace(/[&?]{1,2}/, '?');
    }
  
    // paramaterize an object
    function parameterize( obj ) {
      var params = [], encode = encodeURIComponent;
      params.add = function( key, val ){
        this.push(encode(key) + '=' + encode(val));
      };
      serialize(params, obj);
      return params.join('&').replace(/%20/g, '+');
    }
  
    // serialize an object
    function serialize( params, obj, scope ) {
      var type, hash = _type.object(obj);
      _each.call(obj, function( val, key ) {
        type = _type(val);
        if ( scope ) {
          key = scope + '[' +
            ( hash || type === 'object' || type === 'array' ? key : '' ) + ']';
        }
        // recurse into nested objects
        if ( type === 'array' || type === 'object' ){
          serialize(params, val, key);
        }
        else {
          params.add(key, val);
        }
      });
    }
  
    // handle AJAX successes
    function ajaxSuccess( data, xhr, opts, resolve, reject ) {
      var status = 'success';
      try {
        opts.success.call(xhr, data, status);
      }
      catch ( e ) {
        ajaxError(e, 'callback error', xhr, opts, reject);
        return;
      }
      resolve(data);
      ajaxComplete(status, xhr, opts);
    }
  
    // handle AJAX errors
    function ajaxError( error, type, xhr, opts, reject ) {
      try {
        opts.error.call(xhr, type, error);
      }
      catch ( e ) {
        reject(e);
        return;
      }
      reject(error || type);
      ajaxComplete(type, xhr, opts);
    }
  
    // handle AJAX completions
    function ajaxComplete( status, xhr, opts ) {
      opts.complete.call(xhr, status);
    }
  
    // JSONP request
    function jsonp( opts ) {
      var callbackName = getCallbackName(),
        promise, script, response, xhr, timer;
      // create an object to hold our JSONP callbacks
      window.jsonpCallbacks || ( window.jsonpCallbacks = {} );
      // create the target script element
      script = document.createElement('script');
      // make a fake xhr so we can abort
      xhr = {
        abort: function() {
          script.__aborted__ = true;
          script.onerror({type: 'error'}, 'abort');
        }
      };
      // create a new Promise
      promise = new Ash.Promise(function( resolve, reject ) {
        // listen for script load/error
        script.onload = script.onerror = function( e, errType ) {
          clearTimeout(timer);
          script.onerror = script.onload = noop;
          // didn't load? reject the promise
          if ( e.type === 'error' || !response || script.__aborted__ ) {
            ajaxError(null, errType || 'error', xhr, opts, reject);
          }
          // otherwise, resolve it
          else {
            ajaxSuccess(response[0], xhr, opts, resolve, reject);
          }
          // clean up after ourselves
          function cleanup() {
            Ash.Dom(script).remove();
            delete window.jsonpCallbacks[callbackName];
          }
          // you can't *really* abort a loading script,
          // so if/when the request fulfills, the callback needs to be
          // there or it'll throw
          //
          // note that weirdly, PhantomJS doesn't actually throw an error
          // when an injected script tries to invoke a function that doesn't
          // exist, so any changes to this section need to be tested in a
          // real browser
          if ( script.__aborted__ ) {
            window.jsonpCallbacks[callbackName] = cleanup;
          }
          // clean un the global namespace after a non-aborted request
          else {
            cleanup();
          }
        };
        // create the JSONP callback
        window.jsonpCallbacks[callbackName] = function() {
          // we use arguments here instead of arguments[0]
          // in case that value is falsy. this way, we know
          // the callback definitely ran
          response = arguments;
        };
        // append the callback name to the url and set it as script src
        script.src = opts.url.replace(/\?(.+)=\?/, '?$1=' +
          'jsonpCallbacks.' + callbackName);
        // add the new script to the document
        Ash.Dom(document.head).append(script);
        // timeout
        if ( opts.timeout > 0 ) {
          timer = setTimeout(function() {
            xhr.abort();
          }, opts.timeout);
        }
      });
      xhr.then = promise.then.bind(promise);
      xhr.catch = promise.catch.bind(promise);
      return xhr;
    }
  
    // Ash.ajax
    return function( url, options ) {
      var xhr = new XMLHttpRequest(), opts, timer, promise;
      // rearrange args to support options-only signature
      if ( _type.object(url) ) {
        options = url;
        url = undefined;
      }
      // extend AJAX options
      opts = _extend.call({}, defaults, options || {});
      opts.url = opts.url || url;
      // serialize payload if necessary
      serializePayload(opts);
      // check for JSONP
      if ( opts.dataType === 'jsonp' ) {
        opts.url = appendQuery(opts.url, 'callback=?');
        return jsonp(opts);
      }
      // create a new Promise
      promise = new Ash.Promise(function( resolve, reject ) {
        // make sure we have a valid URL
        if ( !_type.string(opts.url) ) {
          ajaxError(null, 'urlerror', xhr, opts, reject);
        }
        // open the request
        xhr.open(opts.type, opts.url, true);
        // set Content-Type header
        if ( opts.contentType || ( opts.data && opts.type !== 'GET' ) ) {
          xhr.setRequestHeader('Content-Type', types[opts.contentType] ||
            types.form);
        }
        // listen for changes
        xhr.onreadystatechange = function() {
          var result, status, text, responseType;
          // request complete? keep going
          if ( this.readyState === 4 ) {
            this.onreadystatechange = noop;
            clearTimeout(timer);
            // fix error in IE 9 where reading properties on an
            // aborted request throws
            try {
              status = this.status;
            }
            catch ( e ) {
              ajaxError(null, 'abort', this, opts, reject);
              return;
            }
            text = this.statusText;
            // good response? try to resolve
            if ( ( status >= 200 && status < 300 ) || status === 304 ) {
              responseType = opts.dataType ||
                this.getResponseHeader('Content-Type');
              result = this.responseText;
              // JSON parsing
              if ( /json/i.test(responseType) ) {
                try {
                  result = JSON.parse(result);
                }
                // reject the promise on error
                catch ( err ) {
                  ajaxError(err, 'parseerror', this, opts, reject);
                  return;
                }
              }
              // resolve
              ajaxSuccess(result, this, opts, resolve, reject);
            }
            // bad response? reject
            else {
              ajaxError(text || null, status ?
                'error' : 'abort', this, opts, reject);
            }
          }
        };
        // send the request
        if ( _type.undefined(opts.data) ) {
          xhr.send();
        }
        else {
          xhr.send( opts.data );
        }
        // timeout
        if ( opts.timeout > 0 ) {
          timer = setTimeout(function() {
            xhr.onreadystatechange = noop;
            xhr.abort();
            ajaxError(null, 'timeout', xhr, opts, reject);
          }, opts.timeout);
        }
      });
      // extend the xhr with Promise methods
      xhr.then = promise.then.bind(promise);
      xhr.catch = promise.catch.bind(promise);
      return xhr;
    };
  
  });
  
  // create convenience methods
  _each.call(['get', 'post', 'put', 'delete'], function( name ) {
    Ash.def(name, function( url, data, success, type ) {
      if ( _type.function(data) ) {
        type = type || success;
        success = data;
        data = undefined;
      }
      return Ash.ajax({
        url: url,
        type: name.toUpperCase(),
        dataType: type,
        data: data,
        success: success
      });
    });
  });
  

  return Ash;

}(this));
