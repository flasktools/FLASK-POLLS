// ==UserScript==
// @name		FLASK-POLLS
// @namespace	https://flasktools.altervista.org
// @version		1.7
// @author		moonlight900
// @description FLASK-Polls is a small extension for the browser game Grepolis. (Only polls)
// @copyright	2019+, flasktools
// @license     GNU 3.0
// @match		https://*.grepolis.com/game/*
// @match		https://*.forum.grepolis.com/*
// @match		https://flasktools.altervista.org/*
// @updateURL   https://github.com/flasktools/FLASK-POLLS/raw/main/FLASK-POLLS.user.js
// @downloadURL https://github.com/flasktools/FLASK-POLLS/raw/main/FLASK-POLLS.user.js
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @icon		https://flasktools.altervista.org/images/Forum.png
// @icon64		https://flasktools.altervista.org/images/Forum.png
// @grant		GM_info
// @grant		GM_setValue
// @grant		GM_getValue
// @grant		GM_deleteValue
// @grant		GM_xmlhttpRequest
// @grant		GM_getResourceURL
// ==/UserScript==

var number = '1.7';

//if(unsafeWindow.DM) console.dir(unsafeWindow.DM.status('l10n'));
//console.dir(DM.status('templates'));

//https://flasktools.altervista.org/images/Forum.png - FLASK-Polls-Icon

//http://de44.grepolis.com/cache/js/libs/jquery-1.10.2.min.js


//console.log(JSON.stringify(DM.getl10n()));


//// console.log(GM_getResourceText("flask_sprite"));

/*******************************************************************************************************************************
 * Global stuff
 *******************************************************************************************************************************/
var uw = unsafeWindow || window, $ = uw.jQuery || jQuery, DATA, GM;

// GM-API?
GM = (typeof GM_info === 'object');

console.log('%c|= FLASK-Polls is active =|', 'color: green; font-size: 1em; font-weight: bolder; ');

function loadValue(name, default_val){
    var value;
    if(GM){
        value = GM_getValue(name, default_val);
    } else {
        value = localStorage.getItem(name) || default_val;
    }

    if(typeof(value) === "string"){
        value = JSON.parse(value)
    }
    return value;
}

// LOAD DATA
if(GM && (uw.location.pathname.indexOf("game") >= 0)){
    var WID = uw.Game.world_id, MID = uw.Game.market_id, AID = uw.Game.alliance_id;

    //GM_deleteValue(WID + "_bullseyeUnit");

    DATA = {
        // GLOBAL
        options : loadValue("options", "{}"),

        user : loadValue("flask_user", "{}"),
        count: loadValue("flask_count", "[]"),

        notification : loadValue('notif', '0'),

        error: loadValue('error', '{}'),

        spellbox  :	loadValue("spellbox", '{ "top":"23%", "left": "-150%", "show": false }'),
        commandbox: loadValue("commandbox" , '{ "top":55, "left": 250 }'),
        tradebox  :	loadValue("tradebox", '{ "top":55, "left": 450 }'),

        // WORLD
        townTypes : loadValue(WID + "_townTypes", "{}"),
        sentUnits : loadValue(WID + "_sentUnits", '{ "attack": {}, "support": {} }'),

        biremes   : loadValue(WID + "_biremes", "{}"), //old
        bullseyeUnit : loadValue(WID + "_bullseyeUnit", '{ "current_group" : -1 }'), // new

        worldWonder : loadValue(WID + "_wonder", '{ "ratio": {}, "storage": {}, "map": {} }'),

        clickCount : loadValue(WID + "_click_count", '{}'), // old
        statistic : loadValue(WID + "_statistic", '{}'), // new

        // MARKET
        worldWonderTypes : loadValue(MID + "_wonderTypes", '{}')
    };

    if(!DATA.worldWonder.map) {
        DATA.worldWonder.map = {};
    }

    // Temporary:
    if(typeof DATA.options.trd == 'boolean') {
        DATA.options.per = DATA.options.rec = DATA.options.trd; delete DATA.options.trd;
    }
    if(typeof DATA.options.mov == 'boolean') {
        DATA.options.act = DATA.options.mov; delete DATA.options.mov;
    }
    if(typeof DATA.options.twn == 'boolean') {
        DATA.options.tic = DATA.options.til = DATA.options.tim = DATA.options.twn; delete DATA.options.twn;
    }
    if(GM) GM_deleteValue("notification");
}

// GM: EXPORT FUNCTIONS
uw.saveValueGM = function(name, val){
    setTimeout(function(){
        GM_setValue(name, val);
    }, 0);
};

uw.deleteValueGM = function(name){
    setTimeout(function(){
        GM_deleteValue(name);
    },0);
};

uw.getImageDataFromCanvas = function(x, y){

    // console.debug("HEY", document.getElementById('canvas_picker').getContext('2d').getImageData(x, y, 1, 1));
};
uw.calculateConcaveHull = function() {
    var contour = [
        new poly2tri.Point(100, 100),
        new poly2tri.Point(100, 300),
        new poly2tri.Point(300, 300),
        new poly2tri.Point(300, 100)
    ];

    var swctx = new poly2tri.SweepContext(contour);

    swctx.triangulate();
    var triangles = swctx.getTriangles();

    // console.debug(triangles);

    return triangles;
};

if(typeof exportFunction == 'function'){
    // Firefox > 30
    //uw.DATA = cloneInto(DATA, unsafeWindow);
    exportFunction(uw.saveValueGM, unsafeWindow, {defineAs: "saveValueGM"});
    exportFunction(uw.deleteValueGM, unsafeWindow, {defineAs: "deleteValueGM"});
    exportFunction(uw.calculateConcaveHull, unsafeWindow, {defineAs: "calculateConcaveHull"});
    exportFunction(uw.getImageDataFromCanvas, unsafeWindow, {defineAs: "getImageDataFromCanvas"});
} else {
    // Firefox < 30, Chrome, Opera, ...
    //uw.DATA = DATA;
}

var time_a, time_b;

