// Manual test scenarios for ConfirmationModal component
// To be run during development and user testing

/*
MANUAL TEST CHECKLIST FOR CONFIRMATION MODALS

□ Test 1: Clear Canvas Confirmation
  1. Draw something on the canvas
  2. Click the clear/trash button (🗑️)
  3. Verify confirmation modal appears with:
     - Title: "Confirmar borrado"
     - Message about losing drawing
     - Red "Sí, borrar" button
     - Gray "Cancelar" button
  4. Click "Cancelar" - modal should close, drawing preserved
  5. Click clear again, then "Sí, borrar" - modal closes, canvas clears

□ Test 2: Day Navigation Confirmation  
  1. Draw something on the canvas
  2. Click day navigation arrows (← →)
  3. Verify confirmation modal appears with:
     - Title: "Cambiar día"  
     - Message about losing work in progress
     - Yellow "Sí, cambiar día" button
     - Gray "Quedarse aquí" button
  4. Click "Quedarse aquí" - modal closes, stays on same day
  5. Try navigation again, click "Sí, cambiar día" - changes day, work lost

□ Test 3: Empty Canvas - No Confirmation
  1. Ensure canvas is empty (no drawing)
  2. Click clear button - should clear immediately without confirmation
  3. Click day navigation - should navigate immediately without confirmation

□ Test 4: Modal Interaction
  1. Open any confirmation modal
  2. Click outside modal (on overlay) - should close modal
  3. Click on modal content - should NOT close modal
  4. Verify proper focus trapping and keyboard navigation

□ Test 5: Visual Design
  1. Verify warning modals have yellow/orange accent
  2. Verify danger modals have red accent  
  3. Verify proper icons (❓ for warning, ⚠️ for danger)
  4. Test responsive design on mobile sizes
  5. Verify animations work smoothly

□ Test 6: Accessibility
  1. Test with keyboard navigation only
  2. Test with screen reader
  3. Verify proper ARIA labels and focus management
  4. Test color contrast meets accessibility standards

EXPECTED PERFORMANCE IMPROVEMENTS:
□ Bucket fill should be noticeably faster on large areas
□ No console spam in production builds  
□ Memory usage should be lower during bucket fill operations

TESTING NOTES:
- Test on various devices and browsers
- Test with different canvas sizes and complexity
- Verify no memory leaks after multiple confirmations
- Check console for errors or warnings

*/

export default {};