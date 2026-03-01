(function () {
    'use strict';

    if (window.lampa_rating_override_loaded) return;
    window.lampa_rating_override_loaded = true;

    const OMDB_API_KEY = '36bce37e';
    const SHIKIMORI_API = 'https://shikimori.one/api/animes/';

    // Перевіряємо чи карточка аніме
    function isAnime(card) {
        return card.genres && card.genres.includes('Anime');
    }

    // Отримуємо рейтинг з OMDb
    function getOMDbRating(title) {
        return new Promise(resolve => {
            const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
            $.getJSON(url, data => resolve(data && data.imdbRating ? data.imdbRating : null))
             .fail(() => resolve(null));
        });
    }

    // Отримуємо рейтинг з Shikimori
    function getShikimoriRating(id) {
        return new Promise(resolve => {
            $.getJSON(SHIKIMORI_API + id, data => resolve(data && data.score ? data.score : null))
             .fail(() => resolve(null));
        });
    }

    // Оновлюємо рейтинг у карточці
    async function updateRating(card, render) {
        let ratingValue = null;

        if (isAnime(card) && card.shikimori_id) {
            ratingValue = await getShikimoriRating(card.shikimori_id);
        } else {
            const title = card.name || card.original_name;
            if (title) ratingValue = await getOMDbRating(title);
        }

        if (!ratingValue) return;

        // Шукаємо елемент рейтингу у карточці
        let rateElem = render.find('.full-start__rate, .card__rate');
        if (!rateElem.length) {
            render.append('<div class="full-start__rate custom-rating"></div>');
            rateElem = render.find('.full-start__rate');
        }

        rateElem.html(`<div style="color:#FFD700; font-weight:bold;">${ratingValue}</div>`);
    }

    // Подія рендеру карточки
    function onCardRender(e) {
        const card = e.data.movie || e.data.tv;
        if (!card) return;

        const render = e.object.activity.render();
        updateRating(card, render);
    }

    // Підписуємось на подію Lampa
    Lampa.Listener.follow('card', onCardRender);

})();
