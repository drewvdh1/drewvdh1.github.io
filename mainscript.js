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

    controls = new THREE.OrbitControls(camera, renderer.domElement);

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
    // Clear old model
    while (scene.children.length > 1) {
        scene.remove(scene.children[1]);
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const extension = file.name.split('.').pop().toLowerCase();

        if (extension === "stl") loadSTL(e.target.result);
        else if (extension === "glb" || extension === "gltf") loadGLB(e.target.result);
        else alert("Unsupported file type");
    };

    reader.readAsArrayBuffer(file);
}

function loadSTL(data) {
    const loader = new THREE.STLLoader();
    const geometry = loader.parse(data);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    autoCenterAndScale(mesh);
}

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

function autoCenterAndScale(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Move model to center
    object.position.sub(center);

    // Scale model to fit viewer
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 1 / maxDim;
    object.scale.setScalar(scaleFactor);
}

window.onload = initViewer;
