var Spider = require('node-spider');
var _ = require("ramda");
var S = require("underscore.string");
var columnify = require('columnify')

var investors = [];

var spider = new Spider({
    // How many requests can be run in parallel
    concurrent: 5,
    // How long to wait after each request
    delay: 1,
    // A stream to where internal logs are sent, optional
    logs: process.stderr,
    // Re-visit visited URLs, false by default
    allowDuplicates: false,
    // If `true` all queued handlers will be try-catch'd, errors go to `error` callback
    catchErrors: true,
    // Called when there's an error, throw will be used if none is provided
    error: function(err, url) {},
    // Called when there are no more requests
    done: function() {
        columnify(investors);
    },

    //- All options are passed to `request` module, for example:
    headers: { 'user-agent': 'node-spider' },
    encoding: 'utf8'
});

var handleRequest = function(doc) {
    // new page crawled
    // console.log(doc.res); // response object
    console.log(doc.url); // page url
    // uses cheerio, check its docs for more info
    // doc.$('a').each(function(i, elem) {
    // do stuff with element
    // var href = elem.attr('href').split('#')[0];
    // var url = doc.resolve(href);
    // crawl more
    // spider.queue(url, handleRequest);
    // });


};



var person_info = function(doc) {

    var inverstor = {};
    var get_data = _.pipe(_.prop("children"), _.head, _.prop("data"));
    var get_data2 = _.pipe(_.prop("children"), _.last, _.prop("data"));

    var get_name = get_data;

    inverstor.info = doc.url;

    var name = null;
    doc.$('.userTxt h1').each(function(i, elem) {
        inverstor.name = get_name(elem);
    });

    var address = null;
    doc.$('.itemCompanyTxt p > a').each(function(i, elem) {
        inverstor.address = get_data(elem);
    });

    var userIntro = null;

    var enterReplace = _.replace(/(^\s*)|(\s*$)/g, "");

    doc.$('.userIntro').each(function(i, elem) {
        inverstor.userIntro = enterReplace(get_data(elem));
    })

    var wechat = null;

    doc.$(".userWeixinQrcode h3:last-child").each(function(i, elem) {
        inverstor.wechat = S.dedent(get_data2(elem));
    });

    var campany = null;

    doc.$(".itemCompanyTxt h1 a:last-child").each(function(i, elem) {
        inverstor.companyUrl = doc.resolve(elem.attribs.href);
        inverstor.campany = get_data(elem);
    });

    console.log(prints(inverstor));
}

function prints(i) {
    return i.name + "||" + i.info + "||" + i.address + "||" + i.userIntro + "||" + i.wechat + "||" + i.campany + "||" + i.companyUrl;
}

var itemRequest = function(doc) {
    doc.$('.i-investor-list li>a').each(function(i, elem) {
        var href = elem.attribs.href;
        var info_url = doc.resolve(href);
        spider.queue(info_url, person_info);
    });
};

// start crawling
// spider.queue('https://www.evervc.com/investors.html?page=1&cates=3889', itemRequest);

var url = function(i) {
    return "https://www.evervc.com/investors.html?page=" + i + "&cates=3889"
};

var handle = function(url) {
    spider.queue(url, itemRequest);
};

_.forEach(_.pipe(url, handle), _.range(1, 31));
