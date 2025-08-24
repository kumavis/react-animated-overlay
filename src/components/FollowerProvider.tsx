import React, { createContext, useContext, useMemo, useCallback, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFloating, autoUpdate, size, offset } from "@floating-ui/react";

// Context that lets any Target register itself as a reference
type SetRef = (id: string, el: HTMLElement | null) => void;
const FollowerCtx = createContext<SetRef | null>(null);

interface FollowerProviderProps {
  children: React.ReactNode;
  followerColor?: string | ((targetId: string) => string);
}

// Individual Follower component that manages its own floating instance
const Follower = function Follower({ id, getFollowerColor, getTargetElement }: {
  id: string;
  getFollowerColor: (targetId: string) => string;
  getTargetElement: (id: string) => HTMLElement | undefined;
}) {
  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(({ rects }) => ({ mainAxis: -rects.reference.height })),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            height: `${rects.reference.height}px`,
          });
        },
      }),
    ],
  });

  // Get the current target element and update the reference
  useEffect(() => {
    const targetElement = getTargetElement(id);
    if (targetElement) {
      refs.setReference(targetElement);
    }
  }, [refs, id, getTargetElement]);

  const followerColor = getFollowerColor(id);

  return (
    <div
      ref={refs.setFloating}
      className="follower"
      style={{
        ...floatingStyles,
        pointerEvents: "none",
        background: followerColor,
        borderRadius: 12,
        boxSizing: "border-box",
        transition: "all 0.3s ease-in-out",
        opacity: 0.8,
      }}
    />
  );
};

export function FollowerProvider({ children, followerColor = "#e11" }: FollowerProviderProps) {
  const [targetElements, setTargetElements] = useState<Map<string, HTMLElement>>(new Map());

  // Expose a setter that any target can call when it mounts/moves
  const setReference = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      setTargetElements(prev => new Map(prev).set(id, el));
    } else {
      setTargetElements(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  }, []);

  // Create a function to get follower color
  const getFollowerColor = useCallback((targetId: string) => {
    if (typeof followerColor === 'function') {
      return followerColor(targetId);
    }
    return followerColor;
  }, [followerColor]);

  // Function to get target element by ID
  const getTargetElement = useCallback((id: string) => {
    return targetElements.get(id);
  }, [targetElements]);

  return (
    <FollowerCtx.Provider value={setReference}>
      {children}
      {createPortal(
        <>
          {Array.from(targetElements.keys()).map(targetId => (
            <Follower
              key={`follower-${targetId}`}
              id={targetId}
              getFollowerColor={getFollowerColor}
              getTargetElement={getTargetElement}
            />
          ))}
        </>,
        document.body
      )}
    </FollowerCtx.Provider>
  );
}

// Hook for the moving Target component(s)
export function useFollowerTargetRef<T extends HTMLElement>(id: string) {
  const setReference = useContext(FollowerCtx);
  if (!setReference) throw new Error("Wrap your app with <FollowerProvider/>");

  // A callback ref that always re-points the follower to the latest DOM node
  const last = useRef<T | null>(null);
  return useCallback((node: T | null) => {
    last.current = node;
    setReference(id, node);
  }, [setReference, id]);
}
