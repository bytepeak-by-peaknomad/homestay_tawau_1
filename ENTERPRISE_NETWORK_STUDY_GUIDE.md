# Enterprise Network Infrastructure Lab - Study Guide

This guide explains the lab in beginner-friendly language. Each part answers:

- **What:** What is the technology or design?
- **How:** How does it work, generally and in this lab?
- **Why:** Why is it needed?
- **Verify:** How can we prove it works?
- **Troubleshoot:** What usually breaks, and how do we locate the fault?

---

# Part 1: Physical Topology and Enterprise Hierarchy

## 1. What Is a Network Topology?

A network topology is a map showing:

- Which network devices exist.
- How the devices connect.
- Where users and servers connect.
- Which path traffic follows.
- Where security boundaries exist.

Our topology is not a random collection of switches and routers. Every device has a specific role.

A simplified view is:

```text
Internet
   |
  ISP
   |
R1-EDGE -------- WAN -------- R2-BRANCH
   |                              |
FW1-FIREWALL                  BRANCH-SW
   |                              |
Core Layer                   Branch devices
   |
Distribution Layer
   |
Access Layer
   |
Users and phones
```

The internal servers and DMZ connect through separate paths:

```text
CORE1 and CORE2
       |
   SERVER-SW
       |
Internal servers
```

```text
FW1-FIREWALL
       |
     DMZ-SW
       |
Public-facing servers
```

## 2. What Does "Physical" Mean?

The physical topology describes actual devices, interfaces, and cables.

For example:

```text
SW4-ACCESS Fa0/4 -> MGMT-PC01 FastEthernet0
```

This tells us:

- The switch is `SW4-ACCESS`.
- The switch port is `FastEthernet0/4`.
- The connected device is `MGMT-PC01`.
- The PC uses its `FastEthernet0` interface.

The physical connection does not, by itself, tell us the VLAN or IP address. Those are logical settings added later.

Compare:

```text
Physical fact: SW4 Fa0/4 connects to MGMT-PC01.
Logical fact:  SW4 Fa0/4 belongs to VLAN 99.
IP fact:       MGMT-PC01 uses 10.10.99.10/24.
```

These three facts work together, but they describe different layers.

## 3. Why Use a Hierarchical Design?

The headquarters uses three network layers:

```text
Core
Distribution
Access
```

This is called a hierarchical network design.

It divides a large network into smaller areas with clear responsibilities. This makes the network easier to expand, secure, troubleshoot, and maintain.

Think of a road system:

```text
Core layer         = major highways
Distribution layer = roads connecting districts
Access layer       = local streets reaching buildings
End devices        = houses and businesses
```

You would not normally connect every house directly to a national highway. Similarly, enterprise PCs normally connect to access switches, not directly to core switches.

## 4. The Access Layer

### What Is It?

The access layer is where endpoint devices enter the network.

Endpoints include:

- Desktop computers.
- Laptops.
- IP phones.
- Wireless access points.
- Printers.
- Servers, when connected to a dedicated server access switch.

Our user access switches are:

```text
SW1-ACCESS
SW2-ACCESS
SW3-ACCESS
SW4-ACCESS
```

### How Is It Used Here?

Each access switch serves a different physical office area.

```text
SW1-ACCESS
├── Staff PCs
└── IP phones
```

```text
SW2-ACCESS
├── Staff PCs
├── IT PC
└── IP phones
```

```text
SW3-ACCESS
├── Guest PCs
└── AP01 and WIFI-LAPTOP01
```

```text
SW4-ACCESS
├── IT PCs
└── MGMT-PC01
```

Every access switch has two uplinks:

```text
Access switch -> DIST1
Access switch -> DIST2
```

The second uplink provides an alternative path if one distribution path fails.

### Why Is It Needed?

The access layer provides the controls closest to users:

- Assigning switch ports to VLANs.
- Separating normal data and voice traffic.
- Enabling PortFast for endpoint ports.
- Using BPDU Guard against accidental switch connections.
- Applying port security.
- Shutting down unused ports.

In simple terms, the access switch is the network's front door for endpoint devices.

## 5. The Distribution Layer

### What Is It?

The distribution layer collects or aggregates connections from access switches.

