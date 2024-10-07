const imageContainer = document.querySelector('.image-container');
const image = document.getElementById('viewable-image');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const imageViewer = document.getElementById('image-viewer');

let scale = 1;
let initialScale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX, startY;

function setTransform() {
    image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function fitImageToContainer() {
    const containerAspect = imageContainer.clientWidth / imageContainer.clientHeight;
    const imageAspect = image.naturalWidth / image.naturalHeight;

    if (imageAspect > containerAspect) {
        initialScale = imageContainer.clientWidth / image.naturalWidth;
    } else {
        initialScale = imageContainer.clientHeight / image.naturalHeight;
    }

    // Set initial scale and center the image
    scale = initialScale;
    translateX = (imageContainer.clientWidth - image.naturalWidth * scale) / 2;
    translateY = (imageContainer.clientHeight - image.naturalHeight * scale) / 2;

    setTransform();
}

function limitBounds() {
    const imageWidth = image.naturalWidth * scale;
    const imageHeight = image.naturalHeight * scale;

    const minTranslateX = Math.min(0, imageContainer.clientWidth - imageWidth);
    const minTranslateY = Math.min(0, imageContainer.clientHeight - imageHeight);

    translateX = Math.max(minTranslateX, Math.min(0, translateX));
    translateY = Math.max(minTranslateY, Math.min(0, translateY));
}

function zoom(delta) {
    const oldScale = scale;
    const maxScale = imageViewer.clientWidth / image.naturalWidth; // calculate the maximum scale based on the image viewer width
    scale *= delta;
    scale = Math.min(Math.max(initialScale, scale), maxScale); // Limit zoom between initial scale and 4x

    if (scale !== oldScale) {
        const scaleChange = scale / oldScale;

        // Calculate the center of the image
        const imageCenterX = imageContainer.clientWidth / 2;
        const imageCenterY = imageContainer.clientHeight / 2;

        // Adjust the translation to keep the image centered while zooming
        translateX = imageCenterX - (imageCenterX - translateX) * scaleChange;
        translateY = imageCenterY - (imageCenterY - translateY) * scaleChange;

        limitBounds();
        setTransform();
    }
}

imageContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom(delta);
});

imageContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    imageContainer.style.cursor = 'grabbing';
});

imageContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    limitBounds();
    setTransform();
});

imageContainer.addEventListener('mouseup', () => {
    isDragging = false;
    imageContainer.style.cursor = 'grab';
});

imageContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    imageContainer.style.cursor = 'grab';
});

zoomInBtn.addEventListener('click', () => {
    zoom(1.1);
});

zoomOutBtn.addEventListener('click', () => {
    zoom(0.9);
});

image.onload = fitImageToContainer;
window.addEventListener('resize', fitImageToContainer);
window.addEventListener('load', fitImageToContainer);
