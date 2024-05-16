/* global AFRAME, THREE */
AFRAME.registerComponent('transient-grabbable', {
  init: function () {
    console.log("grabbable init: " + this.el.id);
    this.bindMethods();
    this.grabStartPose = null;
    this.el.addEventListener('onInteractStart', this.onGrab.bind(this));
    this.el.addEventListener('onInteract', this.onMove.bind(this));
    this.el.addEventListener('onInteractEnd', this.onRelease.bind(this));
  },

  bindMethods: function () {
    this.onGrab = this.onGrab.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onRelease = this.onRelease.bind(this);
  },

  onGrab: function (event) {
    console.log("grabbable onInteractStart: " + this.el.id);
    this.grabStartPose = event.detail.pose;
    this.el.object3D.userData.initialPosition = this.el.object3D.position.clone();
    this.el.object3D.userData.initialRotation = this.el.object3D.rotation.clone();
  },

  onMove: function (event) {
    const currentPose = event.detail.pose;
    // Extract positions from the initial and current poses
    const startPosition = new THREE.Vector3(this.grabStartPose.transform.position.x, this.grabStartPose.transform.position.y, this.grabStartPose.transform.position.z);
    const currentPosition = new THREE.Vector3(currentPose.transform.position.x, currentPose.transform.position.y, currentPose.transform.position.z);

    // Calculate delta position
    const deltaPosition = new THREE.Vector3().subVectors(currentPosition, startPosition);
    
    // Update object's position
    this.el.object3D.position.copy(startPosition).add(deltaPosition);

    },


  onRelease: function (event) {
    console.log("grabbable onInteractEnd: " + this.el.id);
  }
});