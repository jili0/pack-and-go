"use client";

import React, { useRef, useState, useEffect } from "react";

const COLLAPSE_DELAY = 10000; // 10 seconds
const EXPAND_FADEIN_DELAY = 100; // ms - much faster transition

export default function PhotoInventoryWidget() {
  const [collapsed, setCollapsed] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const autoExpandTimerRef = useRef(null);
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
      clearTimeout(fadeTimerRef.current);
      clearTimeout(autoExpandTimerRef.current);
    };
  }, []);

  // Auto-expand after 0.5 seconds on page load
  useEffect(() => {
    autoExpandTimerRef.current = setTimeout(() => {
      setCollapsed(false);
    }, 500);

    return () => clearTimeout(autoExpandTimerRef.current);
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

      // Don't start collapse timer if result section is shown (even with 0 items)
      // The result section will be shown regardless of item count
    } catch (err) {
      setError("Upload failed. Please try again.");
      // Only start collapse timer on error
      if (!collapsed) startCollapseTimer();
    } finally {
      setUploading(false);
    }
  };

  // Mouse events for collapse logic
  const handleMouseEnter = () => {
    cancelCollapseTimer();
    if (collapsed) setCollapsed(false);
  };
  const handleMouseLeave = () => {
    // Don't start collapse timer if result section is shown or uploading
    if (!collapsed && !uploading && !result) startCollapseTimer();
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

  // Copy to clipboard with feedback
  const handleCopy = async () => {
    const furnitureText = result.furniture
      .map((item) => `${item.description} ${item.name} x ${item.count}`)
      .join("\n");

    const othersText = result.others
      .map((item) => `${item.description} ${item.name} x ${item.count}`)
      .join("\n");

    const text = `FURNITURE:\n${furnitureText}${result.others.length > 0 ? "\n\nOTHERS:\n" + othersText : ""}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={`photo-inventory-widget${collapsed ? " collapsed" : ""}`}
      onMouseEnter={() => {
        if (collapsed) setCollapsed(false);
      }}
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
          {result &&
            (result.furniture?.length > 0 || result.others?.length > 0) && (
              <div className="photo-inventory-result">
                <div className="photo-inventory-result-header">
                  <div>
                    <strong>Detected items:</strong>
                  </div>
                  <button
                    className="photo-inventory-copy-btn"
                    onClick={handleCopy}
                    title={copyFeedback ? "Copied!" : "Copy to clipboard"}
                  >
                    {copyFeedback ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        <span style={{ marginLeft: "4px", fontSize: "12px" }}>
                          Copied!
                        </span>
                      </>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                </div>

                {result.furniture && result.furniture.length > 0 && (
                  <div className="photo-inventory-category">
                    <div className="photo-inventory-category-title">
                      Furniture:
                    </div>
                    <ul>
                      {result.furniture.map((item, i) => (
                        <li key={i} className="photo-inventory-item">
                          <span className="photo-inventory-item-name">
                            {item.description} {item.name}
                          </span>
                          <span className="photo-inventory-item-count">
                            x {item.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.others && result.others.length > 0 && (
                  <div className="photo-inventory-category">
                    <div className="photo-inventory-category-title">
                      Others:
                    </div>
                    <ul>
                      {result.others.map((item, i) => (
                        <li key={i} className="photo-inventory-item">
                          <span className="photo-inventory-item-name">
                            {item.description} {item.name}
                          </span>
                          <span className="photo-inventory-item-count">
                            x {item.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
