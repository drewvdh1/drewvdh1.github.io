// THREE.js imports (unchanged)
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/STLLoader.js";

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
camera.position.set(180, 140, 210);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ✨ Lights — prettier aesthetic
scene.add(new THREE.AmbientLight(0xffffff, 0.42));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(120, 140, 160);
dirLight.castShadow = true;
scene.add(dirLight);

const fillLight = new THREE.PointLight(0x3d91ff, 0.3, 600);
fillLight.position.set(-80, 60, 40);
scene.add(fillLight);

// Loader
const loader = new STLLoader();
let currentMesh = null;

// Fit model to view
function fitToView(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    controls.target.copy(center);

    camera.position.copy(center);
    camera.position.z += size * 1.9;
    camera.position.x += size * 1.3;
    camera.position.y += size * 1.1;

    camera.updateProjectionMatrix();
    controls.update();
}

// Load STL
function loadModel(filename) {
    loadingText.textContent = `Loading ${filename}...`;

    loader.load(
        `models/${filename}`,
        geometry => {
            if (currentMesh) scene.remove(currentMesh);

            // ✨ Prettier material
            const material = new THREE.MeshPhongMaterial({
                color: 0xbfc3c7,
                shininess: 140,
                specular: 0x3d91ff
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Center mesh
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
        err => {
            console.error(err);
            loadingText.textContent = `Error loading ${filename}`;
        }
    );
}

// Buttons
document.querySelectorAll(".model-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        loadModel(btn.dataset.file);
    });
});

// Resize
window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();