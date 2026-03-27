import { useState, useRef } from "react";
import { removeBg } from "./api";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleRemove = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const blob = await removeBg(file);
      setResult(URL.createObjectURL(blob));
    } catch {
      alert("Failed to remove background");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center px-4">
        <div className="w-full max-w-5xl">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              AI Background Remover
            </h1>
            <p className="text-gray-400 mt-2">
              Clean • Fast • Professional
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

            {/* Upload */}
            <div
              onClick={() => inputRef.current.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center cursor-pointer
                         hover:border-cyan-400 hover:bg-cyan-400/5 transition"
            >
              <p className="text-gray-300 text-lg">
                Click to upload an image
              </p>
              <p className="text-gray-500 text-sm mt-1">
                PNG, JPG, WEBP supported
              </p>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                hidden
              />
            </div>

            {/* Preview Section */}
            <div className="grid md:grid-cols-2 gap-8 mt-10">

              {/* Original */}
              <div>
                <p className="mb-3 font-semibold text-gray-300">Original</p>
                <div className="h-64 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img src={preview} className="max-h-full object-contain" />
                  ) : (
                    <span className="text-gray-500">No image</span>
                  )}
                </div>
              </div>

              {/* Result */}
              <div>
                <p className="mb-3 font-semibold text-gray-300">Result</p>
                <div className="h-64 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                  {result ? (
                    <img
                      src={result}
                      onClick={() => setFullscreen(true)}
                      className="max-h-full object-contain cursor-pointer hover:scale-105 transition"
                    />
                  ) : (
                    <span className="text-gray-500">No result</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 mt-10">
              <button
                onClick={handleRemove}
                disabled={!file || loading}
                className="flex-1 py-4 rounded-xl font-semibold text-white
                           bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500
                           hover:opacity-90 transition disabled:opacity-40"
              >
                {loading ? "Processing..." : "Remove Background"}
              </button>

              {result && (
                <a
                  href={result}
                  download="background-removed.png"
                  className="flex-1 py-4 rounded-xl text-center font-semibold text-white
                             bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 transition"
                >
                  Download Image
                </a>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            © {new Date().getFullYear()} AI Background Remover
          </p>
        </div>
      </div>

      {/* FULLSCREEN PREVIEW */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={result}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
          />

          <button
            className="absolute top-6 right-6 text-white text-3xl font-bold"
            onClick={() => setFullscreen(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
