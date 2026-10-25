/**
 * ============================================================================
 * Traffic Shortest Path Finder Using Dijkstra's Algorithm
 * DAA (Design and Analysis of Algorithms) College Laboratory Project
 * 
 * 8 City Locations (A to H) & 14 Interconnecting Road Corridors
 * Pure JavaScript Implementation of Dijkstra's Algorithm
 * ============================================================================
 */

// -----------------------------------------------------------------------------
// 1. 8-NODE ROAD NETWORK TOPOLOGY (A through H)
// -----------------------------------------------------------------------------

const NODES = {
  A: { label: "Central Terminus",          x: 80,  y: 230 },
  B: { label: "North Tech Hub",           x: 230, y: 100 },
  C: { label: "South Market",             x: 230, y: 360 },
  D: { label: "City Center",              x: 400, y: 230 },
  E: { label: "Industrial Zone",          x: 400, y: 80  },
  F: { label: "Metro Plaza",              x: 400, y: 380 },
  G: { label: "University & Medical Hub", x: 580, y: 130 },
  H: { label: "Airport Terminal",         x: 740, y: 230 }
};

// 14 Bidirectional Roads with distances in km
const ROADS = [
  { id: "A-B", u: "A", v: "B", distance: 5, isHeavy: false },
  { id: "A-C", u: "A", v: "C", distance: 6, isHeavy: false },
  { id: "A-D", u: "A", v: "D", distance: 8, isHeavy: false }, // Center arterial
  { id: "B-E", u: "B", v: "E", distance: 4, isHeavy: false },
  { id: "B-D", u: "B", v: "D", distance: 4, isHeavy: false },
  { id: "C-D", u: "C", v: "D", distance: 4, isHeavy: false },
  { id: "C-F", u: "C", v: "F", distance: 4, isHeavy: false },
  { id: "D-E", u: "D", v: "E", distance: 3, isHeavy: false },
  { id: "D-F", u: "D", v: "F", distance: 3, isHeavy: false },
  { id: "E-G", u: "E", v: "G", distance: 4, isHeavy: false },
  { id: "D-G", u: "D", v: "G", distance: 6, isHeavy: false },
  { id: "F-H", u: "F", v: "H", distance: 8, isHeavy: false }, // South express to airport
  { id: "G-H", u: "G", v: "H", distance: 5, isHeavy: false }, // North express to airport
  { id: "D-H", u: "D", v: "H", distance: 9, isHeavy: false }  // Center direct expressway
];

const SPEED_NORMAL_KMH = 50;  // Clear road speed (km/h)
const SPEED_HEAVY_KMH  = 20;  // Congested road speed (km/h)
const HEAVY_COST_MULTIPLIER = 2.5; // Impedance penalty factor for Dijkstra

// Application State
let currentPath = [];
let currentStartNode = "A";
let currentDestNode = "H";

// -----------------------------------------------------------------------------
// 2. DIJKSTRA'S ALGORITHM IMPLEMENTATION FROM SCRATCH
// -----------------------------------------------------------------------------

/**
 * Computes shortest path between start and destination using Dijkstra's Algorithm.
 */
