I wanted a way of having a component animate its position across the page as it get rendered into different parts of the DOM.
Just using normal css animations wouldn't work because the component will be torn down before being drawn again.

This system renders your actual content into an overlay layer, and renders a disposable "FollowTarget" into the page.
If the FollowTarget is rendered into another part of the DOM the content will reposition over the FollowTarget automatically.

This is just a proof of concept.

Demo is here https://kumavis.github.io/react-animated-overlay/


### usage

As a user I want to just render my content where it goes, but if it needs to render into a different part of the DOM it will teardown,
and I won't be able to get it to animate between those two places.

`FollowPortal` allows me to describe it where I want it to go. It will instead render a FollowTarget there, handle rendering the actual content to an overlay layer, and keep its position updated as the FollowTarget moves.

```tsx
{quadrantTargets.map(target => (
  <div key={target.id} style={{ margin: "10px 0" }}>

    <FollowPortal id={target.id} TargetComponent={TargetRepresentation} altTarget={target.id === "1" ? clickTarget : undefined}>
      {/* The below content is rendered into the Follower. The TargetComponent is actually rendered here. */}
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
```

To use this you need to wrap it in a `FollowerProvider` somewhere in your app.