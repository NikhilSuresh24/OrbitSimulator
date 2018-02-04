// ------------------------------------------------
// JS SETUP
// ------------------------------------------------

// Create an empty scene and add axes
var scene = new THREE.Scene();
axes = buildAxes( 100000 );
scene.add( axes );
scene.background = new THREE.Color( 0x000000 );

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({antialias:true});

// Configure renderer clear color
renderer.setClearColor("#ffffff");

// Configure renderer size
renderer.setSize( window.innerWidth, window.innerHeight);

// Append Renderer to DOM
document.body.appendChild( renderer.domElement );

// Create a basic perspective camera
//var cameraControls;
var clock = new THREE.Clock();
var camX = 30;
var camY = 50;
var camZ = 120;
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
//camera.position.z = 4;
camera.position.set( camX, camY, camZ );
camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
// cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
// cameraControls.target.set(0,0,0);

// ------------------------------------------------
// MOVEMENT
// ------------------------------------------------
//Consts
const rotPeriod = 24.47; //days
const daysToMs = 1000; //1000 milliseconds in the program is 1 day real time
const auToDist = 100; //conversion from au to units on program
const secInDay = 86400;

//earth Consts
const earthRotPeriod = 1; //days
const earthInclination = 0.000; //radians
const earthPeriapsis = 102.94719*(Math.PI/180); //radians
const earthAscendingNode = -11.26064 *(Math.PI/180); //radians
const earthMajor = 1.00000011 *auToDist; //au
const earthPeriod = 365.25; //days
const earthPerihelion = 0.9832359198145 * auToDist;//au
const earthEccentricity = 0.0167;
var earthTheta = 0;

//Haley's Comet
const haleyInclination = 162.26 * (Math.PI/180);
const haleyPeriapsis = 111.33 * (Math.PI/180);
const haleyAscendingNode = 58.42 * (Math.PI/180);
const haleyMajor = 17.83 * auToDist;
const haleyPeriod = 27484.5; //days
const haleyPerihelion = 0.586 * auToDist;
const haleyEccentricity = 0.9671;

var haleyInfo = {name: "haley", inclination: haleyInclination, periapsis: haleyPeriapsis, ascendingNode: haleyAscendingNode, a: haleyMajor, perihelion: haleyPerihelion, period: haleyPeriod, eccentricity: haleyEccentricity, theta: 0 };

//earth consts
var earthInfo = {name: "earth", inclination: earthInclination, periapsis: earthPeriapsis, ascendingNode: earthAscendingNode, a: earthMajor, perihelion: earthPerihelion, period: earthPeriod, eccentricity: earthEccentricity, theta: 0 };
// Create Sun
const RADIUS = 20;
const SEGMENTS = 16;
const RINGS = 16;
var sunGeometry = new THREE.SphereGeometry( RADIUS, SEGMENTS, RINGS);
var sunMaterial = new THREE.MeshBasicMaterial( { color: "#433F81" } );
var sun = new THREE.Mesh( sunGeometry, sunMaterial );
sunMaterial.color.setHex( 0xffff00 );
sun.material.wireframe = true;

// Create Earth
var earthGeometry = new THREE.SphereGeometry( 8, 16, 16);
earthGeometry = new THREE.BufferGeometry().fromGeometry( earthGeometry );
var earthMaterial = new THREE.MeshBasicMaterial( { color: "#433F81" } );
var earth = new THREE.Mesh( earthGeometry, earthMaterial );
earthMaterial.color.setHex( 0x00ff00 );
earth.material.wireframe = true;

//Create Haley's Comet
var haleyGeometry = new THREE.SphereGeometry(8,16,16);
haleyGeometry = new THREE.BufferGeometry().fromGeometry( haleyGeometry );
var haleyMaterial = new THREE.MeshBasicMaterial( { color: "#ffffff" } );
var haley = new THREE.Mesh(haleyGeometry, haleyMaterial);
haley.material.wireframe = true;



// Add objs to Scene
scene.add(sun);
scene.add(earth);
scene.add(haley);
d0 = new Date();
prevDate = new Date();
var totalTime = 0;

d0 = new Date();
prevDate = new Date();
var prevT = 0;

