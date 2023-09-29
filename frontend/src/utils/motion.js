/**
 * Common transition configuration used in animations.
 * @type {object}
 */
export const transition = { type: 'spring', duration: 0.8 };

/**
 * Animation variant for text elements with a specified delay.
 *
 * @param {number} delay - The delay before the animation starts (in seconds).
 * @returns {object} - The animation variant object for text elements.
 */
export const textVariant = (delay) => ({
  hidden: {
    y: 50,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      duration: 1.25,
      delay,
    },
  },
});

/**
 * Another animation variant for text elements with a different effect.
 * @type {object}
 */
export const textVariant2 = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      ease: 'easeIn',
    },
  },
};

/**
 * Animation variant for a container element with staggered children animations.
 * @type {object}
 */
export const textContainer = {
  hidden: {
    opacity: 0,
  },
  show: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: i * 0.1 },
  }),
};

/**
 * Animation variant for a container element with
 * staggered children animations (customizable stagger and delay).
 *
 * @param {number} staggerChildren - Stagger time between children animations (in seconds).
 * @param {number} delayChildren - Delay before starting children animations (in seconds).
 * @returns {object} - The animation variant object for the staggered container.
 */
export const staggerContainer = (staggerChildren, delayChildren) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

/**
 * Animation variant for a navigation element.
 * @type {object}
 */
export const navVariants = {
  hidden: {
    opacity: 0,
    y: -50,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 140,
    },
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      delay: 1,
    },
  },
};

/**
 * Generates a slide animation object based on the specified direction.
 *
 * @param {string} direction - The direction of
 * the slide animation ("left", "right", "up", or "down").
 * @returns {object} - The slide animation object with initial, animate, and exit properties.
 */
export const slideAnimation = (direction) => {
  // Calculate the x and y values for initial and exit animations
  let x = 0;
  let y = 0;
  let exitX = 0;
  let exitY = 0;

  // Update x and y values based on the direction
  if (direction === 'left') {
    x = -100;
    exitX = -100;
  } else if (direction === 'right') {
    x = 100;
    exitX = 100;
  }

  if (direction === 'up') {
    y = 100;
    exitY = 100;
  } else if (direction === 'down') {
    y = -100;
    exitY = -100;
  }

  // Return an object with initial, animate, and exit properties for slide animation
  return {
    initial: {
      x,
      y,
      opacity: 0,
      transition: { ...transition, delay: 0.5 },
    },
    animate: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: { ...transition, delay: 0 },
    },
    exit: {
      x: exitX,
      y: exitY,
      transition: { ...transition, delay: 0 },
    },
  };
};

/**
 * Function to generate a slide-in animation variant.
 *
 * @param {string} direction - The direction of the
 * slide-in animation ("left", "right", "up", or "down").
 * @param {string} type - The type of animation (e.g., "spring", "tween").
 * @param {number} delay - The delay before the animation starts (in seconds).
 * @param {number} duration - The duration of the animation (in seconds).
 * @returns {object} - The slide-in animation variant object.
 */
export const slideIn = (direction, type, delay, duration) => {
  // Calculate the x and y values based on the direction
  let x = 0;
  let y = 0;

  if (direction === 'left') {
    x = '-100%';
  } else if (direction === 'right') {
    x = '100%';
  }

  if (direction === 'up' || direction === 'down') {
    y = '100%';
  }

  // Return an object with hidden and show properties for slide-in animation
  return {
    hidden: {
      x,
      y,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type,
        delay,
        duration,
        ease: 'easeOut',
      },
    },
  };
};

/**
 * Animation variant for a fade animation.
 * @type {object}
 */
export const fadeAnimation = {
  initial: {
    opacity: 0,
    transition: { ...transition, delay: 0.5 },
  },
  animate: {
    opacity: 1,
    transition: { ...transition, delay: 0 },
  },
  exit: {
    opacity: 0,
    transition: { ...transition, delay: 0 },
  },
};

/**
 * Function to generate a fade-in animation variant.
 *
 * @param {string} direction - The direction of the
 * fade-in animation ("left", "right", "up", or "down").
 * @param {string} type - The type of animation (e.g., "spring", "tween").
 * @param {number} delay - The delay before the animation starts (in seconds).
 * @param {number} duration - The duration of the animation (in seconds).
 * @returns {object} - The fade-in animation variant object.
 */
export const fadeIn = (direction, type, delay, duration) => {
  // Calculate the x and y values based on the direction
  let x = 0;
  let y = 0;

  if (direction === 'left') {
    x = 100;
  } else if (direction === 'right') {
    x = -100;
  }

  if (direction === 'up') {
    y = 100;
  } else if (direction === 'down') {
    y = -100;
  }

  // Return an object with hidden and show properties for fade-in animation
  return {
    hidden: {
      x,
      y,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        delay,
        duration,
        ease: 'easeOut',
      },
    },
  };
};

/**
 * Animation variant for a diorama animation.
 *
 * @param {string} direction - The direction of the diorama animation ("left" or "right").
 * @returns {object} - The diorama animation variant object.
 */
export const dioramaAnimation = (direction) => ({
  hidden: {
    x: direction === 'left' ? '-100%' : '100%',
    rotate: 120,
  },
  show: {
    x: 0,
    rotate: 0,
    transition: {
      type: 'spring',
      duration: 1.8,
      delay: 0.5,
    },
  },
});

/**
 * Animation variant for a footer element.
 * @type {object}
 */
export const footerVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 140,
    },
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      delay: 0.5,
    },
  },
};
