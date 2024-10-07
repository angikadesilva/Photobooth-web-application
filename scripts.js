const canvas = document.getElementById('outer-canvas');
const ctx = canvas.getContext('2d');
const imgElement = new Image();
let imgLoaded = false;

// Load the frame background image (FRAME1.png)
const frameImage = new Image();
frameImage.src = 'Frame1.png';

frameImage.onload = function() {
    canvas.width = frameImage.width;   // Set canvas width to the frame image width
    canvas.height = frameImage.height; // Set canvas height to the frame image height
    drawCanvas(); // Draw frame when loaded
};

// Handle image browsing
document.getElementById('browse-btn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // Accept only images

    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = readerEvent => {
            imgElement.src = readerEvent.target.result; // Set image source
            imgElement.onload = () => {
                imgLoaded = true;
                drawCanvas(); // Draw the image on canvas when loaded
            };
        };
        
        reader.readAsDataURL(file); // Read file as data URL
    };

    input.click(); // Trigger file input click
});

// Handle image deletion
document.getElementById('delete-btn').addEventListener('click', function() {
    imgElement.src = ''; // Clear image source
    imgLoaded = false; // Reset loaded flag
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    drawCanvas(); // Redraw frame
});

// Draw image and frame
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    if (imgLoaded) {
        const innerRectWidth = 12.2 * 37.7953; // 10.4 cm in pixels
        const innerRectHeight = 14.6 * 37.7953; // 12.1 cm in pixels

        const scaleX = innerRectWidth / imgElement.width;   // Scale for width
        const scaleY = innerRectHeight / imgElement.height; // Scale for height
        const scale = Math.min(scaleX, scaleY);             // Use the smaller scale

        const imgWidth = imgElement.width * scale;
        const imgHeight = imgElement.height * scale;

        const imgX = (canvas.width - imgWidth) / 2; // Centered horizontally
        const upwardAdjustment = 1 * 37.7953; // Adjust this value for upward movement
        const imgY = (canvas.height - imgHeight) / 2 - upwardAdjustment; // Centered vertically, moved up

        ctx.drawImage(imgElement, imgX, imgY, imgWidth, imgHeight);
    }

    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}

// Handle download
document.getElementById('download-btn').addEventListener('click', function() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'photo_frame.png'; // Name of the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Handle mail button
document.getElementById('mail-btn').addEventListener('click', function() {
    window.open("https://mail.google.com/mail/u/0/#inbox?compose=DmwnWrRlQqRvSBcnNtCVMFVwZqBlvCfJlzRtJjbFvQzgxMXzxMNvkwNRbdZCKnwbccNDbsszQlwl", "_blank");
});
