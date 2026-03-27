document.addEventListener("DOMContentLoaded", () => {
    const uploadBox = document.getElementById("uploadBox");
    const fileInput = document.getElementById("fileInput");

    uploadBox.addEventListener("click", () => fileInput.click());

    // SHOW ORIGINAL IMAGE
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            const url = URL.createObjectURL(file);

            document.getElementById("originalImg").src = url;
            document.getElementById("imageContainer").classList.remove("hidden");
        }
    });
});

async function uploadImage() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Upload image first");
        return;
    }

    document.getElementById("loader").classList.remove("hidden");

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("http://127.0.0.1:8000/remove-bg", {
            method: "POST",
            body: formData
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        // SHOW RESULT IMAGE
        document.getElementById("resultImage").src = url;

        // SHOW DOWNLOAD
        const downloadBtn = document.getElementById("downloadBtn");
        downloadBtn.href = url;
        downloadBtn.classList.remove("hidden");

    } catch (e) {
        alert("Error processing image");
    }

    document.getElementById("loader").classList.add("hidden");
}