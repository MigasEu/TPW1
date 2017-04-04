////////////////////////////////////////////////////////////////////////////////
// Global Variables
var stories;                                                                        //stores all the stories
var sTitle;                                                                         //stores title element

//new story
var newStory;                                                                       //stores new story
var prevPieces;
var presentId;
var presentChoice;
var nextId;


////////////////////////////////////////////////////////////////////////////////
// jQuery Initiaization
$(document).ready(function () {
    $.getJSON("data/stories.json", function (data) {                                //load story list from json
        stories = data;
        loadMainPage();
    });
    $("#toHome").click(function() { loadStories($("#maincontainer")); });

    isLoged();
});





////////////////////////////////////////////////////////////////////////////////
// Load HTML and its processment
function loadMainPage() {
    if (Cookies.get("username") == null) {
        listContainer = $("#maincontainer").load("templates/main.html", function () {
            loadStories($("#story-list-container"));
        });
    } else {
        loadStories($("#maincontainer"));
    }
}

function isLoged() {
    $("#navbar-left").find(":not(:first-child)").remove();
    if (Cookies.get("username") == null) {                                          //if not loged
        $("#logincontainer").load("templates/tologin.html");
        $("#other").load("templates/login.html", loadLoginForm);
    } else {                                                                        //if already loged
        $("#logincontainer").load("templates/tologoff.html", function () {
            $("#usernameHandle").text(Cookies.get("username"))                      //print user name handle
            $("#a2logoff").click(logout);                                           //logout on click
        });                                                                         // load tologoff
        loadLogedLeft();
    }
}

function loadLoginForm() {
    $("#in_username, #in_password").keyup(checkLoginInput);
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        login($(this));
    });
}

function loadLogedLeft() {
    $.get("templates/logedLeft.html", function (data) {
        var leftNavHTML = $(data).appendTo("#navbar-left");                         //append logedLeft on nav
        $("#create-link").on('click', loadCreation);                                //add loadCreate on click
    });
}

function loadCreation() {
    $("#maincontainer").load("templates/createStory.html", function () {
        newStory = {
            "id": stories.length,
            "title": "",
            "pieces": []
        };
        prevPieces = []
        presentId = 0;
        nextId = 0;
        autosize($('.create-story .story-title'));                                      //enable text area auto size
        $("#create-save").click(saveStory);
        loadCreatePiece();
    });
}

function saveStory() {
    newStory.title = $(".create-story .story-title").val();
    stories.push(newStory);
    loadStories($("#maincontainer"));
}

function loadCreatePiece() {
    $.get("templates/createPiece.html", function (data) {                               //load html
        createPieceHTML = $(data).appendTo(".create-pieces");                       //append html
        createPieceHTML.find(".dropdown-menu").on('click', 'a', function () {
            var pieceType = Number($(this).attr("piecetype"));
            createSelectType(createPieceHTML, pieceType);
            createPieceHTML.find('.dropdown-toggle').html($(this).text() + '<span class="caret"></span>');
            createPieceHTML.find('.create-ok').off('click');
            createPieceHTML.find('.create-ok').on('click',
                function () { addStoryPiece(createPieceHTML, pieceType); });
        });
    });
}

function createSelectType(createPiece, selectedType) {
    switch (selectedType) {
        case 0:
            loadCreateEvent(createPiece);
            break;
        case 1:
            loadCreateChoices(createPiece);
            break;
        case 2:
            loadCreateLoss(createPiece);
            break;
        case 3:
            loadCreateWin(createPiece);
            break;
    }
}

function loadCreateEvent(createPiece) {
    createPiece.find(".create-piece-middle").load("templates/createEvent.html", function () {
        autosize($(this).find(".create-event"));
        checkCreateInput($(this), 0);
        $(this).on('keyup', '.create-event', (function () { checkCreateInput($(this), 0) }));
    });
}

