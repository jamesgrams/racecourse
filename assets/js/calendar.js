window.addEventListener('DOMContentLoaded', loadCalendar);

/**
 * Load the login page.
 */
function loadCalendar() {
    setUserName();
    var buttons = [
    {
        "name": LOG_OUT_STRING,
        "action": logout
    } ];

    var userInfo = JSON.parse( decodeURIComponent (getCookieValue("racecourse-id")) );
    var calendarClass = document.querySelector("#calendar-class");
    var student = true;
    var now = new Date();
    makeRequest( "GET", "/api/class-user", { "user_id": userInfo.user }, 
    function( data ) {
        
        var items = JSON.parse(data).items;
        student = true;
        for( var i=0; i<items.length; i++ ) {
            if( items[i].is_admin ) {
                student = false; // determine if we should show a student view or an admin view - likely an instructor if admin of one class.
            }
        }

        var requestCount = items.length;
        var errorOcurred = false;
        var classes = {}; // this will be sorted to be alphabetical
        var allDone = function() {
            requestCount --;
            if( requestCount == 0 ) {
                var keys = Object.keys(classes).sort();
                for( var i=0; i<keys.length; i++ ) {
                    calendarClass.appendChild(classes[keys[i]]);
                }
                if( errorOcurred ) {
                    createToast(DEFAULT_ERROR);
                }
                generateCalendar(student, now);
            }
        }
        for( var i=0; i<items.length;i++ ) {

            (function( item ) {
                // todo make these show up alphabetically or some other order
                makeRequest( "GET", "/api/class", { "id": item.class_id }, function( classData ) {
                    var classJson = JSON.parse(classData);
                    var option = document.createElement("option");
                    option.innerHTML = classJson.items[0].name;
                    option.value = classJson.items[0].id;
                    classes[classJson.items[0].name] = option;
                    allDone();
                }, function() {
                    errorOcurred = true;
                    allDone();
                } );
            })( items[i] );

        }

    },
    function( data ) {
        var errorMessage = DEFAULT_ERROR;
        try {
            var responseObj = JSON.parse(data);
            if( responseObj.errorMessage ) errorMessage = responseObj.errorMessage;
        }
        catch(err) {}
        createToast( errorMessage );
    } );

    calendarClass.onchange = function() { generateCalendar( student, now ) };
    document.querySelector("#calendar-next-button").onclick = function() {
        now.setDate( now.getDate() + 7 );
        generateCalendar( student, now );
    }
    document.querySelector("#calendar-previous-button").onclick = function() {
        now.setDate( now.getDate() - 7 );
        generateCalendar( student, now );
    }
    setActionButtons( buttons );
}

/**
 * Generate the calendar view.
 * @param {boolean} student - True if a student view calendar. 
 * @param {Date} now - The date to generate the calendar from. 
 */
function generateCalendar( student, now ) {
    var userInfo = JSON.parse( decodeURIComponent (getCookieValue("racecourse-id")) );
    var classId = student ? document.querySelector("#calendar-class").value : "";
    var rows = [];
    for( var i=5; i<=22; i++ ) {
        var date = new Date(new Date().toDateString());
        date.setHours(i);
        rows.push({
            "value": date.toTimeString().replace(/\s.*$/,""),
            "display": i >= 12 ? (((i-12)?(i-12):12) + " PM") : ((i?i:12) + " AM")
        });
    }
    
    var dates = [];
    dates.push(now);
    var day = now.getDay();
    for( var i=day-1; i>=0; i-- ) {
        var cpy = new Date(dates[0]);
        cpy.setDate( cpy.getDate() - 1 );
        dates.unshift(cpy);
    }
    for( var i=day+1; i<7; i++ ) {
        var cpy = new Date(dates[dates.length-1]);
        cpy.setDate( cpy.getDate() + 1 );
        dates.push(cpy);
    }
    var daynames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var columns = [];
    for( var i=0; i<dates.length; i++ ) {
        columns.push({
            "value": dates[i].toDateString(),
            "display": daynames[i] + " " + (dates[i].getMonth() + 1) + "/" + dates[i].getDate() + "/" + dates[i].getFullYear()
        })
    }
    
    makeRequest( "GET", "/api/meeting", { 
        student: student ? 1 : "",
        class_id: classId,
        user_id: userInfo.user
    }, function(data) {
        var items = JSON.parse(data).items;

        var newTable = document.createElement("table");
        newTable.setAttribute("cellspacing","0");
        for( var i=0; i<rows.length+1; i++ ) {
            var tr = document.createElement("tr");
            for( var j=0; j<columns.length+1; j++ ) {
                var td = document.createElement(!i || !j ? "th" : "td");
                if( !i && j ) {
                    td.innerHTML = columns[j-1].display;
                }
                else if( i && !j ) {
                    td.innerHTML = rows[i-1].display;
                }
                else if( i && j ) {
                    var dateString = columns[j-1].value + " " + rows[i-1].value;
                    var date = new Date(dateString);
                    var endDate = new Date(date);
                    endDate.setHours(endDate.getHours() + 1);
                    if( date < new Date() ) td.classList.add("solid");
                    var item = null;
                    for( var k=0; k<items.length; k++ ) {
                        if( new Date(items[k].start_date) < endDate && new Date(items[k].end_date) > date ) {
                            td.classList.add("taken");
                            td.innerText = items[k].name ? items[k].name : (items[k].first + " " + items[k].last);
                            if( student && items[k].class_id != classId ) td.classList.add("solid");
                            item = items[k];
                            break;
                        }
                    }

                    if( !td.classList.contains("solid") ) {
                        td.onclick = function(date, endDate, item) { return function() {
                            if( item ) {
                                makeRequest( "DELETE", "/api/meeting", {
                                    id: item.id,
                                    class_id: item.class_id
                                }, function() {
                                    createToast("Meeting deleted.");
                                    generateCalendar( student, now );
                                }, function( data ) {
                                    var errorMessage = DEFAULT_ERROR;
                                    try {
                                        var responseObj = JSON.parse(data);
                                        if( responseObj.errorMessage ) errorMessage = responseObj.errorMessage;
                                    }
                                    catch(err) {}
                                    createToast( errorMessage );
                                } );
                            }
                            else {
                                var classId = document.querySelector("#calendar-class").value;
                                if( !classId ) {
                                    createToast("Please select a class.");
                                    return;
                                }
                                makeRequest( "POST", "/api/meeting", {
                                    start_date: date.toString(),
                                    end_date: endDate.toString(),
                                    class_id: classId,
                                    user_id: userInfo.user,
                                    student: student
                                }, function() {
                                    createToast("Meeting added.");
                                    generateCalendar( student, now );
                                }, function( data ) {
                                    var errorMessage = DEFAULT_ERROR;
                                    try {
                                        var responseObj = JSON.parse(data);
                                        if( responseObj.errorMessage ) errorMessage = responseObj.errorMessage;
                                    }
                                    catch(err) {}
                                    createToast( errorMessage );
                                } );
                            }
                        } }(date, endDate, item);
                    }
                }
                tr.appendChild(td);
            }
            newTable.appendChild(tr);
        }

        document.querySelector("table").replaceWith(newTable);
    }, function( data ) {
        var errorMessage = DEFAULT_ERROR;
        try {
            var responseObj = JSON.parse(data);
            if( responseObj.errorMessage ) errorMessage = responseObj.errorMessage;
        }
        catch(err) {}
        createToast( errorMessage );
    } );
}