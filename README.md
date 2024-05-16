# A-frame Interactions for the Apple Vision Pro

This A-Frame component allows objects to be interactively grabbed and manipulated using transient input sources on the vision pro. The component handles both position and rotation updates to ensure smooth and intuitive interactions.

## Installation

Ensure you have A-Frame 1.5.0 referenced. 
```html
<script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
```

Add the transient-input-handler.js & transient-grabbable.js files to your A-Frame project and reference them in scripts:
```html
<script src="components/interactions/transient-input-handler.js"></script>
<script src="components/interactions/transient-grabbable.js"></script>
```

## Components

### transient-input-handler

#### Usage
Add the transient-input-handler component to the scene to handle the input sources:

```html
<a-scene transient-input-handler>
  <!-- Scene content here -->
</a-scene>
```
#### Events

* ```onInteractStart``` Triggered when the object is initially interacted with (when pinch is detected while gazing at an object with a'grabbable' class; event has grabPose of the hand that was used to interact)
* ```onInteract``` Triggered on the object while the pinch is continously held. (event has grabPose of the hand that was used to interact)
* ```onInteractEnd``` Triggered on the object when the pinch is released. (when pinch was released)
* ```click``` called on an element that was gazed at when pinched. (doesn't need a grabbable class. This is added to have a basic implementation of interacting with UI using transient-input)

### transient-grabbable

#### Usage
This component makes an entity grabbable and movable using transient input sources. This receives events from the transient-input-handler and handles transform movement of the grabbed object.

```html
<a-entity id="grabbable-object" class="grabbable" transient-grabbable>
  <!-- Object model or geometry here -->
</a-entity>
```

## Sample

Try out the sample on the Vision Pro by going to https://crosscomm.github.io/a-frame-interactions 
Sample code is at [Sample HTML](https://github.com/CrossComm/a-frame-interactions/blob/main/index.html)
* The logo listens to a ```click``` event and triggers an animation when gazed at and pinched
* The cube has transient-grabbable which allows us to gaze, pinch and move the cube around

## Future Plans
* Add grabbing with 2 hands simulataneously (this component currently only works with one hand at a time)
* Add options to grabbable to enable physics
* Make same component usable with other devices

##License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/CrossComm/a-frame-interactions/blob/main/LICENSE) file for details.