function loadCreateLoss(createPiece) {
    createPiece.find(".create-piece-middle").load("templates/createFinal.html", function () {
        autosize($(this).find(".create-final"));
        $(this).find(".create-final").addClass("event-lose");
        checkCreateInput($(this), 2);
        $(this).on('keyup', '.create-final', (function () { checkCreateInput($(this), 0) }));
    });
}

function loadCreateWin(createPiece) {
    createPiece.find(".create-piece-middle").load("templates/createFinal.html", function () {
        autosize($(this).find(".create-final"));
        $(this).find(".create-final").addClass("event-win");
        checkCreateInput($(this), 3);
        $(this).on('keyup', '.create-final', (function () { checkCreateInput($(this), 0) }));
    });
}

function loadCreateChoices(createPiece) {
    var mid = createPiece.find(".create-piece-middle");
    mid.load("templates/createChoices.html", function () {
        appendCreateChoice(mid.find('.choices'));
        mid.find('.create-choice-more').on('click',
                function () { appendCreateChoice(mid.find('.choices')) });
        mid.find('.create-choice-less').on('click',
                function () { removeCreateChoice(mid.find('.choices')) });
    });
}

function appendCreateChoice(elem) {
    var nChoices = elem.children().length;
    if (nChoices+1 <= 3) {
        $.get("templates/createChoice.html", function (data) {                      //load html
            var choiceHTML = $(data).appendTo(elem);                                //append html
            choiceHTML.addClass("choice-" + nChoices);
            autosize(choiceHTML);
            checkCreateInput(choiceHTML, 1);
            choiceHTML.on('keyup',
                (function () { checkCreateInput($(this), 1); }));

            if (nChoices + 1 == 2)
                elem.parent().find(".create-choice-less").prop('disabled', false);           //disabled false for -
            if (nChoices + 1 == 3)
                elem.parent().find(".create-choice-more").prop('disabled', true);            //disabled true for +
        });
    }
}

function removeCreateChoice(elem) {
    var nChoices = elem.children().length;
    if (nChoices > 1) {
        elem.find(":last-child").remove();

        if (nChoices - 1 == 1)
            elem.parent().find(".create-choice-less").prop('disabled', true);                //disabled true for -
        if (nChoices - 1 == 2)
            elem.parent().find(".create-choice-more").prop('disabled', false);                //disabled false for +
    }
}

function addStoryPiece(elem, pieceType) {
    switch (pieceType) {
        case 0:
            addStoryEvent(elem);
            break;
        case 1:
            addChoicesEvent(elem);
            break;
        case 2:
            addStoryFinal(elem, 2);
            break;
        case 3:
            addStoryFinal(elem, 3);
            break;
    }
    elem.find(".select-piece-type .btn").prop('disabled', true);
    elem.find(".create-ok").prop('disabled', true);
}

function addStoryEvent(elem) {
    var id = nextId;
    var json = {
        "id": id,
        "text": elem.find(".create-piece-middle .create-event").val(),
        "next": null,
        "type": 0
    };
    elem.find(".create-piece-middle .create-event").prop('readonly', true);
    elem.data("json", json);
    prevPieces.push(json);
    newStory.pieces[id] = json;
    nextId = presentId + 1
    newStory.pieces[id].next = nextId;
    presentId++;
    loadCreatePiece();
}

function addStoryFinal(elem,pieceType) {
    var id = nextId;
    var json = {
        "id": id,
        "text": elem.find(".create-piece-middle .create-final").val(),
        "type": pieceType
    };
    elem.find(".create-piece-middle .create-final").prop('readonly', true);
    elem.data("json", json);
    prevPieces.push(json);
    newStory.pieces[id] = json;
    nextId = presentId + 1
    newStory.pieces[id].next = nextId;
    presentId++;
}

function addChoicesEvent(elem) {
    var id = nextId;
    var choices = []
    elem.find(".choices").children().each(function (index) {
        choices.push({
            "text": $(this).val(),
            "next": null
        });
        $(this).prop('readonly', true);
        $(this).on("dblclick", function () { selectCreateChoice($(this), id, index); });
    });
    elem.find(".create-choice-quantity").empty();
    var json = {
        "id": id,
        "choices": choices,
        "type": 1
    };
    elem.data("json", json);
    prevPieces.push(json);
    newStory.pieces[id] = json;
    presentChoice = 0;
    nextId = presentId + 1;
    newStory.pieces[id].choices[presentChoice].next = nextId;
    presentId++;
    loadCreatePiece();
}

