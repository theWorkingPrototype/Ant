
var canvas;
var ctx;
var width = window.innerWidth;
var height = window.innerHeight;
var margin = 50;

var points = []; // [index, x, y]
var edges = []; // [point1index, point2index] -> [length, pheromoneStrength]
var ants = []; // [pointIndex, vis[], distance]

var playing=0;
var busy=false;

var stepTime=50;
var restTime=100;

var bestMinPath = null;
var bestMinDistance = Infinity;
var bestMaxPath = null;
var bestMaxDistance = 0;
var initPending = true;

function createPoints() {
    for (var i = 0; i < numPoints; i++) {
        points.push({
            index : i,
            x : margin + Math.random() * (width - margin * 2),
            y : margin + Math.random() * (height - margin * 2)
        });
    }
}
function createEdges() {
    for(var i = 0; i < points.length; i++) {
        let a = [];
        for(var j = 0; j < points.length; j++) {
            a.push({length: 0, pheromone: 0});
        }
        edges.push(a);
    }
    for(var i = 0; i < points.length; i++) {
        for(var j = 0; j < points.length; j++) {
            if(i == j) continue;
            makeEdge(points[i], points[j]);
        }
    }
}
function putAnts() {
    ants=[];
    for (var i = 0; i < numAnts; i++) {
        var p = Math.floor(Math.random() * points.length);
        ants.push({
            pointIndex : p,
            vis:[p,],
            distance : 0
        });
    }
}
function makeEdge(p1, p2) {
    var dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    edges[p1.index][p2.index] = {
        length : dist, 
        pheromone : 1
    };
    edges[p2.index][p1.index] = {
        length : dist,
        pheromone : 1
    };
}
function setPheromone(p1, p2, amount) {
    edges[p1][p2].pheromone = amount;
    edges[p2][p1].pheromone = amount;
}
function isVisited(ant, pointIndex) {
    for( var i = 0; i < ant.vis.length; i++) {
        if(ant.vis[i] == pointIndex) return true;
    }
    return false;
}
function copy(arr) {
    var newArr = [];
    arr.forEach(val => newArr.push(val));
    return newArr;
}

function clearCanvas() {
    if(ctx) ctx.clearRect(0, 0, width, height);
}
function drawPoints(p) {
    if(!pointsVisible) return;
    ctx.fillStyle = '#fff';
    for (var i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 5, 0, Math.PI * 2, true);
        ctx.fill();
    }
}
function drawAllPaths() {
    for(var i = 0; i < ants.length; i++) {
        drawPath(ants[i]);
    }
}
function drawBestPath() {
    if(ants.length==0) return;
    var bestmin = ants[0];
    var bestmax = ants[0];
    for(var i = 1; i < ants.length; i++) {
        var ant = ants[i];
        if(ant.distance < bestmin.distance) {
            bestmin = ant;
        }
        if(ant.distance > bestmin.distance) {
            bestmax = ant;
        }
    }
    if(bestmin.distance<bestMinDistance) bestMinDistance=bestmin.distance, bestMinPath=copy(bestmin.vis);
    if(bestmax.distance>bestMaxDistance) bestMaxDistance=bestmax.distance, bestMaxPath=copy(bestmax.vis);
    if(mode=='bestMin') drawPath(bestMinPath);
    if(mode=='bestMax') drawPath(bestMaxPath);
}
function drawPath(path) {
    if(!path || path.length<1) return;
    ctx.beginPath();
    ctx.moveTo(points[path[0]].x, points[path[0]].y);
    ctx.strokeStyle = '#fff';
    // ctx.lineWidth = 2;
    for(var i = 1;i < path.length; i++) {
        var p = path[i];
        ctx.lineTo(points[p].x, points[p].y);
    }
    ctx.stroke();
    drawPoints(path);
}

function drawEdge(from, to) {
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(points[from].x, points[from].y);
    ctx.lineTo(points[to].x, points[to].y);
    ctx.stroke();
}

function changeMode() {
    mode = nextMode;
    nextMode = null;
    selected.classList.remove('selected');
    working.classList.add('selected');
    working.classList.remove('working');
    selected = working;
    stepTime = nstepTime;
    restTime = nrestTime;
}

async function start() {
    busy=true;
    putAnts();
    if(mode=='steps') clearCanvas(), drawPoints();
    await moveAnts();
    update();
    if(nextMode) changeMode();
    if(changedVis) changedVis.innerText = 'points', changedVis.classList.remove('selected'), changedVis = null;
    if(mode!='steps') clearCanvas(), drawBestPath(), drawPoints();
    busy=false;
    if(playing && !initPending) setTimeout(start, restTime);
    if(initPending) init(initPending);
}