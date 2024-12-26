import { Variants } from 'framer-motion'

// Page transition variants
export const pageVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 35,
      damping: 25,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    y: 20
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

// Stagger children variants
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
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
  page: 0.5,
  component: 0.3,
  hover: 0.2
}

// Standardized spring configs
export const SPRING_CONFIGS = {
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