const Effects = {

  /**
   * No effect
   */
  none: null,

  /**
   * Fade's in or out by setting the opacity to 0.
   */
  fade: function(node) {
    node.opacity = 0;
  },

  /**
   * Slides to the left.
   */
  slideLeft: function(node, size, hide) {
    console.log('huh');
    node.rect.x = hide ? -size.width : size.width;
  },

  /**
   * Slides to the right.
   */
  slideRight: function(node, size, hide) {
    node.rect.x = hide ? size.width : -size.width;
  },

  /**
   * Slides upwards.
   */
  slideUp: function(node, size, hide) {
    node.rect.y = hide ? size.height : -size.height;
  },

  /**
   * Slides downwards.
   */
  slideDown: function(node, size, hide) {
    node.rect.y = hide ? -size.height : size.height;
  },

  /**
   * Flips left.
   */
  flipLeft: function(node, size, hide) {
    node.rotate.y = hide ? Math.PI : -Math.PI;
  },

  /**
   * Flips right.
   */
  flipRight: function(node, size, hide) {
    node.rotate.y = hide ? -Math.PI : Math.PI;
  },

  /**
   * Zooms.
   */
  zoom: function(node, size, hide) {
    node.scale.x = 0.5;
    node.scale.y = 0.5;
  },

  /**
   * Fades and zooms.
   */
  fadedZoom: function(node, size, hide) {
    node.opacity = 0;
    node.scale.x = 0.5;
    node.scale.y = 0.5;
  }
};

export default Effects;
