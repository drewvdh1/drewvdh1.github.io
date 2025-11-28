// mainscript.js  (ES module)

// Import three.js + helpers from CDN (module versions)
import * as THREE from "https://cdn.skypack.dev/three@0.155.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.155.0/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "https://cdn.skypack.dev/three@0.155.0/examples/jsm/loaders/STLLoader.js";

// ------------- Model list -------------
// Put your STL files in /models and list them here.
const MODELS = [
  { name: "Reactor Vessel", file: "models/reactor_vessel.stl" },
  // { name: "Another Part", file: "models/another_part.stl" },
];

let currentModel = null;

// ------------- Basic scene setup -------------
const viewerEl = document.getElementById("viewer");
const loadingEl = document.getElementById("loading");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070a);

const camera = new THREE.PerspectiveCamera(
  60,
  viewerEl.clientWidth / viewerEl.clientHeight,
  0.1,
  5000
);
camera.position.set(120, 100, 160);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewerEl.clientWidth, viewerEl.clientHeight);
viewerEl.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.6;

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
keyLight.position.set(120, 180, 200);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(-160, -40, -120);
scene.add(rimLight);

// Ground-ish grid (very subtle)
const grid = new THREE.GridHelper(400, 40, 0x202636, 0x111827);
grid.material.transparent = true;
grid.material.opacity = 0.18;
scene.add(grid);

// ------------- STL loader -------------
const stlLoader = new STLLoader();
let mesh = null;

// Helper: fit camera to current mesh
function fitCameraToObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxDim / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = 1.4 * Math.max(fitHeightDistance, fitWidthDistance);

  const dir = new THREE.Vector3()
    .subVectors(camera.position, controls.target)
    .normalize();

  controls.target.copy(center);
  camera.position.copy(center).add(dir.multiplyScalar(distance));

  camera.near = distance / 100;
  camera.far = distance * 10;
  camera.updateProjectionMatrix();
  controls.update();
}

// Load STL and add to scene
function loadModel(file) {
  loadingEl.textContent = `Loading: ${file}`;

  stlLoader.load(
    file,
    geometry => {
      if (mesh) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      }

      const material = new THREE.MeshPhongMaterial({
        color: 0xd4d4d8,
        specular: 0x111111,
        shininess: 80,
      });

      mesh = new THREE.Mesh(geometry, material);

      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);

      scene.add(mesh);
      fitCameraToObject(mesh);

      loadingEl.textContent = `Loaded: ${file}`;
      currentModel = file;
    },
    xhr => {
      if (xhr.total) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        loadingEl.textContent = `Loading: ${file} (${pct}%)`;
      }
    },
    error => {
      console.error("STL load error", error);
      loadingEl.textContent = `Error loading ${file}`;
    }
  );
}

// ------------- Sidebar buttons -------------
const listEl = document.getElementById("model-list");

MODELS.forEach((model, index) => {
  const btn = document.createElement("button");
  btn.className = "model-btn";
  btn.textContent = model.name;

  btn.addEventListener("click", () => {
    // update active styling
    document.querySelectorAll(".model-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadModel(model.file);
  });

  listEl.appendChild(btn);

  // auto-load first model
  if (index === 0) {
    btn.classList.add("active");
    loadModel(model.file);
  }
});

// ------------- Resize handling -------------
window.addEventListener("resize", () => {
  const w = viewerEl.clientWidth;
  const h = viewerEl.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ------------- Animation loop -------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();