function dijkstra(start, destination) {
  // Step A: Build Adjacency List
  const adjList = {};
  for (const nodeKey of Object.keys(NODES)) {
    adjList[nodeKey] = [];
  }

  for (const road of ROADS) {
    const costMultiplier = road.isHeavy ? HEAVY_COST_MULTIPLIER : 1.0;
    const effectiveWeight = road.distance * costMultiplier;

    adjList[road.u].push({
      neighbor: road.v,
      distance: road.distance,
      effectiveWeight: effectiveWeight,
      isHeavy: road.isHeavy,
      roadId: road.id
    });

    adjList[road.v].push({
      neighbor: road.u,
      distance: road.distance,
      effectiveWeight: effectiveWeight,
      isHeavy: road.isHeavy,
      roadId: road.id
    });
  }

  // Step B: Initialize tentative distances, visited set, and predecessor pointers
  const dist = {};
  const parent = {};
  const visited = {};
  const traceLog = [];
  const visitedOrder = [];

  for (const nodeKey of Object.keys(NODES)) {
    dist[nodeKey] = Infinity;
    parent[nodeKey] = null;
    visited[nodeKey] = false;
  }

  dist[start] = 0;
  let stepCounter = 1;

  // Step C: Greedy Selection & Edge Relaxation Loop
  while (true) {
    let minNode = null;
    let minDistance = Infinity;

    for (const nodeKey of Object.keys(NODES)) {
      if (!visited[nodeKey] && dist[nodeKey] < minDistance) {
        minDistance = dist[nodeKey];
        minNode = nodeKey;
      }
    }

    if (minNode === null || minDistance === Infinity) {
      break;
    }

    visited[minNode] = true;
    visitedOrder.push(minNode);

    const stepInfo = {
      step: stepCounter++,
      selectedNode: minNode,
      neighborsChecked: [],
      relaxationDetails: [],
      settledSet: [...visitedOrder]
    };

    if (minNode === destination) {
      traceLog.push(stepInfo);
      break;
    }

    for (const edge of adjList[minNode]) {
      const neighbor = edge.neighbor;
      stepInfo.neighborsChecked.push(neighbor);

      if (!visited[neighbor]) {
        const tentativeDist = dist[minNode] + edge.effectiveWeight;

        if (tentativeDist < dist[neighbor]) {
          const oldDistStr = dist[neighbor] === Infinity ? "∞" : dist[neighbor].toFixed(1);
          dist[neighbor] = tentativeDist;
          parent[neighbor] = minNode;

          stepInfo.relaxationDetails.push(
            `Relaxed ${neighbor}: ${oldDistStr} ➔ ${tentativeDist.toFixed(1)} via ${minNode}`
          );
        } else {
          stepInfo.relaxationDetails.push(
            `No update for ${neighbor} (kept ${dist[neighbor].toFixed(1)})`
          );
        }
      } else {
        stepInfo.relaxationDetails.push(`${neighbor} already settled`);
      }
    }

    traceLog.push(stepInfo);
  }

  // Step D: Reconstruct the complete path by backtracking parent pointers
  const path = [];
  let curr = destination;

  if (dist[destination] !== Infinity) {
    while (curr !== null) {
      path.unshift(curr);
      curr = parent[curr];
    }
  }

  // Step E: Compute physical road distance and estimated travel time along path
  let totalPhysicalDistance = 0;
  let totalTimeHours = 0;
  const pathLegs = [];

  if (path.length > 1) {
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const road = ROADS.find(r => (r.u === u && r.v === v) || (r.u === v && r.v === u));

      if (road) {
        totalPhysicalDistance += road.distance;
        const speed = road.isHeavy ? SPEED_HEAVY_KMH : SPEED_NORMAL_KMH;
        totalTimeHours += (road.distance / speed);
        pathLegs.push({
          from: u,
          to: v,
          distance: road.distance,
          isHeavy: road.isHeavy
        });
      }
    }
  }

  const travelTimeMinutes = totalTimeHours * 60;

  return {
    path,
    pathLegs,
    totalDistance: totalPhysicalDistance,
    effectiveCost: dist[destination] === Infinity ? null : dist[destination],
    travelTimeMins: travelTimeMinutes,
    visitedOrder,
    traceLog,
    isReachable: path.length > 0 && path[0] === start
  };
}

// -----------------------------------------------------------------------------
// 3. SVG GRAPH RENDERING (STABLE LABELS & HIGH-VISIBILITY ROUTE)
// -----------------------------------------------------------------------------