Our distribution switches are:

```text
DIST1
DIST2
```

### How Is It Used Here?

Every access switch connects to both distribution switches:

```text
                DIST1        DIST2
                  | \        / |
                  |  \      /  |
                  |   \    /   |
                 SW1  SW2  SW3  SW4
```

The drawing above is simplified. Each access switch has one connection to each distribution switch.

DIST1 and DIST2 are also connected to each other using an LACP EtherChannel.

In this lab, the distribution layer mainly provides:

- Access-switch aggregation.
- Redundant paths.
- VLAN trunk transport.
- Rapid PVST+ participation.

### Why Is It Needed?

Without a distribution layer, every access switch would need direct connections deep into the core. That becomes difficult to scale and troubleshoot.

The distribution layer creates a clean boundary:

```text
User access below
High-speed core above
```

If users on SW3 lose connectivity, we can first inspect:

```text
SW3 -> DIST1/DIST2 -> CORE1/CORE2
```

We do not need to investigate every device in the company immediately.

## 6. The Core Layer

### What Is It?

The core is the high-speed backbone of the headquarters network.

Our core switches are:

```text
CORE1
CORE2
```

They are multilayer switches, meaning they can perform both:

```text
Layer 2 switching
Layer 3 routing
```

### How Is It Used Here?

CORE1 and CORE2 provide:

- Inter-VLAN routing.
- HSRP virtual gateways.
- Connections to both distribution switches.
- Redundant connections to SERVER-SW.
- Connectivity toward FW1-FIREWALL.
- STP root roles for different VLANs.

The core switches are connected through two physical links combined into one LACP EtherChannel:

```text
CORE1 Fa0/23 ===== CORE2 Fa0/23
CORE1 Fa0/24 ===== CORE2 Fa0/24

Both links form Port-channel1.
```

### Why Are There Two Core Switches?

One core switch would create a single point of failure.

With two cores:

- HSRP provides gateway redundancy.
- Rapid PVST+ selects safe forwarding paths.
- EtherChannel protects against one member-link failure.
- Server and distribution paths have alternatives.

This does not make every component fully redundant. In the current lab, the active firewall transit path terminates on CORE1, while the physical ASA-to-CORE2 interface remains shut down. Therefore, internal gateway redundancy is stronger than firewall-path redundancy.

That is an important real-world lesson:

```text
Redundant switches do not automatically mean every end-to-end path is redundant.
```

## 7. The Internet Edge

### ISP

`ISP` represents the external Internet provider.

It connects to R1-EDGE using:

```text
ISP:     203.0.113.1/30
R1-EDGE: 203.0.113.2/30
```

The ISP also has a loopback address:

```text
198.51.100.1
```

This acts as a simulated Internet destination. When an internal PC successfully pings `198.51.100.1`, it proves that routing, firewall handling, and NAT/PAT work across the Internet path.

### R1-EDGE

R1-EDGE is the company's border router.

It connects:

- The ISP.
- The firewall outside interface.
- The remote branch WAN.

It also performs NAT/PAT, allowing many private devices to share public IP address `203.0.113.2`.

R1-EDGE is like the company's connection point to external networks.

## 8. The Firewall Boundary

### What Is It?

`FW1-FIREWALL` separates networks with different trust levels.

It has these logical zones:

```text
Outside: untrusted Internet/edge side
Inside:  trusted headquarters side
DMZ:     partially trusted public-services side
```

### How Is It Connected?

```text
R1-EDGE
   |
ASA outside: 10.255.0.2

ASA inside: 10.255.2.1
   |
CORE1: 10.255.2.2

ASA DMZ: 10.10.50.1
   |
DMZ-SW
```

A secondary cable exists between the ASA and CORE2, but its ASA interface remains administratively shut down.

### Why Is It Needed?

The firewall enforces trust boundaries:

- Inside users may initiate approved outbound traffic.
- Internet devices cannot freely initiate connections to inside devices.
- DMZ systems cannot initiate connections into the inside network.
- Branch traffic is allowed through specific outside policy.

The firewall is more than another router. A router decides where packets go; a firewall also decides whether packets should be allowed to go there.

## 9. The Internal Server Farm

