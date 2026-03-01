// rating_override_lampa.js
(function(){
    'use strict';

    if(window.rating_override_loaded) return;
    window.rating_override_loaded = true;

    function getCustomRatingSource(type){
        if(type === 'anime') return 'shikimori';
        if(type === 'movie' || type === 'tv' || type === 'cartoon') return 'omdb';
        return 'tmdb';
    }

    Lampa.Listener.follow('cards', function(card){
        if(card.data && card.rating){
            var source = getCustomRatingSource(card.data.type);
            if(source){
                card.rating.source = source;
            }
        }
    });

})();