function renderGraph() {
  const roadLinesLayer = document.getElementById("roadLinesLayer");
  const shortestPathLayer = document.getElementById("shortestPathLayer");
  const roadLabelsLayer = document.getElementById("roadLabelsLayer");
  const nodesLayer = document.getElementById("nodesLayer");

  roadLinesLayer.innerHTML = "";
  shortestPathLayer.innerHTML = "";
  roadLabelsLayer.innerHTML = "";
  nodesLayer.innerHTML = "";

  // 1. Draw Roads (Lines)
  for (const road of ROADS) {
    const nodeU = NODES[road.u];
    const nodeV = NODES[road.v];

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", nodeU.x);
    line.setAttribute("y1", nodeU.y);
    line.setAttribute("x2", nodeV.x);
    line.setAttribute("y2", nodeV.y);
    line.setAttribute("id", `road-line-${road.id}`);
    line.setAttribute("class", `road-line ${road.isHeavy ? "traffic-heavy" : ""}`);
    line.addEventListener("click", () => toggleRoadTraffic(road.id));

    roadLinesLayer.appendChild(line);

    // 2. Draw Stable Distance Badge (Fixed coordinates, NO shaking on hover)
    const midX = (nodeU.x + nodeV.x) / 2;
    const midY = (nodeU.y + nodeV.y) / 2;

    const badgeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    badgeGroup.setAttribute("class", "road-badge-group");
    badgeGroup.setAttribute("transform", `translate(${midX}, ${midY})`);
    badgeGroup.setAttribute("id", `road-badge-${road.id}`);
    badgeGroup.addEventListener("click", () => toggleRoadTraffic(road.id));

    const badgeWidth = road.isHeavy ? 68 : 46;
    const badgeHeight = 20;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", -badgeWidth / 2);
    rect.setAttribute("y", -badgeHeight / 2);
    rect.setAttribute("width", badgeWidth);
    rect.setAttribute("height", badgeHeight);
    rect.setAttribute("class", `road-badge-bg ${road.isHeavy ? "heavy" : ""}`);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", 0);
    text.setAttribute("y", 0);
    text.setAttribute("class", `road-badge-text ${road.isHeavy ? "heavy" : ""}`);
    text.textContent = road.isHeavy ? `${road.distance}k JAM` : `${road.distance} km`;

    badgeGroup.appendChild(rect);
    badgeGroup.appendChild(text);
    roadLabelsLayer.appendChild(badgeGroup);
  }

  // 3. Draw Nodes (Circles and Labels)
  for (const [nodeId, data] of Object.entries(NODES)) {
    const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    nodeGroup.setAttribute("class", "node-group");
    nodeGroup.setAttribute("id", `node-${nodeId}`);
    nodeGroup.setAttribute("transform", `translate(${data.x}, ${data.y})`);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("r", 20);
    circle.setAttribute("class", "node-circle-outer");

    const letterText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    letterText.setAttribute("class", "node-text-letter");
    letterText.textContent = nodeId;

    const landmarkText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    landmarkText.setAttribute("y", 34);
    landmarkText.setAttribute("class", "node-text-label");
    landmarkText.textContent = data.label;

    nodeGroup.appendChild(circle);
    nodeGroup.appendChild(letterText);
    nodeGroup.appendChild(landmarkText);

    nodeGroup.addEventListener("click", () => handleNodeClick(nodeId));
    nodesLayer.appendChild(nodeGroup);
  }

  updateNodeStatusClasses();
}

/**
 * Highlights the complete shortest route clearly on the SVG graph.
 * Uses a dual-line stroke (glow + solid core) so the full path is 100% visible
 * across all browsers without clipping.
 */