Internal servers connect to `SERVER-SW`, which connects redundantly to both core switches.

```text
CORE1 ----- SERVER-SW ----- CORE2
                 |
      Internal VLAN 30 servers
```

The servers provide:

```text
10.10.30.10  DHCP and DNS
10.10.30.20  Internal web
10.10.30.30  File services
10.10.30.40  Database
10.10.30.50  Monitoring
10.10.30.60  Syslog
10.10.30.70  NTP
```

### Why Separate Servers from Users?

Servers should have:

- Predictable static addresses.
- Controlled access.
- Centralized monitoring.
- A dedicated subnet.
- Clear troubleshooting boundaries.

If servers were mixed into the Staff VLAN, user broadcasts, security policies, and address management would become harder to control.

## 10. The DMZ

The DMZ contains services that may eventually be exposed to external users:

```text
DMZ-WEB   10.10.50.10
DMZ-DNS   10.10.50.20
DMZ-MAIL  10.10.50.30
```

Its exact physical path is:

```text
FW1-FIREWALL
      |
    DMZ-SW
   /   |   \
 WEB  DNS  MAIL
```

The DMZ does not connect directly to the branch or core switches.

### Why Use a DMZ?

Public-facing systems receive traffic from less trusted networks. Placing them directly inside the corporate network would create unnecessary risk.

The DMZ acts like a reception area between the street and private offices:

- Visitors can reach approved reception services.
- Reception does not automatically grant access to private offices.
- A compromised reception system remains separated from sensitive internal systems.

## 11. The Branch Office

The branch represents a smaller office in another location.

```text
R1-EDGE
   |
Serial WAN
   |
R2-BRANCH
   |
BRANCH-SW
   |
PCs and printer
```

R2-BRANCH provides the branch gateway and local DHCP service.

The branch network is:

```text
VLAN 110
10.20.10.0/24
Gateway 10.20.10.1
```

OSPF exchanges routing information between R1-EDGE and R2-BRANCH.

### Why Give the Branch Local DHCP?

The branch can assign local client addresses without depending on DHCP broadcasts crossing the WAN.

This is simple and appropriate for the lab. In a larger real network, centralized DHCP with relay and redundant WAN links may be preferred.

## 12. How a Packet Crosses the Topology

### Example A: Staff PC to Internal Server

Suppose STAFF-PC01 accesses `SERVER-WEB-INTERNAL` at `10.10.30.20`.

```text
STAFF-PC01
-> IP-PHONE01
-> SW1-ACCESS
-> DIST1 or DIST2
-> CORE1 or CORE2
-> Inter-VLAN routing
-> SERVER-SW
-> SERVER-WEB-INTERNAL
```

The traffic moves from Staff VLAN 10 to Server VLAN 30 through a core SVI.

### Example B: Guest PC to Internet

```text
GUEST-PC01
-> SW3-ACCESS
-> Distribution layer
-> Core layer
-> Guest ACL check
-> FW1-FIREWALL
-> R1-EDGE
-> NAT/PAT
-> ISP
-> 198.51.100.1
```

The guest ACL permits the Internet destination but denies internal private networks.

### Example C: Branch PC to HQ Server

```text
BRANCH-PC01
-> BRANCH-SW
-> R2-BRANCH
-> Serial WAN
-> R1-EDGE
-> FW1-FIREWALL
-> CORE1
-> SERVER-SW
-> SERVER-DHCP-DNS
```

This path uses branch routing, the WAN, firewall policy, the core, and the server VLAN.

### Example D: Management PC to DMZ-WEB

```text
MGMT-PC01
-> SW4-ACCESS
-> Distribution layer
-> Core layer
-> CORE1 firewall route
-> FW1-FIREWALL inside
-> FW1-FIREWALL DMZ
-> DMZ-SW
-> DMZ-WEB
```

The firewall allows inside-to-DMZ traffic. It denies a new connection initiated in the opposite direction from DMZ to inside.

## 13. How Redundancy Works in This Topology

Several forms of redundancy protect different failures:

