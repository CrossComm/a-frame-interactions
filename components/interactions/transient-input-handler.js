/* global AFRAME, THREE */
AFRAME.registerComponent('transient-input-handler', {
  init: function () {
    console.log("transient-input-handler init");
    this.xrSession = null;
    this.transientInputSource = null;
    this.selectedObject = null;
    
    this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR.bind(this));
    this.el.sceneEl.addEventListener('exit-vr', this.onExitVR.bind(this));
  },
  
  tick: function () {
    if (this.transientInputSource && this.selectedObject) {
      this.updatePose();
    }
  },

  onEnterVR: function () {
    console.log('Entering VR');
    this.xrSession = this.el.sceneEl.renderer.xr.getSession();

    this.xrSession.addEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));
    this.xrSession.addEventListener('selectstart', this.onSelectStart.bind(this));
    this.xrSession.addEventListener('selectend', this.onSelectEnd.bind(this));
  },
  
  onExitVR: function () {
    if (this.xrSession) {
      this.xrSession.removeEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));
      this.xrSession.removeEventListener('selectstart', this.onSelectStart.bind(this));
      this.xrSession.removeEventListener('selectend', this.onSelectEnd.bind(this));
      this.xrSession = null;
    }
  },

  onInputSourcesChange: function (event) {
    event.added.forEach((inputSource) => {
      if (inputSource.targetRayMode === 'transient-pointer') {
        this.transientInputSource = inputSource;
      }
    });

    event.removed.forEach((inputSource) => {
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
        const refSpace = this.el.sceneEl.renderer.xr.getReferenceSpace();
        const pose = frame.getPose(inputSource.targetRaySpace, refSpace);
        if (pose) {
          this.performRaycast(pose);
        } else {
          console.error('No pose available for this input source');
        }
      });
    }
  },

  onSelectEnd: function () {
    this.transientInputSource = null;
    if (this.selectedObject) {
      this.selectedObject.emit('onInteractEnd');
      this.selectedObject = null;
    }
  },

  performRaycast: function (pose) {
    const origin = new THREE.Vector3(
      pose.transform.position.x,
      pose.transform.position.y,
      pose.transform.position.z
    );
    const quaternion = new THREE.Quaternion(
      pose.transform.orientation.x,
      pose.transform.orientation.y,
      pose.transform.orientation.z,
      pose.transform.orientation.w
    );
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);

    const raycaster = new THREE.Raycaster(origin, direction.normalize());
    const intersects = raycaster.intersectObjects(this.el.sceneEl.object3D.children, true);

    if (intersects.length > 0) {
      intersects[0].object.el.emit('click');

      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.el.classList.contains('grabbable')) {
          this.selectedObject = intersects[i].object.el;
          break;
        }
      }

      if (this.selectedObject) {
        this.el.sceneEl.renderer.xr.getSession().requestAnimationFrame((time, frame) => {
          const pose = this.getGrabPose(this.transientInputSource, frame);
          if (pose) {
            this.selectedObject.emit('onInteractStart', { pose: pose });
          } else {
            console.error('No pose available for this input source');
          }
        });
      }
    } else {
      console.log('No intersections found');
    }
  },

  getGrabPose: function (inputSource, frame) {
    const gripSpace = inputSource.gripSpace;
    const refSpace = this.el.sceneEl.renderer.xr.getReferenceSpace();
    const pose = frame.getPose(gripSpace, refSpace);
    return pose;
  },

  updatePose: function () {
    this.el.sceneEl.renderer.xr.getSession().requestAnimationFrame((time, frame) => {
      if (!this.transientInputSource) {
        return;
      }
      const pose = this.getGrabPose(this.transientInputSource, frame);
      if (pose) {
        this.selectedObject.emit('onInteract', { pose: pose });
      } else {
        console.error('No pose available for this input source');
      }
    });
  }
});
