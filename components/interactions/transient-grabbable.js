/* global AFRAME, THREE */
AFRAME.registerComponent('transient-grabbable', {
  init: function () {
    console.log("grabbable init: " + this.el.id);
    this.bindMethods();
    this.grabStartPose = null;
    this.el.addEventListener('onInteractStart', this.onGrab);
    this.el.addEventListener('onInteract', this.onMove);
    this.el.addEventListener('onInteractEnd', this.onRelease);
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
    this.el.object3D.userData.initialRotation = this.el.object3D.quaternion.clone();
  },

  onMove: function (event) {
    const currentPose = event.detail.pose;
    if (!this.grabStartPose) return;

    // Extract positions from the initial and current poses
    const startPosition = new THREE.Vector3(
      this.grabStartPose.transform.position.x,
      this.grabStartPose.transform.position.y,
      this.grabStartPose.transform.position.z
    );
    const currentPosition = new THREE.Vector3(
      currentPose.transform.position.x,
      currentPose.transform.position.y,
      currentPose.transform.position.z
    );

    // Calculate delta position
    const deltaPosition = new THREE.Vector3().subVectors(currentPosition, startPosition);

    // Update object's position
    this.el.object3D.position.copy(this.el.object3D.userData.initialPosition).add(deltaPosition);

    // Extract rotations from the initial and current poses
    const startRotation = new THREE.Quaternion(
      this.grabStartPose.transform.orientation.x,
      this.grabStartPose.transform.orientation.y,
      this.grabStartPose.transform.orientation.z,
      this.grabStartPose.transform.orientation.w
    );
    const currentRotation = new THREE.Quaternion(
      currentPose.transform.orientation.x,
      currentPose.transform.orientation.y,
      currentPose.transform.orientation.z,
      currentPose.transform.orientation.w
    );

    // Calculate delta rotation
    const deltaRotation = new THREE.Quaternion().copy(currentRotation).multiply(startRotation.invert());

    // Update object's rotation
    this.el.object3D.quaternion.copy(this.el.object3D.userData.initialRotation).multiply(deltaRotation);
  },

  onRelease: function () {
    console.log("grabbable onInteractEnd: " + this.el.id);
    this.grabStartPose = null; // Reset grab start pose
  }
});
