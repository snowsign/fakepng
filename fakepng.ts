const HORIZONTAL_SQUARE_COUNT = 59;

const uploadButton = document.getElementById('upload') as HTMLButtonElement;
const filePicker = document.getElementById('file-picker') as HTMLInputElement;
const mainContainer = document.getElementById(
    'main-container'
) as HTMLDivElement;

uploadButton.addEventListener('click', () => {
    filePicker.click();
});

filePicker.addEventListener('change', () => {
    if (filePicker.files.length < 1) return;
    handleFile(filePicker.files[0]);
});

let lastDragTarget: EventTarget;

mainContainer.addEventListener('dragenter', (e) => {
    e.preventDefault();
    lastDragTarget = e.target;
    mainContainer.classList.add('droppable');
    uploadButton.classList.add('droppable');
});

mainContainer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (e.target == lastDragTarget) {
        mainContainer.classList.remove('droppable');
        uploadButton.classList.remove('droppable');
    }
});

mainContainer.addEventListener('dragover', (e) => {
    e.preventDefault(); // This API fucking sucks
    e.dataTransfer.dropEffect = 'copy'; // This API fucking SUCKS
});

mainContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    mainContainer.classList.remove('droppable');
    uploadButton.classList.remove('droppable');
    if (e.dataTransfer.items.length < 1) return;
    let item = e.dataTransfer.items[0];
    if (item.kind == 'file') {
        handleFile(item.getAsFile());
    }
});

function handleFile(file: File) {
    console.log(file.name);
    const pngName =
        file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    window
        .createImageBitmap(file)
        .then((image) => {
            genFakePNG(image, pngName);
        })
        .catch((err) => {
            if (
                err instanceof DOMException &&
                err.name == 'InvalidStateError'
            ) {
                alert(
                    `Unsupported file format${
                        file.type != '' ? `: ${file.type}` : ''
                    }`
                );
            } else {
                alert(err);
            }
        });
}

function genFakePNG(image: ImageBitmap, filename: string) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    drawCheckerboard(ctx);
    ctx.drawImage(image, 0, 0);

    // Download as png
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
}

function drawCheckerboard(ctx: CanvasRenderingContext2D) {
    const squareSize = Math.floor(ctx.canvas.width / HORIZONTAL_SQUARE_COUNT);
    for (let i = 0; ; i++) {
        for (let j = 0; j < HORIZONTAL_SQUARE_COUNT; j++) {
            ctx.fillStyle = (i + j) & 1 ? '#cccccc' : '#ffffff';
            ctx.fillRect(
                j * squareSize,
                i * squareSize,
                squareSize,
                squareSize
            );
        }
        if (i * squareSize > ctx.canvas.height) break;
    }
}
