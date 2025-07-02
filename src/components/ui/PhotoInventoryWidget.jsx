"use client";

import React, { useRef, useState, useEffect } from "react";

const COLLAPSE_DELAY = 3000;

export default function PhotoInventoryWidget() {
  const [collapsed, setCollapsed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  // Auto-collapse nach 3 Sekunden
  useEffect(() => {
    timerRef.current = setTimeout(() => setCollapsed(true), COLLAPSE_DELAY);
    return () => clearTimeout(timerRef.current);
  }, []);

  // Expand bei Hover/Klick
  const handleExpand = () => setCollapsed(false);
  const handleCollapse = () => setCollapsed(true);

  // Drag-and-drop Events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  // Upload-Logik
  const handleFileUpload = async (file) => {
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/photo-inventory", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Upload fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`photo-inventory-widget${collapsed ? " collapsed" : ""}`}
      onMouseEnter={handleExpand}
      onMouseLeave={handleCollapse}
      style={{ zIndex: 9999 }}
    >
      {collapsed ? (
        <div className="photo-inventory-collapsed" onClick={handleExpand}>
          <span role="img" aria-label="camera">
            📷
          </span>
        </div>
      ) : (
        <div
          className={`photo-inventory-content${dragActive ? " drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            className="photo-inventory-close"
            onClick={handleCollapse}
            title="Minimieren"
          >
            ×
          </button>
          <div className="photo-inventory-title">
            <strong>Foto-Inventar</strong>
          </div>
          <div className="photo-inventory-desc">
            Make a photo of your room and we give you a list of to transported
            items instantly back!
          </div>
          <label className="photo-inventory-droparea">
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <div className="photo-inventory-droptext">
              {uploading
                ? "Uploading..."
                : dragActive
                  ? "Drop your photo here!"
                  : "Drag & Drop or Click to Upload"}
            </div>
          </label>
          {error && <div className="photo-inventory-error">{error}</div>}
          {result && (
            <div className="photo-inventory-result">
              <div>
                <strong>Detected items:</strong>
              </div>
              <ul>
                {result.items?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              {result.materials && (
                <div>
                  <strong>Material estimation:</strong> {result.materials}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