function selectCreateChoice(elem, p, choiceIndex) {
    elem.parents(".create-piece").nextAll().remove();
    if (newStory.pieces[p].choices[choiceIndex].next == null) {
        nextId = presentId + 1;
        presentId++;
        newStory.pieces[p].choices[choiceIndex].next = nextId;
        loadCreatePiece();
    } else {
        reloadPath(p, choiceIndex);
    }
}

function reloadPath(p, choiceIndex) {
    var nextP;
    if (newStory.pieces[p].type == 0) {
        nextP = newStory.pieces[p].next;
    } else if (newStory.pieces[p].type == 1) {
        nextP = newStory.pieces[p].choices[choiceIndex].next;
    }

    if (nextP != null) {
        var createPieceHTML;

        $.get("templates/createPiece.html", function (data) {                               //load html
            createPieceHTML = $(data).appendTo(".create-pieces");                       //append html
            createPieceHTML.find(".dropdown-menu").on('click', 'a', function () {
                var pieceType = Number($(this).attr("piecetype"));
                createSelectType(createPieceHTML, pieceType);
                createPieceHTML.find('.dropdown-toggle').html($(this).text() + '<span class="caret"></span>');
                createPieceHTML.find('.create-ok').on('click',
                    function () { addStoryPiece(createPieceHTML, pieceType); });
            });
            if (newStory.pieces[nextP] != undefined) {
                createPieceHTML.find(".select-piece-type .btn").prop('disabled', true);

                if (newStory.pieces[nextP].type == 1) {
                    var mid = createPieceHTML.find(".create-piece-middle");
                    mid.load("templates/createChoices.html", function () {
                        mid.find('.create-choice-more').on('click',
                                function () { appendCreateChoice(mid.find('.choices')) });
                        mid.find('.create-choice-less').on('click',
                                function () { removeCreateChoice(mid.find('.choices')) });
                        $.each(newStory.pieces[nextP].choices, function (index) {
                            var choiceJson = this;
                            $.get("templates/createChoice.html", function (data) {                      //load html
                                var elem = mid.find('.choices');
                                var choiceHTML = $(data).appendTo(elem);                                //append html
                                choiceHTML.addClass("choice-" + index);
                                autosize(choiceHTML);
                                choiceHTML.on("dblclick", function () { selectCreateChoice(choiceHTML, nextP, index); });
                                if (newStory.pieces[nextP].next != null) {
                                    checkCreateInput(choiceHTML, 1);                                    
                                    choiceHTML.on('keyup',
                                        (function () { checkCreateInput($(this), 1); }));

                                    if (index + 1 == 2)
                                        elem.parent().find(".create-choice-less").prop('disabled', false);           //disabled false for -
                                    if (index + 1 == 3)
                                        elem.parent().find(".create-choice-more").prop('disabled', true);            //disabled true for +
                                } else {
                                    choiceHTML.prop('readonly', true);
                                    elem.parent().find(".create-choice-quantity").empty();
                                }

                                choiceHTML.text(choiceJson.text);
                            });
                        });
                    });
                } else {
                    createPieceHTML.find(".create-piece-middle").load("templates/createEvent.html", function () {
                        autosize($(this).find(".create-event"));
                        checkCreateInput($(this), 0);
                        $(this).on('keyup', '.create-event', (function () { checkCreateInput($(this), 0) }));                            
                        $(this).find(".create-event").text(newStory.pieces[nextP].text);

                        if (newStory.pieces[nextP].type == 2) {                                            //if it's a lose event
                            $(this).find(".create-event").addClass("event-lose");                //add event-lose class
                        } else if (newStory.pieces[nextP].type == 3) {                                     //if it's a win event
                            $(this).find(".create-event").addClass("event-win");                 //add event-win class
                        }

                        $(this).find(".create-event").prop('readonly', true);
                        $(this).find(".create-event").prop('readonly', true);
                    });
                }
                reloadPath(nextP, 0);
            } else {
                nextId = nextP;
            }
        });
    }
}

