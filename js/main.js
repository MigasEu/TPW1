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
        $("#maincontainer").load("templates/main.html");
        $("#other").load("templates/login.html", loadLoginForm);
    } else {                                                                        //if already loged
        $("#logincontainer").load("templates/tologoff.html", function () {
            $("#usernameHandle").text(Cookies.get("username"))                      //print user name handle
            $("#a2logoff").click(logout);                                           //logout on click
        });          // load tologoff
        //$("#maincontainer").load("templates/event.html");                          //  loged main page
        //$.get("templates/event.html", function (data) { $("#maincontainer").append(data); });
        $("#other").empty();
    }
    loadStories();
}

function loadLoginForm() {
    $("#in_username, #in_password").keyup(checkLoginInput);
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        login($(this));
    });
}

function loadStories() {
    $.getJSON("data/stories.json", function (data) {
        stories = data;                                                             //store all the info from json
        loadStory(0);                                                               //for test
    });
}

function loadStory(id) {
    $("#maincontainer").load("templates/storyIntro.html", function () {
        sTitle = $("#storyTitle");
        sTitle.text(stories[id].title);
        sTitle.data("id", id);
        sTitle.data("index", 0);
        loadNextPiece();
    });
}

function loadNextPiece() {
    var sId = sTitle.data("id");
    var i = sTitle.data("index");
    var piece = stories[sId].pieces[i];
    switch (piece.type) {
        case 0:
            showEvent(piece);
            break;
        case 1:
            showChoices(piece);
            break;
        default:
    }
}

function showEvent(eve) {
    $.get("templates/event.html", function (data) {
        var eventHTML = $(data).appendTo("#maincontainer");                     //append html of the event
        eventHTML.attr("id", "event-"+eve.id)                                   //set the id
        eventHTML.data("json", eve);                                            //store event info
        eventHTML.find(".eventContent").text(eve.text);                         //print the event text

        sTitle.data("index", eve.next);
        loadNextPiece();
    });
}

function showChoices(piece) {
    $.get("templates/choices.html", function (data) {
        var choicesHTML = $(data).appendTo("#maincontainer");                       //append html of the event
        choicesHTML.attr("id", "choices-" + piece.id)                               //set the id
        choicesHTML.data("json", piece);                                            //store event info
        $.each(piece.choices, function (index) {
            $.get("templates/choice.html", function (data2) {
                var choiceHTML = $(data2).appendTo(choicesHTML);                    //append html
                choiceHTML.find(".choiceContent").text(piece.choices[index].text);  //print the choice text
                choiceHTML.find(".choice").addClass("choice-"+index);            //change backgroud-color

                var colSize = (Math.floor(12 / piece.choices.length)                //calc size of each choice
                    - Math.floor((piece.choices.length - 1) / piece.choices.length));
                //choiceHTML.addClass("col-md-" + colSize);                           //add class for the right size
                if (index > 0) {
                    var offset = Math.floor((12 - colSize * piece.choices.length)   //calc offset
                        / (piece.choices.length - 1))
                    //choiceHTML.addClass("col-md-offset-" + offset);                 //add class for the offset
                }
            });
        });
    });
}

function selectChoice(choices, choice) {

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
            });
            $("#loginModal").modal('hide');                                      //close login modal
        }
    });
}

function logout() {
    Cookies.remove("username");
    isLoged();
}