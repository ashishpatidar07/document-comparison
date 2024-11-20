// Handle drag-and-drop functionality
function setupDropzone(dropzone, input) {
    dropzone.addEventListener("click", () => input.click()); // Trigger file selection when clicked
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault(); // Allow dropping
        dropzone.style.backgroundColor = "#f0f0f0"; // Visual feedback
    });
    dropzone.addEventListener("dragleave", () => {
        dropzone.style.backgroundColor = "white"; // Reset background when drag leaves
    });
    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.style.backgroundColor = "white";
        input.files = e.dataTransfer.files; // Set the files from the drop event
    });
}

// Set up dropzones for both PDFs
setupDropzone(document.getElementById("dropzone1"), document.getElementById("pdf1"));
setupDropzone(document.getElementById("dropzone2"), document.getElementById("pdf2"));

// Extract text from PDF using PDF.js
async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        text += strings.join(" ") + "\n"; // Combine text from all pages
    }

    return text.trim(); // Return the extracted text
}

// Compare two text strings and highlight differences
function compareTexts(text1, text2) {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    let result = "";

    const maxLength = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLength; i++) {
        const line1 = lines1[i] || "";
        const line2 = lines2[i] || "";

        if (line1 === line2) {
            result += `<span style="color: green;">${line1}</span>\n`; // Identical lines
        } else {
            if (line1 && !line2) {
                result += `<span style="color: red;">- Missing in Document 2: ${line1}</span>\n`; // Missing in Document 2
            } else if (!line1 && line2) {
                result += `<span style="color: blue;">+ Added in Document 2: ${line2}</span>\n`; // Added in Document 2
            }
        }
    }

    return result;
}

// Trigger comparison on button click
document.getElementById("compareButton").addEventListener("click", async () => {
    const pdf1 = document.getElementById("pdf1").files[0];
    const pdf2 = document.getElementById("pdf2").files[0];

    if (!pdf1 || !pdf2) {
        alert("Please select both PDF files.");
        return;
    }

    const text1 = await extractTextFromPDF(pdf1);
    const text2 = await extractTextFromPDF(pdf2);

    const result = compareTexts(text1, text2);
    document.getElementById("comparisonOutput").innerHTML = result;
});