function loadStories(container) {
    container.load("templates/storyList.html", function () {
        $.each(stories, function (index) {
            $.get("templates/storyCard.html", function (data) {                         //load html
                var cardHTML = $(data).appendTo(".stories-list");                       //append html
                cardHTML.find(".story-title").text(stories[index].title);               //print the choice text
                cardHTML.on('click', function () { loadStory(stories[index].id); });    //add loadStory event on click
            });
        });
    });
}

function loadStory(id) {
    $("#maincontainer").load("templates/storyIntro.html", function () {             //load intro element
        sTitle = $(".storyIntro").find(".story-title");                             //get intro element
        scrollTo(sTitle);                                                           //scroll to intro
        sTitle.text(stories[id].title);                                             //add title text
        sTitle.data("id", id);                                                      //store story id on info element
        sTitle.data("index", 0);                                                    //store index on info element
        loadNextPiece();                                                            //load next piece (first)
    });
}

function loadNextPiece() {
    var sId = sTitle.data("id");                                                    //stores locally the story id
    var i = sTitle.data("index");                                                   //stores locally the story piece index to load
    var piece = stories[sId].pieces[i];                                             //stores locally the piece info
    switch (piece.type) {
        case 2:                                                                     
        case 3:                                                                     
        case 0:
            showEvent(piece);
            break;
        case 1:
            showChoices(piece);
            break;
    }
}

function showEvent(eve) {
    $.get("templates/event.html", function (data) {
        var eventHTML = $(data).appendTo("#maincontainer");                     //append html of the event
        eventHTML.attr("id", "event-"+eve.id)                                   //set the id
        eventHTML.data("json", eve);                                            //store event info
        eventHTML.find(".eventContent").text(eve.text);                         //print the event text
        scrollTo(eventHTML);                                                    //scroll to event

        if (eve.type == 0) {                                                //if it's a normal event
            sTitle.data("index", eve.next);                                     //update index to next
            loadNextPiece();                                                    //load next piece
        } else {
            if (eve.type == 2) {                                            //if it's a lose event
                eventHTML.find(".event").addClass("event-lose");                //add event-lose class
            } else if (eve.type == 3) {                                     //if it's a win event
                eventHTML.find(".event").addClass("event-win");                 //add event-win class
            }
            $.get("templates/restart.html", function (data) {                   //load restart button
                var restartHTML = $(data).appendTo("#maincontainer");           //appent restart button to main container
                restartHTML.on('click',                                         //add click event
                    function () { loadStory(sTitle.data("id")); });             //reLoad story on click
            });
        }
    });
}

function showChoices(piece) {
    $.get("templates/choices.html", function (data) {
        var choicesHTML = $(data).appendTo("#maincontainer");                       //append html of the event
        choicesHTML.attr("id", "choices-" + piece.id)                               //set the id
        choicesHTML.data("choices", piece);                                         //store event info
        scrollTo(choicesHTML);                                                      //scroll to choices
        $.each(piece.choices, function (index) {                                //for each choice
            $.get("templates/choice.html", function (data2) {                       //load html
                var choiceHTML = $(data2).appendTo(choicesHTML);                    //append html
                choiceHTML.find(".choiceContent").text(piece.choices[index].text);  //print the choice text
                choiceHTML.find(".choice").addClass("choice-"+index);               //change backgroud-color
                choiceHTML.find(".choice").on('click',
                    { "allChoices": piece.choices }, selectChoice);                 //add selectChoice event on click
                choiceHTML.find(".choice").data("choice", piece.choices[index]);    //store data of the choice
            });
        });
    });
}

