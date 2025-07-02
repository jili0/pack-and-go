"use client";

import React, { useRef, useState, useEffect } from "react";

const COLLAPSE_DELAY = 10000; // 10 seconds
const EXPAND_FADEIN_DELAY = 100; // ms - much faster transition

export default function PhotoInventoryWidget() {
  const [collapsed, setCollapsed] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const widgetRef = useRef(null);

  // Collapse after 10s only if mouse is not over widget
  const startCollapseTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCollapsed(true);
    }, COLLAPSE_DELAY);
  };
  const cancelCollapseTimer = () => {
    clearTimeout(timerRef.current);
  };

  // Handle fade-in of content after expand
  useEffect(() => {
    if (!collapsed) {
      fadeTimerRef.current = setTimeout(
        () => setShowContent(true),
        EXPAND_FADEIN_DELAY
      );
    } else {
      setShowContent(false);
      clearTimeout(fadeTimerRef.current);
    }
    return () => clearTimeout(fadeTimerRef.current);
  }, [collapsed]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(fadeTimerRef.current);
    };
  }, []);

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
      // Reset the input value so the same file can be selected again
      e.target.value = "";
    }
  };

  // Upload-Logik
  const handleFileUpload = async (file) => {
    setUploading(true);
    setError(null);
    setResult(null);
    // Pause auto-collapse timer during upload
    cancelCollapseTimer();

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
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Resume auto-collapse timer after upload
      if (!collapsed) startCollapseTimer();
    }
  };

  // Mouse events for collapse logic
  const handleMouseEnter = () => {
    cancelCollapseTimer();
    if (collapsed) setCollapsed(false);
  };
  const handleMouseLeave = () => {
    if (!collapsed && !uploading) startCollapseTimer();
  };

  // Close button
  const handleCollapse = () => {
    cancelCollapseTimer();
    setCollapsed(true);
  };

  // Click to upload
  const fileInputRef = useRef(null);
  const handleDropAreaClick = () => {
    if (!uploading && fileInputRef.current) {
      // Pause auto-collapse timer when starting file selection
      cancelCollapseTimer();
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`photo-inventory-widget${collapsed ? " collapsed" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={widgetRef}
      style={{ zIndex: 9999 }}
    >
      <div className="photo-inventory-collapsed"></div>
      {!collapsed && (
        <div
          className={`photo-inventory-content${dragActive ? " drag-active" : ""}`}
          style={{
            opacity: showContent ? 1 : 0,
            transition: "opacity 0.2s cubic-bezier(0.4,0,0.2,1)",
            pointerEvents: showContent ? "auto" : "none",
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            className="photo-inventory-close"
            onClick={handleCollapse}
            title="Minimize"
          >
            ×
          </button>
          <div className="photo-inventory-title">
            <strong>Photo Inventory</strong>
          </div>
          <div className="photo-inventory-desc">
            Make a photo of your room and we give you a list of to transported
            items instantly back!
          </div>
          <div
            className={`photo-inventory-droparea${uploading ? " uploading" : ""}`}
            onClick={handleDropAreaClick}
            style={{
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={uploading}
              ref={fileInputRef}
            />
            <div className="photo-inventory-droptext">
              {uploading
                ? "Uploading..."
                : dragActive
                  ? "Drop your photo here!"
                  : "Drag & Drop or Click to Upload"}
            </div>
          </div>
          {error && <div className="photo-inventory-error">{error}</div>}
          {result && result.items && (
            <div className="photo-inventory-result">
              <div>
                <strong>Detected items:</strong>
              </div>
              <ul>
                {result.items.map((item, i) => (
                  <li key={i}>
                    {item.name} (x{item.count})
                    {item.description ? ` – ${item.description}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