function highlightPath(path) {
  const shortestPathLayer = document.getElementById("shortestPathLayer");
  shortestPathLayer.innerHTML = "";

  document.querySelectorAll(".node-group").forEach(el => {
    el.classList.remove("is-on-path");
  });

  if (!path || path.length < 2) return;

  // Draw full bright glowing emerald path overlays for every road segment
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];

    const nodeU = NODES[u];
    const nodeV = NODES[v];

    // 1. Wide glowing halo line underneath
    const glowLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    glowLine.setAttribute("x1", nodeU.x);
    glowLine.setAttribute("y1", nodeU.y);
    glowLine.setAttribute("x2", nodeV.x);
    glowLine.setAttribute("y2", nodeV.y);
    glowLine.setAttribute("class", "route-glow-line");
    shortestPathLayer.appendChild(glowLine);

    // 2. Crisp solid neon green core line on top
    const coreLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    coreLine.setAttribute("x1", nodeU.x);
    coreLine.setAttribute("y1", nodeU.y);
    coreLine.setAttribute("x2", nodeV.x);
    coreLine.setAttribute("y2", nodeV.y);
    coreLine.setAttribute("class", "route-core-line");
    shortestPathLayer.appendChild(coreLine);
  }

  // Highlight all nodes participating in the route
  for (const nodeId of path) {
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (nodeEl) nodeEl.classList.add("is-on-path");
  }

  updateNodeStatusClasses();
}

function updateNodeStatusClasses() {
  document.querySelectorAll(".node-group").forEach(el => {
    el.classList.remove("is-source", "is-dest");
  });

  const startEl = document.getElementById(`node-${currentStartNode}`);
  const destEl = document.getElementById(`node-${currentDestNode}`);

  if (startEl) startEl.classList.add("is-source");
  if (destEl) destEl.classList.add("is-dest");
}

// -----------------------------------------------------------------------------
// 4. TRAFFIC MANAGER LIST (SIDEBAR)
// -----------------------------------------------------------------------------

function renderTrafficManagerList() {
  const trafficList = document.getElementById("trafficList");
  trafficList.innerHTML = "";

  let heavyCount = 0;

  for (const road of ROADS) {
    if (road.isHeavy) heavyCount++;

    const item = document.createElement("div");
    item.className = `traffic-item ${road.isHeavy ? "is-heavy" : ""}`;

    item.innerHTML = `
      <div class="traffic-edge-info">
        <span class="traffic-edge-name">Road ${road.u} &harr; ${road.v}</span>
        <span class="traffic-edge-meta">${road.distance} km &bull; ${road.isHeavy ? "Heavy (20 km/h)" : "Normal (50 km/h)"}</span>
      </div>
      <label class="switch" title="Toggle Normal / Heavy Traffic">
        <input type="checkbox" id="toggle-${road.id}" ${road.isHeavy ? "checked" : ""}>
        <span class="slider"></span>
      </label>
    `;

    const checkbox = item.querySelector(`#toggle-${road.id}`);
    checkbox.addEventListener("change", (e) => {
      setRoadTraffic(road.id, e.target.checked);
    });

    trafficList.appendChild(item);
  }

  const heavyCountBadge = document.getElementById("heavyCountBadge");
  heavyCountBadge.textContent = `${heavyCount} Heavy Road${heavyCount !== 1 ? 's' : ''}`;
}

function toggleRoadTraffic(roadId) {
  const road = ROADS.find(r => r.id === roadId);
  if (road) {
    setRoadTraffic(roadId, !road.isHeavy);
  }
}

function setRoadTraffic(roadId, isHeavy) {
  const road = ROADS.find(r => r.id === roadId);
  if (road) {
    road.isHeavy = isHeavy;
    renderGraph();
    renderTrafficManagerList();

    // Always immediately re-compute and fully highlight the new shortest route
    executeRouteSearch();
  }
}

// -----------------------------------------------------------------------------
// 5. ROUTE EXECUTION & RESULTS PRESENTATION
// -----------------------------------------------------------------------------

function executeRouteSearch() {
  const startSelect = document.getElementById("startNode");
  const destSelect = document.getElementById("destNode");
  const alertBox = document.getElementById("validationAlert");

  currentStartNode = startSelect.value;
  currentDestNode = destSelect.value;

  if (currentStartNode === currentDestNode) {
    alertBox.style.display = "block";
    resetResultsDisplay();
    return;
  } else {
    alertBox.style.display = "none";
  }

  updateNodeStatusClasses();

  const result = dijkstra(currentStartNode, currentDestNode);
  currentPath = result.path;

  updateResultsUI(result);
  highlightPath(result.path);
}

