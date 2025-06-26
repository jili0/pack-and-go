"use client";

const Loader = ({
  variant = "spinner",
  size = "medium",
  overlay = false,
  className = "",
  text = "",
}) => {
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "loader-small";
      case "large":
        return "loader-large";
      default:
        return "";
    }
  };

  const SpinnerLoader = () => (
    <div className={`loader-spinner ${getSizeClass()}`}></div>
  );

  const DotsLoader = () => (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <div
        style={{
          width: size === "small" ? "4px" : size === "large" ? "8px" : "6px",
          height: size === "small" ? "4px" : size === "large" ? "8px" : "6px",
          backgroundColor: "#007bff",
          borderRadius: "50%",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      ></div>
      <div
        style={{
          width: size === "small" ? "4px" : size === "large" ? "8px" : "6px",
          height: size === "small" ? "4px" : size === "large" ? "8px" : "6px",
          backgroundColor: "#007bff",
          borderRadius: "50%",
          animation: "pulse 1.5s ease-in-out infinite 0.1s",
        }}
      ></div>
      <div
        style={{
          width: size === "small" ? "4px" : size === "large" ? "8px" : "6px",
          height: size === "small" ? "4px" : size === "large" ? "8px" : "6px",
          backgroundColor: "#007bff",
          borderRadius: "50%",
          animation: "pulse 1.5s ease-in-out infinite 0.2s",
        }}
      ></div>
    </div>
  );

  const SkeletonLoader = () => (
    <div>
      <div
        style={{
          backgroundColor: "#f3f3f3",
          borderRadius: "4px",
          height: "16px",
          width: "75%",
          marginBottom: "8px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      ></div>
      <div
        style={{
          backgroundColor: "#f3f3f3",
          borderRadius: "4px",
          height: "16px",
          width: "50%",
          marginBottom: "8px",
          animation: "pulse 1.5s ease-in-out infinite 0.2s",
        }}
      ></div>
      <div
        style={{
          backgroundColor: "#f3f3f3",
          borderRadius: "4px",
          height: "16px",
          width: "85%",
          animation: "pulse 1.5s ease-in-out infinite 0.4s",
        }}
      ></div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <DotsLoader />;
      case "skeleton":
        return <SkeletonLoader />;
      case "spinner":
      default:
        return <SpinnerLoader />;
    }
  };

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      className={className}
    >
      {renderLoader()}
      {text && (
        <p
          style={{
            marginTop: "8px",
            fontSize: "14px",
            color: "#666",
            marginBottom: 0,
          }}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div
        className="loader-overlay"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loader;
