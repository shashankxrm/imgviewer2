const imageContainer = document.querySelector('.image-container');
const image = document.getElementById('viewable-image');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');

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

    // Reset scale and translation to initial values
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

function zoom(delta, centerX, centerY) {
    const oldScale = scale;
    scale *= delta;
    scale = Math.min(Math.max(initialScale, scale), 4); // Limit zoom between initial scale and 4x

    if (scale !== oldScale) {
        const scaleChange = scale / oldScale;

        // Adjust the translation to zoom towards the cursor position
        translateX = centerX - (centerX - translateX) * scaleChange;
        translateY = centerY - (centerY - translateY) * scaleChange;

        limitBounds();
        setTransform();
    }
}

imageContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = imageContainer.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom(delta, centerX, centerY);
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
    const centerX = imageContainer.clientWidth / 2;
    const centerY = imageContainer.clientHeight / 2;
    zoom(1.1, centerX, centerY);
});

zoomOutBtn.addEventListener('click', () => {
    const centerX = imageContainer.clientWidth / 2;
    const centerY = imageContainer.clientHeight / 2;
    zoom(0.9, centerX, centerY);
});

image.onload = fitImageToContainer;
window.addEventListener('resize', fitImageToContainer);

// Ensure the image is rendered in its initial state on page load
window.addEventListener('load', fitImageToContainer);