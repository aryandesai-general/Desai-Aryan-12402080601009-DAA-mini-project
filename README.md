# Traffic Shortest Path Finder Using Dijkstra's Algorithm
### Design and Analysis of Algorithms (DAA) Laboratory Project

A modern, interactive, and zero-dependency web application demonstrating **Dijkstra's Shortest Path Algorithm** applied to dynamic urban traffic routing.

---

## 1. Project Overview & Problem Statement

### Problem Statement
In urban road networks, commuters face unpredictable congestion, road closures, and traffic spikes. Traditional static shortest-path navigation fails because the geographically shortest route is not always the fastest.

Given a weighted road network represented as a graph $G = (V, E)$, where:
- $V$ is a set of intersections / key landmarks (Nodes **A** through **F**).
- $E$ is a set of bidirectional roads with physical length $d_{uv}$ in kilometers.
- Each edge has a dynamic traffic condition multiplier $T_{uv}$ ($1.0\times$ for normal flow, $2.5\times$ for heavy congestion).

The objective is to find the optimal path from any given source node $S$ to destination node $D$ that minimizes total effective impedance, and dynamically reroute traffic in real time when congestion occurs.

---

## 2. Technology Stack

- **Frontend Structure:** HTML5 (Semantic & Accessible)
- **Styling:** Modern CSS3 (CSS Grid, Flexbox, Custom Properties, Dark-Blue Glassmorphism UI)
- **Algorithm & Logic:** Pure Vanilla JavaScript (ES6+, written completely from scratch)
- **Visualization:** Scalable Vector Graphics (SVG) with dynamic glowing paths and interactive toggles
- **Dependencies:** **Zero external libraries, no database, no backend server, and no npm installation required.** Runs directly in any modern web browser.

---

## 3. How to Run the Project

1. Open your Desktop folder:
   ```bash
   cd ~/Desktop/Traffic-Shortest-Path-Finder
   ```
2. Simply double-click **`index.html`** or right-click and open with **Google Chrome**, **Safari**, or **Microsoft Edge**.
3. That's it! The application loads instantly with pre-loaded demo routes.

---

## 4. Graph Network Topology

The project models a 6-node city layout:

| Node | Landmark Label | Position (X, Y) | Connected To |
|:---:|:---|:---:|:---|
| **A** | Central Station | (90, 220) | B (4 km), C (6 km) |
| **B** | Tech Park | (250, 100) | A (4 km), C (3 km), D (4 km), E (7 km) |
| **C** | South Market | (250, 340) | A (6 km), B (3 km), E (5 km) |
| **D** | University | (490, 100) | B (4 km), E (2 km), F (5 km) |
| **E** | Medical City | (490, 340) | B (7 km), C (5 km), D (2 km), F (4 km) |
| **F** | Airport Hub | (650, 220) | D (5 km), E (4 km) |

Total: **$V = 6$ vertices**, **$E = 9$ bidirectional edges**.

---

## 5. Sample Demonstrations (For College Presentation)

### Demonstration 1: Normal Traffic Flow (A ➔ F)
- **Source:** Node A (Central Station)
- **Destination:** Node F (Airport Hub)
- **Traffic Condition:** All roads clear (Normal)
- **Algorithm Execution:**
  - Evaluates Route 1: $A \to B \to D \to F = 4 + 4 + 5 = \mathbf{13\text{ km}}$
  - Evaluates Route 2: $A \to C \to E \to F = 6 + 5 + 4 = 15\text{ km}$
  - Evaluates Route 3: $A \to B \to D \to E \to F = 4 + 4 + 2 + 4 = 14\text{ km}$
- **Result:**
  - **Shortest Route:** `A ➔ B ➔ D ➔ F`
  - **Total Distance:** $13\text{ km}$
  - **Estimated Travel Time:** $15.6\text{ minutes}$ (at average 50 km/h)

---

### Demonstration 2: Rush-Hour Congestion & Dynamic Rerouting (A ➔ F)
- **Source:** Node A (Central Station)
- **Destination:** Node F (Airport Hub)
- **Traffic Simulation:** Toggle road `A-B` and `B-D` to **Heavy Traffic**.
  - Road `A-B` effective cost: $4 \times 2.5 = 10.0$ units.
  - Road `B-D` effective cost: $4 \times 2.5 = 10.0$ units.
  - Northern Route $(A \to B \to D \to F)$ cost jumps to $10.0 + 10.0 + 5.0 = \mathbf{25.0\text{ units}}$.
