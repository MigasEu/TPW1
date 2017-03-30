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
        });          // load tologoff
        //$("#maincontainer").load("templates/main.html");                          //  loged main page
        $("#other").empty();
    }
}

function loadLoginForm() {
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        login($(this));
    });
}






////////////////////////////////////////////////////////////////////////////////
// Load JSON and its processment









////////////////////////////////////////////////////////////////////////////////
// General Functions
function login(formEl) {
    var username = formEl.find('#in_username').val();
    var password = formEl.find('#in_password').val();
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