import React, { useState, useEffect, useRef } from "react";
import { FollowerProvider, FollowPortal } from "./components/FollowerSystem";
import "./App.css";

interface Target {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  quadrant: number;
  nextMoveTime: number;
}

// Predefined color palette for targets
const COLOR_PALETTE = [
  { primary: "#cde4ff", secondary: "#4a90e2" }, // Blue
  { primary: "#ffcdcd", secondary: "#e24a4a" }, // Red
  { primary: "#cdffcd", secondary: "#4ae24a" }, // Green
  { primary: "#ffcdff", secondary: "#e24ae2" }, // Purple
  { primary: "#ffe4cd", secondary: "#e2904a" }, // Orange
  { primary: "#e4cdff", secondary: "#904ae2" }, // Violet
  { primary: "#cdffe4", secondary: "#4ae290" }, // Mint
  { primary: "#ffffe4", secondary: "#e2e24a" }, // Yellow
];

const secondaryColorForId = (id: string) => {
  const targetIndex = parseInt(id) - 1;
  const colorIndex = targetIndex % COLOR_PALETTE.length;
  return COLOR_PALETTE[colorIndex].secondary;
}

// For most usecases these will be invisible, but we color it to demonstrate the follower system.
const TargetRepresentation: React.FC<{ id: string, targetRef: React.Ref<HTMLDivElement> }> = ({ id, targetRef }) => {
  return (
    <div ref={targetRef} style={{
      width: 180,
      height: 90,
      background: "transparent",
      border: `3px solid ${secondaryColorForId(id)}`,
      boxSizing: "border-box",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>Target {id}</div>
  );
}

function AppContent() {
  const [targets, setTargets] = useState<Target[]>(() => {
    const now = Date.now();
    return [
      {
        id: "1",
        primaryColor: COLOR_PALETTE[0].primary,
        secondaryColor: COLOR_PALETTE[0].secondary,
        quadrant: Math.floor(Math.random() * 4),
        nextMoveTime: now + Math.random() * 3000
      },
      {
        id: "2",
        primaryColor: COLOR_PALETTE[1].primary,
        secondaryColor: COLOR_PALETTE[1].secondary,
        quadrant: Math.floor(Math.random() * 4),
        nextMoveTime: now + Math.random() * 3000
      },
    ];
  });

  // Add a new target
  const addTarget = () => {
    const now = Date.now();
    const newId = (targets.length + 1).toString();
    const colorIndex = targets.length % COLOR_PALETTE.length;

    const newTarget: Target = {
      id: newId,
      primaryColor: COLOR_PALETTE[colorIndex].primary,
      secondaryColor: COLOR_PALETTE[colorIndex].secondary,
      quadrant: Math.floor(Math.random() * 4),
      nextMoveTime: now + Math.random() * 3000
    };

    setTargets(prev => [...prev, newTarget]);
  };

  // Remove the last target
  const removeTarget = () => {
    if (targets.length > 1) { // Keep at least one target
      setTargets(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    const checkAndMoveTargets = () => {
      const now = Date.now();
      setTargets(prevTargets =>
        prevTargets.map(target => {
          if (now >= target.nextMoveTime) {
            // Move to a different random quadrant and set new random move time
            let newQuadrant;
            do {
              newQuadrant = Math.floor(Math.random() * 4);
            } while (newQuadrant === target.quadrant);

            return {
              ...target,
              quadrant: newQuadrant,
              nextMoveTime: now + 2000 + Math.random() * 4000 // Random interval between 2-6 seconds
            };
          }
          return target;
        })
      );
    };

    // Check every 100ms for targets that need to move
    const intervalId = setInterval(checkAndMoveTargets, 100);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const [clickTarget, setClickTarget] = useState<{ x: number, y: number } | undefined>();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const handlePageClick = (event: React.MouseEvent) => {
    setClickTarget({
      x: event.clientX,
      y: event.clientY,
    });
    // Clear temp target on timeout
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      console.log("clearing clickTarget");
      setClickTarget(undefined);
    }, 1000);
  };

  const renderQuadrant = (index: number) => {
    const quadrantTargets = targets.filter(target => target.quadrant === index);

    return (
      <div
        key={index}
        className="quadrant"
        style={{
          flex: 1,
          border: "2px solid #ddd",
          position: "relative",
          minHeight: "50vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          {quadrantTargets.map(target => (
            <div key={target.id} style={{ margin: "10px 0" }}>
              <FollowPortal id={target.id} TargetComponent={TargetRepresentation} altTarget={target.id === "1" ? clickTarget : undefined}>
                {/* The below content is rendered into the follower. The TargetComponent is actually rendered here. */}
                <div
                  style={{
                    height: 90,
                    width: 180,
                    boxSizing: "border-box",
                    background: target.primaryColor,
                    opacity: 0.8,
                    borderRadius: 8,
                    padding: 12,
                    pointerEvents: "none",
                    fontWeight: "bold",
                  }}
                >Follower {target.id}</div>
              </FollowPortal>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dynamic Moving Targets Demo</h1>
        <p>
          This is a demonstration of a floating follower system in React. Content is rendered into the Follower, which is repositioned above the Target (usually invisible).
          <br/>
          If the Target is repositioned or even rendered into a different part of the DOM tree, the Follower follows it, without tearing down. Here a simple css transition is applied to the follower.
          <br />
          A novel result here is that the Follower content is described by the children of the Target, so the full context of the Target is available to the Follower. See the README for example code.
          <br />
          Additionally, you can use the `altTarget` prop to specify an arbitrary point to follow. This is useful for animations that are not triggered by the target's movement. Click to try.
        </p>

        <div className="target-controls">
          <button
            onClick={addTarget}
            className="control-button add-button"
          >
            + Add Target ({targets.length})
          </button>
          <button
            onClick={removeTarget}
            className="control-button remove-button"
            disabled={targets.length <= 1}
          >
            - Remove Target
          </button>
          <a
            href="https://github.com/kumavis/react-animated-overlay"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "#24292e",
              color: "white",
              textDecoration: "none",
              border: "1px solid #ffffff",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease-in-out",
              height: "36px",
              boxSizing: "border-box"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2f363d";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#24292e";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </header>

      <main
        className="quadrant-container"
        onClick={handlePageClick}
      >
        <div className="quadrant-row">
          {renderQuadrant(0)}
          {renderQuadrant(1)}
        </div>
        <div className="quadrant-row">
          {renderQuadrant(2)}
          {renderQuadrant(3)}
        </div>
      </main>

      <footer className="App-footer">
        <p>{targets.length} targets moving independently • Each has its own follower</p>
        <div style={{ marginTop: "10px" }}>
          {targets.map(target => {
            const timeUntilMove = Math.max(0, target.nextMoveTime - Date.now());
            const secondsUntilMove = Math.ceil(timeUntilMove / 1000);
            return (
              <span
                key={target.id}
                style={{
                  margin: "0 10px",
                  padding: "5px 10px",
                  background: target.primaryColor,
                  borderRadius: "15px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                {target.id}: Q{target.quadrant + 1} ({secondsUntilMove}s)
              </span>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <FollowerProvider>
      <AppContent />
    </FollowerProvider>
  );
}

export default App;