- **Dynamic Recalculation:**
  - Southern Route $(A \to C \to E \to F)$ cost remains $6.0 + 5.0 + 4.0 = \mathbf{15.0\text{ units}}$.
- **Result:**
  - **Shortest Route Automatically Switches to:** `A ➔ C ➔ E ➔ F`
  - **Total Physical Distance:** $15\text{ km}$
  - **Travel Time:** $18.0\text{ minutes}$ (avoiding severe congestion delays)
  - **Demonstration Takeaway:** Proves how Dijkstra's algorithm dynamically selects an alternative path with greater physical distance but significantly lower travel impedance!

---

## 6. Algorithm Steps & Complexity Analysis

### Dijkstra's Algorithm Steps
1. **Initialization:**
   - Set tentative distance $\text{dist}[source] = 0$.
   - Set $\text{dist}[v] = \infty$ for all other vertices $v \in V \setminus \{source\}$.
   - Set $\text{visited}[v] = \text{false}$ for all $v$.
2. **Greedy Node Selection:**
   - Select the unvisited node $u$ with the minimum tentative distance $\text{dist}[u]$.
3. **Edge Relaxation:**
   - For every unvisited neighbor $v$ of $u$:
   $$\text{tentative} = \text{dist}[u] + \text{weight}(u, v)$$
   - If $\text{tentative} < \text{dist}[v]$:
     - $\text{dist}[v] \leftarrow \text{tentative}$
     - $\text{parent}[v] \leftarrow u$
4. **Finalization:**
   - Mark $u$ as visited.
   - Terminate when target node is reached or all reachable nodes are settled.
   - Reconstruct the path by backtracking from destination to source via $\text{parent}$ pointers.

### Time & Space Complexity

| Metric | Adjacency List + Min-Heap | Simple Array / Matrix | Our Web Project ($V=6, E=9$) |
|:---|:---:|:---:|:---:|
| **Time Complexity** | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(V^2)$ | $< 1\text{ ms}$ (Real-time) |
| **Space Complexity** | $\mathcal{O}(V + E)$ | $\mathcal{O}(V^2)$ | $\mathcal{O}(V + E)$ (Adjacency List) |

---

## 7. College Viva Questions & High-Scoring Answers

### Q1: Why is Dijkstra's algorithm classified as a Greedy algorithm?
**Answer:** At every step, Dijkstra makes the locally optimal choice by picking the unvisited node with the smallest tentative distance, without considering future paths. Because all edge weights are non-negative, this locally optimal choice is mathematically proven to produce the globally optimal shortest path.

### Q2: Why does Dijkstra fail when negative edge weights are present? What should be used instead?
**Answer:** Once Dijkstra marks a node as visited, it assumes its shortest distance is finalized and never re-visits it. A negative edge encountered later could lower an already settled distance, violating Dijkstra's greedy invariant. For graphs with negative weights or negative cycles, the **Bellman-Ford Algorithm** ($\mathcal{O}(V \times E)$) must be used.

### Q3: How is traffic congestion represented in this project?
**Answer:** Each road edge stores a physical distance $d$ and a boolean traffic status. Normal traffic uses an impedance multiplier of $1.0\times$. When heavy congestion is marked, the edge relaxation cost becomes $\text{Effective Weight} = d \times 2.5$. The algorithm runs on these effective weights, while the UI displays both physical distance (km) and estimated travel time ($t = d / v$).

### Q4: What data structure is optimal for Dijkstra on large road networks?
**Answer:** Real-world road networks are **sparse graphs** where each junction connects to only 3 to 4 roads ($E \approx 3V$ to $4V$). Using an **Adjacency List** and a **Binary Min-Heap / Priority Queue** yields $\mathcal{O}((V + E) \log V)$ time complexity, which is vastly superior to the $\mathcal{O}(V^2)$ linear array implementation.

### Q5: How does Dijkstra differ from Breadth-First Search (BFS)?
**Answer:** BFS finds shortest paths exclusively on **unweighted graphs** (where every edge cost is 1) using a standard FIFO queue in $\mathcal{O}(V + E)$ time. Dijkstra's algorithm generalizes BFS to **weighted graphs** with non-negative weights by substituting the FIFO queue with a Priority Queue sorted by accumulated distance.
