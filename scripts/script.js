const upload = document.getElementById('image-upload');
let image;
let container;
let hatImage;

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(process_image);

async function process_image() {
    container = document.getElementById('hat-image-container');
    container.style.position = 'relative';

    // Load hat image
    hatImage = new Image();
    hatImage.src = 'assets/bearcathat.png'; // Path to your hat image

    upload.addEventListener('change', async () => {
        if (image) image.remove();

        image = await faceapi.bufferToImage(upload.files[0]);
        container.innerHTML = ''; // Clear container before appending new elements
        container.appendChild(image);

        // Calculate width relative to the container's width
        const containerWidth = container.clientWidth;
        image.style.width = '100%'; // Set image width to 100% of container width
        image.id = 'img-hat';

        const grayscaleImage = await convertToGrayscale(image);

        const detections = await faceapi.detectAllFaces(grayscaleImage).withFaceLandmarks().withFaceDescriptors();

        detections.forEach(detection => {
            const box = detection.detection.box;
            const faceBox = document.createElement('div');
            // Overlay hat image on each face
            const hatWidth = box.width * 1.5; // Adjust hat size as needed
            const hatHeight = hatWidth * (hatImage.height / hatImage.width);
            const hatTop = box.y - hatHeight / 2; // Position the hat above the face
            const hatLeft = box.x + box.width / 2 - hatWidth / 2; // Center the hat horizontally

            const hatOverlay = document.createElement('img');
            hatOverlay.src = 'assets/bearcathat.png'; // Path to your hat image
            hatOverlay.style.position = 'absolute';
            hatOverlay.style.top = `${hatTop}px`;
            hatOverlay.id = 'hatoverlay-img';
            hatOverlay.style.left = `${hatLeft}px`;
            hatOverlay.style.width = `${hatWidth}px`;
            hatOverlay.style.height = `${hatHeight}px`;
            container.appendChild(hatOverlay);
        });

        // Adjust image size whenever window size changes
        window.addEventListener('resize', () => {
            const rect = image.getBoundingClientRect();
            image.style.width = `${rect.width}px`;
            document.getElementById('hatoverlay-img').remove();
            document.getElementById('img-hat').remove();
        });
    });
}

// Function to convert image to grayscale
function convertToGrayscale(image) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }

        ctx.putImageData(imageData, 0, 0);
        const grayscaleImage = new Image();
        grayscaleImage.src = canvas.toDataURL();
        grayscaleImage.onload = () => resolve(grayscaleImage);
    });
}
