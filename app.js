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
        changeTexture("tackless_horses/horse_creamy.png");

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

const invalidCombinations = [

    // BLACK 1 COMBOS
    {
        coat: "tackless_horses/horse_black.png",
        marking: "markings/horse_markings_white2.png"
    },

    {
        coat: "tackless_horses/horse_black.png",
        marking: "markings/horse_markings_white3.png"
    },

    {
        coat: "tackless_horses/horse_black.png",
        marking: "markings/horse_markings_whitedots2.png"
    },

    {
        coat: "tackless_horses/horse_black.png",
        marking: "markings/horse_markings_whitedots3.png"
    },

    // BLACK 2 COMBOS
    {
        coat: "tackless_horses/horse_black2.png",
        marking: "markings/horse_markings_white.png"
    },

    {
        coat: "tackless_horses/horse_black2.png",
        marking: "markings/horse_markings_white3.png"
    },

    {
        coat: "tackless_horses/horse_black2.png",
        marking: "markings/horse_markings_whitedots.png"
    },

    {
        coat: "tackless_horses/horse_black2.png",
        marking: "markings/horse_markings_whitedots3.png"
    },

    // BLACK 3 COMBOS
    {
        coat: "tackless_horses/horse_black3.png",
        marking: "markings/horse_markings_white.png"
    },

    {
        coat: "tackless_horses/horse_black3.png",
        marking: "markings/horse_markings_white2.png"
    },

    {
        coat: "tackless_horses/horse_black3.png",
        marking: "markings/horse_markings_whitedots.png"
    },

    {
        coat: "tackless_horses/horse_black3.png",
        marking: "markings/horse_markings_whitedots2.png"
    },

    // BROWN COMBOS -- TWO ARE EXCEPTIONS; MENTIONED L8R
    {
        coat: "tackless_horses/horse_brown.png",
        marking: "markings/horse_markings_whitefield3.png"
    },

    // BROWN 2 COMBOS
    {
        coat: "tackless_horses/horse_brown2.png",
        marking: "markings/horse_markings_blackdots2.png"
    },

    {
        coat: "tackless_horses/horse_brown2.png",
        marking: "markings/horse_markings_whitefield2.png"
    },

    {
        coat: "tackless_horses/horse_brown2.png",
        marking: "markings/horse_markings_whitefield4.png"
    },

    // CHESTNUT COMBOS
    {
        coat: "tackless_horses/horse_chestnut.png",
        marking: "markings/horse_markings_white2.png"
    },

    {
        coat: "tackless_horses/horse_chestnut.png",
        marking: "markings/horse_markings_white3.png"
    },

    {
        coat: "tackless_horses/horse_chestnut.png",
        marking: "markings/horse_markings_whitedots2.png"
    },

    {
        coat: "tackless_horses/horse_chestnut.png",
        marking: "markings/horse_markings_whitedots3.png"
    },

    // CHESTNUT 2 COMBOS
    {
        coat: "tackless_horses/horse_chestnut2.png",
        marking: "markings/horse_markings_white.png"
    },

    {
        coat: "tackless_horses/horse_chestnut2.png",
        marking: "markings/horse_markings_white3.png"
    },

    {
        coat: "tackless_horses/horse_chestnut2.png",
        marking: "markings/horse_markings_whitedots.png"
    },

    {
        coat: "tackless_horses/horse_chestnut2.png",
        marking: "markings/horse_markings_whitedots3.png"
    },

    // CHESTNUT 3 COMBOS
    {
        coat: "tackless_horses/horse_chestnut3.png",
        marking: "markings/horse_markings_white.png"
    },

    {
        coat: "tackless_horses/horse_chestnut3.png",
        marking: "markings/horse_markings_white2.png"
    },

    {
        coat: "tackless_horses/horse_chestnut3.png",
        marking: "markings/horse_markings_whitedots.png"
    },

    {
        coat: "tackless_horses/horse_chestnut3.png",
        marking: "markings/horse_markings_whitedots2.png"
    },

    // CREAMY COMBOS
    {
        coat: "tackless_horses/horse_creamy.png",
        marking: "markings/horse_markings_blackdots2.png"
    },

    {
        coat: "tackless_horses/horse_creamy.png",
        marking: "markings/horse_markings_whitefield2.png"
    },

    {
        coat: "tackless_horses/horse_creamy.png",
        marking: "markings/horse_markings_whitefield3.png"
    },

    {
        coat: "tackless_horses/horse_creamy.png",
        marking: "markings/horse_markings_whitefield4.png"
    },

    // CREAMY 2 COMBOS
    {
        coat: "tackless_horses/horse_creamy2.png",
        marking: "markings/horse_markings_blackdots.png"
    },

    {
        coat: "tackless_horses/horse_creamy2.png",
        marking: "markings/horse_markings_whitefield.png"
    },

    {
        coat: "tackless_horses/horse_creamy2.png",
        marking: "markings/horse_markings_whitefield3.png"
    },

    {
        coat: "tackless_horses/horse_creamy2.png",
        marking: "markings/horse_markings_whitefield4.png"
    },

    // CREAMY 3 COMBOS
    {
        coat: "tackless_horses/horse_creamy3.png",
        marking: "markings/horse_markings_blackdots2.png"
    },

    {
        coat: "tackless_horses/horse_creamy3.png",
        marking: "markings/horse_markings_whitefield.png"
    },

    {
        coat: "tackless_horses/horse_creamy3.png",
        marking: "markings/horse_markings_whitefield2.png"
    },

    {
        coat: "tackless_horses/horse_creamy3.png",
        marking: "markings/horse_markings_whitefield4.png"
    },

    // CREAMY 4 COMBOS
    {
        coat: "tackless_horses/horse_creamy4.png",
        marking: "markings/horse_markings_blackdots.png"
    },

    {
        coat: "tackless_horses/horse_creamy4.png",
        marking: "markings/horse_markings_whitefield.png"
    },

    {
        coat: "tackless_horses/horse_creamy4.png",
        marking: "markings/horse_markings_whitefield2.png"
    },

    {
        coat: "tackless_horses/horse_creamy4.png",
        marking: "markings/horse_markings_whitefield3.png"
    },

    // DARK BROWN COMBOS
    {
        coat: "tackless_horses/horse_darkbrown.png",
        marking: "markings/horse_markings_blackdots2.png"
    },

    {
        coat: "tackless_horses/horse_darkbrown.png",
        marking: "markings/horse_markings_whitefield2.png"
    },

    {
        coat: "tackless_horses/horse_darkbrown.png",
        marking: "markings/horse_markings_whitefield4.png"
    },

    // DARK BROWN 2 COMBOS
    {
        coat: "tackless_horses/horse_darkbrown2.png",
        marking: "markings/horse_markings_blackdots.png"
    },

    {
        coat: "tackless_horses/horse_darkbrown2.png",
        marking: "markings/horse_markings_whitefield1.png"
    },

    {
        coat: "tackless_horses/horse_darkbrown2.png",
        marking: "markings/horse_markings_whitefield3.png"
    },

    // GRAY COMBOS
    {
        coat: "tackless_horses/horse_gray.png",
        marking: "markings/horse_markings_white2.png"
    },

    {
        coat: "tackless_horses/horse_gray.png",
        marking: "markings/horse_markings_white3.png"
    },

    {
        coat: "tackless_horses/horse_gray.png",
        marking: "markings/horse_markings_whitedots2.png"
    },

    {
        coat: "tackless_horses/horse_gray.png",
        marking: "markings/horse_markings_whitedots3.png"
    },

    // GRAY 2 COMBOS
    {
        coat: "tackless_horses/horse_gray2.png",
        marking: "markings/horse_markings_white.png"
    },

    {
        coat: "tackless_horses/horse_gray2.png",
        marking: "markings/horse_markings_white3.png"
    },

    {
        coat: "tackless_horses/horse_gray2.png",
        marking: "markings/horse_markings_whitedots.png"
    },

    {
        coat: "tackless_horses/horse_gray2.png",
        marking: "markings/horse_markings_whitedots3.png"
    },

    // GRAY 3 COMBOS
    {
        coat: "tackless_horses/horse_gray3.png",
        marking: "markings/horse_markings_white.png"
    },

    {
        coat: "tackless_horses/horse_gray3.png",
        marking: "markings/horse_markings_white2.png"
    },

    {
        coat: "tackless_horses/horse_gray3.png",
        marking: "markings/horse_markings_whitedots.png"
    },

    {
        coat: "tackless_horses/horse_gray3.png",
        marking: "markings/horse_markings_whitedots2.png"
    },

    // WHITE COMBOS
    {
        coat: "tackless_horses/horse_white.png",
        marking: "markings/horse_markings_blackdots2.png"
    },

    {
        coat: "tackless_horses/horse_white.png",
        marking: "markings/horse_markings_whitefield2.png"
    },

    {
        coat: "tackless_horses/horse_white.png",
        marking: "markings/horse_markings_whitefield4.png"
    },

    // WHITE 2 COMBOS
    {
        coat: "tackless_horses/horse_white2.png",
        marking: "markings/horse_markings_blackdots.png"
    },

    {
        coat: "tackless_horses/horse_white2.png",
        marking: "markings/horse_markings_whitefield.png"
    },

    {
        coat: "tackless_horses/horse_white2.png",
        marking: "markings/horse_markings_whitefield3.png"
    },
    

];


function checkCombination() {

    const coat =
        document.getElementById("coatSelect").value;

    const marking =
        document.getElementById("markingSelect").value;

    const message =
        document.getElementById("combinationMessage");


    // BROWN + BLACKDOTS EXCEPTION
    if (coat === "tackless_horses/horse_brown.png" && marking ==="markings/horse_markings_blackdots.png") {

        message.textContent =
            "Valid for Vanilla, invalid for Optifine.";

        return;
    }
    // BROWN + WHITEFIELD EXCEPTION
    if (coat === "tackless_horses/horse_brown.png" && marking ==="markings/horse_markings_whitefield.png") {

        message.textContent =
            "Valid for Vanilla, invalid for Optifine.";

        return;
    }


    // is combo for optifine working right
    const isInvalid = invalidCombinations.some(combination =>
        combination.coat === coat &&
        combination.marking === marking
    );


    if (isInvalid) {

        message.textContent =
            "This combination is not possible at the moment :( Sorry!";

    } else {

        message.textContent =
            "This combination is possible!";

    }

}


// Coat
document.getElementById("coatSelect")
    .addEventListener("change", checkCombination);


// Marking
document.getElementById("markingSelect")
    .addEventListener("change", checkCombination);


