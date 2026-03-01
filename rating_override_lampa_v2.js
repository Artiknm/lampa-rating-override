(function () {
    'use strict';

    if (window.lampa_rating_override_loaded) return;
    window.lampa_rating_override_loaded = true;

    const OMDB_API_KEY = 'http://www.omdbapi.com/?i=tt3896198&apikey=36bce37e'; // твій OMDb ключ
    const SHIKIMORI_API = 'https://shikimori.one/api/animes/'; // базовий URL Shikimori

    function isAnime(card) {
        return card.genres && card.genres.includes('Anime');
    }

    function getOMDbRating(title) {
        return new Promise((resolve) => {
            const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
            $.getJSON(url, function(data) {
                if (data && data.imdbRating) resolve(data.imdbRating);
                else resolve(null);
            }).fail(() => resolve(null));
        });
    }

    function getShikimoriRating(id) {
        return new Promise((resolve) => {
            $.getJSON(SHIKIMORI_API + id, function(data) {
                if (data && data.score) resolve(data.score);
                else resolve(null);
            }).fail(() => resolve(null));
        });
    }

    async function updateRating(card, render) {
        let ratingValue = null;

        if (isAnime(card) && card.shikimori_id) {
            ratingValue = await getShikimoriRating(card.shikimori_id);
        } else {
            const title = card.name || card.original_name;
            if (title) ratingValue = await getOMDbRating(title);
        }

        if (!ratingValue) return;

        // знаходимо елемент рейтингу у карточці
        let rateElem = render.find('.full-start__rate');
        if (!rateElem.length) {
            render.append('<div class="full-start__rate custom-rating"></div>');
            rateElem = render.find('.full-start__rate');
        }

        rateElem.html(`<div style="color:#FFD700; font-weight:bold;">${ratingValue}</div>`);
    }

    function onCardRender(e) {
        const card = e.data.movie || e.data.tv;
        if (!card) return;

        const render = e.object.activity.render();
        updateRating(card, render);
    }

    Lampa.Listener.follow('card', onCardRender);
})();
