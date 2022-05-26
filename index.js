
var numPoints = 20;
var numAnts = 5;
var Q = 10;
var evaporation = 0.3;
var alpha = 4;
var beta = 2;
var maxPheromone = 100;

async function moveAnts() {
    return new Promise((resolve, reject) => {
        var count=0;
        var d=false;
        if(ants.length==0) resolve();
        function counter() {
            count++;
            if(initPending) resolve();
            if(count==ants.length && !d) d=true, resolve();
            setTimeout(() => {if(!d)resolve}, 1000);
        }
        ants.forEach((ant, index) => travel(ant, (!index)&&(mode=="steps"), counter));
    });
}


function travel(ant, draw, done, visited=1) {
    if(visited>numPoints || initPending) {
        done();
        return;
    }
    else if(visited==numPoints) {
        if(draw) drawEdge(ant.vis[ant.vis.length-1], ant.vis[0]);
        ant.vis.push(ant.vis[0]);
        setTimeout(travel, stepTime, ant, draw, done, visited+1);
        return;
    }
    var p = ant.pointIndex;
    var next = getNextPointACO(ant);
    ant.pointIndex = next;
    ant.vis.push(next);
    ant.distance += edges[p][next].length;
    if(draw) drawEdge(p, next);
    setTimeout(travel, stepTime, ant, draw, done, visited+1);
}



function getNextPointACO(ant) {
    var next = null;
    var sum = 0;
    var prob = [];
    var p = ant.pointIndex;
    var mx=0;
    var pos=[];
    for (var i = 0; i < points.length; i++) {
        if(isVisited(ant, i) || i==p) continue;
        pos.push(i);
        prob.push([i, Math.pow(edges[p][i].pheromone, alpha) * Math.pow(1/edges[p][i].length, beta)]);
        sum += prob[prob.length-1][1];
        if(prob[prob.length-1][1]>prob[mx][1]) mx=prob.length-1;
    }
    // return prob[mx][0];
    var r = Math.random();
    for (var i = 0; i < prob.length; i++) prob[i][1]/=sum;
    for (var i = 0; i < prob.length; i++) {
        if(r<prob[i][1]) {
            next = prob[i][0];
            break;
        }   
        r -= prob[i][1];
    }
    // if(!next) return pos[Math.floor(Math.random()*pos.length)];
    return next;
}

function evaporate() {
    for (var i = 0; i < points.length; i++) {
        for (var j = i+1; j < points.length; j++) {
            setPheromone(i, j, Math.max(0, edges[i][j].pheromone*(1 - evaporation)));
        }
    }
}
function update() {
    evaporate();
    for(var i = 0; i < ants.length; i++) {
        var ant = ants[i];
        var u = ant.vis[0];
        for(var j = 1; j < ant.vis.length; j++) {
            var v = ant.vis[j];
            setPheromone(u, v, Math.min(maxPheromone, edges[u][v].pheromone + Q/ant.distance));
            u=v;
        }
    }
}

function init(newNumPoints) {
    console.log("init", newNumPoints);
    if(newNumPoints) {
        numPoints = newNumPoints;
        numAnts = numPoints/4;
    }
    document.body.style.backgroundColor = "#000";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    if(!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d");
        interactInit();
    }
    clearCanvas();
    points = [], edges= [], ants = [];
    setControls();
    createPoints();
    createEdges();
    putAnts();
    drawPoints();
    bestMinDistance = Infinity;
    bestMinPath = null;
    bestMaxDistance = 0;
    bestMaxPath = null;
    initPending = 0;
    playing=0;
}
init();

