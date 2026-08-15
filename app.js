import * as THREE from
    "https://unpkg.com/three@0.160.0/build/three.module.js";

import { OrbitControls }
    from
    "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

import { GLTFLoader }
    from
    "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";


const scene = new THREE.Scene();

scene.background = new THREE.Color(0x222222);


const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(5.9, 1.5, 0);


const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(window.devicePixelRatio);

renderer.outputColorSpace = THREE.SRGBColorSpace;

document
    .getElementById("viewer")
    .appendChild(renderer.domElement);


const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;


scene.add(
    new THREE.AmbientLight(0xffffff, 2)
);

const light = new THREE.DirectionalLight(
    0xffffff,
    3
);

light.position.set(5, 10, 5);

scene.add(light);


// --------------------------------------------------
// MODEL
// --------------------------------------------------

let model;

const loader = new GLTFLoader();

loader.load(

    "minecraft_horse__bare_bones.glb",

    (gltf) => {

        model = gltf.scene;

        scene.add(model);

        // Default coat
        changeTexture("tackless_horses/horse_creamy3.png");

    },

    undefined,

    (err) => {

        console.log(err);

    }

);


// --------------------------------------------------
// TEXTURES
// --------------------------------------------------

const textureLoader = new THREE.TextureLoader();


// Currently selected coat
let currentCoat = null;

// Currently selected marking
let currentMarking = null;


// --------------------------------------------------
// APPLY TEXTURE TO HORSE
// --------------------------------------------------

function applyTexture(texture) {

    if (!model) return;

    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    model.traverse((child) => {

        if (!child.isMesh) return;

        const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

        materials.forEach((mat) => {

            mat.map = texture;

            mat.transparent = true;
            mat.alphaTest = 0.01;

            mat.color.set(0xffffff);

            mat.needsUpdate = true;

        });

    });

}


// --------------------------------------------------
// CHANGE COAT
// --------------------------------------------------

function changeTexture(file) {

    textureLoader.load(

        file,

        (texture) => {

            texture.flipY = false;
            texture.colorSpace = THREE.SRGBColorSpace;

            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.generateMipmaps = false;

            // Remember currently selected coat
            currentCoat = texture;

            // If there is a marking selected,
            // rebuild the combined texture.
            if (currentMarking) {

                createCombinedTexture();

            } else {

                applyTexture(texture);

            }

        }

    );

}


// --------------------------------------------------
// CHANGE MARKING
// --------------------------------------------------

function changeMarking(file) {

    // Remove marking
    if (file === "none") {

        currentMarking = null;

        if (currentCoat) {

            applyTexture(currentCoat);

        }

        return;

    }


    textureLoader.load(

        file,

        (texture) => {

            texture.flipY = false;
            texture.colorSpace = THREE.SRGBColorSpace;

            currentMarking = texture;

            createCombinedTexture();

        }

    );

}


// --------------------------------------------------
// COMBINE COAT + MARKING
// --------------------------------------------------

function createCombinedTexture() {

    if (!currentCoat || !currentMarking) return;

    const width = currentCoat.image.width;
    const height = currentCoat.image.height;

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;

    // Coat
    ctx.drawImage(
        currentCoat.image,
        0,
        0,
        width,
        height
    );

    // Marking ON TOP
    ctx.drawImage(
        currentMarking.image,
        0,
        0,
        width,
        height
    );


    // -----------------------------------------
    // Make alpha strictly 0 or 255 (fixing flashy model parts)
    // -----------------------------------------

    const imageData = ctx.getImageData(
        0,
        0,
        width,
        height
    );

    const data = imageData.data;

    for (let i = 3; i < data.length; i += 4) {

        if (data[i] < 128) {
            data[i] = 0;
        } else {
            data[i] = 255;
        }

    }

    ctx.putImageData(
        imageData,
        0,
        0
    );


    // -----------------------------------------
    // Create Three.js texture
    // -----------------------------------------

    const combinedTexture =
        new THREE.CanvasTexture(canvas);

    combinedTexture.flipY = false;
    combinedTexture.colorSpace =
        THREE.SRGBColorSpace;

    combinedTexture.magFilter =
        THREE.NearestFilter;

    combinedTexture.minFilter =
        THREE.NearestFilter;

    combinedTexture.generateMipmaps = false;

    combinedTexture.wrapS =
        THREE.ClampToEdgeWrapping;

    combinedTexture.wrapT =
        THREE.ClampToEdgeWrapping;

    combinedTexture.needsUpdate = true;


    applyTexture(combinedTexture);

}


// --------------------------------------------------
// BUTTONS
// --------------------------------------------------

// Coat select
document.getElementById("coatSelect").addEventListener("change", (event) => {

    changeTexture(event.target.value);

});


// Marking select
document.getElementById("markingSelect").addEventListener("change", (event) => {

    changeMarking(event.target.value);

});


// --------------------------------------------------
// RESIZE
// --------------------------------------------------

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});


// --------------------------------------------------
// ANIMATION
// --------------------------------------------------

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(
        scene,
        camera
    );

}

animate();

// --------------------------------------------
// CHECKING IF COMBO IS POSSIBLE
// --------------------------------------------

function checkCombination() {



    const coat =
        document.getElementById("coatSelect").value;

    const marking =
        document.getElementById("markingSelect").value;


    if (
        coat === "https://www.dropbox.com/scl/fi/ranplvessrwi0cwqnxyim/horse_black.png?rlkey=5cslor8z7lqx4rqvwbuwus2pe&st=0kdncz69&e=1&dl=0" &&
        marking === "https://www.dropbox.com/scl/fi/vfnpnq5ei1k9rtaosnacm/horse_markings_blackdots.png?rlkey=4dzy00y2pqjn8nxlt9kqv3kb1&st=8wc42tml&dl=0"
    ) {

        document.getElementById("combinationMessage").textContent =
            "This combination is possible!";

    } else {

        document.getElementById("combinationMessage").textContent =
            "This combination is not possible.";

    }

}
// for changing coat
document.getElementById("coatSelect").addEventListener("change", checkCombination);
// for changing marking
document.getElementById("markingSelect").addEventListener("change", checkCombination);


