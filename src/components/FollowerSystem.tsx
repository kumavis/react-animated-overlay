import React, { createContext, useContext, useCallback, useRef, useState, useEffect, ReactNode, Ref, useMemo } from "react";
import { createPortal } from "react-dom";
import { useFloating, autoUpdate, offset, useTransitionStatus } from "@floating-ui/react";

type FollowTarget = HTMLElement | null;
type AltTarget = { x: number, y: number };
type FollowerContent = ReactNode | null;

// Context that lets any Target register itself as a reference
type SetRef = (id: string, el: HTMLElement | null) => void;
type FollowerCtxType = {
  setTargetReference: SetRef;
  getFollowEntry: (id: string) => FollowTarget | undefined;
  setFollowerContent: (id: string, content: ReactNode | null) => void;
  getFollowerContent: (id: string) => ReactNode | null;
  setAltTarget: (id: string, altTarget: AltTarget | undefined) => void;
  getAltTarget: (id: string) => AltTarget | undefined;
}

const FollowerCtx = createContext<FollowerCtxType | null>(null);

interface FollowerProps {
  id: string;
  getFollowTargetElement: (id: string) => FollowTarget | undefined;
  altTarget?: AltTarget;
  children: ReactNode;
}
// Internal Follower component that follows a target element (or alternate target)
const Follower = ({ id, getFollowTargetElement, altTarget, children }: FollowerProps) => {
  const isInitiallyPositioned = useRef(false);
  const followEntry = getFollowTargetElement(id);
  const shouldBeVisible = !!followEntry;
  const shouldAnimate = shouldBeVisible && isInitiallyPositioned.current;

  // Configure floating-ui system
  const { refs, floatingStyles, context, elements } = useFloating({
    open: shouldBeVisible,
    strategy: "fixed",
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      // Adjust position
      offset(({ rects }) => ({ mainAxis: -rects.reference.height })),
    ],
  });
  const { status } = useTransitionStatus(context);
  const isOpen = status === "open";

  // After the first open, mark as initially positioned
  useEffect(() => {
    if (isInitiallyPositioned.current) return;
    if (isOpen) {
      isInitiallyPositioned.current = true;
    }
  }, [isOpen]);

  // If altTarget is set, set a virtual element as the position reference
  useEffect(() => {
    if (altTarget) {
      const virtualEl = {
        getBoundingClientRect() {
          return {
            x: 0,
            y: 0,
            top: altTarget.y,
            left: altTarget.x,
            bottom: 0,
            right: 0,
            width: 0,
            height: 0,
          };
        },
      };
      refs.setPositionReference(virtualEl);
      return () => refs.setPositionReference(null);
    } else {
      const targetElement = getFollowTargetElement(id) || null;
      refs.setReference(targetElement);
    }
  }, [altTarget, id, getFollowTargetElement]);

  // Get the current target element and update the reference
  // TODO: This is likely unnecessary indirection and the reference could be set directly.
  useEffect(() => {
    const targetElement = getFollowTargetElement(id);
    if (targetElement) {
      refs.setReference(targetElement);
    }
  }, [refs, id, getFollowTargetElement]);

  return shouldBeVisible && (
    <div
      key={id}
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        transition: shouldAnimate ? "all 0.3s ease-in-out" : "none",
      }}
    >
      {children}
    </div>
  ) || null;
};

interface FollowerProviderProps {
  children: ReactNode;
}
// This component is the root of the follower system. It manages the target elements and their followers.
export const FollowerProvider: React.FC<FollowerProviderProps> = ({ children }) => {
  // Stores the target elements. Observable, triggers changes.
  const [followTargets, setFollowTargets] = useState<Map<string, FollowTarget>>(new Map());
  const setTargetReference: SetRef = useCallback((id: string, followTargetElement: FollowTarget) => {
    setFollowTargets(prev => {
      // Remove Element
      if (!followTargetElement) {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      }
      // New Element
      const newMap = new Map(prev);
      newMap.set(id, followTargetElement);
      return newMap;
    });
  }, []);
  const [altTargets, setAltTargets] = useState<Map<string, AltTarget>>(new Map());
  const setAltTarget = useCallback((id: string, altTarget: AltTarget | undefined) => {
    setAltTargets(prev => {
      // No change
      if (prev.get(id) === altTarget) {
        return prev;
      }
      // Remove Element
      if (!altTarget) {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      }
      // New Element
      const newMap = new Map(prev);
      newMap.set(id, altTarget);
      return newMap;
    });
  }, []);
  const getAltTarget = useCallback((id: string) => {
    return altTargets.get(id);
  }, [altTargets]);

  // Stores the Follower content ReactNode. Non-observable, doesn't trigger changes.
  const followerContentRefs = useRef<Map<string, FollowerContent>>(new Map());
  const getFollowerContext = useCallback((id: string) => {
    return followerContentRefs.current.get(id);
  }, []);
  const setFollowerContext = useCallback((id: string, content: ReactNode | null) => {
    followerContentRefs.current.set(id, content);
  }, []);

  // Function to get target element by ID
  const getFollowEntry = useCallback((id: string) => {
    return followTargets.get(id);
  }, [followTargets]);

  const contextValue = useMemo<FollowerCtxType>(() => ({
    setTargetReference,
    getFollowEntry,
    setFollowerContent: setFollowerContext,
    getFollowerContent: getFollowerContext,
    setAltTarget,
    getAltTarget,
  }), [setTargetReference, getFollowEntry, setFollowerContext, getFollowerContext]);

  return (
    <FollowerCtx.Provider value={contextValue}>
      {children}
      {createPortal(
        <div>
          {Array.from(followerContentRefs.current.entries()).map(([id, content]) => (
            <Follower key={id} id={id} getFollowTargetElement={getFollowEntry} altTarget={getAltTarget(id)}>
              {content}
            </Follower>
          ))}
        </div>,
        document.body,
      )}
    </FollowerCtx.Provider>
  );
}

// Internal hook for connecting the Targer and Follower components via the Provider
const useFollowerTargetRef = <T extends HTMLElement>(id: string, children: ReactNode, altTarget?: AltTarget) => {
  const context = useContext(FollowerCtx);
  if (!context) throw new Error("Wrap your app with <FollowerProvider/>");
  const { setTargetReference, setFollowerContent: setFollowerContext, setAltTarget } = context;

  // Send the children to get rendered in the portal
  setFollowerContext(id, children);

  // Forward the altTarget to the follower system
  useEffect(() => {
    setAltTarget(id, altTarget);
  }, [altTarget, id, setAltTarget]);

  // A callback ref that always re-points the follower to the latest DOM node
  const last = useRef<T | null>(null);
  const setTargetRef = useCallback((node: T | null) => {
    last.current = node;
    setTargetReference(id, node);
  }, [setTargetReference, id]);

  return setTargetRef;
}

interface FollowPortalProps<T extends HTMLElement> {
  id: string;
  TargetComponent: React.FC<{ id: string, targetRef: Ref<T> }>;
  altTarget?: AltTarget;
  children: ReactNode;
}
// This component takes the children and forwards it to be rendered into its Follower, and renders the Target component as its real child.
export const FollowPortal = <T extends HTMLElement>({ id, TargetComponent, children, altTarget }: FollowPortalProps<T>) => {
  // Send children to the follower system
  const targetRef = useFollowerTargetRef<T>(id, children, altTarget);
  // Mark the target with a ref
  return <TargetComponent key={`target-${id}`} id={id} targetRef={targetRef} />;
}
