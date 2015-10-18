const Effects = {

  /**
   * No effect
   */
  none: null,

  /**
   * Fade's in or out by setting the opacity to 0.
   */
  fade: (node) => node.opacity = 0,

  /**
   * Slides to the left.
   */
  slideLeft: {
    show: (node, rect) => node.rect.x = rect.width,
    hide: (node, rect) => node.rect.x = -rect.width
  },

  /**
   * Slides to the right.
   */
  slideRight: {
    show: (node, rect) => node.rect.x = -rect.width,
    hide: (node, rect) => node.rect.x = rect.width
  },

  /**
   * Slides upwards.
   */
  slideUp: {
    show: (node, rect) => node.rect.y = -rect.height,
    hide: (node, rect) => node.rect.y = rect.height
  },

  /**
   * Slides downwards.
   */
  slideDown: {
    show: (node, rect) => node.rect.y = rect.height,
    hide: (node, rect) => node.rect.y = -rect.height
  },

  /**
   * Cover slide left.
   */
  coverSlideLeft: {
    show: (node, rect) => {
      node.rect.x = rect.width;
      node.rect.z = rect.z + 5;
    },
    postShow: (node, rect) => node.rect.z = rect.z + 5,
    hide: (node, rect) => node.rect.x = -(rect.width / 2)
  },

  /**
   * Cover slide right.
   */
  coverSlideRight: {
    show: (node, rect) => {
      node.rect.x = -rect.width;
      node.rect.z = rect.z + 5;
    },
    postShow: (node, rect) => node.rect.z = rect.z + 5,
    hide: (node, rect) => node.rect.x = (rect.width / 2)
  },

  /**
   * Flips left.
   */
  flipLeft: {
    show: (node) => node.rotation.y = -Math.PI,
    hide: (node) => node.rotation.y = Math.PI
  },

  /**
   * Flips right.
   */
  flipRight: {
    show: (node) => node.rotation.y = -Math.PI,
    hide: (node) => node.rotation.y = Math.PI
  },

  /**
   * Flips up.
   */
  flipUp: {
    show: (node, size) => {
      node.origin.y = 0.5;
      node.rotation.x = Math.PI;
    },
    hide: (node, size) => {
      node.origin.y = 0.5;
      node.rotation.x = -Math.PI;
    }
  },

  /**
   * Zooms.
   */
  zoom: (node, size) => {
    node.scale.x = 0.5;
    node.scale.y = 0.5;
  },

  /**
   * Fades and zooms.
   */
  fadedZoom: (node, size) => {
    node.origin.x = 0.5;
    node.origin.y = 0.5;
    node.opacity = 0;
    node.scale.x = 0.5;
    node.scale.y = 0.5;
  }
};

export default Effects;
