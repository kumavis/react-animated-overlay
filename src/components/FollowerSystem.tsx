import React, { createContext, useContext, useCallback, useRef, useState, useEffect, ReactElement, ReactNode, Ref } from "react";
import { createPortal } from "react-dom";
import { useFloating, autoUpdate, size, offset } from "@floating-ui/react";


// Context that lets any Target register itself as a reference
type SetRef = (id: string, el: HTMLElement | null, followerContent: ReactNode) => void;
const FollowerCtx = createContext<SetRef | null>(null);

interface FollowTargetProps {
  id: string;
  renderTarget: (id: string, ref: Ref<HTMLDivElement>) => ReactElement | null;
  children: ReactNode;
}

export function FollowTarget({ id, renderTarget, children }: FollowTargetProps) {
  // Each target registers itself with the follower system
  const followerRef = useFollowerTargetRef<HTMLDivElement>(id, children);
  return renderTarget(id, followerRef);
}

interface FollowerProviderProps {
  children: ReactNode;
  followerColor?: string | ((targetId: string) => string);
}

// Individual Follower component that manages its own floating instance
const Follower = ({ id, getFollowEntry }: {
  id: string;
  getFollowEntry: (id: string) => FollowerEntry | undefined;
}) => {
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
    const { el: targetElement } = getFollowEntry(id) || {};
    if (targetElement) {
      refs.setReference(targetElement);
    }
  }, [refs, id, getFollowEntry]);

  const { followerContent } = getFollowEntry(id) || {};

  return (
    <div
      key={id}
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {followerContent}
    </div>
  )
};

type FollowerEntry = {
  el: HTMLElement | null;
  followerContent: ReactNode;
}

export function FollowerProvider({ children }: FollowerProviderProps) {
  const [targetElements, setTargetElements] = useState<Map<string, FollowerEntry>>(new Map());

  // Expose a setter that any target can call when it mounts/moves
  const setReference = useCallback((id: string, el: HTMLElement | null, followerContent: ReactNode) => {
    if (el) {
      setTargetElements(prev => new Map(prev).set(id, { el, followerContent }));
    } else {
      setTargetElements(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  }, []);

  // Function to get target element by ID
  const getFollowEntry = useCallback((id: string) => {
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
              getFollowEntry={getFollowEntry}
            />
          ))}
        </>,
        document.body
      )}
    </FollowerCtx.Provider>
  );
}

// Hook for the moving Target component(s)
export function useFollowerTargetRef<T extends HTMLElement>(
  id: string,
  followerContent: React.ReactNode
) {
  const setReference = useContext(FollowerCtx);
  if (!setReference) throw new Error("Wrap your app with <FollowerProvider/>");

  // A callback ref that always re-points the follower to the latest DOM node
  const last = useRef<T | null>(null);
  return useCallback((node: T | null) => {
    last.current = node;
    setReference(id, node, followerContent);
  }, [setReference, id, followerContent]);
}
