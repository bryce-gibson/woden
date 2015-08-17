
'use strict';

var ProxyCache = require( '../' ),
    url = require('url'),
    proxycache = new ProxyCache( {
        output: process.stdout,
        proxyUnsupportedMethods: true
    } ),
    DS = { };

proxycache.when( new RegExp(), {
    getKey: function ( path, query ) {
        return path
    }
} );

// don't crash on errors
proxycache.on( 'error', console.error.bind( console ) );

proxycache.store({
    get: function( key, callback ) {
        callback( null, DS[ key ] );
    },
    set: function( options, callback ) {
        DS[ options.key ] = options.value;
        if ( options.timeout > 0 ) {
            setTimeout( function() {
                delete DS[ options.key ];
            }, options.timeout );
        }
        callback();
    }
});

proxycache.on('request', function(req) {
    process.nextTick(function() {
        if(req.method.toLowerCase() == 'get') return
        var regex = new RegExp('^' + req._target + req.url, 'i')
        Object.getOwnPropertyNames(DS).forEach(function(key) {
            if(!regex.test( key )) return
            console.log('Deleting cache for ' + key)
            delete DS[key]
        })
    })
})

proxycache.listen( 9000 );