function updateResultsUI(result) {
  const routeSummaryHops = document.getElementById("routeSummaryHops");
  const routeChainContainer = document.getElementById("routeChainContainer");
  const totalDistanceDisplay = document.getElementById("totalDistanceDisplay");
  const effectiveCostDisplay = document.getElementById("effectiveCostDisplay");
  const travelTimeDisplay = document.getElementById("travelTimeDisplay");
  const trafficDelayDisplay = document.getElementById("trafficDelayDisplay");
  const visitedNodesDisplay = document.getElementById("visitedNodesDisplay");
  const resultStatusBadge = document.getElementById("resultStatusBadge");

  if (!result.isReachable) {
    resultStatusBadge.className = "badge-status status-error";
    resultStatusBadge.textContent = "No Path Found";
    routeSummaryHops.textContent = "Unreachable";
    routeChainContainer.innerHTML = `<span style="color:#ef4444; font-weight:600;">No connecting route found between Node ${currentStartNode} and Node ${currentDestNode}.</span>`;
    totalDistanceDisplay.innerHTML = `&infin; <span class="unit">km</span>`;
    effectiveCostDisplay.textContent = "Effective Cost: ∞";
    travelTimeDisplay.innerHTML = `-- <span class="unit">mins</span>`;
    trafficDelayDisplay.textContent = "No connecting route exists";
    visitedNodesDisplay.textContent = result.visitedOrder.join(", ") || "None";
    return;
  }

  resultStatusBadge.className = "badge-status status-success";
  resultStatusBadge.textContent = "Optimal Route Found";

  const hops = result.path.length - 1;
  routeSummaryHops.textContent = `${hops} Road Segment${hops !== 1 ? 's' : ''} (${result.path.length} Locations)`;

  // Render Visual Route Pathway Chain
  routeChainContainer.innerHTML = "";
  for (let i = 0; i < result.path.length; i++) {
    const node = result.path[i];
    const isStart = (i === 0);
    const isDest = (i === result.path.length - 1);

    const nodePill = document.createElement("div");
    nodePill.className = `route-node-pill ${isStart ? "is-start" : ""} ${isDest ? "is-dest" : ""}`;
    nodePill.innerHTML = `
      <span class="badge-letter">${node}</span>
      <span>${NODES[node].label}</span>
    `;
    routeChainContainer.appendChild(nodePill);

    // If not the last node, add arrow with distance leg
    if (i < result.path.length - 1) {
      const leg = result.pathLegs[i];
      const arrowDiv = document.createElement("div");
      arrowDiv.className = `route-leg-arrow ${leg && leg.isHeavy ? "is-heavy" : ""}`;
      arrowDiv.innerHTML = `
        <span>${leg ? leg.distance : ""} km</span>
        <span class="arrow-symbol">&rarr;</span>
      `;
      routeChainContainer.appendChild(arrowDiv);
    }
  }

  totalDistanceDisplay.innerHTML = `${result.totalDistance} <span class="unit">km</span>`;
  effectiveCostDisplay.textContent = `Effective Cost: ${result.effectiveCost.toFixed(1)} units`;
  travelTimeDisplay.innerHTML = `${result.travelTimeMins.toFixed(1)} <span class="unit">mins</span>`;

  const hasCongestion = result.pathLegs.some(l => l.isHeavy);
  trafficDelayDisplay.textContent = hasCongestion
    ? "⚠️ Delay factored in due to heavy traffic"
    : "✓ Free flowing route (50 km/h avg)";

  visitedNodesDisplay.textContent = result.visitedOrder.join(" ➔ ");
}

