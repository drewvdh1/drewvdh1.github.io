// Import ThreeJS modules (ESM) from jsDelivr CDN
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js";
import { STLLoader } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/controls/OrbitControls.js";

// === Scene Setup ===
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

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(50, 50, 100);
scene.add(dir);

let currentMesh = null;

// === Load STL ===
const loader = new STLLoader();

function loadModel(file) {
    loading.innerText = "Loading " + file + "...";

    loader.load("models/" + file, geo => {
        if (currentMesh) scene.remove(currentMesh);

        const mat = new THREE.MeshPhongMaterial({
            color: 0xbbbbbb,
            shininess: 80
        });

        currentMesh = new THREE.Mesh(geo, mat);

        geo.computeBoundingBox();
        const center = new THREE.Vector3();
        geo.boundingBox.getCenter(center);
        geo.translate(-center.x, -center.y, -center.z);

        scene.add(currentMesh);
        fitView();
        loading.innerText = "Loaded: " + file;
    });
}

function fitView() {
    if (!currentMesh) return;

    const box = new THREE.Box3().setFromObject(currentMesh);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    controls.target.copy(center);
    camera.position.set(
        center.x + size * 1.3,
        center.y + size * 1.1,
        center.z + size * 1.3
    );
}

// === Controls ===
document.getElementById("reactorBtn").onclick = () => loadModel("reactor_vessel.stl");
document.getElementById("centerBtn").onclick = fitView;
document.getElementById("resetBtn").onclick = () => {
    camera.position.set(120, 120, 150);
    controls.target.set(0, 0, 0);
};
document.getElementById("wireBtn").onclick = () => {
    if (currentMesh) currentMesh.material.wireframe = !currentMesh.material.wireframe;
};

let autoRotate = false;
document.getElementById("autoBtn").onclick = () => autoRotate = !autoRotate;

document.getElementById("scaleRange").oninput = e => {
    if (currentMesh) currentMesh.scale.set(e.target.value, e.target.value, e.target.value);
};

// === Resize ===
window.addEventListener("resize", () => {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
});

// === Animation ===
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (autoRotate && currentMesh) {
        currentMesh.rotation.y += 0.003;
    }
    renderer.render(scene, camera);
}
animate();