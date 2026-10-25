#!/usr/bin/env python3
"""
Traffic Shortest Path Finder - Interactive Terminal Engine
DAA College Project: Dijkstra's Algorithm (8 Nodes, 14 Roads)
"""

import sys

V = 8
INF = float('inf')

NODE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
NODE_NAMES = [
    "Central Terminus",          # 0: A
    "North Tech Hub",           # 1: B
    "South Market",             # 2: C
    "City Center",              # 3: D
    "Industrial Zone",          # 4: E
    "Metro Plaza",              # 5: F
    "University & Medical Hub", # 6: G
    "Airport Terminal"          # 7: H
]

ROADS = [
    {"id": 1,  "u": 0, "v": 1, "dist": 5.0, "isHeavy": False},
    {"id": 2,  "u": 0, "v": 2, "dist": 6.0, "isHeavy": False},
    {"id": 3,  "u": 0, "v": 3, "dist": 8.0, "isHeavy": False},
    {"id": 4,  "u": 1, "v": 4, "dist": 4.0, "isHeavy": False},
    {"id": 5,  "u": 1, "v": 3, "dist": 4.0, "isHeavy": False},
    {"id": 6,  "u": 2, "v": 3, "dist": 4.0, "isHeavy": False},
    {"id": 7,  "u": 2, "v": 5, "dist": 4.0, "isHeavy": False},
    {"id": 8,  "u": 3, "v": 4, "dist": 3.0, "isHeavy": False},
    {"id": 9,  "u": 3, "v": 5, "dist": 3.0, "isHeavy": False},
    {"id": 10, "u": 4, "v": 6, "dist": 4.0, "isHeavy": False},
    {"id": 11, "u": 3, "v": 6, "dist": 6.0, "isHeavy": False},
    {"id": 12, "u": 5, "v": 7, "dist": 8.0, "isHeavy": False},
    {"id": 13, "u": 6, "v": 7, "dist": 5.0, "isHeavy": False},
    {"id": 14, "u": 3, "v": 7, "dist": 9.0, "isHeavy": False}
]

def get_cost(road):
    return road["dist"] * (2.5 if road["isHeavy"] else 1.0)

def dijkstra(src, dest):
    if src == dest:
        print("\n[!] Error: Starting point and destination cannot be identical.\n")
        return

    # Build cost matrix
    cost_matrix = [[INF]*V for _ in range(V)]
    for i in range(V):
        cost_matrix[i][i] = 0.0

    for r in ROADS:
        cost = get_cost(r)
        cost_matrix[r["u"]][r["v"]] = cost
        cost_matrix[r["v"]][r["u"]] = cost

    dist = [INF] * V
    parent = [-1] * V
    visited = [False] * V

    dist[src] = 0.0

    print("\n" + "="*70)
    print("   DIJKSTRA'S ALGORITHM EXECUTION TRACE (8 NODES)")
    print("="*70)
    print(f"{'Step':<6} {'Settled Node':<20} {'Neighbors Relaxed':<24} {'Status':<16}")
    print("-" * 70)

    step = 1
    for _ in range(V):
        u = -1
        min_d = INF
        for i in range(V):
            if not visited[i] and dist[i] < min_d:
                min_d = dist[i]
                u = i

        if u == -1 or min_d == INF:
            break

        visited[u] = True
        node_desc = f"{NODE_LETTERS[u]} ({NODE_NAMES[u]})"

        if u == dest:
            print(f"{step:<6} {node_desc:<20} {'--':<24} {'Target Reached':<16}")
            break

        relaxed_str = []
        for v in range(V):
            if not visited[v] and cost_matrix[u][v] < INF:
                new_d = dist[u] + cost_matrix[u][v]
                if new_d < dist[v]:
                    dist[v] = new_d
                    parent[v] = u
                    relaxed_str.append(f"{NODE_LETTERS[v]}:{dist[v]:.0f}")

        relaxed_display = " ".join(relaxed_str) if relaxed_str else "No updates"
        print(f"{step:<6} {node_desc:<20} {relaxed_display:<24} {'Settled':<16}")
        step += 1

    print("=" * 70)

    if dist[dest] == INF:
        print(f"\n[X] Destination {NODE_LETTERS[dest]} is unreachable from {NODE_LETTERS[src]}.\n")
        return

    # Backtrack path
    path = []
    curr = dest
    while curr != -1:
        path.append(curr)
        curr = parent[curr]
    path.reverse()

    # Calculate distance and travel time
    total_dist = 0.0
    total_time_h = 0.0
    has_heavy = False

    for i in range(len(path) - 1):
        u_node = path[i]
        v_node = path[i + 1]
        for r in ROADS:
            if (r["u"] == u_node and r["v"] == v_node) or (r["u"] == v_node and r["v"] == u_node):
                total_dist += r["dist"]
                if r["isHeavy"]:
                    has_heavy = True
                spd = 20.0 if r["isHeavy"] else 50.0
                total_time_h += (r["dist"] / spd)
                break

    time_mins = total_time_h * 60.0

    print("\n==================== FULL OPTIMAL ROUTE BREAKDOWN ====================")
    route_chain = "  ==>  ".join([f"[{NODE_LETTERS[n]}: {NODE_NAMES[n]}]" for n in path])
    print(f"Shortest Route:  {route_chain}\n")
    print(f"Total Physical Distance:    {total_dist:.1f} km")
    print(f"Effective Algorithmic Cost: {dist[dest]:.1f} units")
    print(f"Estimated Travel Time:      {time_mins:.1f} minutes")
    status_msg = "[!] Caution: Congested segments present" if has_heavy else "[OK] Free flowing (50 km/h avg)"
    print(f"Traffic Condition on Path:  {status_msg}")
    print("======================================================================\n")

