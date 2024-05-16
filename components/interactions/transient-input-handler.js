/* global AFRAME, THREE */
AFRAME.registerComponent('transient-input-handler', {
    init: function () {
        console.log("transient-input-handler init");
    this.xrSession = null;
    this.transientInputSource = null;
    this.selectedObject = null;
    
        this.el.sceneEl.addEventListener('enter-vr', () => {
            console.log('Entering VR');
            this.xrSession = this.el.sceneEl.renderer.xr.getSession();
    
            this.xrSession.addEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));
            this.xrSession.addEventListener('selectstart', this.onSelectStart.bind(this));
            this.xrSession.addEventListener('selectend', this.onSelectEnd.bind(this));
        });
  },
  
  tick: function () {
    //if there is a transient input source and a selected object, get the pose of the transient input source
    if (this.transientInputSource != null && this.selectedObject != null)
    {
      this.el.sceneEl.renderer.xr.getSession().requestAnimationFrame((time, frame) => {

        if (this.transientInputSource == null) 
        {
          return;
        }
        
        const pose = this.getGrabPose(this.transientInputSource, frame);
        //if pose is available, emit a move event with the pose
        if (pose) {
          this.selectedObject.emit('onInteract', { pose: pose });
        } else {
          console.error('No pose available for this input source');
        }
      });
    }
  },

    onInputSourcesChange: function (event) {
      event.added.forEach((inputSource) => {
        if (inputSource.targetRayMode === 'transient-pointer') {
          // This is where you might prepare to handle new inputs
          this.transientInputSource = inputSource;
        }
      });
  
      event.removed.forEach((inputSource) => {
        // Handle cleanup for removed inputs here
        if (inputSource.targetRayMode === 'transient-pointer') {
            this.transientInputSource = null;
            if (this.selectedObject) {
              this.selectedObject.emit('onInteractEnd');
              this.selectedObject = null;
            }
        }
      });
    },
  
  onSelectStart: function (event) {
    const inputSource = event.inputSource;
    if (inputSource.targetRayMode === 'transient-pointer') {
        this.el.sceneEl.renderer.xr.getSession().requestAnimationFrame((time, frame) => {
            const refSpace = this.el.sceneEl.renderer.xr.getReferenceSpace('viewer');
            const pose = frame.getPose(inputSource.targetRaySpace, refSpace);
            if (pose) {
                this.performRaycast(pose);
            } else {
                console.error('No pose available for this input source');
            }
        });
    }
},

  
  onSelectEnd: function (event) {
    this.transientInputSource = null;
    if (this.selectedObject) {
      this.selectedObject.emit('onInteractEnd');
      this.selectedObject = null;
    }
      
  },

  performRaycast: function (pose) {
      const origin = new THREE.Vector3(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
      const quaternion = new THREE.Quaternion(pose.transform.orientation.x, pose.transform.orientation.y, pose.transform.orientation.z, pose.transform.orientation.w);
      const direction = new THREE.Vector3(0, 0, -1); // Forward direction
      direction.applyQuaternion(quaternion);

      const raycaster = new THREE.Raycaster(origin, direction.normalize());
      const intersects = raycaster.intersectObjects(this.el.sceneEl.object3D.children, true);

    if (intersects.length > 0) {
      
      //lets emit a click event for the object on the top of the stack
        intersects[0].object.el.emit('click');
      
      //iterate through all intersections and select the first object that is .grabbable class
      for (let i = 0; i < intersects.length; i++)
      {
        console.log(intersects[i].object.el.id);
        if (intersects[i].object.el.classList.contains('grabbable'))
        {
          this.selectedObject = intersects[i].object.el;
          break;
        }
      }

      if (this.selectedObject)
      {
        //get frame
        this.el.sceneEl.renderer.xr.getSession().requestAnimationFrame((time, frame) =>
        {
          const pose = this.getGrabPose(this.transientInputSource, frame);
          if (pose)
          {
            this.selectedObject.emit('onInteractStart', { pose: pose });
          }
          else
          {
            console.error('No pose available for this input source');
          }
        });
      }
    }
    else
    {
      console.log('No intersections found');
    }
  },

  getGrabPose: function (inputSource, frame) {
    //get grip space of the saved transient input source
    const gripSpace = inputSource.gripSpace;
    //get reference space of the session
    const refSpace = this.el.sceneEl.renderer.xr.getReferenceSpace();
    //get pose of the grip space
    const pose = frame.getPose(gripSpace, refSpace);
    return pose;
  }
 

});