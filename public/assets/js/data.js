function getArticles() {
    $.ajax({
        type: 'GET', url: '/articles/',
        contentType: 'application/json',
        headers: {
            'Content-Type': 'application/json',
        },
        success: function (response) {
            console.log(response)
            var articles = [];
            response.forEach(function (article) {
                articles.push(
                    '<div data-_id="' + article._id + '" class="card">' +
                    '<div class="card-header">' +
                    '<h3>' +
                    '<a class="article-link" target="_blank" rel="noopener noreferrer"' +
                    'href="' + article.link + '">' + article.title + '</a>' +
                    '<a class="btn btn-danger save" onclick="toggleSave(this)">Save Article</a>' +
                    '</h3>' +
                    '</div>' +
                    '<div class="card-body">' + article.description + '</div>' +
                    '</div>'
                )
            });
            $('#article_container').html(articles.join(''));
        }
    })
}

function getSavedArticles() {
    $.ajax({
        type: 'GET', url: '/articles/saved',
        contentType: 'application/json',
        headers: {
            'Content-Type': 'application/json',
        },
        success: function (response) {
            console.log(response)
            var articles = [];
            response.filter(function (article) {
                return article.saved;
            }).forEach(function (article) {
                articles.push(
                    '<div data-_id="' + article._id + '" class="card">' +
                    '<div class="card-header">' +
                    '<h3>' +
                    '<a class="article-link" target="_blank" rel="noopener noreferrer"' +
                    'href="' + article.link + '">' + article.title + '</a>' +
                    '<a class="btn btn-danger save" onclick="toggleSave(this)">Forget Article</a>' +
                    '</h3>' +
                    '</div>' +
                    '<div class="card-body">' + article.description + '</div>' +
                    '</div>'
                )
            });
            $('#article_container').html(articles.join(''));
        }
    })
}

function deleteArticles() {
    $.ajax({
        type: 'DELETE', url: '/articles',
        contentType: 'application/json',
        headers: {
            'Content-Type': 'application/json',
        },
        success: function (response) {
            location.reload();
        }
    })
}

function scrapeArticles() {
    $.ajax({
        type: 'get', url: '/scrape',
        contentType: 'application/json',
        headers: {
            'Content-Type': 'application/json',
        },
        success: function (response) {
            location.reload();
        }
    })
}

function toggleSave(el) {
    var _id = $(el).parent().parent().parent().attr('data-_id');
    console.log(_id)
    $.ajax({
        type: 'post', url: '/articles/save/' + _id,
        contentType: 'application/json',
        headers: {
            'Content-Type': 'application/json',
        },
        success: function (response) {
            console.log('saved: ' + _id)
        }
    })
}