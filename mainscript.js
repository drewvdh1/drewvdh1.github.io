// =======================
// MODEL LIST
// =======================
const MODELS = [
    { name: "Reactor Vessel", file: "models/reactor_vessel.stl" }
];

// =======================
// Scene Setup
// =======================
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
camera.position.set(150, 150, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
viewer.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(100, 100, 200);
scene.add(light);

let currentMesh = null;

// =======================
// LOAD STL MODEL
// =======================
const loader = new THREE.STLLoader();

function loadModel(file) {
    loading.innerText = "Loading " + file + "...";

    loader.load(
        file,
        geo => {
            if (currentMesh) scene.remove(currentMesh);

            const material = new THREE.MeshPhongMaterial({
                color: 0xe0e0e0,
                shininess: 60
            });

            currentMesh = new THREE.Mesh(geo, material);

            // Center model
            geo.computeBoundingBox();
            const center = new THREE.Vector3();
            geo.boundingBox.getCenter(center);
            geo.translate(-center.x, -center.y, -center.z);

            scene.add(currentMesh);
            fitView();

            loading.innerText = "Loaded: " + file;
        },
        undefined,
        err => {
            console.error(err);
            loading.innerText = "Error loading model.";
        }
    );
}

// =======================
// CAMERA FIT
// =======================
function fitView() {
    if (!currentMesh) return;

    const box = new THREE.Box3().setFromObject(currentMesh);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    controls.target.copy(center);
    camera.position.set(center.x + size, center.y + size, center.z + size);
    camera.updateProjectionMatrix();
}

// =======================
// SIDEBAR BUTTONS
// =======================
const list = document.getElementById("model-list");

MODELS.forEach(m => {
    const btn = document.createElement("button");
    btn.className = "model-btn";
    btn.innerText = m.name;
    btn.onclick = () => loadModel(m.file);
    list.appendChild(btn);
});

// =======================
// RENDER LOOP
// =======================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// =======================
// RESIZE HANDLER
// =======================
window.addEventListener("resize", () => {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
});