I wanted a way of having a component animate its position across the page as it get rendered into different parts of the DOM.
Just using normal css animations wouldn't work because the component will be torn down before being drawn again.

This system renders your actual content into an overlay layer, and renders a disposable "FollowTarget" into the page.
If the FollowTarget is rendered into another part of the DOM the content will respotion over the FollowTarget automatically.

This is just a proof of concept.

Demo is here https://kumavis.github.io/react-animated-overlay/