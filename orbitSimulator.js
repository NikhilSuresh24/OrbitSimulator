// ------------------------------------------------
// JS SETUP
// ------------------------------------------------

// Create an empty scene and add axes
var scene = new THREE.Scene();
axes = buildAxes( 100000 );
scene.add( axes );
scene.background = new THREE.Color( 0xffffff );

// Create a basic perspective camera
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 4;
camera.position.set( 30,50,120 );
camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({antialias:true});

// Configure renderer clear color
renderer.setClearColor("#000000");

// Configure renderer size
renderer.setSize( window.innerWidth, window.innerHeight);

// Append Renderer to DOM
document.body.appendChild( renderer.domElement );

// ------------------------------------------------
// MESHES
// ------------------------------------------------

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
var earthGeometry = new THREE.BufferGeometry().fromGeometry( earthGeometry );
var earthMaterial = new THREE.MeshBasicMaterial( { color: "#433F81" } );
var earth = new THREE.Mesh( earthGeometry, earthMaterial );
earthMaterial.color.setHex( 0x00000 );
earth.material.wireframe = true;

// Add objs to Scene
scene.add(sun);
scene.add(earth);

// Render Loop
var render = function () {
  requestAnimationFrame( render );

  sun.rotation.x += 0.0;
  sun.rotation.y += 0.01;
  earth.position.x = 50;
  earth.position.y = 0;
  earth.position.z = 0;
  earth.rotation.x += 0.0;
  earth.rotation.y += 0.01;
  // Render the scene
  renderer.render(scene, camera);
};
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

	var axis = new THREE.Line( geom, mat, THREE.LineSegments );

	return axis;
	}

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