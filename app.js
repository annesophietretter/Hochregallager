/* 
 * Author: Anne Tretter
 *
 * We will have a global variable which will tell us our time in our simulation
 * it will be possible to reset this variable.
 */

// Idex of our timeline (seconds)
let time_of_simulation = 0;

// The interval itself so we can toggle it from everywhere
var our_simulation;

// Data from the website
var data;

// Fetch data from website once
d3.json("https://it2wi1.if-lab.de/rest/ft_fach").then( (data, error) => {
        if (error) {
            console.log(error);
        } else {
            this.data = data;
        }
}); 

// Our two graphs, so we can update them from everywhere
var doughnut;
var lineChart;
var xValuesLine = [0]
var yValuesLine = [9];

// Our array of items in the storage
var items = [ 
          { id: "1_1", status: "empty", RFID:111111, ID:000000, color:"white" }
        , { id: "1_2", status: "empty", RFID:111111, ID:000000, color:"white" }
        , { id: "1_3", status: "empty", RFID:111111, ID:000000, color:"white" }
        , { id: "2_1", status: "empty", RFID:111111, ID:000000, color:"white" }
        , { id: "2_2", status: "empty", RFID:111111, ID:000000, color:"white" }
        , { id: "2_3", status: "empty", RFID:111111, ID:000000, color:"white" }
        , { id: "3_1", status: "empty", RFID:111111, ID:000000, color:"white" }
        , { id: "3_2", status: "empty", RFID:111111, ID:000000, color:"white" }
        , { id: "3_3", status: "empty", RFID:111111, ID:000000, color:"white" }
    ];

// Event Listener for start button
function startSimulation() {
    our_simulation = setInterval(simulate, 1000);
    document.getElementById("start_button").disabled = true;
    document.getElementById("start_button").style.backgroundColor = 'RoyalBlue';
}

// Event listener for reset button
function resetSimulation() {
    clearInterval(our_simulation);
    time_of_simulation = 0;
    simulate()
    document.getElementById("start_button").disabled = false;
    document.getElementById("start_button").style.backgroundColor = 'DodgerBlue';
}

// Helper function to return true if in range, otherwise false
function inRange(x, min, max) {
    return ((x-min)*(x-max) <= 0);
}

// Event listener for fillAll button
function fillAll() {
    for (var x = 0; x < items.length; x += 1) {
        items[x].RFID = 123456;
        items[x].status = "full";
        items[x].ID = 654321;
        if (x<3)items[x].color = "white";
        else if(x<6)items[x].color = "blue";
        else items[x].color = "red";


        // Change the display
        document.getElementById(items[x].id).style.backgroundColor = items[x].color;
        document.getElementById("grid" + items[x].id).style.backgroundColor = "orange";
        document.getElementById("status" + items[x].id).innerHTML = "i";

        updateDoughnut();
    }
}

// This function checks if a fach is hit and draws our graph
function setValues(data) {
    vertikal = data[time_of_simulation].werte["H-vertikal"];
    horizontal = data[time_of_simulation].werte["H-horizontal"];
    document.getElementById("horizontal").innerHTML = horizontal;
    document.getElementById("vertikal").innerHTML = vertikal;

    // Visualize
    h = parseInt(horizontal);
    v = parseInt(vertikal);

    // Checking if the arm is visiting a fach
    if (inRange(h, 2330, 2360)) {
        if (inRange(v, 85, 115)) {
            // 1_1
            kickItem("1_1");
        } else if(inRange(v, 435, 465)) {
            // 2_1
            kickItem("2_1");
        } else if(inRange(v, 885, 915)) {
            // 3_1
            kickItem("3_1");
        }
    } else if (inRange(h, 1610, 1640)) {
        if (inRange(v, 85, 115)) {
            // 1_2
            kickItem("1_2");
        } else if(inRange(v, 435, 465)) {
            // 2_2
            kickItem("2_2");
        } else if(inRange(v, 885, 915)) {
            // 3_2
            kickItem("3_2");
        }
    } else if (inRange(h, 885, 915)) {
        if (inRange(v, 85, 115)) {
            // 1_3
            kickItem("1_3");
        } else if(inRange(v, 435, 465)) {
            // 2_3
            kickItem("2_3");
        } else if(inRange(v, 885, 915)) {
            // 3_3
            kickItem("3_3");
        }
    }

    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 200, 100);
    ctx.beginPath();
    ctx.rect(190 - h/13, v/13 + 4, 5, 5);
    ctx.fillStyle = "red";
    ctx.fill();
}