function objMovement(obj, objInfo) { // need to speed up and slow down orbit 
	name = objInfo.name;
	inclination = objInfo.inclination;
	periapsis = objInfo.periapsis;
	ascendingNode = objInfo.ascendingNode;
	a = objInfo.a;
	perihelion = objInfo.perihelion;
	period = objInfo.period;
	eccentricity = objInfo.eccentricity;
	theta = objInfo.theta;

	b = Math.sqrt(2*a*perihelion - perihelion^2);
	t = (2*Math.PI*totalTime/daysToMs*period) % (2*Math.PI);
	tChange = t - prevT;
	newTheta = (timePast*2*Math.PI*a**2*(1+eccentricity*Math.cos(theta)))/(daysToMs*period*b);
	//console.log(name,theta, newTheta, timePast);
	console.log(camera.position);
	x = a*Math.cos(theta);
	y = b*Math.sin(theta);
	obj.position.x = x*Math.cos(inclination)*Math.cos(ascendingNode) - y*Math.cos(periapsis)*Math.sin(ascendingNode) + x*Math.sin(inclination)*Math.sin(periapsis)*Math.sin(ascendingNode);
	obj.position.y = x*Math.cos(inclination)*Math.sin(ascendingNode) + y*Math.cos(periapsis)*Math.cos(ascendingNode) - x*Math.sin(inclination)*Math.sin(periapsis)*Math.cos(ascendingNode);
	obj.position.z = y*Math.sin(periapsis) + x*Math.sin(inclination)*Math.cos(periapsis);
	prevT = t;
	theta += newTheta;

	return theta;
}
// Render Loop
var render = function () {
	setTimeout(function(){
		requestAnimationFrame(render);
	}, 1000/30);
	// var delta = clock.getDelta();
	// cameraControls.update(delta);
	date = new Date();
	timePast = date - prevDate;
	newT = objMovement(earth, earthInfo);
	reassignObjTheta(earthInfo, newT);
	newT = objMovement(haley, haleyInfo);
	reassignObjTheta(haleyInfo, newT);
	camera.position.set(camX, camY, camZ);

	currentPos = [earth.position.x, earth.position.y, earth.position.z];
	totalTime = date - d0;
	sun.rotation.y += 2*Math.PI*timePast/(rotPeriod*secInDay*1000000);
	earth.rotation.y += 2*Math.PI*timePast/(earthRotPeriod*secInDay*1000000);

  	// Render the scene
  	renderer.render(scene, camera);
  	prevPos = currentPos;
  	prevDate = date;
  	//Stats.update();
};

// function plotOrbit (currentPos, pastPos){

// 	var lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
// 	var lineGeometry = new THREE.Geometry();

// 	lineGeometry.vertices.push(currentPos.clone());
// 	lineGeometry.vertices.push(pastPos.clone());
// 	lineGeometry.computeLineDistances();
// 	var line = new THREE.Line(lineGeometry, lineMaterial);
// 	scene.add(line);

// }
function buildAxis( src, dst, colorHex, dashed ) {
	var geom = new THREE.Geometry(),
		mat; 

	if(dashed) {
		mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
	} else {
		mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
	}

	geom.vertices.push( src.clone() );
	geom.vertices.push( dst.clone() );
	geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

	var axis = new THREE.Line(geom, mat, THREE.LineSegments);

	return axis;
	}

function reassignObjRef (ref, new_obj) {
  for (var n in ref) {
    if (ref.hasOwnProperty(n)) {
      delete(ref[n]);
    }
  }
  for (var n in new_obj) {
    if (new_obj.hasOwnProperty(n)) {
      ref[n] = new_obj[n];
    }
  }
}

function reassignObjTheta (ref, newTheta){
	for (var n in ref){
		if (n == "theta"){
			delete(ref[n]);
			ref[n] = newTheta;
		}
	}
}

$( "#zoomIn" ).click(function(e) {
	console.log('zooming');
	camX *= 0.9;
	camY *= 0.9;
	camZ *= 0.9;
});

function buildAxes( length ) {
	var axes = new THREE.Object3D();

	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

	return axes;
	}

render();