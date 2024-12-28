# Add Contact Refactor Documentation

## Comparison Findings and Checklist

### 1. Imports:
- **Edit Contact** imports `framer-motion` for animations.
- **Add Contact** does not use `framer-motion`.
- **Action**: Consider adding animation support to the **Add Contact** component if desired.

### 2. Props Interface:
- **Edit Contact** defines a props interface with `contact`, `section`, `onFieldUpdate`, and `className`.
- **Add Contact** does not define a props interface.
- **Action**: Define a similar props interface for the **Add Contact** component.

### 3. State Management:
- **Edit Contact** manages multiple state variables including `error`, `saving`, `industries`, and activity-related states.
- **Add Contact** manages `isSubmitting`, `error`, and `formData`.
- **Action**: Enhance state management in the **Add Contact** component to include additional state variables as needed.

### 4. Form Structure:
- **Edit Contact** uses expandable sections and has a more complex form structure.
- **Add Contact** appears to have a simpler structure.
- **Action**: Consider implementing expandable sections in the **Add Contact** form if it requires more fields.

## Changes Made

### Defined Props Interface for Add Contact
- Created an `AddContactProps` interface that includes:
  - `formData`: An object representing the fields related to the contact.
  - `onFieldChange`: A function to handle changes in the input fields.
  - `className`: An optional class name for styling.
- The `AddContactProps` interface is now utilized in the **Add Contact** component.

### Updated Component Definition
- The **Add Contact** component now accepts props and uses `onFieldChange` to update field values instead of managing its own state for `formData`.
- The component's props are now validated against the `AddContactProps` interface.

## Checklist Summary

- [ ] **Imports**: Add animation support to **Add Contact** if desired.
- [x] **Props Interface**: Define a props interface for **Add Contact**.
- [ ] **State Management**: Enhance state management in **Add Contact**.
- [ ] **Form Structure**: Implement expandable sections in **Add Contact** if necessary.

## Next Steps
- Start with enhancing state management in the **Add Contact** component.
