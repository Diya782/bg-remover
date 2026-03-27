export async function removeBg(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://127.0.0.1:8000/remove-bg", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to remove background");
  }

  return await res.blob();
}
