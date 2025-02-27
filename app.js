import * as THREE from "three";
import { OrbitControls } from "./js/OrbitControls.js";

window.updateCuboidSize = updateCuboidSize;

// Scene and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls for interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth movement
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.update();

// Function to Create a Material
function createMaterial(color, opacity = 1.0, isTransparent = false) {
    return new THREE.MeshBasicMaterial({
        color,
        opacity,
        transparent: isTransparent
    });
}

// Predefined Materials
const materialRedTransparent = createMaterial(0xff0000, 0.15, true);
const materialBlueTransparent = createMaterial(0x0000ff, 0.15, true);
const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });

// Cuboid Dimensions (Default)
const dimensions = {
    biggerCuboid: { width: 2.35, height: 2.39, depth: 12.03 },
    insideCuboid: { width: 2.35, height: 0.5, depth: 2.0 },
    topCuboid: { width: 1.5, height: 1.0, depth: 3.0 }
};

// Function to Create a Cuboid
function createCuboid({ width, height, depth }, material, position = { x: 0, y: 0, z: 0 }, addWireframe = false) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);

    if (addWireframe) {
        const edges = new THREE.EdgesGeometry(geometry);
        const wireframe = new THREE.LineSegments(edges, wireframeMaterial);
        mesh.add(wireframe);
    }

    return mesh;
}

// Create Cuboids
let insideCuboid = createCuboid(dimensions.insideCuboid, materialRedTransparent, {
    x: dimensions.biggerCuboid.width / 2 - dimensions.insideCuboid.width / 2,
    y: -dimensions.insideCuboid.height,
    z: 0
}, true);

let topCuboid = createCuboid(dimensions.topCuboid, materialBlueTransparent, {
    x: dimensions.biggerCuboid.width / 2 - dimensions.topCuboid.width / 2 - 5,
    y: dimensions.insideCuboid.height + dimensions.topCuboid.height / 2,
    z: 0
}, true);

let bigCuboid = createCuboid(dimensions.biggerCuboid, materialBlueTransparent, { x: 0, y: 0, z: 0 }, true);

// Grouping for Rotation
const group = new THREE.Group();
group.add(insideCuboid, topCuboid, bigCuboid);
scene.add(group);

// Position Camera
camera.position.set(0, 5, 15);

// Function to Check if One Cuboid Fits Inside Another
function doesCuboidFit(inner, outer) {
    const fits = inner.width <= outer.width && inner.height <= outer.height && inner.depth <= outer.depth;
    console.log(fits ? "The inside cuboid fits inside the bigger cuboid." : "The inside cuboid does NOT fit inside the bigger cuboid.");
    return fits;
}
doesCuboidFit(dimensions.insideCuboid, dimensions.biggerCuboid);

// Function to Update Cuboid Sizes Dynamically
function updateCuboidSize() {
    const newWidth = parseFloat(document.getElementById("widthInput").value);
    const newHeight = parseFloat(document.getElementById("heightInput").value);
    const newDepth = parseFloat(document.getElementById("depthInput").value);

    if (isNaN(newWidth) || isNaN(newHeight) || isNaN(newDepth)) return;

    dimensions.insideCuboid.width = newWidth;
    dimensions.insideCuboid.height = newHeight;
    dimensions.insideCuboid.depth = newDepth;

    // Remove old inside cuboid
    group.remove(insideCuboid);
    
    // Create a new one with updated dimensions
    insideCuboid = createCuboid(dimensions.insideCuboid, materialRedTransparent, {
        x: dimensions.biggerCuboid.width / 2 - dimensions.insideCuboid.width / 2,
        y: -dimensions.insideCuboid.height,
        z: 0
    }, true);

    group.add(insideCuboid);
    doesCuboidFit(dimensions.insideCuboid, dimensions.biggerCuboid);
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
}
animate();
