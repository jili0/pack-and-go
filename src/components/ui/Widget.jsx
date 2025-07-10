"use client";

import React, { useRef, useState, useEffect } from "react";

export default function Widget() {
  const [state, setState] = useState({
    collapsed: true,
    dragActive: false,
    uploading: false,
    copyFeedback: false,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const timers = useRef({});
  const fileInputRef = useRef(null);
  const widgetRef = useRef(null);

  const updateState = (updates) =>
    setState((prev) => ({ ...prev, ...updates }));

  const clearAllTimers = () => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  };

  const setTimer = (name, callback, delay) => {
    clearTimeout(timers.current[name]);
    timers.current[name] = setTimeout(callback, delay);
  };

  const handleCollapse = () => {
    updateState({ collapsed: true });
  };

  const handleExpand = () => {
    updateState({ collapsed: false });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target) &&
        !state.collapsed
      ) {
        handleCollapse();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [state.collapsed]);

  const handleFileUpload = async (file) => {
    updateState({ uploading: true });
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
      setResult(await res.json());
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      updateState({ uploading: false });
    }
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    if (type === "over") updateState({ dragActive: true });
    if (type === "leave") updateState({ dragActive: false });
    if (type === "drop") {
      updateState({ dragActive: false });
      if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      handleFileUpload(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleMouse = (entering) => {
    if (entering && state.collapsed) handleExpand();
  };

  const handleCopy = async () => {
    const furniture =
      result.furniture
        ?.map((item) => `${item.description} ${item.name} x ${item.count}`)
        .join("\n") || "";
    const others =
      result.others
        ?.map((item) => `${item.description} ${item.name} x ${item.count}`)
        .join("\n") || "";
    const text = `FURNITURE:\n${furniture}${others ? "\n\nOTHERS:\n" + others : ""}`;

    try {
      await navigator.clipboard.writeText(text);
      updateState({ copyFeedback: true });
      setTimer(
        "copyFeedback",
        () => updateState({ copyFeedback: false }),
        2000
      );
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const openFileDialog = () => {
    if (!state.uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      ref={widgetRef}
      className={`widget${state.collapsed ? " collapsed" : ""}`}
      onMouseEnter={() => handleMouse(true)}
      onMouseLeave={() => handleMouse(false)}
    >
      <div
        className="widget-content"
        onDragOver={(e) => handleDrag(e, "over")}
        onDragLeave={(e) => handleDrag(e, "leave")}
        onDrop={(e) => handleDrag(e, "drop")}
      >
        <button
          className="widget-close btn-secondary"
          onClick={() => handleCollapse()}
        >
          ×
        </button>
        <div className="widget-header">Photo Inventory</div>
        <div>
          Make a photo of your room and we give you a list of to transported
          items instantly back!
        </div>

        <div
          className={`upload-area${state.dragActive ? " drag-active" : ""}`}
          onClick={openFileDialog}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={state.uploading}
            ref={fileInputRef}
          />
          {state.uploading
            ? "Uploading..."
            : state.dragActive
              ? "Drop your photo here!"
              : "Drag & Drop or Click to Upload"}
        </div>

        {error && <div className="error">{error}</div>}

        {result &&
          (result.furniture?.length > 0 || result.others?.length > 0) && (
            <div className="result-section">
              <div className="result-header">
                <span>Detected items:</span>
                <button className="copy-button" onClick={handleCopy}>
                  {state.copyFeedback ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
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

              {result.furniture?.length > 0 && (
                <div className="result-category">
                  <div className="category-title">FURNITURE:</div>
                  {result.furniture.map((item, idx) => (
                    <div key={idx} className="result-item">
                      <span>{item.name}</span>
                      <span>x {item.count}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.others?.length > 0 && (
                <div className="result-category">
                  <div className="category-title">OTHERS:</div>
                  {result.others.map((item, idx) => (
                    <div key={idx} className="result-item">
                      <span>{item.name}</span>
                      <span>x {item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
