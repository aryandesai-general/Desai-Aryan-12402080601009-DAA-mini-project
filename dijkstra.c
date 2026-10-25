/**
 * ============================================================================
 * Project Title: Traffic Shortest Path Finder Using Dijkstra's Algorithm
 * Subject: Design and Analysis of Algorithms (DAA) College Laboratory
 * Language: Pure C (C99 Standard)
 *
 * Network: 8 City Locations (A through H) with 14 Interconnecting Roads
 *
 * How to Compile & Run:
 *   gcc dijkstra.c -o dijkstra
 *   ./dijkstra
 * ============================================================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <ctype.h>

#define V 8             // Total number of vertices (A, B, C, D, E, F, G, H)
#define NUM_ROADS 14    // Total number of roads (Edges)
#define INF 999999.0    // Representation of Infinity for unreachable nodes

// -----------------------------------------------------------------------------
// 1. DATA STRUCTURES & DEFINITIONS
// -----------------------------------------------------------------------------

const char NODE_LETTERS[V] = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'};

const char* NODE_NAMES[V] = {
    "Central Terminus",          // 0: A
    "North Tech Hub",           // 1: B
    "South Market",             // 2: C
    "City Center",              // 3: D
    "Industrial Zone",          // 4: E
    "Metro Plaza",              // 5: F
    "University & Medical Hub", // 6: G
    "Airport Terminal"          // 7: H
};

typedef struct {
    int id;
    int u;
    int v;
    double distance;
    bool isHeavy;
} Road;

Road roads[NUM_ROADS] = {
    {1,  0, 1, 5.0, false}, // A - B (5 km)
    {2,  0, 2, 6.0, false}, // A - C (6 km)
    {3,  0, 3, 8.0, false}, // A - D (8 km)
    {4,  1, 4, 4.0, false}, // B - E (4 km)
    {5,  1, 3, 4.0, false}, // B - D (4 km)
    {6,  2, 3, 4.0, false}, // C - D (4 km)
    {7,  2, 5, 4.0, false}, // C - F (4 km)
    {8,  3, 4, 3.0, false}, // D - E (3 km)
    {9,  3, 5, 3.0, false}, // D - F (3 km)
    {10, 4, 6, 4.0, false}, // E - G (4 km)
    {11, 3, 6, 6.0, false}, // D - G (6 km)
    {12, 5, 7, 8.0, false}, // F - H (8 km)
    {13, 6, 7, 5.0, false}, // G - H (5 km)
    {14, 3, 7, 9.0, false}  // D - H (9 km)
};

double getEffectiveCost(Road r) {
    return r.distance * (r.isHeavy ? 2.5 : 1.0);
}

// -----------------------------------------------------------------------------
// 2. DIJKSTRA'S ALGORITHM IMPLEMENTATION IN PURE C
// -----------------------------------------------------------------------------

void dijkstra(int src, int dest) {
    if (src == dest) {
        printf("\n[!] Error: Starting point and destination cannot be identical.\n");
        return;
    }

    // Step A: Build Adjacency Cost Matrix
    double costMatrix[V][V];
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            costMatrix[i][j] = (i == j) ? 0.0 : INF;
        }
    }

    for (int i = 0; i < NUM_ROADS; i++) {
        double cost = getEffectiveCost(roads[i]);
        costMatrix[roads[i].u][roads[i].v] = cost;
        costMatrix[roads[i].v][roads[i].u] = cost; // Undirected road network
    }

    // Step B: Initialize Algorithm Arrays
    double dist[V];
    int parent[V];
    bool visited[V];

    for (int i = 0; i < V; i++) {
        dist[i] = INF;
        parent[i] = -1;
        visited[i] = false;
    }

    dist[src] = 0.0;

    printf("\n======================================================================\n");
    printf("   DIJKSTRA'S ALGORITHM EXECUTION TRACE TABLE (8 NODES)\n");
    printf("======================================================================\n");
    printf("%-6s %-20s %-22s %-16s\n", "Step", "Settled Node", "Neighbors Relaxed", "Status");
    printf("----------------------------------------------------------------------\n");

    int step = 1;

    // Step C: Greedy Selection & Edge Relaxation Loop
    for (int count = 0; count < V; count++) {
        int u = -1;
        double minDistance = INF;

        // Greedy choice: pick unvisited node with lowest tentative distance
        for (int i = 0; i < V; i++) {
            if (!visited[i] && dist[i] < minDistance) {
                minDistance = dist[i];
                u = i;
            }
        }

        if (u == -1 || minDistance == INF) {
            break;
        }

        visited[u] = true;

        char nodeDesc[36];
        snprintf(nodeDesc, sizeof(nodeDesc), "%c (%s)", NODE_LETTERS[u], NODE_NAMES[u]);

        if (u == dest) {
            printf("%-6d %-20s %-22s %-16s\n", step++, nodeDesc, "--", "Destination Settled");
            break;
        }

        char updatesStr[64] = "";
        for (int v = 0; v < V; v++) {
            if (!visited[v] && costMatrix[u][v] < INF) {
                double newDistance = dist[u] + costMatrix[u][v];

                if (newDistance < dist[v]) {
                    dist[v] = newDistance;
                    parent[v] = u;

                    char buf[16];
                    snprintf(buf, sizeof(buf), "%c:%.0f ", NODE_LETTERS[v], dist[v]);
                    strncat(updatesStr, buf, sizeof(updatesStr) - strlen(updatesStr) - 1);
                }
            }
        }

        if (strlen(updatesStr) == 0) {
            strcpy(updatesStr, "No updates");
        }

        printf("%-6d %-20s %-22s %-16s\n", step++, nodeDesc, updatesStr, "Settled");
    }

    printf("======================================================================\n");

    if (dist[dest] == INF) {
        printf("\n[X] Destination %c is unreachable from %c.\n", NODE_LETTERS[dest], NODE_LETTERS[src]);
        return;
    }

    // Step D: Reconstruct Path
    int path[V];
    int pathLength = 0;
    for (int at = dest; at != -1; at = parent[at]) {
        path[pathLength++] = at;
    }

    // Step E: Compute physical road distance and travel time along path
    double totalPhysicalDist = 0.0;
    double totalTimeHours = 0.0;
    bool pathHasHeavyTraffic = false;

    for (int i = pathLength - 1; i > 0; i--) {
        int uNode = path[i];
        int vNode = path[i - 1];

        for (int r = 0; r < NUM_ROADS; r++) {
            if ((roads[r].u == uNode && roads[r].v == vNode) ||
                (roads[r].u == vNode && roads[r].v == uNode)) {
                totalPhysicalDist += roads[r].distance;
                if (roads[r].isHeavy) {
                    pathHasHeavyTraffic = true;
                }
                double speed = roads[r].isHeavy ? 20.0 : 50.0; // km/h
                totalTimeHours += (roads[r].distance / speed);
                break;
            }
        }
    }

    double travelTimeMinutes = totalTimeHours * 60.0;

    // Display Final Formatted Results
    printf("\n==================== FULL OPTIMAL ROUTE BREAKDOWN ====================\n");
    printf("Shortest Route:  ");
    for (int i = pathLength - 1; i >= 0; i--) {
        printf("[Node %c: %s]", NODE_LETTERS[path[i]], NODE_NAMES[path[i]]);
        if (i > 0) printf("  ==>  ");
    }
    printf("\n\n");
    printf("Total Physical Distance:    %.1f km\n", totalPhysicalDist);
    printf("Effective Algorithmic Cost: %.1f units\n", dist[dest]);
    printf("Estimated Travel Time:      %.1f minutes\n", travelTimeMinutes);
    printf("Traffic Condition on Path:  %s\n", 
           pathHasHeavyTraffic ? "[!] Caution: Congested segments present" : "[OK] Clear road conditions (50 km/h avg)");
    printf("======================================================================\n");
}

// -----------------------------------------------------------------------------
// 3. ROAD NETWORK DISPLAY & TRAFFIC TOGGLE
// -----------------------------------------------------------------------------

void displayNetwork() {
    printf("\n======================== CURRENT ROAD NETWORK =========================\n");
    printf("%-4s %-16s %-12s %-18s %-14s\n", "ID", "Road Link", "Distance", "Traffic Status", "Effective Cost");
    printf("-----------------------------------------------------------------------\n");
    for (int i = 0; i < NUM_ROADS; i++) {
        char link[20];
        snprintf(link, sizeof(link), "%c <--> %c", NODE_LETTERS[roads[i].u], NODE_LETTERS[roads[i].v]);
        printf("%-4d %-16s %-12.1f %-18s %-14.1f\n",
               roads[i].id,
               link,
               roads[i].distance,
               roads[i].isHeavy ? "HEAVY JAM (2.5x)" : "Normal (1.0x)",
               getEffectiveCost(roads[i]));
    }
    printf("=======================================================================\n");
}

void toggleTraffic() {
    displayNetwork();
    printf("Enter Road ID (1 - 14) to toggle traffic (0 to cancel): ");
    int id;
    if (scanf("%d", &id) == 1 && id >= 1 && id <= NUM_ROADS) {
        roads[id - 1].isHeavy = !roads[id - 1].isHeavy;
        printf("[✓] Road %d (%c <--> %c) is now %s.\n",
               id,
               NODE_LETTERS[roads[id - 1].u],
               NODE_LETTERS[roads[id - 1].v],
               roads[id - 1].isHeavy ? "HEAVY TRAFFIC (Congested)" : "NORMAL TRAFFIC (Clear)");
    } else {
        printf("Action cancelled.\n");
    }
}

// -----------------------------------------------------------------------------
// 4. PRESETS
// -----------------------------------------------------------------------------

void runPresetNormal() {
    for (int i = 0; i < NUM_ROADS; i++) roads[i].isHeavy = false;
    printf("\n>>> DEMO 1: Clear Roads from Central Terminus A to Airport H <<<\n");
    dijkstra(0, 7); // 0 = A, 7 = H
}

void runPresetCongestion() {
    for (int i = 0; i < NUM_ROADS; i++) roads[i].isHeavy = false;
    roads[2].isHeavy = true;  // Road 3 (A-D) heavy
    roads[13].isHeavy = true; // Road 14 (D-H) heavy
    printf("\n>>> DEMO 2: Rush Hour Congestion on Center Arterials (A-D & D-H) <<<\n");
    printf("Watch Dijkstra dynamically reroute through the North Highway (A -> B -> E -> G -> H)!\n");
    dijkstra(0, 7); // 0 = A, 7 = H
}

// -----------------------------------------------------------------------------
// 5. MAIN MENU
// -----------------------------------------------------------------------------

int main() {
    int choice;
    do {
        printf("\n=======================================================\n");
        printf("   TRAFFIC SHORTEST PATH FINDER (DIJKSTRA IN C)        \n");
        printf("   DAA College Laboratory - 8 Node Road Network Engine \n");
        printf("=======================================================\n");
        printf(" 1. Find Shortest Route (Choose Custom Start & End)\n");
        printf(" 2. Toggle Road Traffic (Normal <--> Heavy)\n");
        printf(" 3. Run Preset Demo 1: Direct Highway (A to H)\n");
        printf(" 4. Run Preset Demo 2: Rush-Hour Dynamic Reroute (A to H)\n");
        printf(" 5. View Road Network Table & Traffic Status\n");
        printf(" 6. Exit\n");
        printf("-------------------------------------------------------\n");
        printf(" Enter Choice (1-6): ");

        if (scanf("%d", &choice) != 1) {
            while (getchar() != '\n');
            choice = -1;
            continue;
        }

        switch (choice) {
            case 1: {
                char sChar, dChar;
                printf("\nAvailable Locations: A, B, C, D, E, F, G, H\n");
                printf("Enter Starting Location (A-H): ");
                scanf(" %c", &sChar);
                printf("Enter Destination Location (A-H): ");
                scanf(" %c", &dChar);

                sChar = toupper(sChar);
                dChar = toupper(dChar);

                int src = sChar - 'A';
                int dest = dChar - 'A';

                if (src >= 0 && src < V && dest >= 0 && dest < V) {
                    dijkstra(src, dest);
                } else {
                    printf("[!] Invalid locations entered. Please choose letters between A and H.\n");
                }
                break;
            }
            case 2:
                toggleTraffic();
                break;
            case 3:
                runPresetNormal();
                break;
            case 4:
                runPresetCongestion();
                break;
            case 5:
                displayNetwork();
                break;
            case 6:
                printf("\nExiting. Best of luck with your DAA presentation!\n");
                break;
            default:
                printf("[!] Invalid choice. Please enter a number from 1 to 6.\n");
        }
    } while (choice != 6);

    return 0;
}
