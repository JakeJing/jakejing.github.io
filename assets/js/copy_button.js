// this function is used to enable the copy in code chunk
var codeBlocks = document.querySelectorAll("pre.highlight");
codeBlocks.forEach(function (codeBlock) {
  var copyButton = document.createElement("button");
  copyButton.className = "copy";
  copyButton.type = "button";
  copyButton.ariaLabel = "Copy code to clipboard";
  copyButton.innerText = "Copy";
  copyButton.style.fontSize = "16px";
  copyButton.style.position = "absolute";
  copyButton.style.top = "0";
  copyButton.style.right = "0";
  copyButton.style.opacity = "1"; // Always show the button
  copyButton.style.border = "none"; // Hide the border of the button
  copyButton.style.transition = "brightness 0.2s ease-in-out"; // Add a transition effect to the brightness of the button

  // Add a hover effect to the button
  copyButton.addEventListener("mouseenter", () => {
    copyButton.style.filter = "brightness(150%)"; // Increase the brightness of the button on hover
    copyButton.style.border = "1px solid black"; // Set the border of the button on hover
  });

  copyButton.addEventListener("mouseleave", () => {
    copyButton.style.filter = "brightness(100%)"; // Restore the brightness of the button when the mouse pointer leaves
    copyButton.style.border = "none"; // Remove the border of the button when the mouse pointer leaves
  });

  codeBlock.append(copyButton);

  copyButton.addEventListener("click", function () {
    var code = codeBlock.querySelector("code").innerText.trim();
    window.navigator.clipboard.writeText(code);

    copyButton.innerText = "Copied";
    var fourSeconds = 4000;
    setTimeout(function () {
      copyButton.innerText = "Copy";
    }, fourSeconds);
  });
});