// This function is our simulation (it gets called every 1000ms)
function simulate() {
    // Clearing our interval if we reach the end of file
    if (time_of_simulation == data.length) {
        clearInterval(our_simulation);
        document.getElementById("start_button").disabled = false;
    } else {
        datum = data[time_of_simulation].datum
        document.getElementById('time_label').innerHTML = datum;
        setValues(data)
        time_of_simulation += 1;

        updateLinechartValues(data);

        // Dealing with updating the line chart
        if (time_of_simulation % 60 == 0) {
            updateLine();
            clearLineChartValues();
        }
    }
}

// Helper function which converts an id (1_2) into the space in the array of items
function getPos(id){
    var a = parseInt(id.slice(0,1))
    var b = parseInt(id.slice(2,3))
    return (a-1)*3+b-1;
}

// ***** The following section is dedicated to handle all window openings and closings **** //

function openInfo(id) {
    if (document.getElementById("status" + id).textContent == "i") {
        document.getElementById("InfoFach").style.display = "inline-block";
        document.getElementById("headerInfoFach").innerHTML = "Info Fach " + id;

        // Set RFID and ID and the color of the blob
        var pos = getPos(id);
        document.getElementById("InfoFach-rfidLabel").innerHTML = "RFID-Adresse: " + items[pos].RFID;
        document.getElementById("InfoFach-idLabel").innerHTML = "ID-Nummer: " + items[pos].ID;
        document.getElementById("InfoFach-dot").style.backgroundColor = items[pos].color;

    } else {
        document.getElementById("fachstatus").innerHTML = "Fach " + id + " ist leer.";
        document.getElementById("rfid").value = "";
        document.getElementById("id-number").value = "";
        document.getElementById("infoBox").style.display = "inline-block";
    } 
}

function closeError() {
    // Closing Error and opening info fach
    document.getElementById("Error").style.display = "none";
    document.getElementById("infoBox").style.display = "inline-block";
}

function closeInfoFach() {
    document.getElementById("InfoFach").style.display = "none";
}

// Event listener for the submit button to submit a item
function checkInfo() {
    // We let our window disappear
    document.getElementById("infoBox").style.display = "none";

    // Getting the id number of the fach
    var id = document.getElementById("fachstatus").textContent;
    id = id.slice(5, 8);

    var rfid = parseInt(document.getElementById("rfid").value);
    var idnumber = parseInt(document.getElementById("id-number").value);

    // Getting the color
    var e = document.getElementById("selection");
    var value = e.options[e.selectedIndex].value;
    var color = e.options[e.selectedIndex].text;
    if (color == "Weiß") color = "white";
    if (color == "Blau") color = "blue";
    if (color == "Rot") color = "red";
    
    // Make checks for the rightness
    if (!Number.isInteger(rfid) || rfid > 999999 || rfid < 100000 || !Number.isInteger(idnumber) || idnumber > 999999 || idnumber < 100000) {
        // There was an error, closing the info fach and opening the error message
        document.getElementById("InfoFach").style.display = "none";
        document.getElementById("Error").style.display = "inline-block";
    } else {
        // Edit our array of items and display it
        changeItem(id, idnumber, rfid, color)


        document.getElementById("Ergebnismeldung-label").innerHTML = "Die Ware (ID: " + idnumber + " / RDIF: " + rfid + ")"
        document.getElementById("Ergebnismeldung-label2").innerHTML = "wird in das Fach " + id + " eingelagert."

        // Give rfid, id, fach to the next window
        document.getElementById("Ergebnismeldung").style.display = "inline-block";
    }
}

