"use client";

import React, { useRef, useState, useEffect } from "react";

const COLLAPSE_DELAY = 10000; // 10 seconds
const EXPAND_FADEIN_DELAY = 100; // ms - much faster transition

export default function Widget() {
  const [collapsed, setCollapsed] = useState(true);
  const [slowCollapse, setSlowCollapse] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const autoExpandTimerRef = useRef(null);
  const autoCollapseTimerRef = useRef(null);
  const widgetRef = useRef(null);
  const mouseOverRef = useRef(false);

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
      clearTimeout(autoCollapseTimerRef.current);
    };
  }, []);

  // Auto-expand on mount, then collapse after 3s (unless hovered)
  useEffect(() => {
    autoExpandTimerRef.current = setTimeout(() => {
      setCollapsed(false);
      autoCollapseTimerRef.current = setTimeout(() => {
        if (!mouseOverRef.current) {
          setSlowCollapse(true);
          setCollapsed(true);
        }
      }, 3000); // 3 Sekunden
    }, 100);
    return () => {
      clearTimeout(autoExpandTimerRef.current);
      clearTimeout(autoCollapseTimerRef.current);
    };
  }, []);

  // Nach der Animation slowCollapse wieder zurücksetzen
  useEffect(() => {
    if (slowCollapse && collapsed) {
      const reset = setTimeout(() => setSlowCollapse(false), 3000);
      return () => clearTimeout(reset);
    }
  }, [slowCollapse, collapsed]);

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
    mouseOverRef.current = true;
    cancelCollapseTimer();
    if (collapsed) setCollapsed(false);
  };
  const handleMouseLeave = () => {
    mouseOverRef.current = false;
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
      className={`widget${collapsed ? " collapsed" : ""}${slowCollapse ? " slow-collapse" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={widgetRef}
      style={{
        zIndex: 9999,
        transition: slowCollapse ? "all 3s linear" : undefined,
      }}
    >
      {/* collapsed state visual indicator, falls nötig */}
      {collapsed && <div style={{ width: "100%", height: "100%" }}></div>}
      {!collapsed && (
        <div
          style={{
            opacity: showContent ? 1 : 0,
            transition: "opacity 0.2s cubic-bezier(0.4,0,0.2,1)",
            pointerEvents: showContent ? "auto" : "none",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            onClick={handleCollapse}
            title="Minimize"
            style={{
              position: "absolute",
              top: 8,
              right: 12,
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              zIndex: 10,
              padding: 4,
              minWidth: 24,
              minHeight: 24,
            }}
          >
            ×
          </button>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            Photo Inventory
          </div>
          <div style={{ marginBottom: 8 }}>
            Make a photo of your room and we give you a list of to transported
            items instantly back!
          </div>
          <div
            onClick={handleDropAreaClick}
            style={{
              border: "2px dashed #007bff",
              borderRadius: 10,
              padding: 18,
              textAlign: "center",
              background: uploading
                ? "#f8faff"
                : dragActive
                  ? "#e6f0ff"
                  : "#f8faff",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
              marginBottom: 6,
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
            <div style={{ color: "#007bff", fontWeight: 500 }}>
              {uploading
                ? "Uploading..."
                : dragActive
                  ? "Drop your photo here!"
                  : "Drag & Drop or Click to Upload"}
            </div>
          </div>
          {error && (
            <div style={{ color: "#ff6b6b", marginTop: -12 }}>{error}</div>
          )}
          {result &&
            (result.furniture?.length > 0 || result.others?.length > 0) && (
              <div
                style={{
                  background: "#f6f8fa",
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 6,
                  color: "#222",
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    paddingBottom: 6,
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>Result</span>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 4,
                      fontSize: 16,
                    }}
                  >
                    {copyFeedback ? "Copied!" : "Copy"}
                  </button>
                </div>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  {result.furniture?.map((item, idx) => (
                    <li
                      key={"furn-" + idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span style={{ color: "#667eea", fontWeight: 600 }}>
                        {item.count}
                      </span>
                    </li>
                  ))}
                  {result.others?.map((item, idx) => (
                    <li
                      key={"oth-" + idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span style={{ color: "#667eea", fontWeight: 600 }}>
                        {item.count}
                      </span>
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