// APPEND SCRIPT
function appendScript(){
    //console.log("GM-API: " + gm_bool);
    if(document.getElementsByTagName('body')[0]){
        var flaskscript = document.createElement('script');
        flaskscript.type ='text/javascript';
        flaskscript.id = 'flasktools';

        time_a = uw.Timestamp.client();
        flaskscript.textContent = FLASK_GAME.toString().replace(/uw\./g, "") + "\n FLASK_GAME('"+ number +"', "+ GM +", '" + JSON.stringify(DATA).replace(/'/g, "##") + "', "+ time_a +");";
        document.body.appendChild(flaskscript);
    } else {
        setTimeout(function(){
            appendScript();
        }, 500);
    }
}

if(location.host === "flasktools.altervista.org"){
    // PAGE
    FLASK_PAGE();
}
else if((uw.location.pathname.indexOf("game") >= 0) && GM){
    // GAME
    appendScript();
}
else {
    FLASK_FORUM();
}

function FLASK_PAGE(){

    document.getElementById("pied-de-page-pub-2").innerHTML = "";
}



function FLASK_GAME(number, gm, DATA, time_a) {
    var MutationObserver = uw.MutationObserver || window.MutationObserver,

        WID, MID, PID,

        flask_sprite = "https://flasktools.altervista.org/images/vxk8zp.png", // https://flasktools.altervista.org/images/r2w2lt.png,
        flask_icon = '<img src="https://flasktools.altervista.org/images/166d6p2.png" style="width: 20px;float:left;margin: 1px 4px 0px -3px">';

    if (uw.location.pathname.indexOf("game") >= 0) {
        DATA = JSON.parse(DATA.replace(/##/g, "'"));

        WID = uw.Game.world_id;
        MID = uw.Game.market_id;
        PID = uw.Game.player_id;
    }

    $.prototype.reverseList = [].reverse;

    // Implement old jQuery method (version < 1.9)
    $.fn.toggleClick = function () {
        var methods = arguments;    // Store the passed arguments for future reference
        var count = methods.length; // Cache the number of methods

        // Use return this to maintain jQuery chainability
        // For each element you bind to
        return this.each(function (i, item) {
            // Create a local counter for that element
            var index = 0;

            // Bind a click handler to that element
            $(item).on('click', function () {
                // That when called will apply the 'index'th method to that element
                // the index % count means that we constrain our iterator between 0
                // and (count-1)
                return methods[index++ % count].apply(this, arguments);
            });
        });
    };

    function saveValue(name, val) {
        if (gm) {
            saveValueGM(name, val);
        } else {
            localStorage.setItem(name, val);
        }
    }

    function deleteValue(name) {
        if (gm) {
            deleteValueGM(name);
        } else {
            localStorage.removeItem(name);
        }
    }

    /*******************************************************************************************************************************
     * Graphic filters
     *******************************************************************************************************************************/
    if (uw.location.pathname.indexOf("game") >= 0) {
        $('<svg width="0%" height="0%">' +
                // GREYSCALE
            '<filter id="GrayScale">' +
            '<feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0">' +
            '</filter>' +
                // SEPIA
            '<filter id="Sepia">' +
            '<feColorMatrix type="matrix" values="0.343 0.669 0.119 0 0 0.249 0.626 0.130 0 0 0.172 0.334 0.111 0 0 0.000 0.000 0.000 1 0">' +
            '</filter>' +
                // SATURATION
            '<filter id="Saturation"><feColorMatrix type="saturate" values="0.2"></filter>' +
            '<filter id="Saturation1"><feColorMatrix type="saturate" values="1"></filter>' +
            '<filter id="Saturation2"><feColorMatrix type="saturate" values="2"></filter>' +
                // HUE
            '<filter id="Hue1"><feColorMatrix type="hueRotate" values= "65"></filter>' +
            '<filter id="Hue2"><feColorMatrix type="hueRotate" values="150"></filter>' +
            '<filter id="Hue3"><feColorMatrix type="hueRotate" values="-65"></filter>' +
                // BRIGHTNESS
            '<filter id="Brightness15">' +
            '<feComponentTransfer><feFuncR type="linear" slope="1.5"/><feFuncG type="linear" slope="1.5"/><feFuncB type="linear" slope="1.5"/></feComponentTransfer>' +
            '</filter>' +
            '<filter id="Brightness12">' +
            '<feComponentTransfer><feFuncR type="linear" slope="1.2"/><feFuncG type="linear" slope="1.2"/><feFuncB type="linear" slope="1.2"/></feComponentTransfer>' +
            '</filter>' +
            '<filter id="Brightness11">' +
            '<feComponentTransfer><feFuncR type="linear" slope="1.1"/><feFuncG type="linear" slope="1.1"/><feFuncB type="linear" slope="1.1"/></feComponentTransfer>' +
            '</filter>' +
            '<filter id="Brightness10">' +
            '<feComponentTransfer><feFuncR type="linear" slope="1.0"/><feFuncG type="linear" slope="1.0"/><feFuncB type="linear" slope="1.0"/></feComponentTransfer>' +
            '</filter>' +
            '<filter id="Brightness07">' +
            '<feComponentTransfer><feFuncR type="linear" slope="0.7"/><feFuncG type="linear" slope="0.7"/><feFuncB type="linear" slope="0.7"/></feComponentTransfer>' +
            '</filter>' +
            '</svg>').appendTo('#ui_box');
    }

    /*******************************************************************************************************************************
     * Language versions: italian
     *******************************************************************************************************************************/
var LANG = {
        it: {
            settings: {
                dsc: "FLASK-Polls offre, sondaggi su proposte della InnoGames e dei giocatori",
                act: "Attivazione/Disattivazione delle carrateristiche del tool:",
                prv: "Antemprima di molte caratteristiche:",

                number_old: "Versione da aggiornare",
                number_new: "Versione aggiornata",
                number_dev: "Versione sviluppatore",

                number_update: "Aggiornare",

                link_forum: "https://it.forum.grepolis.com/index.php?threads/script-flask-polls.23288/",
                link_contact: "https://it.forum.grepolis.com/index.php?members/moonlight900.30315/",
                link_answer: "https://docs.google.com/forms/d/e/1FAIpQLSfZJfm-SCMMe2JTiB141bfN2RBKofvnKUPr3PGgZ-YUTl6F4g/viewanalytics",
                Update: "https://it.forum.grepolis.com/index.php?members/moonlight900.30315/",

                forum: "Forum",
                author: "Autore",
                Answer: "Risultati",

                cat_polls: "Sondaggi"
            },
            options: {
                pol: ["Sondaggi", "Partecipa ai sondaggi della community"],
                err: ["Invia automaticamente il report dei bug", "Se attivi questa opzione, puoi aiutare a identificare i bug."]
            },
            labels: {
                pol: "Sondaggi"
            },
            buttons: {
                sav: "Salva", ins: "Inserisci", res: "Reset"
            },
            iframe: {
                ifr: "https://docs.google.com/forms/d/e/1FAIpQLSfZJfm-SCMMe2JTiB141bfN2RBKofvnKUPr3PGgZ-YUTl6F4g/viewform?embedded=true",
                wdt: "640",
                hgt: "1752",
            },
        },
        en: {
            settings: {
                dsc: "FLASK-Polls offers, polls on proposals from InnoGames and players ",
                act: "Activate/deactivate features of the toolset:",
                prv: "Preview of several features:",

                number_old: "Version is not up to date",
                number_new: "Version is up to date",
                number_dev: "Developer version",

                number_update: "Update",

                link_forum: "https://it.forum.grepolis.com/index.php?threads/script-flask-polls.23288/",
                link_contact: "https://it.forum.grepolis.com/index.php?members/moonlight900.30315/",
                link_answer: "https://docs.google.com/forms/d/e/1FAIpQLSfZJfm-SCMMe2JTiB141bfN2RBKofvnKUPr3PGgZ-YUTl6F4g/viewanalytics",
                Update: "https://it.forum.grepolis.com/index.php?members/moonlight900.30315/",

                forum: "Forum",
                author: "Author",
                Answer: "Answers",

                cat_polls: "Surveys"
            },
            options: {
                pol: ["Surveys", "Take part in community surveys"],
                err: ["Send bug reports automatically", "If you activate this option, you can help identify bugs."]
            },
            labels: {
                pol: "Surveys"
            },
            buttons: {
                sav: "Save", ins: "Insert", res: "Reset"
            },
            iframe: {
                ifr: "https://docs.google.com/forms/d/e/1FAIpQLSdux-cvy0dL4A4np53L_o98_V0SnqvO-l7g8mpMdBRUEFSNqQ/viewform?embedded=true",
                wdt: "640",
                hgt: "672",
            },
        }

    };

    // Create JSON
    // console.log(JSON.stringify(LANG.en));


    console.debug("SPRACHE", MID);
    // Translation GET
    function getText(category, name) {
        var txt = "???";
        if (LANG[MID]) {
            if (LANG[MID][category]) {
                if (LANG[MID][category][name]) {
                    txt = LANG[MID][category][name];
                } else {
                    if (LANG.en[category]) {
                        if (LANG.en[category][name]) {
                            txt = LANG.en[category][name];
                        }
                    }
                }
            } else {
                if (LANG.en[category]) {
                    if (LANG.en[category][name]) {
                        txt = LANG.en[category][name];
                    }
                }
            }
        } else {
            if (LANG.en[category]) {
                if (LANG.en[category][name]) {
                    txt = LANG.en[category][name];
                }
            }
        }
        return txt;
    }

    /*******************************************************************************************************************************
     * Settings
     *******************************************************************************************************************************/

    // (De)activation of the features
    var options_def = {
        pol: false, // Polls
        err: false // Error Reports
    };

    if (uw.location.pathname.indexOf("game") >= 0) {
        for (var opt in options_def) {
            if (options_def.hasOwnProperty(opt)) {
                if (DATA.options[opt] === undefined) {
                    DATA.options[opt] = options_def[opt];
                }
            }
        }
    }

    var number_text = '', number_color = 'black';
    $('<script src="https://openuserjs.org/install/flasktools/Flask-polls-version.user.js"></script>').appendTo("head");
    function getLatestNumber() {
        $('<style id="flask_number">' +
            '#number_info .number_icon { background: url(https://flasktools.altervista.org/images/r2w2lt.png) -50px -50px no-repeat; width:25px; height:25px; float:left; } ' +
            '#number_info .number_icon.red { filter:hue-rotate(-100deg); -webkit-filter: hue-rotate(-100deg); } ' +
            '#number_info .number_icon.green { filter:hue-rotate(0deg); -webkit-filter: hue-rotate(0deg); } ' +
            '#number_info .number_icon.blue { filter:hue-rotate(120deg); -webkit-filter: hue-rotate(120deg); } ' +
            '#number_info .number_text { line-height: 2; margin: 0px 6px 0px 6px; float: left;} ' +
            '</style>').appendTo("head");

        var n_info = $('#number_info');
        if (number_text === '') {
                    if (number < latest_number) {
                        number_text = "<div class='number_icon red'></div><div class='number_text'>" + getText('settings', 'number_old') + "</div><div class='number_icon red'></div>" +
                            '<a class="number_text" href="https://github.com/flasktools/FLASK-POLLS/raw/main/FLASK-POLLS.user.js" target="_top">--> Update</a>';
                        number_color = 'crimson';
                    } else if (number == latest_number) {
                        number_text = "<div class='number_icon green'></div><div class='number_text'>" + getText('settings', 'number_new') + "</div><div class='number_icon green'></div>";
                        number_color = 'darkgreen';
                    } else {
                        number_text = "<div class='number_icon blue'></div><div class='number_text'>" + getText('settings', 'number_dev') + "</div><div class='number_icon blue'></div>";
                        number_color = 'darkblue';
                    }
                    n_info.html(number_text).css({color: number_color});
                }
        else {
            n_info.html(number_text).css({color: number_color});
        }
    }

    // Add FLASK-Polls to grepo settings
    function settings() {
        var wid = $(".settings-menu").get(0).parentNode.id;

        if (!$("#flask_polls").get(0)) {
            $(".settings-menu ul:last").append('<li id="flask_li"><img id="flask_icon" src="https://flasktools.altervista.org/images/166d6p2.png"></div> <a id="flask_polls" href="#"> FLASK-Polls</a></li>');
        }

        $(".settings-link").click(function () {
            $('.section').each(function () {
                this.style.display = "block";
            });
            $('.settings-container').removeClass("flask_overflow");

            $('#flask_bg_medusa').css({display: "none"});

            if ($('#polls_settings').get(0)) {
                $('#polls_settings').get(0).style.display = "none";
            }
        });

        $("#flask_polls").click(function () {
            if ($('.email').get(0)) {
                $('.settings-container').removeClass("email");
            }

            $('.settings-container').addClass("flask_overflow");

            $('#flask_bg_medusa').css({display: "block"});

            if (!$('#polls_settings').get(0)) {
                // Styles
                $('<style id="polls_settings_style">' +
                        // Chrome Scroollbar Style
                    '#polls_settings ::-webkit-scrollbar { width: 13px; } ' +
                    '#polls_settings ::-webkit-scrollbar-track { background-color: rgba(130, 186, 135, 0.5); border-top-right-radius: 4px; border-bottom-right-radius: 4px; } ' +
                    '#polls_settings ::-webkit-scrollbar-thumb { background-color: rgba(87, 121, 45, 0.5); border-radius: 3px; } ' +
                    '#polls_settings ::-webkit-scrollbar-thumb:hover { background-color: rgba(87, 121, 45, 0.8); } ' +

                    '#polls_settings table tr :first-child { text-align:center; vertical-align:top; } ' +

                    '#polls_settings #number_info { font-weight:bold;height: 35px;margin-top:-5px; } ' +
                    '#polls_settings #number_info img { margin:-1px 2px -8px 0px; } ' +

                    '#polls_settings .icon_types_table { font-size:0.7em; line-height:2.5; border:1px solid green; border-spacing:10px 2px; border-radius:5px; } ' +
                    '#polls_settings .icon_types_table td { text-align:left; } ' +

                    '#polls_settings table p { margin:0.2em 0em; } ' +

                    '#polls_settings .checkbox_new .cbx_caption { white-space:nowrap; margin-right:10px; font-weight:bold; } ' +

                    '#polls_settings .polls_settings_tabs {width:auto; border:2px solid darkgreen; background:#2B241A; padding:1px 1px 0px 1px; right:auto; border-top-left-radius:5px; border-top-right-radius:5px; border-bottom:0px;} ' +

                    '#polls_settings .polls_settings_tabs li { float:left; } ' +

                    '#polls_settings .icon_small { margin:0px; } ' +

                    '#polls_settings img { max-width:90px; max-height:90px; margin-right:10px; } ' +

                    '#polls_settings .content { border:2px solid darkgreen; border-radius:5px; border-top-left-radius:0px; background:rgba(31, 25, 12, 0.1); top:23px; position:relative; padding:10px; height:350px; overflow-y:auto; } ' +
                    '#polls_settings .content .content_category { display:none; border-spacing:5px; } ' +

                    '#polls_settings .flask_options_table legend { font-weight:bold; } ' +
                    '#polls_settings .flask_options_table p { margin:0px; } ' +
                    '#polls_settings #donate_btn { filter: hue-rotate(45deg); -webkit-filter: hue-rotate(45deg); } ' +

                    '#donate_btn { background: url(' + flask_sprite + '); width:120px; height:28px; background-position: 0px -250px; } ' +
                    '#donate_btn.it { background-position: 0px -290px; } ' +
                    '#donate_btn.en { background-position: 0px -250px; } ' +

                    '#flask_hall table { border-spacing: 9px 3px; } ' +
                    '#flask_hall table th { text-align:left !important;color:green;text-decoration:underline;padding-bottom:10px; } ' +
                    '#flask_hall table td.value { text-align: right; } ' +

                    '#flask_hall table td.laurel.green { background: url("/images/game/ally/founder.png") no-repeat; height:18px; width:18px; background-size:100%; } ' +
                    '#flask_hall table td.laurel.bronze { background: url("https://flasktools.altervista.org/images/game/laurel_sprite.png") no-repeat 25%; height:18px; width:18px; } ' +
                    '#flask_hall table td.laurel.silver { background: url("https://flasktools.altervista.org/images/game/laurel_sprite.png") no-repeat 50%; height:18px; width:18px; } ' +
                    '#flask_hall table td.laurel.gold { background: url("https://flasktools.altervista.org/images/game/laurel_sprite.png") no-repeat 75%; height:18px; width:18px; } ' +
                    '#flask_hall table td.laurel.blue { background: url("https://flasktools.altervista.org/images/game/laurel_sprite.png") no-repeat 100%; height:18px; width:18px; } ' +
                    '</style>').appendTo('head');


                $('.settings-container').append(
                    '<div id="polls_settings" class="player_settings section"><div id="flask_bg_medusa"></div>' +
                    '<div class="game_header bold"><a href="#" target="_blank" style="color:white">FLASK-Polls (v' + number + ')</a></div>' +

                        // Check latest version
                    '<div id="number_info"><img src="http://666kb.com/i/csmicltyu4zhiwo5b.gif" /></div>' +

                        // Donate button
                    '<div style="position:absolute; left: 495px;top: 40px;"><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=flasktools%40gmail.com&currency_code=EUR&source=url" target="_blank">' +
                    '<div id="donate_btn" class="' + MID + '" alt="Donate"></div></a></div>' +

                        // Settings navigation
                    '<ul class="menu_inner polls_settings_tabs">' +
                    '<li><a class="submenu_link active" href="#" id="flask_polls"><span class="left"><span class="right"><span class="middle">' + getText("settings", "cat_polls") + '</span></span></span></a></li>' +
                    '</ul>' +

                        // Settings content
                    '<DIV class="content">' +

                        // Units tab
                    '<table id="flask_polls_table" class="content_category visible"><tr>' +
                    '<td><img src="http://flasktools.altervista.org/Poll/images/Poll.jpg" alt="" /></td>' +
                    '<td><div id="pol" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "pol")[0] + '</div></div>' +
                    '<p>' + getText("options", "pol")[1] + '  ' +
                    '<a href=' + getText("settings", "link_answer") + ' target="_blank">' + getText("settings", "Answer") + '</a></p></td>' +
                    '</tr></table>' +


                        // Hall of FLASK-Polls tab
                    '<div id="flask_hall" class="content_category">'+
                    "<p>I like to thank all of you who helped the development of FLASK-Polls by donating or translating!</p>"+
                    '<table style="float:left;margin-right: 75px;">'+
                    '<tr><th colspan="3">Donations</th></tr>'+
                    (function(){
                        var donations = [
                        ];
                        var donation_table = "";

                        for(var d = 0; d < donations.length; d++){

                            var donation_class = "";

                            switch(donations[d][1]){
                                case 50: donation_class = "gold";   break;
                                case 25: donation_class = "silver"; break;
                                case 20: donation_class = "bronze"; break;
                                default: donation_class = "green";  break;
                            }

                            donation_table += '<tr class="donation"><td class="laurel '+ donation_class +'"></td><td>' + donations[d][0] + '</td><td class="value">' + donations[d][1] + '€</td></tr>';
                        }

                        return donation_table;
                    })() +
                    '</table>'+
                    '<table>'+
                    '<tr><th colspan="3">Translations</th></tr>'+
                    (function(){
                        var translations = [
                        ];

                        var translation_table = "";

                        for(var d = 0; d < translations.length; d++){
                            translation_table += '<tr class="translation"><td class="laurel blue"></td><td >' + translations[d][0] + '</td><td class="value">' + translations[d][1] + '</td></tr>';
                        }

                        return translation_table;
                    })() +
                    '</table>'+
                    '</div>' +

                    '</DIV>' +

                        // Links (Forum, PM, ...)
                    '<div style="bottom: -50px;font-weight: bold;position: absolute;width: 99%;">' +

                    '<a id="hall_of_flasktools" href="#" style="font-weight:bold; float:left">' +
                    '<img src="/images/game/ally/founder.png" alt="" style="float:left;height:19px;margin:0px 5px -3px;"><span>Hall of FLASK-Polls</span></a>' +

                    '<span class="bbcodes_player bold" style="font-weight:bold; float:right; margin-left:20px;">' + getText("settings", "author") + ': ' +
                    '<a id="link_contact" href=' + getText("settings", "link_contact") + ' target="_blank">moonlight900</a></span>' +

                    '<a id="link_forum" href=' + getText("settings", "link_forum") + ' target="_blank" style="font-weight:bold; float:right">' +
                    '<img src="https://flasktools.altervista.org/images/Forum.png" alt="" style="margin: 0px 5px -3px 5px;" /><span>' + getText("settings", "forum") + '</span></a>' +

                    '</div>' +

                    '</div></div>');

                getLatestNumber();

                // Tab event handler
                $('#polls_settings .polls_settings_tabs .submenu_link').click(function () {
                    if (!$(this).hasClass("active")) {
                        $('#polls_settings .polls_settings_tabs .submenu_link.active').removeClass("active");
                        $(this).addClass("active");
                        $("#polls_settings .visible").removeClass("visible");
                        $("#" + this.id + "_table").addClass("visible");
                    }
                });

                //
                $('#hall_of_flasktools').click(function () {
                    $('#polls_settings .polls_settings_tabs .submenu_link.active').removeClass("active");

                    $("#polls_settings .visible").removeClass("visible");
                    $("#flask_hall").addClass("visible");
                });

                $("#polls_settings .checkbox_new").click(function () {
                    $(this).toggleClass("checked").toggleClass("disabled").toggleClass("green");
                    toggleActivation(this.id);

                    DATA.options[this.id] = $(this).hasClass("checked");

                    saveValue("options", JSON.stringify(DATA.options));
                });

                $('#polls_settings .radiobutton .option').click(function(){

                    //$(this).attr("name");
                    $('#polls_settings .radiobutton .option').removeClass("checked").addClass("disabled").removeClass("green");
                    DATA.options.cls = false;
                    DATA.options.hol = false;
                    DATA.options.bbt = false;
                    DATA.options.mrv = false;
                    $(this).toggleClass("checked").toggleClass("disabled").toggleClass("green");
                    toggleActivation(this.id);

                    DATA.options[this.id] = $(this).hasClass("checked");
                    saveValue("options", JSON.stringify(DATA.options));
                    if (DATA.options.pop){
                    FavorPopup.deactivate();
                    FavorPopup.activate();
                    };

                    //$('#polls_settings .radiobutton .option.checked').removeClass("checked");
                    //$(this).addClass("checked");
                });

                for (var e in DATA.options) {
                    if (DATA.options.hasOwnProperty(e)) {
                        if (DATA.options[e] === true) {
                            $("#" + e).addClass("checked").addClass("green");
                        } else {
                            $("#" + e).addClass("disabled");
                        }
                    }
                }

                $('#flask_save').click(function () {
                    $('#polls_settings .checkbox_new').each(function () {
                        var act = false;
                        if ($("#" + this.id).hasClass("checked")) {
                            act = true;
                        }
                        DATA.options[this.id] = act;
                    });
                    saveValue("options", JSON.stringify(DATA.options));
                });
            }
            $('.section').each(function () {
                this.style.display = "none";
            });
            $('#polls_settings').get(0).style.display = "block";
        });
    }

    function toggleActivation(opt) {
        var FEATURE, activation = true;
        switch (opt) {
            case "pol":
                FEATURE = Polls;
                break;

            default:
                activation = false;
                break;
        }
        if (activation) {
            if (DATA.options[opt]) {
                FEATURE.deactivate();
            } else {
                FEATURE.activate();
            }
        }
    }

    function addSettingsButton() {
        var tooltip_str = "FLASK-Polls: " + (DM.getl10n("layout", "config_buttons").settings || "Settings");

        $('<div class="btn_settings circle_button polls_settings"><div class="flask_icon js-caption"></div></div>').appendTo(".gods_area");

        // Style
        $('<style id="polls_settings_button" type="text/css">' +
            '#ui_box .btn_settings.polls_settings { top:50px; right:103px; z-index:10; } ' +
            '#ui_box .polls_settings .flask_icon { margin:8px 0px 0px 7px; width:18px; height:20px; background:url(https://flasktools.altervista.org/images/Forum.png) no-repeat 0px 0px; background-size:100% } ' +
            '#ui_box .polls_settings .flask_icon.click { margin-top:8px; }' +
            '</style>').appendTo('head');

        // Tooltip
        $('.polls_settings').tooltip(tooltip_str);

        // Mouse Events
        $('.polls_settings').on('mousedown', function () {
            $('.flask_icon').addClass('click');
        });
        $('.polls_settings').on('mouseup', function () {
            $('.flask_icon').removeClass('click');
        });
        $('.polls_settings').click(openSettings);
    }

    var flasksettings = false;

    function openSettings() {
        if (!GPWindowMgr.getOpenFirst(Layout.wnd.TYPE_PLAYER_SETTINGS)) {
            flasksettings = true;
        }
        Layout.wnd.Create(GPWindowMgr.TYPE_PLAYER_SETTINGS, 'Settings');
    }

    var exc = false, sum = 0, ch = ["IGCCJB"], alpha = 'ABCDEFGHIJ';

    function a() {
        var pA = PID.toString(), pB = "";

        for (var c in pA) {
            if (pA.hasOwnProperty(c)) {
                pB += alpha[pA[parseInt(c, 10)]];
            }
        }

        sum = 0;
        for (var b in ch) {
            if (ch.hasOwnProperty(b)) {
                if (pB !== ch[b]) {
                    exc = true;
                } else {
                    exc = false;
                    return;
                }
                for (var s in ch[b]) {
                    if (ch[b].hasOwnProperty(s)) {
                        sum += alpha.indexOf(ch[b][s]);
                    }
                }
            }
        }
    }


    var autoTownTypes, manuTownTypes, population, sentUnitsArray, biriArray, commandbox, tradebox;

    function setStyle() {
        // Settings
        $('<style id="polls_settings_style" type="text/css">' +
            '#flask_bg_medusa { background:url(https://flasktools.altervista.org/images/game/settings/medusa_transp.png) no-repeat; height: 510px; width: 380px; right: -10px; top:6px; z-index: -1; position: absolute;} ' +
            '.flask_overflow  { overflow: hidden; } ' +
            '#flask_icon  { width:15px; vertical-align:middle; margin-top:-2px; } ' +
            '#quackicon { width:15px !important; vertical-align:middle !important; margin-top:-2px; height:12px !important; } ' +
            '#polls_settings .green { color: green; } ' +
            '#polls_settings .visible { display:block !important; } ' +
            '</style>').appendTo('head');

        // Town Icons
        $('<style id="flask_icons" type="text/css">.icon_small { position:relative; height:20px; width:25px; }</style>').appendTo('head');

        // Tutorial-Quest Container
        $('<style id="flask_quest_container" type="text/css"> #tutorial_quest_container { top: 130px } </style>').appendTo('head');

        // Velerios
        $('<style id="flask_velerios" type="text/css"> #ph_trader_image { background-image: url(https://flasktools.altervista.org/images/marchand-phenicien.jpg); } </style>').appendTo('head');
        // http://s7.directupload.net/images/140826/bgqlsdrf.jpg

        // Specific player wishes
        if (PID == 1212083) {
            $('<style id="flask_wishes" type="text/css"> #world_end_info { display: none; } </style>').appendTo('head');
        }
    }

    function loadFeatures() {
        if (typeof(ITowns) !== "undefined") {

            autoTownTypes = {};
            manuTownTypes = DATA.townTypes;
            population = {};

            sentUnitsArray = DATA.sentUnits;
            biriArray = DATA.biremes;

            commandbox = DATA.commandbox;
            tradebox = DATA.tradebox;

            var FLASK_USER = {'name': uw.Game.player_name, 'market': MID};
            saveValue("flask_user", JSON.stringify(FLASK_USER));


            $.Observer(uw.GameEvents.game.load).subscribe('FLASK_START', function (e, data) {
                a();

                // English => default language
                if (!LANG[MID]) {
                    MID = "en";
                }

                if ((ch.length == 1) && exc && (sum == 28)) {
                    // AJAX-EVENTS
                    setTimeout(function () {
                        ajaxObserver();
                    }, 0);

                    addSettingsButton();

                    addFunctionToITowns();

                    if (DATA.options.tsk) {
                        setTimeout(function () {
                            minimizeDailyReward();

                            if(Game.market_id !== "de" && Game.market_id !== "zz") {
                                Taskbar.activate();
                            }
                        }, 0);
                    }

                    //addStatsButton();

                    fixUnitValues();

                    setTimeout(function () {

                        var waitCount = 0;

                        // No comment... it's Grepolis... i don't know... *rolleyes*
                        function waitForGrepoLazyLoading() {
                            if (typeof(ITowns.townGroups.getGroupsFLASK()[-1]) !== "undefined" && typeof(ITowns.getTown(Game.townId).getBuildings) !== "undefined") {

                                try {
                                    // Funktion wird manchmal nicht ausgefÃ¼hrt:
                                    var units = ITowns.getTown(Game.townId).units();


                                    if (DATA.options.pol) {
                                        setTimeout(function () {
                                            Polls.activate();
                                        }, 0);
                                    }

                                } catch(e){
                                    if(waitCount < 12) {
                                        waitCount++;

                                        console.warn("FLASK-Polls | Fehler | getAllUnits | units() fehlerhaft ausgefÃ¼hrt?", e);

                                        // AusfÃ¼hrung wiederholen
                                        setTimeout(function () {
                                            waitForGrepoLazyLoading();
                                        }, 5000); // 5s
                                    }
                                    else {
                                        errorHandling(e, "waitForGrepoLazyLoading2");
                                    }
                                }
                            }
                            else {
                                var e = { "stack": "getGroups() = " + typeof(ITowns.townGroups.getGroupsFLASK()[-1]) + ", getBuildings() = " + typeof(ITowns.getTown(Game.townId).getBuildings) };

                                if(waitCount < 12) {
                                    waitCount++;

                                    console.warn("FLASK-Polls | Fehler | getAllUnits | " + e.stack);

                                    // AusfÃ¼hrung wiederholen
                                    setTimeout(function () {
                                        waitForGrepoLazyLoading();
                                    }, 5000); // 5s
                                }
                                else {


                                    errorHandling(e, "waitForGrepoLazyLoading2");
                                }
                            }
                        }

                        waitForGrepoLazyLoading();

                    }, 0);


                    setTimeout(function () {
                        counter(uw.Timestamp.server());
                        setInterval(function () {
                            counter(uw.Timestamp.server());
                        }, 21600000);
                    }, 60000);

                    // Notifications
                    setTimeout(function () {
                        Notification.init();
                    }, 0);

                    setTimeout(function(){ HolidaySpecial.activate(); }, 0);




                }
                time_b = uw.Timestamp.client();
                //console.log("Gebrauchte Zeit:" + (time_b - time_a));
            });
        } else {
            setTimeout(function () {
                loadFeatures();
            }, 100);
        }
    }

    if (uw.location.pathname.indexOf("game") >= 0) {
        setStyle();

        loadFeatures();
    }

    /*******************************************************************************************************************************
     * HTTP-Requests
     * *****************************************************************************************************************************/
    function ajaxObserver() {
        $(document).ajaxComplete(function (e, xhr, opt) {

            var url = opt.url.split("?"), action = "";

            //console.debug("0: ", url[0]);
            //console.debug("1: ", url[1]);

            if(typeof(url[1]) !== "undefined" && typeof(url[1].split(/&/)[1]) !== "undefined") {

                action = url[0].substr(5) + "/" + url[1].split(/&/)[1].substr(7);
            }


            if (PID == 84367 || PID == 104769 || PID == 1577066) {
                console.log(action);
                //console.log((JSON.parse(xhr.responseText).json));
            }
            switch (action) {
                case "/frontend_bridge/fetch": // Daily Reward
                    //$('.daily_login').find(".minimize").click();
                    break;
                case "/player/index":
                    settings();
                    if (flasksettings) {
                        $('#flask_polls').click();
                        flasksettings = false;
                    }
                    break;
                // Ab Grepolis Version 2.114 ist der Ajax-Request: /frontend_bridge/execute
            }
        });
    }

    function test() {
        //http://gpde.innogamescdn.com/images/game/temp/island.png

        //console.log(uw.WMap);
        //console.log(uw.WMap.getSea(uw.WMap.getXCoord(), uw.WMap.getYCoord()));

        //console.log(uw.GameControllers.LayoutToolbarActivitiesController().prototype.getActivityTypes());
        //console.log(uw.GameViews);
        //console.log(uw.GameViews.BarracksUnitDetails());

        //console.log(uw.ITowns.getTown(uw.Game.townId).unitsOuter().sword);
        //console.log(uw.ITowns.getCurrentTown().unitsOuter().sword);

        //console.log(uw.ITowns.getTown(uw.Game.townId).researches().attributes);
        //console.log(uw.ITowns.getTown(uw.Game.townId).hasConqueror());
        //console.log(uw.ITowns.getTown(uw.Game.townId).allUnits());
        //console.log(uw.ITowns.all_units.fragments[uw.Game.townId]._byId);
        //console.log("Zeus: " + uw.ITowns.player_gods.zeus_favor_delta_property.lastTriggeredVirtualPropertyValue);
        //console.log(uw.ITowns.player_gods.attributes);

        //console.log(uw.ITowns.getTown('5813').createTownLink());
        //console.log(uw.ITowns.getTown(5813).unitsOuterTown);

        //console.log(uw.ITowns.getTown(uw.Game.townId).getLinkFragment());

        //console.log(uw.ITowns.getTown(uw.Game.townId).allGodsFavors());

        console.debug("STADTGRUPPEN", Game.constants.ui.town_group);
    }

    /*******************************************************************************************************************************
     * Helping functions
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ● fixUnitValues: Get unit values and overwrite some wrong values
     * | ● getMaxZIndex: Get the highest z-index of "ui-dialog"-class elements
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    var flask = {};

    // Fix buggy grepolis values
    function fixUnitValues() {
        //uw.GameData.units.small_transporter.attack = uw.GameData.units.big_transporter.attack = uw.GameData.units.demolition_ship.attack = uw.GameData.units.militia.attack = 0;
        //uw.GameData.units.small_transporter.defense = uw.GameData.units.big_transporter.defense = uw.GameData.units.demolition_ship.defense = uw.GameData.units.colonize_ship.defense = 0;
        uw.GameData.units.militia.resources = {wood: 0, stone: 0, iron: 0};
    }

    function getMaxZIndex() {
        var maxZ = Math.max.apply(null, $.map($("div[class^='ui-dialog']"), function (e, n) {
            if ($(e).css('position') == 'absolute') {
                return parseInt($(e).css('z-index'), 10) || 1000;
            }
        }));
        return (maxZ !== -Infinity) ? maxZ + 1 : 1000;
    }

    function getBrowser() {
        var ua = navigator.userAgent,
            tem,
            M = ua.match(/(opera|maxthon|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            M[1] = 'IE';
            M[2] = tem[1] || '';
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/);
            if (tem !== null) {
                M[1] = 'Opera';
                M[2] = tem[1];
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/number\/(\d+)/i)) !== null) M.splice(1, 1, tem[1]);

        return M.join(' ');
    }

    // Error Handling / Remote diagnosis / Automatic bug reports
    function errorHandling(e, fn) {
        if (PID == 84367 || PID == 104769 || PID === 1291505) {
            HumanMessage.error("FLASK-POLLS(" + number + ")-ERROR: " + e.message);
            console.log("FLASK-POLLS | Error-Stack | ", e.stack);
        } else {
            if (!DATA.error[number]) {
                DATA.error[number] = {};
            }

            if (DATA.options.err && !DATA.error[number][fn]) {
                $.ajax({
                    type: "POST",
                    url: "https://diotools.de/game/error.php",
                    data: {error: e.stack.replace(/'/g, '"'), "function": fn, browser: getBrowser(), version: number},
                    success: function (text) {
                        DATA.error[number][fn] = true;
                        saveValue("error", JSON.stringify(DATA.error));
                    }
                });
            }
        }
    }

    function createWindowType(name, title, width, height, minimizable, position) {
        $('<style id="flask_window">' +
            '.flask_title_img { height:20px; float:left; margin-right:3px; } ' +
            '.flask_title { margin:1px 6px 13px 23px; color:rgb(126,223,126); } ' +
            '</style>').appendTo('head');

        // Create Window Type
        function WndHandler(wndhandle) {
            this.wnd = wndhandle;
        }

        Function.prototype.inherits.call(WndHandler, WndHandlerDefault);
        WndHandler.prototype.getDefaultWindowOptions = function () {
            return {
                position: position,
                width: width,
                height: height,
                minimizable: minimizable,
                title: "<img class='flask_title_img' src='https://flasktools.altervista.org/images/166d6p2.png' /><div class='flask_title'>" + title + "</div>"
            };
        };
        GPWindowMgr.addWndType(name, "", WndHandler, 1);
    }

    // Notification
    var Notification = {
        init: function () {
            // NotificationType
            NotificationType.FLASK_TOOLS = "flasktools";

            // Style
            $('<style id="flask_notification" type="text/css">' +
                '#notification_area .flasktools .icon { background: url(https://flasktools.altervista.org/images/166d6p2.png) 4px 7px no-repeat !important;} ' +
                '#notification_area .flasktools { cursor:pointer; } ' +
                '</style>').appendTo('head');

            var notif = DATA.notification;
            if (notif <= 7) {
                //Notification.create(1, 'Swap context menu buttons ("Select town" and "City overview")');
                //Notification.create(2, 'Town overview (old window mode)');
                //Notification.create(3, 'Mouse wheel: You can change the views with the mouse wheel');
                //Notification.create(4, 'Town icons on the strategic map');
                //Notification.create(5, 'Percentual unit population in the town list');
                //Notification.create(6, 'New world wonder ranking');
                //Notification.create(7, 'World wonder icons on the strategic map');

                // Click Event
                $('.flasktools .icon').click(function () {
                    openSettings();
                    $(this).parent().find(".close").click();
                });

                saveValue('notif', '8');
            }
        },
        create: function (nid, feature) {
            var Notification = new NotificationHandler();
            Notification.notify($('#notification_area>.notification').length + 1, uw.NotificationType.FLASK_TOOLS,
                "<span style='color:rgb(8, 207, 0)'><b><u>New Feature!</u></b></span>" + feature + "<span class='small notification_date'>FLASK-Polls: v" + number + "</span>");
        }
    };

    /*******************************************************************************************************************************
     * Vital functions
     *******************************************************************************************************************************/

    function imageSelectionProtection() {
        $('<style id="flask_image_selection" type="text/css"> img { -moz-user-select: -moz-none; -khtml-user-select: none; -webkit-user-select: none;} </style>').appendTo('head');
    }

    function addFunctionToITowns() {
        // Copy function and prevent an error
        uw.ITowns.townGroups.getGroupsFLASK = function () {
            var town_groups_towns, town_groups, groups = {};

            // #Grepolis Fix: 2.75 -> 2.76
            if (MM.collections) {
                town_groups_towns = MM.collections.TownGroupTown[0];
                town_groups = MM.collections.TownGroup[0];
            } else {
                town_groups_towns = MM.getCollections().TownGroupTown[0];
                town_groups = MM.getCollections().TownGroup[0];
            }

            town_groups_towns.each(function (town_group_town) {
                var gid = town_group_town.getGroupId(),
                    group = groups[gid],
                    town_id = town_group_town.getTownId();

                if (!group) {
                    groups[gid] = group = {
                        id: gid,
                        //name: town_groups.get(gid).getName(), // hier tritt manchmal ein Fehler auf: TypeError: Cannot read property "getName" of undefined at http://_.grepolis.com/cache/js/merged/game.js?1407322916:8298:525
                        towns: {}
                    };
                }

                group.towns[town_id] = {id: town_id};
                //groups[gid].towns[town_id]={id:town_id};
            });
            //console.log(groups);
            return groups;
        };
        uw.ITowns.getHeroFLASK = function () {
            var town_groups_towns, town_groups, groups = {};


            return groups;
        };
    }

    /*******************************************************************************************************************************
     * Polls access
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Improved a button to access to the polls
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    var Polls = {
        activate: function () {
            // Add button
            Polls.addButton();

            // Create Window Type
            createWindowType("FLASK_POLL", getText("labels", "pol"), 640, 1800, true, ["center", "center", 100, 100]);

            // Style
            $('<style id="flask_poll_style">' +

                    // Button
                '#flask_poll_button { top:51px; left:3px; z-index:10; position:absolute; } ' +
                '#flask_poll_button .ico_poll { margin:7px 0px 0px 8px; width:17px; height:17px; background:url(http://flasktools.altervista.org/Poll/images/ballot-box-5588999_1280.png) no-repeat 0px 0px; background-size:100%; } ' +
                '#flask_poll_button .ico_poll.checked { margin-top:8px; } ' +

              '</style>').appendTo('head');
        },

        deactivate: function () {
            $('#flask_poll_button').remove();
            $('#flask_poll_style').remove();

        },
        addButton: function () {
            $('<div id="flask_poll_button" class="circle_button"><div class="ico_poll js-caption"></div></div>').appendTo(".bull_eye_buttons");


            // Events
            $('#flask_poll_button').on('mousedown', function () {
                if (!Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_POLL)) {
                    Polls.openWindow();
                    $('#flask_poll_button').addClass("checked");
                } else {
                    Polls.closeWindow();
                    $('#flask_poll_button').removeClass("checked");
                }
            });
            // Tooltip
            $('#flask_poll_button').tooltip(getText("labels", "pol"));
        },
        openWindow: function () {
            var content =
                    // Content
                '<iframe src=' + getText("iframe", "ifr") + ' width=' + getText("iframe", "wdt") + ' height=' + getText("iframe", "hgt") + ' frameborder="0" marginheight="0" marginwidth="0">Caricamento…</iframe>'

            Layout.wnd.Create(GPWindowMgr.TYPE_FLASK_POLL).setContent(content);
        },
        closeWindow: function () {
            Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_POLL).close();
        },
    };
}
