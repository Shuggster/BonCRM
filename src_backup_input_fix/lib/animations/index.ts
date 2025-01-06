import { Variants } from 'framer-motion'

// Page transition variants
export const pageVariants: Variants = {
  initial: { 
    opacity: 0,
    x: "100%"
  },
  animate: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 1.2,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: { 
    opacity: 0,
    x: "100%",
    transition: {
      duration: 1.2,
      ease: [0.32, 0.72, 0, 1]
    }
  }
}

// Split view container variants
export const splitContainerVariants: Variants = {
  initial: { x: "100%" },
  animate: { 
    x: 0,
    transition: {
      duration: 1.2,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: { 
    x: "100%",
    transition: {
      duration: 1.2,
      ease: [0.32, 0.72, 0, 1]
    }
  }
}

// Split view content variants
export const splitContentVariants = {
  top: {
    initial: { y: "-100%" },
    animate: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }
  },
  bottom: {
    initial: { y: "100%" },
    animate: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }
  }
}

// Component fade-in variants
export const fadeInVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 10
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 35,
      damping: 25
    }
  }
}

// Card hover variants
export const cardHoverVariants: Variants = {
  initial: {},
  hover: {
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  tap: {
    y: 0
  }
}

// Animation timing constants
export const ANIMATION_DURATION = {
  page: 1.2,
  split: 1.2,
  hover: 0.2
}

// Standardized spring configs
export const SPRING_CONFIGS = {
  splitView: {
    type: "spring",
    stiffness: 50,
    damping: 15
  },
  gentle: {
    type: "spring",
    stiffness: 35,
    damping: 25
  },
  responsive: {
    type: "spring",
    stiffness: 400,
    damping: 25
  }
} 