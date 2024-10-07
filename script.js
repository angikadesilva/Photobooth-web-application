// Select the necessary DOM elements
const canvas = document.getElementById('canvas');
const video = document.getElementById('video');
const context = canvas.getContext('2d');
const tracker = new tracking.ObjectTracker('face');

// Capture Button Logic
const captureButton = document.getElementById('capture-btn');

// Timer logic
let timerInterval;
let countdownValue = 5; // Set countdown value in seconds
const timerButton = document.getElementById('timer-button');

timerButton.addEventListener('click', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerButton.innerText = '⏱️'; // Reset button text
        timerInterval = null; // Stop timer
    } else {
        timerButton.innerText = 'On'; // Change button text when timer is on
    }
});

// Capture logic
let capturedImages = [];

captureButton.addEventListener('click', () => {
    if (capturedImages.length < 2) { // Limit to 2 pictures
        startCaptureTimer(); // Start the countdown for capturing
    } else {
        saveCombinedImage(); // Save the combined image if 2 images have been captured
    }
});

function startCaptureTimer() {
    let countdownCaptureValue = 5; // Set countdown value for capture
    timerButton.innerText = 'On'; // Change button text when capturing starts
    timerButton.innerText = countdownCaptureValue; // Display initial countdown value

    const countdownCaptureInterval = setInterval(() => {
        countdownCaptureValue--;
        timerButton.innerText = countdownCaptureValue; // Update button text with countdown value

        if (countdownCaptureValue <= 0) {
            clearInterval(countdownCaptureInterval);
            capturePhoto(); // Capture the photo when countdown finishes
        }
    }, 1000);
}

function capturePhoto() {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = canvas.width;
    captureCanvas.height = canvas.height;
    const captureContext = captureCanvas.getContext('2d');

    // Draw the video frame to the canvas
    captureContext.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw the filter (canvas overlay) on top of the video frame
    captureContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);

    // Convert canvas content to data URL for storage
    const dataURL = captureCanvas.toDataURL('image/png');
    capturedImages.push(dataURL); // Store the captured image

    // Reset countdown and button state
    countdownValue = 5; // Reset to original countdown
    timerButton.innerText = '⏱️'; // Reset button text
    clearInterval(timerInterval); // Clear any running timers
    timerInterval = null; // Stop timer

    if (capturedImages.length === 2) { // Change to 2 images
        saveCombinedImage(); // Save combined image after 2 captures
    }
}

function saveCombinedImage() {
    const frameCanvas = document.createElement('canvas');
    const frameContext = frameCanvas.getContext('2d');

    // Set frame dimensions (height for 2 images stacked vertically)
    const frameWidth = canvas.width; // Use original canvas width
    const frameHeight = canvas.height * 2; // Stack two images vertically
    frameCanvas.width = frameWidth;
    frameCanvas.height = frameHeight;

    // Flip the canvas horizontally before drawing images
    frameContext.translate(frameWidth, 0); // Move the canvas context to the right side
    frameContext.scale(-1, 1); // Flip horizontally by scaling negatively on the x-axis

    // Draw the captured images onto the frame
    capturedImages.forEach((imageData, index) => {
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
            frameContext.drawImage(img, 0, index * canvas.height, canvas.width, canvas.height);
            
            // If this is the last image, save the frame
            if (index === capturedImages.length - 1) {
                const combinedDataURL = frameCanvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = combinedDataURL;
                downloadLink.download = 'combined-photo.png';
                downloadLink.click();

                // Clear the captured images for the next round
                capturedImages = [];
            }
        };
    });

    // Reset button state
    timerButton.innerText = '⏱️'; // Reset button text
    clearInterval(timerInterval); // Clear any running timers
    timerInterval = null; // Stop timer
}

// Initialize filter image
const img = new Image();
let filterX = 0;
let filterY = 0;
let filterWidth = 0;
let filterHeight = 0;

let faceHistory = [];
const historyLength = 5; // Number of frames to average for smoother tracking

// Adjust filter placement based on canvas size
function changePic(x, y, width, height, src) {
    img.src = src;

    // Scaling factors based on the canvas size
    const scaleX = canvas.width / 700; // Scale relative to original width (700px)
    const scaleY = canvas.height / 525; // Scale relative to original height (525px)

    // Apply the scaling to the filter position and size
    filterX = x * scaleX;
    filterY = y * scaleY;
    filterWidth = width * scaleX;
    filterHeight = height * scaleY;

    console.log(`Changed to: ${src}, x: ${filterX}, y: ${filterY}, width: ${filterWidth}, height: ${filterHeight}`);
}

// Default filter on load
function flowerCrown() {
    changePic(0, -0.5, 1, 1, 'flower-crown.png');
}

flowerCrown(); // Default filter on load

// Event Listeners for Filter Buttons
document.getElementById('flower-crown').addEventListener('click', flowerCrown);
document.getElementById('bunny-ears').addEventListener('click', () => {
    changePic(-0.5, -0.9, 2, 2, 'bunny-ears.png');
});
document.getElementById('face').addEventListener('click', () => {
    changePic(-0.5, -0.9, 2, 2, 'face.png');
});
document.getElementById('harrypotter').addEventListener('click', () => {
    changePic(-0.5, -0.2, 2, 1.1, 'harrypotter.png');
});
document.getElementById('spiderman').addEventListener('click', () => {
    changePic(-0.75, -0.3, 2.5, 1.7, 'spiderman.png');
});
document.getElementById('ironman').addEventListener('click', () => {
    changePic(-0.75, -0.3, 2.6, 1.6, 'ironman.png');
});
document.getElementById('pirate').addEventListener('click', () => {
    changePic(-1.35, -1.3, 3.8, 2.4, 'pirate.png');
});
document.getElementById('dog').addEventListener('click', () => {
    changePic(-0.25, -0.7, 1.5, 2, 'dog.png');
});
document.getElementById('hearts').addEventListener('click', () => {
    changePic(0, -0.6, 1.0, 1.0, 'hearts.png');
});
document.getElementById('dogfilter').addEventListener('click', () => {
    changePic(-0.05, -0.5, 1, 1.2, 'dogfilter.png');
});
document.getElementById('capture-no-filter').addEventListener('click', () => {
    changePic(0,0,0,0, '');
});

// Smoothing function to make face tracking smoother over multiple frames
function smoothFaceData(rect) {
    faceHistory.push(rect);
    if (faceHistory.length > historyLength) {
        faceHistory.shift(); // Remove oldest entry if history exceeds desired length
    }

    let avgX = 0;
    let avgY = 0;
    let avgWidth = 0;
    let avgHeight = 0;

    faceHistory.forEach(face => {
        avgX += face.x;
        avgY += face.y;
        avgWidth += face.width;
        avgHeight += face.height;
    });

    avgX /= faceHistory.length;
    avgY /= faceHistory.length;
    avgWidth /= faceHistory.length;
    avgHeight /= faceHistory.length;

    return { x: avgX, y: avgY, width: avgWidth, height: avgHeight };
}

// Set up face tracker settings
tracker.setInitialScale(4);
tracker.setStepSize(2);
tracker.setEdgesDensity(0.1);
tracking.track('#video', tracker, { camera: true }); // Tracking for webcam

// Add frame event for face tracking and drawing on canvas
tracker.on('track', event => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    event.data.forEach(rect => {
        const { x, y, width, height } = smoothFaceData(rect);

        context.strokeStyle = '#e6c919';
        context.strokeRect(x, y, width, height);

        // Draw the filter image on top of the face tracking rectangle
        context.drawImage(img, x + filterX * width, y + filterY * height, filterWidth * width, filterHeight * height);
    });
});
