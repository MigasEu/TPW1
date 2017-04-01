////////////////////////////////////////////////////////////////////////////////
// Global Variables





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
        
        loadStory(0);
        $("#other").empty();
    }
}

function loadLoginForm() {
    $("#in_username, #in_password").keyup(checkLoginInput);
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        login($(this));
    });
}

function loadStory(id) {
    $.getJSON("data/stories.json", function (data) {
        $("#maincontainer").load("templates/storyIntro.html", function () {
            var sTitle = $("#storyTitle");
            sTitle.text(data[id].title);
            sTitle.data("index", 0);

            var i = 0;
            var wCont = true
            while (wCont) {
                var piece = data[id].pieces[i];
                switch (piece.type) {
                    case 0:
                        showEvent(piece);
                        sTitle.data("index", i = piece.next);
                        break;

                    case 1:
                        
                    default:
                        wCont = false;
                }
            }
        });

        
    });
}

function showEvent(eve) {
    $.get("templates/event.html", function (data) {
        var eventHTML = $(data).appendTo("#maincontainer");                     //append html of the event
        eventHTML.attr("id", "event-"+eve.id)                                   //set the id
        eventHTML.data("json", eve);                                    //store event info
        eventHTML.find(".eventContent").text(eve.text);                         //print the event text
    });
}



////////////////////////////////////////////////////////////////////////////////
// Load JSON and its processment









////////////////////////////////////////////////////////////////////////////////
// General Functions
function checkLoginInput() {
    var username = $("#loginForm").find('#in_username').val();                           //username from form
    var password = $("#loginForm").find('#in_password').val();                           //password from form

    //check
    var regex = new RegExp('^[A-Za-z0-9]{3,12}$');                                      //regex
    if (!regex.test(username)) {                                                        //username check
        $('#error_username').show();
    } else {
        $('#error_username').hide();
    }

    if (!regex.test(password)) {                                                        //password check
        $('#error_password').show();
    } else {
        $('#error_password').hide();
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