// Extracts the first dropped file from a drag-and-drop event and feeds it to the
// same handler used by click-to-select, so a dropped file takes the IDENTICAL
// validation + upload path as a selected one. Calls preventDefault so the
// browser doesn't navigate to / open the dropped file.
export function handleFileDrop(e, onFile) {
  e.preventDefault();
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) onFile(file);
}
