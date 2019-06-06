// -------------------------
// CONSTS
// -------------------------
const rotPeriod = 24.47; //days
const daysToMs = 5000;
const auToDist = 100; //conversion from au to units on program
const secInDay = 86400;
const DEG_TO_RAD = (Math.PI / 180);

//earth Consts
const earthRotPeriod = 1; //days
const earthInclination = 0.000; //radians
const earthPeriapsis = 102.94719 * DEG_TO_RAD; //radians
const earthAscendingNode = -11.26064 * DEG_TO_RAD; //radians
const earthMajor = 1.00000011 * auToDist; //au
const earthPeriod = 365.25; //days
const earthPerihelion = 0.9832359198145 * auToDist; //au
const earthEccentricity = 0.0167;

// Venus

const venusInclination = 3.39 * DEG_TO_RAD;
const venusPeriapsis = 131.53298 * DEG_TO_RAD;
const venusAscendingNode = 76.68069 * DEG_TO_RAD;
const venusMajor = 0.72333199 * auToDist;
const venusPeriod = 224.701; //days
const venusPerihelion = 0.718459423901 * auToDist;
const venusEccentricity = 0.0067;

// -------------------------
// SETUP
// -------------------------

// Create an empty scene and add axes
var scene = new THREE.Scene();
axes = buildAxes(100000);
scene.add(axes);
scene.background = new THREE.Color(0x000000);

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({ antialias: true });

// Configure renderer clear color
renderer.setClearColor("#ffffff");

// Configure renderer size
renderer.setSize(window.innerWidth, window.innerHeight);

// Append Renderer to DOM
document.body.appendChild(renderer.domElement);

// Create a camera
var camX = 150; //30
var camY = 50; // 50
var camZ = 50; //150
var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(camX, camY, camZ);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Scale time steps
var timeScaleSlider;

window.onload = function() {
    timeScaleSlider = document.getElementById("timeScale");
};

// Orbital Parameter Containers
var earthInfo = { name: "earth", inclination: earthInclination, periapsis: earthPeriapsis, ascendingNode: earthAscendingNode, a: earthMajor, perihelion: earthPerihelion, period: earthPeriod, eccentricity: earthEccentricity, theta: 0 };

var venusInfo = { name: "venus", inclination: venusInclination, periapsis: venusPeriapsis, ascendingNode: venusAscendingNode, a: venusMajor, perihelion: venusPerihelion, period: venusPeriod, eccentricity: venusEccentricity, theta: 0 };

// Create Sun
var sunGeometry = new THREE.SphereGeometry(20, 16, 16);
var sunMaterial = new THREE.MeshBasicMaterial({ color: "#ffff00" });
var sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.material.wireframe = true;

// Create Earth
var earthGeometry = new THREE.SphereGeometry(8, 16, 16);
earthGeometry = new THREE.BufferGeometry().fromGeometry(earthGeometry);
var earthMaterial = new THREE.MeshBasicMaterial({ color: "#00ff00" });
var earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.material.wireframe = true;

// Create Venus
var venusGeometry = new THREE.SphereGeometry(8, 16, 16);
venusGeometry = new THREE.BufferGeometry().fromGeometry(venusGeometry);
var venusMaterial = new THREE.MeshBasicMaterial({ color: "#ff0000" });
var venus = new THREE.Mesh(venusGeometry, venusMaterial);
venus.material.wireframe = true;

// Add objects to Scene
scene.add(sun);
scene.add(earth);
scene.add(venus);
d0 = new Date();
prevTime = new Date();

// -------------------------
// FUNCTIONS
// -------------------------

/*
Plans the movement of an object given orbital parameters
*/
function objMovement(obj, objInfo) {
    // Unpack containers
    name = objInfo.name;
    inclination = objInfo.inclination;
    periapsis = objInfo.periapsis;
    ascendingNode = objInfo.ascendingNode;
    a = objInfo.a;
    perihelion = objInfo.perihelion;
    period = objInfo.period;
    eccentricity = objInfo.eccentricity;
    theta = objInfo.theta;

    if (a < 0) {
        a *= -1;
    }

    if (theta < 0) {
        theta *= -1;
    }

    // calculate change in angle of object
    b = Math.sqrt(2 * a * perihelion - perihelion ** 2);
    newTheta = (deltaTime * 2 * Math.PI * a ** 2 * (1 + eccentricity * Math.cos(theta))) / (daysToMs * period * b);
    x = a * Math.cos(theta);
    y = b * Math.sin(theta);
    obj.position.x = x * Math.cos(inclination) * Math.cos(ascendingNode) - y * Math.cos(periapsis) * Math.sin(ascendingNode) + x * Math.sin(inclination) * Math.sin(periapsis) * Math.sin(ascendingNode);
    obj.position.y = x * Math.cos(inclination) * Math.sin(ascendingNode) + y * Math.cos(periapsis) * Math.cos(ascendingNode) - x * Math.sin(inclination) * Math.sin(periapsis) * Math.cos(ascendingNode);
    obj.position.z = y * Math.sin(periapsis) + x * Math.sin(inclination) * Math.cos(periapsis);
    theta += newTheta;

    return theta;
}

// Render Loop
var render = function() {
    setTimeout(function() {
        requestAnimationFrame(render);
    }, 1000 / 30);

    //Calculate Movement of Planets
    time = new Date();
    deltaTime = scaleTime(time - prevTime);
    newT = objMovement(earth, earthInfo);
    reassignObjTheta(earthInfo, newT);
    newT = objMovement(venus, venusInfo);
    reassignObjTheta(venusInfo, newT);

    // Render the scene
    renderer.render(scene, camera);
    prevTime = time;
};

/*
Scales a given time based on the value of an input slider
*/
function scaleTime(time) {
    var scale;
    if (typeof timeScaleSlider == "object") {
        scale = timeScaleSlider.value;
    } else {
        scale = 0;
    }
    if (scale > 0) {
        return time * scale;
    } else if (scale < 0) {
        return time / -scale;
    } else {
        return time;
    }
}

function reassignObjTheta(ref, newTheta) {
    for (var n in ref) {
        if (n == "theta") {
            delete(ref[n]);
            ref[n] = newTheta;
        }
    }
}

/*
Constructs an axis
*/
function buildAxis(src, dst, colorHex, dashed) {
    var geom = new THREE.Geometry(),
        mat;

    if (dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
    }

    geom.vertices.push(src.clone());
    geom.vertices.push(dst.clone());
    geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

    var axis = new THREE.Line(geom, mat, THREE.LineSegments);

    return axis;
}
/*
Constructs the X, Y, and Z axes 
*/
function buildAxes(length) {
    var axes = new THREE.Object3D();

    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z

    return axes;
}

render();