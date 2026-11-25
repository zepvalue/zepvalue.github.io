// Pure helpers for the /apps/ panel deck. No DOM access, so Node can test them
// (tests/panels-core.test.js). Loaded in the browser as window.PanelsCore.
(function (root) {
  // "#firecomm" -> { panel: 1, project: "firecomm" }; "#backend" -> { panel: 2, project: null }.
  // panelIds: ordered panel ids. projectPanels: { projectId: panelIndex }.
  function parseHash(hash, panelIds, projectPanels) {
    var id = (hash || "").replace(/^#/, "");
    try { id = decodeURIComponent(id); } catch (e) { /* keep raw id */ }
    if (Object.prototype.hasOwnProperty.call(projectPanels, id)) {
      return { panel: projectPanels[id], project: id };
    }
    var i = panelIds.indexOf(id);
    return { panel: i === -1 ? 0 : i, project: null };
  }

  // Panel index when the hash names a panel ("#backend" -> 2), else -1.
  // Unlike parseHash, an empty or unknown hash does not mean "first panel".
  function namedPanel(hash, panelIds) {
    var id = (hash || "").replace(/^#/, "");
    try { id = decodeURIComponent(id); } catch (e) { /* keep raw id */ }
    return id ? panelIds.indexOf(id) : -1;
  }

  // Index of the offset closest to `pos`.
  function nearestIndex(pos, offsets) {
    var best = 0;
    for (var i = 1; i < offsets.length; i++) {
      if (Math.abs(offsets[i] - pos) < Math.abs(offsets[best] - pos)) best = i;
    }
    return best;
  }

  // The id before (dir -1) or after (dir 1) `id` in `ids`, or null at the ends.
  function neighbor(ids, id, dir) {
    var i = ids.indexOf(id);
    if (i === -1) return null;
    var j = i + dir;
    return j >= 0 && j < ids.length ? ids[j] : null;
  }

  // Height the deck needs to show panels first..last: the tallest of them.
  function visibleHeight(heights, first, last) {
    var max = 0;
    for (var i = Math.max(0, first); i <= Math.min(last, heights.length - 1); i++) {
      if (heights[i] > max) max = heights[i];
    }
    return max;
  }

  var api = {
    parseHash: parseHash, namedPanel: namedPanel, nearestIndex: nearestIndex,
    neighbor: neighbor, visibleHeight: visibleHeight
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PanelsCore = api;
})(this);
