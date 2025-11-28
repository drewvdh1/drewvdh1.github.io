// mainscript.js (ES module version)

// Import three.js and helpers from CDN as modules
import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';
import { STLLoader } from 'https://unpkg.com/three@0.155.0/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.155.0/examples/jsm/controls/OrbitControls.js';

// ==============================
// 1) EDIT THIS LIST TO ADD MODELS
// ==============================
const MODELS = [
    { name: "Reactor Vessel", file: "models/reactor_vessel.stl" },
    // Add more here:
    // { name: "Pump", file: "models/pump.stl" },
    // { name: "Nozzle", file: "models/nozzle.stl" },
];


// ==============================
// 2) Scene Setup
// ==============================
const viewer = document.getElementById("viewer");
const loading = document.getElementById("loading");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    60,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    2000
);
camera.position.set(120, 120, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(80, 80, 150);
scene.add(dir);

// Model container
let currentMesh = null;


// ==============================
// 3) Load STL Function
// ==============================
const loader = new STLLoader();

function loadModel(file) {
    loading.innerText = "Loading " + file + "...";

    loader.load(
        file,
        geo => {
            if (currentMesh) scene.remove(currentMesh);

            const mat = new THREE.MeshPhongMaterial({
                color: 0xbbbbbb,
                shininess: 80
            });

            currentMesh = new THREE.Mesh(geo, mat);

            // Center model
            geo.computeBoundingBox();
            const center = new THREE.Vector3();
            geo.boundingBox.getCenter(center);
            geo.translate(-center.x, -center.y, -center.z);

            scene.add(currentMesh);

            fitView();

            loading.innerText = "Loaded: " + file;
        },
        xhr => {},
        err => {
            console.error(err);
            loading.innerText = "Error loading " + file;
        }
    );
}


// ==============================
// 4) Fit model into camera view
// ==============================
function fitView() {
    if (!currentMesh) return;

    const box = new THREE.Box3().setFromObject(currentMesh);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    controls.target.copy(center);

    camera.position.copy(center);
    camera.position.x += size * 1.3;
    camera.position.y += size * 1.1;
    camera.position.z += size * 1.3;

    camera.updateProjectionMatrix();
    controls.update();
}


// ==============================
// 5) Sidebar Model Buttons
// ==============================
const list = document.getElementById("model-list");

MODELS.forEach(m => {
    const btn = document.createElement("button");
    btn.className = "model-btn";
    btn.innerText = m.name;

    btn.onclick = () => loadModel(m.file);

    list.appendChild(btn);
});


// ==============================
// 6) Control Buttons
// ==============================
document.getElementById("btn-center").onclick = fitView;

document.getElementById("btn-reset").onclick = () => {
    camera.position.set(120, 120, 150);
    controls.target.set(0, 0, 0);
};

document.getElementById("btn-wire").onclick = () => {
    if (!currentMesh) return;
    currentMesh.material.wireframe = !currentMesh.material.wireframe;
};

let autoRotate = false;
document.getElementById("btn-auto").onclick = () => {
    autoRotate = !autoRotate;
};

document.getElementById("scale-range").oninput = e => {
    if (!currentMesh) return;
    const s = e.target.value;
    currentMesh.scale.set(s, s, s);
};


// ==============================
// 7) Resize Handling
// ==============================
window.addEventListener("resize", () => {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
});


// ==============================
// 8) Animation Loop
// ==============================
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (autoRotate && currentMesh) {
        currentMesh.rotation.y += 0.003;
    }

    renderer.render(scene, camera);
}
animate();