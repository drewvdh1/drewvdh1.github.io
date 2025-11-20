// Create the scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("viewer").appendChild(renderer.domElement);

// Add orbit controls so you can rotate the model
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// STL loader
const loader = new THREE.STLLoader();

// Handle file upload
document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const geometry = loader.parse(e.target.result);
        const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh(geometry, material);

        scene.clear(); // Remove previous model
        scene.add(mesh);

        // Center the model
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const center = box.getCenter(new THREE.Vector3());
        mesh.position.sub(center);

        // Auto zoom to fit
        const size = box.getSize(new THREE.Vector3()).length();
        camera.position.set(size, size, size);
        controls.update();
    };
    reader.readAsArrayBuffer(file);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