function selectChoice(event) {
    var choice = $(this);                                                           //choice element
    choice.prop('disabled', true);                                                  //disable selected
    choice.off();                                                                   //turn off event handler
    $.when($(this).parent(".col").siblings().each(function (index) {            //for each sibling
        $(this).find(".choice").prop('disabled', true);                             //disable choice
        $(this).fadeOut(800, function () { $(this).detach(); });                    //animation of other choices fading out
    })).then(function () {                                                      //after siblings are gone
        sTitle.data("index", choice.data("choice").next);                          //update de index of the piece to 
        loadNextPiece();                                                           //load next piece (of the selected choice)
    });
}

////////////////////////////////////////////////////////////////////////////////
// Load JSON and its processment









////////////////////////////////////////////////////////////////////////////////
// General Functions
function checkLoginInput() {
    var username = $("#loginForm").find('#in_username').val();                                                   //username from form
    var password = $("#loginForm").find('#in_password').val();                                                   //password from form

    //check
    var regex = new RegExp('^[A-Za-z0-9]{3,12}$');                                      //regex
    var usernameCheck = regex.test(username);
    var passwordCheck = regex.test(password);
    if (!usernameCheck) {                                                        //username check
        $('#error_username').show();
        $("#username-group").addClass("has-danger");
    } else {
        $('#error_username').hide();
        $("#username-group").removeClass("has-danger");
    }

    if (!passwordCheck) {                                                        //password check
        $('#error_password').show();
        $("#password-group").addClass("has-danger");
    } else {
        $('#error_password').hide();
        $("#password-group").removeClass("has-danger");
    }

    if (!usernameCheck || !passwordCheck) {
        $("#btnSubmit").prop('disabled', true);
    } else {
        $("#btnSubmit").prop('disabled', false);
    }
}

function checkCreateInput(inp, pieceType) {
    var regex;
    if (pieceType == 1) {
        regex = new RegExp("^[\\w \\-\\.\\,\\?\\!\\:\\;\\n]{5,100}$");
    } else {
        regex = new RegExp("^[\\w \\-\\.\\,\\?\\!\\:\\;\\n]{5,200}$");
    }
    
    var checkAll = true;
    if (pieceType == 1) {
        $.when(inp.parent().children().each(function () {
            var newLines = $(this).val().split("\n").length;
            var check = regex.test($(this).val()) && newLines <= 5;
            if (!check) {                                                        //event text check
                $(this).addClass("form-control-danger");
            } else {
                $(this).removeClass("form-control-danger");
            }
            checkAll = checkAll && check;
        })).then(function () {
            if (!checkAll) {
                inp.parents(".create-piece").find(".create-ok").prop('disabled', true);
            } else {
                inp.parents(".create-piece").find(".create-ok").prop('disabled', false);
            }
        });
    } else {
        var newLines = inp.val().split("\n").length;
        var check = regex.test(inp.val()) && newLines <= 5;
        if (!check) {                                                        //event text check
            inp.addClass("form-control-danger");
            inp.parents(".create-piece").find(".create-ok").prop('disabled', true);
        } else {
            inp.removeClass("form-control-danger");
            inp.parents(".create-piece").find(".create-ok").prop('disabled', false);
        }
    }
}

function login(formEl) {
    var username = formEl.find('#in_username').val();                           //username from form
    var password = formEl.find('#in_password').val();                           //password from form

    //compare
    $.getJSON("data/users.json", function (data) {                              //get users
        var loged = false;
        $.each(data, function () {                                              //for each user
            if (username == this.username && password == this.password) {       //if username and password is 
                loged = true;
                return false;
            }
        });
        if (loged) {
            Cookies.set("username", username);                                  //save cookies
            $("#loginModal").on('hidden.bs.modal', function () {
                isLoged();
                loadMainPage();
                $("#other").empty();                                            //erase login modal
            });
            $("#loginModal").modal('hide');                                     //close login modal
        }
    });
}

function logout() {
    Cookies.remove("username");
    isLoged();
    loadMainPage();
}

function scrollTo(elem) {                                                       //scroll to element (with animation)
    $("hetml, body").animate({
        scrollTop: elem.offset().top
    }, 300);
}