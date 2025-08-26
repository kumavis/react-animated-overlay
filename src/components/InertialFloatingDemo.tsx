import React, { useEffect, useRef, useState } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import { motion, useSpring } from "framer-motion";

/**
 * A demo showing a floating element that follows a virtual position with inertial animation.
 * Uses a virtual element reference that gets updated on clicks, with smooth spring-based movement.
 */
export default function InertialFloatingDemo() {
  // const [open, setOpen] = useState(true);
  const [virtualPosition, setVirtualPosition] = useState({ x: 100, y: 100 });
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    refs,
    context,
    x,               // target x from Floating UI
    y,               // target y from Floating UI
    strategy,
    placement,
    elements,
  } = useFloating({
    open: true,
    // onOpenChange: setOpen,
    placement: "top",
    strategy: "fixed",
    middleware: [
      offset(16),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, update, { animationFrame: true }),
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useRole(context, { role: "dialog" }),
    useDismiss(context),
  ]);

  // Inertial springs for the floating's position with sensible defaults
  const stiffness = 3;
  const damping = 3;
  const mass = 1;
  const springX = useSpring(0, { stiffness, damping, mass });
  const springY = useSpring(0, { stiffness, damping, mass });

  // Update spring targets when Floating UI position changes
  useEffect(() => {
    console.log('Floating UI calculated position:', { x, y });
    if (typeof x === "number") springX.set(x);
    if (typeof y === "number") springY.set(y);
  }, [x, y, springX, springY]);

  // Set up virtual element reference
  useEffect(() => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const virtualEl = {
        getBoundingClientRect() {
          const rect = {
            x: containerRect.left + virtualPosition.x,
            y: containerRect.top + virtualPosition.y,
            top: containerRect.top + virtualPosition.y,
            left: containerRect.left + virtualPosition.x,
            bottom: containerRect.top + virtualPosition.y + 20,
            right: containerRect.left + virtualPosition.x + 20,
            width: 20,
            height: 20,
          };
          return rect;
        },
      };
      refs.setPositionReference(virtualEl);
      console.log('Set position reference to virtual element');
      return () => refs.setPositionReference(null);
    }
  }, [virtualPosition, refs]);

  const handleClick = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;

      setVirtualPosition({
        x: clickX,
        y: clickY,
      });
    }
  };

  return (
    <div className="inertial-demo" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>

      <div
        ref={containerRef}
        className="demo-area"
        onClick={handleClick}
        style={{
          flex: 1,
          position: 'relative',
          cursor: 'crosshair',
          background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        {/* Visual indicator of virtual target position */}
        <div
          style={{
            position: 'absolute',
            left: virtualPosition.x,
            top: virtualPosition.y,
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            background: '#007bff',
            borderRadius: '50%',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 5,
          }}
        />

        <FloatingPortal>
          {true && (
            <motion.div
              ref={refs.setFloating}
              {...getFloatingProps()}
              className="inertial-floating-panel"
              style={{
                position: strategy,
                top: springY,
                left: springX,
                willChange: "transform",
                zIndex: 1000,
                background: 'white',
                border: '2px solid #28a745',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                minWidth: '200px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>
                Following with inertia! 🚀
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Velocity: ({Math.round(springX.getVelocity())}, {Math.round(springY.getVelocity())})
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Spring: ({Math.round(springX.get())}, {Math.round(springY.get())})
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Floating UI: ({typeof x === 'number' ? Math.round(x) : 'undefined'}, {typeof y === 'number' ? Math.round(y) : 'undefined'})
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Virtual Pos: ({Math.round(virtualPosition.x)}, {Math.round(virtualPosition.y)})
              </div>
            </motion.div>
          )}
        </FloatingPortal>
      </div>
    </div>
  );
}
