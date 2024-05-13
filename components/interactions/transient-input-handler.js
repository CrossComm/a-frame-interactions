
AFRAME.registerComponent('transient-input-handler', {
    init: function () {
        console.log("transient-input-handler init");
        this.xrSession = null;
    
        this.el.sceneEl.addEventListener('enter-vr', () => {
            console.log('Entering VR');
            this.xrSession = this.el.sceneEl.renderer.xr.getSession();
    
            this.xrSession.addEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));
            this.xrSession.addEventListener('selectstart', this.onSelectStart.bind(this));
            this.xrSession.addEventListener('selectend', this.onSelectEnd.bind(this));
        });
    },
  
    onInputSourcesChange: function (event) {
      event.added.forEach((inputSource) => {
        if (inputSource.targetRayMode === 'transient-pointer') {
          // This is where you might prepare to handle new inputs
        }
      });
  
      event.removed.forEach((inputSource) => {
        // Handle cleanup for removed inputs here
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
  },

 performRaycast: function (pose) {
    const origin = new THREE.Vector3(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
    const quaternion = new THREE.Quaternion(pose.transform.orientation.x, pose.transform.orientation.y, pose.transform.orientation.z, pose.transform.orientation.w);
    const direction = new THREE.Vector3(0, 0, -1); // Forward direction
    direction.applyQuaternion(quaternion);

    const raycaster = new THREE.Raycaster(origin, direction.normalize());
    const intersects = raycaster.intersectObjects(this.el.sceneEl.object3D.children, true);

   if (intersects.length > 0) {
     //send click event to the intersected object at the top of the stack
        intersects[0].object.el.emit('click');

        for (let i = 0; i < intersects.length; i++) {
            console.log('Intersected object:', intersects[i].object.el.id);
        }
    } else {
        console.log('No intersections found');
    }
}

  });