export function addDropHandler(onDrop: (blob: Blob) => void) {
  const dropTarget = document.createElement("div");
  dropTarget.style.top = "0px";
  dropTarget.style.left = "0px";
  dropTarget.style.position = "absolute";
  dropTarget.style.bottom = "0";
  dropTarget.style.right = "0";
  document.body.appendChild(dropTarget);

  function dropHandler(ev: DragEvent) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    const file = ev.dataTransfer.files[0];
    if (file == null) {
      return;
    }

    clearDropTargetStyle();
    onDrop(file);
  }

  function clearDropTargetStyle() {
    dropTarget.style.border = "none";
  }

  function dragOverHandler(ev: DragEvent) {
    dropTarget.style.border = "4px dotted white";
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  dropTarget.addEventListener("dragover", dragOverHandler);
  dropTarget.addEventListener("dragleave", clearDropTargetStyle);
  dropTarget.addEventListener("drop", dropHandler);
}
