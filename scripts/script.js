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

                const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

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
               });
            });
        }