def display_network():
    print("\n======================== CURRENT ROAD NETWORK =========================")
    print(f"{'ID':<4} {'Road Link':<16} {'Distance':<12} {'Traffic Status':<18} {'Effective Cost':<14}")
    print("-" * 71)
    for r in ROADS:
        link = f"{NODE_LETTERS[r['u']]} <--> {NODE_LETTERS[r['v']]}"
        status = "HEAVY JAM (2.5x)" if r["isHeavy"] else "Normal (1.0x)"
        print(f"{r['id']:<4} {link:<16} {r['dist']:<12.1f} {status:<18} {get_cost(r):<14.1f}")
    print("=" * 71)

def toggle_traffic():
    display_network()
    try:
        val = int(input("Enter Road ID (1 - 14) to toggle traffic (0 to cancel): "))
        if 1 <= val <= len(ROADS):
            ROADS[val - 1]["isHeavy"] = not ROADS[val - 1]["isHeavy"]
            state = "HEAVY TRAFFIC (Congested)" if ROADS[val - 1]["isHeavy"] else "NORMAL TRAFFIC (Clear)"
            print(f"[✓] Road {val} ({NODE_LETTERS[ROADS[val-1]['u']]} <--> {NODE_LETTERS[ROADS[val-1]['v']]}) is now {state}.")
        else:
            print("Action cancelled.")
    except ValueError:
        print("Invalid input.")

def main():
    while True:
        print("\n=======================================================")
        print("   TRAFFIC SHORTEST PATH FINDER (DIJKSTRA IN TERMINAL)  ")
        print("   DAA College Laboratory - 8 Node Road Network Engine  ")
        print("=======================================================")
        print(" 1. Find Shortest Route (Choose Custom Start & End)")
        print(" 2. Toggle Road Traffic (Normal <--> Heavy)")
        print(" 3. Run Preset Demo 1: Direct Highway (A to H)")
        print(" 4. Run Preset Demo 2: Rush-Hour Dynamic Reroute (A to H)")
        print(" 5. View Road Network Table & Traffic Status")
        print(" 6. Exit")
        print("-------------------------------------------------------")
        try:
            choice = input(" Enter Choice (1-6): ").strip()
            if choice == "1":
                print("\nAvailable Locations: A, B, C, D, E, F, G, H")
                s_char = input("Enter Starting Location (A-H): ").strip().upper()
                d_char = input("Enter Destination Location (A-H): ").strip().upper()
                if s_char in NODE_LETTERS and d_char in NODE_LETTERS:
                    dijkstra(NODE_LETTERS.index(s_char), NODE_LETTERS.index(d_char))
                else:
                    print("[!] Invalid locations entered.")
            elif choice == "2":
                toggle_traffic()
            elif choice == "3":
                for r in ROADS: r["isHeavy"] = False
                print("\n>>> DEMO 1: Clear Roads from Central Terminus A to Airport H <<<")
                dijkstra(0, 7)
            elif choice == "4":
                for r in ROADS: r["isHeavy"] = False
                ROADS[2]["isHeavy"] = True  # A-D heavy
                ROADS[13]["isHeavy"] = True # D-H heavy
                print("\n>>> DEMO 2: Rush Hour Congestion on Center Arterials (A-D & D-H) <<<")
                print("Watch Dijkstra dynamically reroute through the North Highway (A -> B -> E -> G -> H)!")
                dijkstra(0, 7)
            elif choice == "5":
                display_network()
            elif choice == "6":
                print("\nExiting. Best of luck with your DAA presentation!\n")
                break
            else:
                print("[!] Invalid choice. Enter 1 to 6.")
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break

if __name__ == "__main__":
    main()
