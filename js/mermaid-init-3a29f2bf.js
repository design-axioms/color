document.addEventListener("DOMContentLoaded", function () {
  var codeBlocks = document.querySelectorAll("code.language-mermaid");
  codeBlocks.forEach(function (codeBlock) {
    var pre = codeBlock.parentNode;
    if (pre.tagName.toLowerCase() === "pre") {
      var div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = codeBlock.textContent;
      pre.parentNode.replaceChild(div, pre);
    }
  });
  mermaid.initialize({ startOnLoad: true });
});
