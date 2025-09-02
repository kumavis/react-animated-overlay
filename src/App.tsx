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

const MyFollower: React.FC<{ id: string, primaryColor: string }> = ({ id, primaryColor }) => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [counter]);

  return (
    <div
      style={{
        height: 90,
        width: 180,
        boxSizing: "border-box",
        background: primaryColor,
        opacity: 0.8,
        borderRadius: 8,
        padding: 12,
        pointerEvents: "none",
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div style={{ fontWeight: "bold" }}>Follower {id}</div>
        <div style={{ alignSelf: "flex-end" }}>Internal State: {counter}</div>
      </div>
    </div>
  );
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
  const [useInertial, setUseInertial] = useState(false);
  const [springConfig, setSpringConfig] = useState({ stiffness: 75, damping: 15, mass: 1 });
  const [reshufflingEnabled, setReshufflingEnabled] = useState(true);

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
      if (!reshufflingEnabled) return; // Skip if reshuffling is disabled

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
  }, [reshufflingEnabled]);

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
    }, 3000);
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
        }}
      >
        <div style={{ textAlign: "center" }}>
          {quadrantTargets.map(target => (
            <div key={target.id} style={{ margin: "10px 0" }}>
              <FollowPortal id={target.id} TargetComponent={TargetRepresentation} altTarget={target.id === "1" ? clickTarget : undefined} useInertial={useInertial} springConfig={springConfig}>
                {/* The below content is rendered into the follower. The TargetComponent is actually rendered here. */}
                <MyFollower id={target.id} primaryColor={target.primaryColor} />
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
        <h1>Floating UI Demo</h1>

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6',
          color: '#ffffff'
        }}>
          <p style={{ marginBottom: '16px' }}>
            This is a demonstration of a <strong>floating follower system</strong> in React. Content is rendered into the Follower, which is repositioned above the Target (usually invisible).
          </p>

          <details>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '600',
              color: '#ffffff',
              fontSize: '16px',
              marginBottom: '12px'
            }}>
              Read more
            </summary>

            <div style={{
              color: '#ffffff',
              marginTop: '16px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <p style={{ marginBottom: '16px' }}>
                If the Target is repositioned or even rendered into a different part of the DOM tree, the Follower follows it seamlessly, without tearing down or recreating components.
              </p>

              <p style={{ marginBottom: '16px' }}>
                <strong>Key Innovation:</strong> The Follower content is defined where you want it to appear, so it has the relevant local context, despite being rendered into an overlay layer.
              </p>

              <p style={{ marginBottom: '16px' }}>
                You may also want to position the Follower at an arbitrary position on the screen. Use the <code style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>altTarget</code> prop to specify an arbitrary point to follow. This is useful for animations that are not triggered by the target's movement. <em>Try clicking anywhere on the page to see it in action!</em>
              </p>

              <p style={{ marginBottom: '0' }}>
                <strong>Animation Options:</strong> By default, a simple CSS transition is applied to the follower. Toggle the <strong>Inertial</strong> button above to see smooth spring-based animations with configurable physics parameters.
              </p>
            </div>
          </details>
        </div>

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
          <button
            onClick={() => setUseInertial(!useInertial)}
            className={`control-button ${useInertial ? 'inertial-active' : 'inertial-inactive'}`}
          >
            {useInertial ? '🚀 Inertial ON' : '⚡ Inertial OFF'}
          </button>

          <button
            onClick={() => setReshufflingEnabled(!reshufflingEnabled)}
            className={`control-button ${reshufflingEnabled ? 'reshuffle-active' : 'reshuffle-inactive'}`}
          >
            {reshufflingEnabled ? '🔄 Reshuffle ON' : '⏸️ Reshuffle OFF'}
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

        {useInertial && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ color: '#333', marginBottom: '8px', fontWeight: '500' }}>Stiffness</label>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={springConfig.stiffness}
                  onChange={(e) => setSpringConfig({ ...springConfig, stiffness: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <span style={{ marginTop: '5px', color: '#333', fontWeight: '500' }}>{springConfig.stiffness}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ color: '#333', marginBottom: '8px', fontWeight: '500' }}>Damping</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={springConfig.damping}
                  onChange={(e) => setSpringConfig({ ...springConfig, damping: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <span style={{ marginTop: '5px', color: '#333', fontWeight: '500' }}>{springConfig.damping}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ color: '#333', marginBottom: '8px', fontWeight: '500' }}>Mass</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={springConfig.mass}
                  onChange={(e) => setSpringConfig({ ...springConfig, mass: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <span style={{ marginTop: '5px', color: '#333', fontWeight: '500' }}>{springConfig.mass}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="demo-content">
        <div
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
        </div>
      </main>

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
