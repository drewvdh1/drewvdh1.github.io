// =========================
// Basic Scene Setup
// =========================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.set(100, 100, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("viewer").appendChild(renderer.domElement);

// =========================
// Orbit Controls
// =========================
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.5;

// =========================
// Lighting
// =========================
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(50, 50, 100);
scene.add(directional);

// =========================
// Load STL Model
// =========================
const loader = new THREE.STLLoader();

loader.load(
    "reactor_vessel.stl",
    function (geometry) {
        const material = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            specular: 0x111111,
            shininess: 80
        });

        const mesh = new THREE.Mesh(geometry, material);

        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        mesh.position.sub(center); // center the model

        mesh.scale.set(1, 1, 1);
        scene.add(mesh);

        document.getElementById("loading").style.display = "none";
    },
    undefined,
    function (error) {
        console.error("STL Loading Error:", error);
        document.getElementById("loading").innerText = "Failed to load STL.";
    }
);

// =========================
// Handle Resize
// =========================
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =========================
// Render Loop
// =========================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();