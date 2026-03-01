(function () {
    'use strict';

    if (window.lampa_rating_working) return;
    window.lampa_rating_working = true;

    const OMDB_API_KEY = '36bce37e'; // твій OMDb ключ
    const SHIKIMORI_API = 'https://shikimori.one/api/animes?search='; // пошук по назві

    // перевірка, чи карточка аніме
    function isAnime(card) {
        return card.genres && card.genres.some(g => g.toLowerCase().includes('anime'));
    }

    // отримує рейтинг з OMDb
    function getOMDbRating(title) {
        return new Promise(resolve => {
            $.getJSON(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`)
            .done(data => resolve(data && data.imdbRating ? data.imdbRating : null))
            .fail(() => resolve(null));
        });
    }

    // отримує рейтинг з Shikimori по назві
    function getShikimoriRating(title) {
        return new Promise(resolve => {
            $.getJSON(SHIKIMORI_API + encodeURIComponent(title) + '&limit=1')
            .done(data => resolve(data && data.length > 0 && data[0].score ? data[0].score : null))
            .fail(() => resolve(null));
        });
    }

    // оновлює рейтинг на карточці
    async function updateRating(card, render) {
        if (!card || !render) return;

        let rating = null;

        if (isAnime(card)) {
            rating = await getShikimoriRating(card.name || card.original_name);
        } else {
            rating = await getOMDbRating(card.name || card.original_name);
        }

        if (!rating) return;

        let rateElem = render.find('.full-start__rate.custom-rating');
        if (!rateElem.length) {
            render.append('<div class="full-start__rate custom-rating" style="color:#FFD700;font-weight:bold;margin-top:5px;"></div>');
            rateElem = render.find('.full-start__rate.custom-rating');
        }

        rateElem.html(`<div style="color:#FFD700;font-weight:bold;">${rating}</div>`);
    }

    // обробка однієї карточки
    function processCard(e) {
        const card = e.data.movie || e.data.tv;
        if (!card) return;

        const render = e.object.activity.render();
        updateRating(card, render);
    }

    // підписка на нові карточки
    Lampa.Listener.follow('card', processCard);

    // обробка вже завантажених карточок
    setTimeout(() => {
        $('.full-start-new, .full-start').each(function () {
            const elem = $(this);
            const cardData = elem.data('movie') || elem.data('tv');
            if (cardData) updateRating(cardData, elem);
        });
    }, 1000);

})();
