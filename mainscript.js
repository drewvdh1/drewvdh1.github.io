// THREE.js modules (same style as the YouTuber tutorial)
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/STLLoader.js";

// DOM elements
const container = document.getElementById("viewer");
const loadingText = document.getElementById("loading");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1113);

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
);
camera.position.set(150, 120, 180);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(80, 80, 140);
scene.add(directional);

// STL Loader
const loader = new STLLoader();

let currentMesh = null;

// Fit the model in view
function fitToView(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    controls.target.copy(center);

    camera.position.copy(center);
    camera.position.z += size * 1.8;
    camera.position.x += size * 1.2;
    camera.position.y += size * 1.1;

    camera.updateProjectionMatrix();
    controls.update();
}

// Load STL file
function loadModel(filename) {
    loadingText.textContent = `Loading ${filename}...`;

    loader.load(
        `models/${filename}`,
        (geometry) => {
            if (currentMesh) scene.remove(currentMesh);

            const material = new THREE.MeshPhongMaterial({
                color: 0xbbbbbb,
                shininess: 80,
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Center model
            geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);

            scene.add(mesh);
            currentMesh = mesh;

            fitToView(mesh);

            loadingText.textContent = `Loaded: ${filename}`;
        },
        undefined,
        (err) => {
            loadingText.textContent = `Error loading ${filename}`;
            console.error(err);
        }
    );
}

// Sidebar model buttons
document.querySelectorAll(".model-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const file = btn.getAttribute("data-file");
        loadModel(file);
    });
});

// Resize handling
window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();