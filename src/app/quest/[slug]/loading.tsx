export default function QuestLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d0f0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        fontFamily: "var(--font-sixtyfour), cursive",
      }}
    >
      {/* Pixel slime bouncing */}
      <div style={{ position: "relative", width: "48px", height: "48px" }}>
        <div className="pixel-slime-container">
          <div className="pixel-slime" />
        </div>
      </div>

      {/* Loading text */}
      <div
        style={{
          fontSize: "0.75rem",
          color: "#4ade80",
          letterSpacing: "3px",
          textShadow: "2px 2px 0px #000",
          animation: "loadingPulse 1.2s ease-in-out infinite",
        }}
      >
        LOADING QUEST DATA...
      </div>

      {/* Pixel progress bar */}
      <div
        style={{
          width: "200px",
          height: "12px",
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "2px solid rgba(74,222,128,0.3)",
          boxShadow: "2px 2px 0px #000",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "#4ade80",
            animation: "loadingBar 1.5s ease-in-out infinite",
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)",
          }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loadingPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes loadingBar {
          0% { width: 0%; }
          60% { width: 85%; }
          100% { width: 100%; }
        }
      ` }} />
    </div>
  );
}