// Assigns the given parameters to the item with id 'id'
function changeItem(id, idnumber, rfid, color) {
    // Get the position of our element in the array
    var pos = getPos(id);

    // Change the values
    items[pos].RFID = rfid;
    items[pos].color = color;
    items[pos].status = "full";
    items[pos].ID = idnumber;

    // Change the display
    document.getElementById(id).style.backgroundColor = color;
    document.getElementById("grid" + id).style.backgroundColor = "orange";
    document.getElementById("status" + id).innerHTML = "i";

    // Update our litte doughnut
    updateDoughnut();
}

function closeInfo() {
    document.getElementById("infoBox").style.display = "none";
}

function closeErgebnismeldung(){
    document.getElementById("Ergebnismeldung").style.display = "none";
}

// Gets called once when the body loads
function setup() {
    initDoughnut();
    initLinechart();
}

// Initializing the line chart
function initLinechart() {
    // Init with 0
    for(var i=1 ; i<61 ; i++) {
        xValuesLine.push(i);
        yValuesLine.push(0)
    }
    
    var barColors = ["orange"];
    linechart = new Chart("myLinechart", {
        type: "line",
        data: {
            labels: xValuesLine,
            datasets: [{
                backgroundColor: barColors,
                data: yValuesLine
            }]
        },
        options: {
            title: {
                display: false,
            },
            responsive: false,
            legend: {
                display: false,
            },
            scales: {
                yAxes: [{
                    ticks: {
                        fontColor: "white",
                        fontSize: 8,
                        stepSize: 1,
                        steps: 9,
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "white",
                        fontSize: 8,
                        stepSize: 1,
                        beginAtZero: true
                    }
                }]
            }
        }
       });

    clearLineChartValues();
}

// Initializing the doughnut
function initDoughnut() {
    // Getting the number of items in our storage
    var count = 0
    for (var i in items) {
        if (items[i].status == "full") {
           count+=1;
        }
    }

    document.getElementById("belegt_label").innerHTML = "Belegte Fächer: " + count;

    var xValues = ["Belegt", "Frei"];
    var yValues = [count, 9-count];
    var barColors = ["orange","lightgreen"];

    doughnut = new Chart("myChart", {
        type: "doughnut",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
        },
        options: {
            title: {
                display: true,
            },
            legend: {
                labels: {
                    fontColor: "white",
                    fontSize: 12
                }
            }
        }
    });
}

// Updated the doughnut chart
function updateDoughnut() {
    // Getting the number of items in our storage
    var count = 0
    for (var i in items) {
        if (items[i].status == "full") {
           count+=1;
        }
    }
    document.getElementById("belegt_label").innerHTML = "Belegte Fächer: " + count;
    doughnut.data.datasets[0].data[0] = count;
    doughnut.data.datasets[0].data[1] = 9-count;
    doughnut.update();
}

// Updating the line chart itself
function updateLine(){
    for (var i=0; i<=60; i++) {
        linechart.data.datasets[0].data[i] = yValuesLine[i];
    }
    linechart.update();
}

// Updating the Values for the line chart
function clearLineChartValues() {
    var count = 0;
    for (var i in items) {
        if (items[i].status == "full") {
           count+=1;
        }
    }
    xValuesLine = [0]
    yValuesLine = [9]
}

// Updates the values of the line chart
function updateLinechartValues(datum) {
    var count = 0;
    for (var i in items) {
        if (items[i].status == "full") {
           count+=1;
        }
    }
    datum = datum.slice(14,19);
    xValuesLine.push(datum);
    yValuesLine.push(count);
}

// Removes items from a fach
function kickItem(getID) {
    if (getID != null) {
        var id = getID
    } else {
        var id = document.getElementById("headerInfoFach").textContent.slice(10,13);
    }
    var pos = getPos(id);
    items[pos].status = "empty";

    // Change the display
    document.getElementById(id).style.backgroundColor = "lightgreen";
    document.getElementById("grid" + id).style.backgroundColor = "lightgreen";
    document.getElementById("status" + id).innerHTML = "+";

    // Update our litte doughnut
    updateDoughnut();

    // Close the window
    document.getElementById("InfoFach").style.display = "none";
}

// Reset the simulation time
function reset() {
    time_of_simulation = 0;
    clearLineChartValues();
    updateLine();
}