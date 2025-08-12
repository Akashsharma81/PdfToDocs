import React, { useState, useRef } from "react";
import axios from "axios";

export default function DocxPdfConverter() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setMessage("");
  };

  const upload = async () => {
    if (!file) {
      setMessage("Please choose a DOCX or PDF file first.");
      return;
    }

    const allowed = [".docx", ".pdf"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      setMessage("Only .docx or .pdf files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("uploading");
      setMessage("");
      setProgress(0);

      const response = await axios.post("http://localhost:7000/convert", formData, {
        responseType: "blob", // important: server will send converted file
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
        timeout: 5 * 60 * 1000, // 5 minutes - conversions can take time
      });

      // infer filename from content-disposition if present
      const disposition = response.headers["content-disposition"];
      let filename = "converted-file";
      if (disposition) {
        const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
        if (match) filename = decodeURIComponent(match[1] || match[2]);
      } else {
        // fallback: if uploaded docx -> pdf, change extension accordingly
        const base = file.name.replace(/\.[^.]+$/, "");
        filename = ext === ".docx" ? `${base}.pdf` : `${base}.docx`;
      }

      // create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatus("done");
      setProgress(100);
      setMessage("Conversion finished. Download should start automatically.");
    } catch (err) {
      console.error(err);
      setStatus("error");
      if (err?.response) {
        // server responded with error blob or json
        try {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const text = reader.result;
              const json = JSON.parse(text);
              setMessage(json.error || "Conversion failed");
            } catch (e) {
              setMessage("Conversion failed (server error).");
            }
          };
          if (err.response.data) reader.readAsText(err.response.data);
        } catch (e) {
          setMessage("Conversion failed (response parse error).");
        }
      } else if (err?.message) {
        setMessage(err.message);
      } else {
        setMessage("Conversion failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 ">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">PDF To DOCX Converter</h1>
        <p className="text-sm text-slate-500 mb-4">
          Drag & drop or choose a file.
         
        </p>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border-2 ${
            dragActive ? "border-blue-400 bg-blue-50" : "border-dashed border-slate-200"
          } rounded-lg p-6 text-center transition-all`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".docx,.pdf"
            onChange={onFileChange}
            className="hidden"
          />

          {!file ? (
            <div>
              <p className="text-slate-600 mb-3">Drop your .docx or .pdf file here</p>
              <button
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Choose File
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  Change
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={upload}
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
            disabled={!file || status === "uploading"}
          >
            Convert
          </button>

          <button onClick={reset} className="px-3 py-2 border rounded-md">
            Reset
          </button>

          <div className="ml-auto text-sm text-slate-500">
            Status: <span className="font-medium">{status}</span>
          </div>
        </div>

        {/* progress */}
        <div className="mt-4">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all"
            ></div>
          </div>
          <div className="mt-2 text-sm text-slate-600">{progress}%</div>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              status === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

      </div>
    </div>
  );
}