function resetResultsDisplay() {
  currentPath = [];
  highlightPath([]);
  document.getElementById("routeSummaryHops").textContent = "--";
  document.getElementById("routeChainContainer").innerHTML = `<span style="color:#94a3b8;">Select start & destination and click 'Find Shortest Route'.</span>`;
  document.getElementById("totalDistanceDisplay").innerHTML = `0 <span class="unit">km</span>`;
  document.getElementById("effectiveCostDisplay").textContent = "Effective Cost: --";
  document.getElementById("travelTimeDisplay").innerHTML = `0 <span class="unit">mins</span>`;
  document.getElementById("trafficDelayDisplay").textContent = "Simulated travel time";
  document.getElementById("visitedNodesDisplay").textContent = "--";
}

function handleNodeClick(nodeId) {
  const startSelect = document.getElementById("startNode");
  const destSelect = document.getElementById("destNode");

  if (nodeId !== currentStartNode) {
    destSelect.value = nodeId;
    currentDestNode = nodeId;
  } else {
    return;
  }

  executeRouteSearch();
}

// -----------------------------------------------------------------------------
// 6. PRESET PRESENTATION DEMOS
// -----------------------------------------------------------------------------

function loadPreset(scenarioKey) {
  ROADS.forEach(r => r.isHeavy = false);

  const startSelect = document.getElementById("startNode");
  const destSelect = document.getElementById("destNode");

  if (scenarioKey === "normal_A_to_H") {
    // Demo 1: Direct Highway via Center: A -> D -> H (17 km)
    startSelect.value = "A";
    destSelect.value = "H";
  } else if (scenarioKey === "heavy_traffic_reroute") {
    // Demo 2: Jam center roads A-D and D-H.
    // Dijkstra dynamically switches to North corridor: A -> B -> E -> G -> H (18 km)
    ROADS.find(r => r.id === "A-D").isHeavy = true;
    ROADS.find(r => r.id === "D-H").isHeavy = true;
    startSelect.value = "A";
    destSelect.value = "H";
  } else if (scenarioKey === "south_bypass") {
    // Demo 3: Jam North and Center. Dijkstra shifts to South bypass: A -> C -> F -> H (18 km)
    ROADS.find(r => r.id === "A-D").isHeavy = true;
    ROADS.find(r => r.id === "A-B").isHeavy = true;
    startSelect.value = "A";
    destSelect.value = "H";
  }

  currentStartNode = startSelect.value;
  currentDestNode = destSelect.value;

  renderGraph();
  renderTrafficManagerList();
  executeRouteSearch();
}

// -----------------------------------------------------------------------------
// 7. INITIALIZATION & EVENT LISTENERS
// -----------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  renderGraph();
  renderTrafficManagerList();

  document.getElementById("findRouteBtn").addEventListener("click", executeRouteSearch);

  document.getElementById("resetBtn").addEventListener("click", () => {
    ROADS.forEach(r => r.isHeavy = false);
    document.getElementById("startNode").value = "A";
    document.getElementById("destNode").value = "H";
    currentStartNode = "A";
    currentDestNode = "H";
    renderGraph();
    renderTrafficManagerList();
    executeRouteSearch();
  });

  document.getElementById("clearTrafficBtn").addEventListener("click", () => {
    ROADS.forEach(r => r.isHeavy = false);
    renderGraph();
    renderTrafficManagerList();
    executeRouteSearch();
  });

  document.getElementById("setAllHeavyBtn").addEventListener("click", () => {
    ROADS.find(r => r.id === "A-D").isHeavy = true;
    ROADS.find(r => r.id === "D-H").isHeavy = true;
    renderGraph();
    renderTrafficManagerList();
    executeRouteSearch();
  });

  document.getElementById("startNode").addEventListener("change", (e) => {
    currentStartNode = e.target.value;
    updateNodeStatusClasses();
    executeRouteSearch();
  });

  document.getElementById("destNode").addEventListener("change", (e) => {
    currentDestNode = e.target.value;
    updateNodeStatusClasses();
    executeRouteSearch();
  });

  // Run initial route calculation
  executeRouteSearch();
});
