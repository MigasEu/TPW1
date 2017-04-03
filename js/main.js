////////////////////////////////////////////////////////////////////////////////
// Global Variables
var stories;                                                                        //stores all the stories
var sTitle;


////////////////////////////////////////////////////////////////////////////////
// jQuery Initiaization
$(document).ready(isLoged());





////////////////////////////////////////////////////////////////////////////////
// Load HTML and its processment
function isLoged() {
    if (Cookies.get("username") == null) {                                          //if not loged
        $("#logincontainer").load("templates/tologin.html");
        $("#other").load("templates/login.html", loadLoginForm);
    } else {                                                                        //if already loged
        $("#logincontainer").load("templates/tologoff.html", function () {
            $("#usernameHandle").text(Cookies.get("username"))                      //print user name handle
            $("#a2logoff").click(logout);                                           //logout on click
        });          // load tologoff
        //$("#maincontainer").load("templates/event.html");                          //  loged main page
        //$.get("templates/event.html", function (data) { $("#maincontainer").append(data); });
    }
    $.getJSON("data/stories.json", function (data) {                                //load story list from json
        stories = data;                                                             //store all the info from json
        loadStories($("#maincontainer"));                                                              //for test
    });                                                                 
}

function loadLoginForm() {
    $("#in_username, #in_password").keyup(checkLoginInput);
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        login($(this));
    });
}

function loadStories(container) {
    container.load("templates/storyList.html", function () {
        $.each(stories, function (index) {
            $.get("templates/storyCard.html", function (data) {                         //load html
                var cardHTML = $(data).appendTo(".stories-list");                       //append html
                cardHTML.find(".story-title").text(stories[index].title);               //print the choice text
                cardHTML.on('click', function () { loadStory(stories[index].id); });                            //add loadStory event on click
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
                $("#other").empty();                                            //erase login modal
            });
            $("#loginModal").modal('hide');                                     //close login modal
        }
    });
}

function logout() {
    Cookies.remove("username");
    isLoged();
}

function scrollTo(elem) {                                                       //scroll to element (with animation)
    $("hetml, body").animate({
        scrollTop: elem.offset().top
    }, 300);
}