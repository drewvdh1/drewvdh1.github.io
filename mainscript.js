// Import modern Three.js + loaders (jsDelivr works reliably)
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js";
import { STLLoader } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/controls/OrbitControls.js";

// Setup
const viewer = document.getElementById("viewer");
const loading = document.getElementById("loading");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0f0f);

const camera = new THREE.PerspectiveCamera(
    60,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    2000
);
camera.position.set(150, 150, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(200, 200, 200);
scene.add(dir);

let mesh = null;

// Load STL
const loader = new STLLoader();

function loadSTL(path) {
    loading.style.display = "block";

    loader.load(
        path,
        geo => {
            if (mesh) scene.remove(mesh);

            const mat = new THREE.MeshPhongMaterial({
                color: 0xdddddd,
                shininess: 80
            });

            mesh = new THREE.Mesh(geo, mat);

            geo.computeBoundingBox();
            const center = new THREE.Vector3();
            geo.boundingBox.getCenter(center);
            geo.translate(-center.x, -center.y, -center.z);

            scene.add(mesh);
            fitView();

            loading.innerText = "Loaded: " + path;
            setTimeout(() => loading.style.display = "none", 1200);
        },
        undefined,
        err => {
            console.error(err);
            loading.innerText = "Error loading file.";
        }
    );
}

function fitView() {
    if (!mesh) return;

    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    controls.target.copy(center);

    camera.position.copy(center);
    camera.position.x += size * 1.5;
    camera.position.y += size * 1.2;
    camera.position.z += size * 1.5;

    controls.update();
}

// Sidebar buttons
document.getElementById("btn-reactor").onclick = () =>
    loadSTL("models/reactor_vessel.stl");

document.getElementById("center").onclick = fitView;

document.getElementById("reset").onclick = () => {
    camera.position.set(150, 150, 200);
    controls.target.set(0, 0, 0);
};

document.getElementById("wireframe").onclick = () => {
    if (mesh) mesh.material.wireframe = !mesh.material.wireframe;
};

let auto = false;
document.getElementById("auto").onclick = () => auto = !auto;

// Resize
window.addEventListener("resize", () => {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    if (auto && mesh) mesh.rotation.y += 0.003;
    renderer.render(scene, camera);
}
animate();