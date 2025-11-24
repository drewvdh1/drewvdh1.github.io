let scene, camera, renderer, controls;

function initViewer() {
    const container = document.getElementById("viewer");

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(2, 2, 2);

    controls = new OrbitControls(camera, renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function selectModel() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".stl,.glb,.gltf";

    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) loadLocalModel(file);
    };

    input.click();
}

function loadLocalModel(file) {
    // Remove previous models but keep light + camera
    scene.children = scene.children.filter(obj => obj.type === "DirectionalLight");

    const reader = new FileReader();

    reader.onload = function (e) {
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === "stl") loadSTL(e.target.result);
        else if (ext === "glb" || ext === "gltf") loadGLB(e.target.result);
        else alert("Unsupported file format");
    };

    reader.readAsArrayBuffer(file);
}

function loadSTL(buffer) {
    const loader = new STLLoader();
    const geometry = loader.parse(buffer);

    const material = new THREE.MeshStandardMaterial({ color: 0x999999 });
    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);
    autoCenterAndScale(mesh);
}

function loadGLB(buffer) {
    const loader = new GLTFLoader();

    loader.parse(
        buffer,
        "",
        (gltf) => {
            const model = gltf.scene;
            scene.add(model);
            autoCenterAndScale(model);
        },
        (error) => console.error("GLB load error:", error)
    );
}

function autoCenterAndScale(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    object.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1 / maxDim;

    object.scale.setScalar(scale);
}

// Attach events to buttons
document.querySelectorAll("[data-model-btn]").forEach(btn => {
    btn.addEventListener("click", selectModel);
});

// Start viewer
window.onload = initViewer;