| Technology/design | Protects against |
|---|---|
| Dual core switches | One core gateway/switch failure |
| Dual distribution switches | One distribution-switch failure |
| Dual access uplinks | One uplink or distribution path failure |
| HSRP | Default-gateway failure |
| LACP EtherChannel | One bundled member-link failure |
| Rapid PVST+ | Layer-2 loops while retaining alternate paths |
| OSPF plus floating static routes | Dynamic route loss between edge and branch |

These technologies solve different problems. EtherChannel does not replace HSRP. HSRP does not replace STP. STP does not provide Internet redundancy.

## 14. How to Verify the Physical Hierarchy

### Check Interface State

On switches and routers:

```cisco
show ip interface brief
show interfaces status
```

Typical meanings:

```text
up/up          = physical and protocol operation are healthy
down/down      = no physical carrier or remote side down
administratively down = interface was shut by configuration
connected      = active switch port
notconnect     = no active physical endpoint
```

### Check Direct Cisco Neighbors

```cisco
show cdp neighbors
```

This helps confirm that a cable reaches the intended Cisco device and port.

Example:

```text
SW1 Gig0/1 should discover DIST1.
SW1 Gig0/2 should discover DIST2.
```

### Check Trunks

```cisco
show interfaces trunk
```

This confirms that infrastructure links carry the required VLANs.

### Check EtherChannels

```cisco
show etherchannel summary
```

Healthy output:

```text
Po1(SU) LACP Fa0/23(P) Fa0/24(P)
```

### Check Layer-2 Paths

```cisco
show spanning-tree
```

`Altn BLK` is not automatically an error. It often means STP has safely blocked a redundant path to prevent a loop.

## 15. Common Physical-Topology Problems

### Wrong Port

Example:

```text
Expected: ASA G1/2 -> CORE1 Fa0/20
Actual:   ASA G1/2 -> CORE2 Fa0/20
```

Symptoms:

- Configured interface remains down.
- The wrong interface becomes active.
- Routes using the expected link do not install.

Check the cable endpoints in Packet Tracer and compare them with `1.PHYSICAL_TOPOLOGY.md`.

### Wrong Phone Port

Correct:

```text
Access switch -> phone Switch port
Phone PC port -> staff PC
```

Incorrect:

```text
Access switch -> phone PC port
```

The phone's `Switch` port is the upstream connection. Its `PC` port is for a downstream computer.

### Missing Router `no shutdown`

Router and firewall interfaces commonly begin administratively down.

```cisco
interface gigabitEthernet0/1
 no shutdown
```

A correct cable cannot compensate for an administratively shut interface.

### Yellow Switch Link

A yellow/amber switch link often means STP is blocking a redundant path.

Check:

```cisco
show spanning-tree interface INTERFACE
```

If it shows:

```text
Altn BLK
```

the switch is preventing a loop. Do not remove the cable merely because it is amber.

### Broken EtherChannel

Symptoms:

```text
Po1(SD)
Fa0/23(s)
Fa0/24(s)
```

Likely causes:

- Native VLAN mismatch.
- Allowed VLAN mismatch.
- Different LACP modes.
- Member ports have different configurations.

Healthy state:

```text
Po1(SU)
Fa0/23(P)
Fa0/24(P)
```

## 16. Questions You Should Be Able to Answer

After studying Part 1, explain these in your own words:

1. Why does a PC connect to an access switch rather than directly to the core?
2. What job does the distribution layer perform?
3. Why are there two core switches?
4. Why is the DMZ connected directly to the firewall?
5. Why does SERVER-SW connect to both core switches?
6. What is the difference between a physical connection and a VLAN assignment?
7. Why can an amber redundant link be normal?
8. Which parts of the current design are not fully redundant?
9. What path does a branch packet follow to reach an HQ server?
10. What is the difference between the edge router and the firewall?

## 17. Part 1 Summary

The topology follows a hierarchical design:

```text
Access connects users.
Distribution aggregates access switches.
Core routes between enterprise networks.
Firewall controls trust boundaries.
Edge router connects WAN and Internet paths.
Server farm hosts trusted internal services.
DMZ isolates public-facing services.
Branch extends the company network to another location.
```

The main lesson is not simply where the cables go. It is that each layer has a limited, understandable responsibility. That separation makes an enterprise network easier to secure, scale, operate, and troubleshoot.
