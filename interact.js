

var controls = {
    point:null,
    ant:null,
    alpha:null,
    beta:null
};

var mode = 'steps';
var nextMode = null;
var changedVis = false;
var selected;
var working;
var nstepTime, nrestTime;
var pointsVisible = true;



var t = false;
function interactInit() {
    canvas.addEventListener('mousedown', ()=> {
        if(playing) pause(), t=true;
    });

    canvas.addEventListener('mouseup', ()=> {
        if(!playing && !t) play();
        t=false;
    });
}

function setControls() {
    controls.point = document.getElementById("point");
    controls.ant = document.getElementById("ants");
    controls.alpha = document.getElementById("alpha");
    controls.beta = document.getElementById("beta");
    controls.evaporate = document.getElementById("evaporate");
    if(controls.point) controls.point.value = numPoints;
    if(controls.Q) controls.Q.value = Q;
    if(controls.ant) {
        controls.ant.max = numPoints;
        controls.ant.value = numAnts;
    }
    if(controls.alpha) controls.alpha.value = alpha;
    if(controls.beta) controls.beta.value = beta;
    if(controls.evaporate) controls.evaporate.value = evaporation;
    selected = document.getElementById("steps");
}

function pause() {
    playing = false;
}

function play() {
    playing=true;
    start();
}



function changeQ(e) {
    Q = parseInt(e.value);
}

function changeAlpha(e) {
    alpha = parseInt(e.value);
}

function changeBeta(e) {
    beta = parseInt(e.value);
}

function changeNumAnts(e) {
    numAnts = parseInt(e.value);
}

function changePoints(e) {
    if(!busy) init(e.value);
    else {
        initPending=e.value;
    }
    beta = 2+Math.floor((e.value-20)/60);
    controls.beta.value = beta;
}

function changeEvaporation(e) {
    evaporation = e.value;
}

function bestMin(e) {
    if(selected == e) return;
    nextMode = 'bestMin';
    e.classList.add("working");
    working = e;
    nstepTime = nrestTime = stepTime = restTime = 0;
}

function bestMax(e) {
    if(selected == e) return;
    nextMode = 'bestMax';
    e.classList.add("working");
    working = e;
    nstepTime = nrestTime = stepTime = restTime = 0;
}

function steps(e) {
    if(selected == e) return;
    if(busy) {
        nextMode = 'steps';
        e.classList.add("working");
        working = e;
        nstepTime = 100;
        nrestTime = 100;
    }
    else {
        selected.classList.remove('selected');
        selected = e;
        e.classList.add('selected');
        mode = 'step';
        stepTime = 100;
        restTime = 100;
    }
}

function point(e) {
    if(pointsVisible) {
        pointsVisible = false;
        e.innerText = "wait..";
        changedVis = e;
    }
    else {
        pointsVisible = true;
        e.classList.add('selected');
        drawPoints();
    }
}