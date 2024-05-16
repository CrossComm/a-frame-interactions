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
    },

    onMove: function (event) {
        const currentPose = event.detail.pose;
    },

    onRelease: function (event) {
        
    }

});