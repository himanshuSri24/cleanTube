import "./App.css";

function App() {
  const handleUnsubscribe = () => {
    chrome.runtime.sendMessage({ action: "CLEANTUBE_OPEN_SUBSCRIPTIONS_PAGE" });
  };

  return (
    <div className="outerContainer">
      <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#ff0000" }}>
        CleanTube
      </h2>
      <p style={{ color: "#555", fontSize: "14px", marginTop: "5px" }}>
        Unsubscribe from all channels instantly
      </p>

      <button
        onClick={handleUnsubscribe}
        className="unsubscribeButton"
        onMouseOver={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#cc0000")
        }
        onMouseOut={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "#ff4444")
        }
      >
        Unsubscribe All
      </button>
    </div>
  );
}

export default App;
