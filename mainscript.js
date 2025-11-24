let scene, camera, renderer, controls;

window.onload = initViewer;

function initViewer() {
    const container = document.getElementById("viewer");

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000);
    container.appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(2, 2, 2);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    animate();
}

// Rendering loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Called when clicking sidebar buttons
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

// Loads STL / GLB / GLTF
function loadLocalModel(file) {
    // Remove old model(s) but keep the light
    scene.children = scene.children.filter(obj => obj.type === "DirectionalLight");

    const reader = new FileReader();

    reader.onload = function (e) {
        const extension = file.name.split('.').pop().toLowerCase();

        if (extension === "stl") loadSTL(e.target.result);
        else if (extension === "glb" || extension === "gltf") loadGLB(e.target.result);
        else alert("Unsupported file type");
    };

    reader.readAsArrayBuffer(file);
}

// STL loader
function loadSTL(data) {
    const loader = new THREE.STLLoader();
    const geometry = loader.parse(data);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);
    autoCenterAndScale(mesh);
}

// GLB/GLTF loader
function loadGLB(data) {
    const loader = new THREE.GLTFLoader();

    loader.parse(
        data,
        "",
        (gltf) => {
            const model = gltf.scene;
            scene.add(model);
            autoCenterAndScale(model);
        },
        (error) => console.error("GLB load error:", error)
    );
}

// Centers and scales models
function autoCenterAndScale(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Move to center
    object.position.sub(center);

    // Fit to view
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 1 / maxDim;
    object.scale.setScalar(scaleFactor);
}
