import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/STLLoader.js";

let scene, camera, renderer, controls, currentModel;

initViewer();

function initViewer() {
    const container = document.getElementById("viewer");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 50, 120);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(light);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

/* ---- PRELOADED MODELS ----
   Replace the URLs below with real STL files hosted online.
*/

const models = {
    r1: "./reactor.stl",
    r2: "./model2.stl",
    r3: "./model3.stl"
};

const loader = new STLLoader();

/* ---- FUNCTION CALLED BY BUTTONS ---- */
function loadPreloaded(name) {
    const file = models[name];
    if (!file) {
        console.error("Unknown model:", name);
        return;
    }

    loader.load(file, geometry => {
        if (currentModel) scene.remove(currentModel);

        const material = new THREE.MeshStandardMaterial({ color: 0x999999 });
        currentModel = new THREE.Mesh(geometry, material);

        geometry.computeBoundingBox();
        const center = geometry.boundingBox.getCenter(new THREE.Vector3());
        currentModel.position.sub(center);

        scene.add(currentModel);
    });
}

// Expose to global so HTML can call it
window.loadPreloaded = loadPreloaded;
