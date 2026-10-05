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

---

# Part 2: VLAN Segmentation

## What Is a VLAN?

A VLAN divides one physical switch into separate logical networks. Devices may share the same switch but behave as if they were connected to different switches.

```text
One physical switch
├── VLAN 10: Staff
├── VLAN 20: IT
├── VLAN 40: Guest
└── VLAN 99: Management
```

Each VLAN is a separate broadcast domain. A broadcast generated in VLAN 10 does not automatically enter VLAN 20.

## How Does It Work Here?

Our VLAN-to-subnet mapping is:

| VLAN | Name | Network | Gateway |
|---:|---|---|---|
| 10 | STAFF | 10.10.10.0/24 | 10.10.10.1 |
| 20 | IT | 10.10.20.0/24 | 10.10.20.1 |
| 30 | SERVERS | 10.10.30.0/24 | 10.10.30.1 |
| 40 | GUEST | 10.10.40.0/24 | 10.10.40.1 |
| 50 | DMZ | 10.10.50.0/24 | 10.10.50.1 |
| 60 | VOICE | 10.10.60.0/24 | 10.10.60.1 |
| 70 | WIFI | 10.10.70.0/24 | 10.10.70.1 |
| 99 | MANAGEMENT | 10.10.99.0/24 | 10.10.99.1 |
| 110 | BRANCH-USERS | 10.20.10.0/24 | 10.20.10.1 |
| 999 | NATIVE-BLACKHOLE | No user subnet | None |

Create a VLAN:

```cisco
vlan 10
 name STAFF
```

Assign an endpoint port:

```cisco
interface fa0/2
 switchport mode access
 switchport access vlan 10
```

The first command creates the logical network. The interface commands place the connected device inside it.

## Why Do We Need VLANs?

Without VLANs, guests, administrators, servers, phones, and employees would share one large network. VLANs reduce broadcasts and create boundaries where routing and security policies can be applied.

The Guest VLAN demonstrates the security value. Guests use the same enterprise switching infrastructure but cannot reach Staff, IT, Server, DMZ, Management, or Branch networks.

## VLAN and Subnet Are Not the Same

```text
VLAN 10       = Layer-2 broadcast domain
10.10.10.0/24 = Layer-3 IP subnet
```

They are normally paired one-to-one. Communication inside one VLAN is switched. Communication between VLANs must be routed.

## Verify and Troubleshoot

```cisco
show vlan brief
show interfaces fa0/2 switchport
```

A Staff port should report `Access Mode VLAN: 10`. A Staff PC should receive a `10.10.10.x` address.

If a client receives an address from the wrong subnet, check its access VLAN first. If the VLAN is absent from `show vlan brief`, create it locally on that switch.

## Takeaway

A VLAN is an invisible wall that separates devices sharing the same physical switching infrastructure.

---

# Part 3: 802.1Q Trunks and Native VLAN 999

## What Is a Trunk?

An access port carries one normal data VLAN. A trunk carries several VLANs over one physical cable.

```text
Access port: VLAN 10 only
Trunk: VLANs 10,20,30,40,60,70,99,999
```

802.1Q adds a VLAN tag to Ethernet frames. The receiving switch reads the tag and keeps the frame in the correct VLAN.

## How Does It Work Here?

Trunks connect:

- Core to distribution.
- Distribution to access.
- Core to SERVER-SW.
- CORE1 to CORE2 through Port-channel1.
- DIST1 to DIST2 through Port-channel1.

Example:

```cisco
interface gig0/1
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,30,40,60,70,99,999
```

`switchport mode trunk` forces trunk operation. The allowed list prevents unnecessary VLANs from crossing the link.

## What Is the Native VLAN?

The native VLAN carries untagged frames on an 802.1Q trunk. VLAN 1 is the default, but using it for normal untagged traffic is poor practice.

Our trunks use unused VLAN 999:

```cisco
switchport trunk native vlan 999
```

Both ends must agree. A mismatch can leak traffic into the wrong VLAN and break EtherChannel formation.

## Why Force Trunks?

Dynamic mode `auto` depends on DTP negotiation. If both ends are `auto`, neither may actively form a trunk. Explicit trunk mode is predictable and easier to audit.

## Packet Example

A VLAN 10 frame moving from SW1 to DIST1 receives an 802.1Q VLAN 10 tag. DIST1 reads the tag, then forwards it only through paths carrying VLAN 10.

## Verify and Troubleshoot

```cisco
show interfaces trunk
```

Check:

```text
Mode: on
Status: trunking
Native VLAN: 999
Allowed VLANs: expected list
```

`%CDP-4-NATIVE_VLAN_MISMATCH` means the two ends use different native VLANs. Correct both sides; never ignore it.

## Takeaway

A trunk is a shared highway for multiple VLANs; 802.1Q tags keep their traffic separated.

---

# Part 4: LACP EtherChannel

## What Is EtherChannel?

EtherChannel combines multiple physical links into one logical interface.

```text
Fa0/23 + Fa0/24 = Port-channel1
```

LACP is the negotiation protocol used to form the bundle.

## How Does It Work Here?

Two LACP bundles exist:

```text
CORE1 <== Port-channel1 ==> CORE2
DIST1 <== Port-channel1 ==> DIST2
```

Configuration pattern:

```cisco
interface range fa0/23 - 24
 channel-group 1 mode active

interface port-channel 1
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,30,40,60,70,99,999
```

`active` means the switch actively sends LACP messages. Active-to-active and active-to-passive work. Passive-to-passive does not initiate a bundle.

## Why Use It?

- More aggregate bandwidth.
- One member can fail while the logical link remains available.
- STP sees one logical path instead of blocking one parallel physical link.

EtherChannel does not multiply one flow across every cable in a simple way. A hashing method assigns different conversations to member links.

## Why Must Members Match?

All member ports must have compatible speed, duplex, trunk mode, native VLAN, and allowed VLAN settings. LACP suspends incompatible ports to prevent unsafe forwarding.

## Verify and Troubleshoot

```cisco
show etherchannel summary
```

Healthy:

```text
Po1(SU) LACP Fa0/23(P) Fa0/24(P)
```

Meanings:

```text
S = Layer 2
U = in use
P = bundled member
D = down
s = suspended
```

Our initial `Po1(SD)` and `(s)` state followed a native-VLAN/configuration mismatch. Removing and re-adding channel membership forced fresh LACP negotiation after both ends matched.

## Takeaway

EtherChannel turns compatible parallel links into one resilient logical connection.

---

# Part 5: Rapid PVST+ and Loop Prevention

## What Problem Does STP Solve?

Redundant Layer-2 links can create loops. A broadcast may circulate forever, multiplying into a broadcast storm and making MAC tables unstable.

STP keeps redundancy but blocks selected paths until needed.

## How Does Rapid PVST+ Work?

Rapid PVST+ builds a separate spanning tree for each VLAN. Switches elect a root bridge. Every non-root switch calculates its best path toward that root.

Port roles include:

```text
Root FWD = best path toward root
Desg FWD = forwarding for a network segment
Altn BLK = redundant alternate path blocked
```

## Root Assignment Here

```text
CORE1 primary: VLANs 10,30,60,999
CORE2 primary: VLANs 20,40,70,99
```

This aligns VLAN forwarding with the preferred HSRP core and shares work between cores.

```cisco
spanning-tree mode rapid-pvst
spanning-tree vlan 10,30,60,999 root primary
```

## Why Is an Amber Link Often Normal?

An amber link may show `Altn BLK`. STP intentionally blocks it to prevent a loop. If the active path fails, Rapid PVST+ can move the alternate path to forwarding.

## Verify and Troubleshoot

```cisco
show spanning-tree
show spanning-tree vlan 10
show spanning-tree interface gig0/1
```

On the intended root, look for:

```text
This bridge is the root
```

Unexpected roots can cause inefficient paths. Check bridge priorities and whether required VLANs cross the trunks.

## Takeaway

STP makes redundant Layer-2 paths safe by forwarding on some paths and keeping others ready as backups.

---

# Part 6: Access Ports, PortFast, and BPDU Guard

## What Is an Access Port?

An access port connects an endpoint and places ordinary data traffic into one VLAN.

```cisco
interface fa0/2
 switchport mode access
 switchport access vlan 10
```

## What Is PortFast?

Normal STP waits before forwarding. An endpoint cannot create a switching loop by itself, so PortFast lets its port begin forwarding immediately.

This helps DHCP clients avoid delays during startup.

```cisco
spanning-tree portfast
```

## What Is BPDU Guard?

Switches exchange BPDUs for STP. An endpoint port should not receive them. BPDU Guard disables the port if a switch or bridge is unexpectedly attached.

```cisco
spanning-tree bpduguard enable
```

## Why Not Use Them on Uplinks?

Uplinks legitimately receive BPDUs. BPDU Guard on an uplink could disable a major network path. PortFast would also bypass the normal protection period on a link capable of creating a loop.

Apply them to PCs, servers, phones, APs, and printers, not switch-to-switch links.

## Verify and Troubleshoot

```cisco
show spanning-tree summary
show interfaces status
```

An err-disabled endpoint port may have received a BPDU. Remove the unauthorized switch, then recover the interface with `shutdown` followed by `no shutdown`.

## Takeaway

PortFast gives trusted endpoints fast access; BPDU Guard prevents those endpoint ports from becoming accidental network links.

---

# Part 7: SVIs and Inter-VLAN Routing

## What Is an SVI?

An SVI is a virtual Layer-3 interface representing a VLAN on a multilayer switch.

```cisco
interface vlan 10
 ip address 10.10.10.2 255.255.255.0
 no shutdown
```

Unlike a physical port, `interface vlan 10` represents the whole VLAN 10 network on that switch.

## How Does Inter-VLAN Routing Work?

A Staff PC in `10.10.10.0/24` cannot directly deliver a packet to a server in `10.10.30.0/24`. It sends the packet to gateway `10.10.10.1`. The core routes it from VLAN 10 to VLAN 30.

```text
Staff PC -> VLAN 10 SVI -> routing table -> VLAN 30 SVI -> server
```

The cores require:

```cisco
ip routing
```

## Why Use Multilayer Switches?

Routing in the core is fast and keeps internal traffic inside the switching infrastructure. A separate router-on-a-stick would create a bottleneck for many HQ VLANs.

## Why Can an SVI Be Down?

An SVI normally requires:

- The VLAN to exist.
- The SVI to have `no shutdown`.
- At least one active port or trunk carrying that VLAN.

## Verify and Troubleshoot

```cisco
show ip interface brief
show ip route
```

Expected:

```text
Vlan10 10.10.10.2 up up
C 10.10.10.0/24 is directly connected, Vlan10
```

If same-VLAN communication works but other VLANs fail, check `ip routing`, SVI state, gateway settings, ACLs, and the routing table.

## Takeaway

SVIs are the Layer-3 doors through which VLANs reach other networks.

---

# Part 8: HSRP Gateway Redundancy

## What Is HSRP?

HSRP lets two routers or multilayer switches share one virtual gateway address.

Clients know only:

```text
10.10.10.1
```

The cores use separate physical addresses:

```text
CORE1: 10.10.10.2
CORE2: 10.10.10.3
Virtual: 10.10.10.1
```

One core is active; the other is standby.

## How Is Preference Decided?

```cisco
standby 10 ip 10.10.10.1
standby 10 priority 110
standby 10 preempt
```

Higher priority wins. `preempt` allows the preferred device to reclaim active status after recovering.

Our active roles are split:

```text
CORE1 active: VLANs 10,30,60
CORE2 active: VLANs 20,40,70,99
```

## Why Is It Needed?

Without HSRP, clients would point to one core's physical address. Failure of that core would remove their gateway even if the second core remained healthy.

## Verify and Troubleshoot

```cisco
show standby brief
```

Both cores should agree on active, standby, and virtual IP. Mismatched group numbers, virtual addresses, VLAN reachability, or priorities cause unexpected states.

Failover test: shut the active SVI, wait for standby takeover, test the virtual gateway, then restore it.

## Takeaway

HSRP gives clients one stable gateway while two devices provide it behind the scenes.

---

# Part 9: Management VLAN and SSH

## What Is a Management VLAN?

VLAN 99 carries administrative traffic for network devices.

```text
MGMT-PC01: 10.10.99.10
CORE1:     10.10.99.11
CORE2:     10.10.99.12
DIST1:     10.10.99.13
...
```

It separates device administration from ordinary user traffic.

## What Is SSH?

SSH provides encrypted remote command-line access. Telnet sends credentials and commands without encryption.

Basic setup:

```cisco
ip domain-name enterprise.local
username netadmin privilege 15 secret anifhaikal
crypto key generate rsa
ip ssh version 2

line vty 0 4
 login local
 transport input ssh
```

ACL 99 restricts switch VTY access to the management subnet.

## Why Use Static Management Addresses?

Administrators and monitoring systems need predictable device addresses. A changing DHCP lease would make management unreliable.

## Verify and Troubleshoot

```cisco
show ip ssh
show ip interface brief
```

From MGMT-PC01:

```text
ssh -l netadmin 10.10.99.11
```

If ping works but SSH fails, check RSA keys, domain name, local username, VTY `login local`, `transport input ssh`, and access-class rules.

On the ASA, local authentication also required:

```cisco
aaa authentication ssh console LOCAL
```

## Takeaway

The management VLAN creates a controlled administrative network; SSH protects credentials and commands in transit.

---

# Part 10: DHCP, DHCP Relay, and DNS

## What Is DHCP?

DHCP automatically provides clients with:

- IP address.
- Subnet mask.
- Default gateway.
- DNS server.

`SERVER-DHCP-DNS` hosts pools for Staff, IT, Guest, Voice, and Wi-Fi.

## Why Is DHCP Relay Needed?

DHCP discovery begins as a broadcast. Routers do not normally forward broadcasts between VLANs. The core SVI converts the request into a routed message:

```cisco
interface vlan 10
 ip helper-address 10.10.30.10
```

Packet flow:

```text
Staff PC broadcasts DHCPDISCOVER
-> VLAN 10 SVI receives it
-> SVI relays it to 10.10.30.10
-> server chooses STAFF pool
-> client receives 10.10.10.x
```

## What Is DNS?

DNS translates names into addresses:

```text
internal.enterprise.local -> 10.10.30.20
www.enterprise.local      -> 10.10.50.10
```

Humans use names; IP routing still uses the resulting address.

## Why Keep Infrastructure Static?

Servers, routers, firewall interfaces, switch management addresses, and MGMT-PC01 must remain predictable. User endpoints benefit from DHCP convenience.

## Verify and Troubleshoot

Client:

```text
ipconfig /all
ping DEFAULT-GATEWAY
ping 10.10.30.10
ping internal.enterprise.local
```

A `169.254.x.x` address indicates DHCP failure. Check the switch VLAN, trunk allowance, SVI state, helper address, DHCP service, and pool network/gateway.

If ping by IP works but ping by name fails, routing works and DNS is the likely fault.

## Takeaway

DHCP gives clients usable network settings; relay carries requests between VLANs; DNS gives services memorable names.

---

# Part 11: ASA Zones and Security Levels

## What Are Firewall Zones?

The ASA divides the topology into trust zones:

```text
inside  = security level 100
dmz     = security level 50
outside = security level 0
```

Higher-security zones may initiate traffic toward lower-security zones by default. Lower-to-higher initiation is denied unless explicitly allowed.

## How Is It Configured?

```cisco
interface gigabitEthernet1/2
 nameif inside
 security-level 100
 ip address 10.255.2.1 255.255.255.252
```

The ASA has routes back to HQ and branch networks plus a default route toward R1-EDGE.

## Why Use a Firewall Instead of Only ACLs?

The firewall tracks connection state. If an inside client starts an allowed session, the return traffic belongs to that session. Unsolicited inbound traffic remains blocked.

It also creates a clear boundary between trusted users, public services, and external networks.

## Current Policy

```text
Inside -> outside: allowed
Inside -> DMZ: allowed
DMZ -> inside: denied
Outside -> inside: denied except approved branch traffic
```

## Verify and Troubleshoot

```cisco
show interface ip brief
show route
show access-list
show running-config access-group
```

Troubleshoot in this order:

```text
Interface up?
Correct IP and nameif?
Route exists?
ACL attached to correct interface and direction?
Destination has correct return gateway?
```

Our Packet Tracer ASA behaved inconsistently with an attached broad `INSIDE-IN` ACL. Detaching it restored the normal security-level behavior.

## Takeaway

Firewall zones express trust. Routes choose paths; security policy decides whether traffic may use them.

---

# Part 12: Guest ACL and Rule Ordering

## What Is an ACL?

An ACL is an ordered list of permit and deny rules. The device checks from top to bottom and uses the first match. Anything unmatched reaches an implicit final deny.

## How Does Guest Isolation Work?

The ACL is applied inbound on VLAN 40, close to the guest source.

It permits:

- DHCP.
- DNS to `10.10.30.10`.
- Guest gateway/core addresses.
- Destinations outside HQ and branch private ranges.

It denies HQ and branch networks.

## Why Does Rule Order Matter?

This broad deny includes the guest gateway:

```cisco
deny ip 10.10.40.0 0.0.0.255 10.10.0.0 0.0.255.255
```

Therefore gateway exceptions must appear first:

```cisco
permit ip 10.10.40.0 0.0.0.255 host 10.10.40.1
```

Our first version omitted the exception. Guests received `Destination host unreachable` from CORE2. Reordering fixed it.

## Why Apply It on Both Cores?

CORE2 is normally HSRP active for VLAN 40, but CORE1 can take over. Applying the same ACL to both keeps policy intact after failover.

## Verify and Troubleshoot

```cisco
show access-lists GUEST-IN
show ip interface vlan 40
```

Use counters to identify which rule matches. Test both allowed and denied destinations. A successful denial is part of correct operation.

## Takeaway

ACLs are read like a checklist from top to bottom; specific exceptions belong before broad denials.

---

# Part 13: Corporate Wi-Fi and VLAN 70

## What Is AP01 Doing?

AP01 bridges wireless traffic onto its wired switch port. The basic Packet Tracer `AccessPoint-PT` has no management IP fields in this lab.

```text
WIFI-LAPTOP01 --radio--> AP01 --cable--> SW3 Fa0/4 --VLAN 70
```

Because SW3 Fa0/4 is an access port in VLAN 70, wireless clients become VLAN 70 clients.

## How Was It Secured?

```text
SSID: CORP-WIFI
Authentication: WPA2-PSK
Encryption: AES
Passphrase: CorpWifi@2025
```

The laptop required a `WPC300N` wireless module. `WPC300N` is for laptops; `WMP300N` is for desktop PCs.

## Why Use a Separate Wi-Fi VLAN?

Wireless access has different security and operational needs. VLAN 70 lets administrators apply separate addressing, policies, and monitoring without mixing wireless clients directly into wired Staff VLAN 10.

## Verify and Troubleshoot

The laptop should receive:

```text
10.10.70.x/24
Gateway 10.10.70.1
DNS 10.10.30.10
```

If association fails, check wireless module, SSID, passphrase, and security mode. If association works but DHCP fails, check SW3 Fa0/4 VLAN 70, trunk allowed lists, VLAN 70 SVI, helper address, and DHCP pool.

## Limitation

The basic AP supports one practical SSID/VLAN here. Guest Wi-Fi would require a second AP or a VLAN-aware controller/AP model.

## Takeaway

The AP converts radio connectivity into switched VLAN connectivity; the switch port determines where clients enter the wired network.

---

# Part 14: Voice VLAN and IP Phones

## What Is a Voice VLAN?

A phone and PC can share one switch port while using different VLANs:

```text
Phone voice traffic = tagged VLAN 60
PC data traffic     = untagged VLAN 10
```

Configuration:

```cisco
interface fa0/3
 switchport access vlan 10
 switchport voice vlan 60
```

## How Are the Cables Connected?

```text
Access switch -> phone Switch port
Phone PC port -> staff PC
```

The phone learns the Voice VLAN through CDP. The downstream PC remains in the access/data VLAN.

## Why Separate Voice?

- Separate IP addressing.
- Easier QoS treatment.
- Easier troubleshooting.
- Better security and policy control.

## Why Did Phones Show `Configuring CM List`?

The Layer-2 Voice VLAN worked, but no Cisco Unified CME/Call Manager or DHCP option 150 was configured. The phones were searching for call control, not reporting a switch-port failure.

## Verify and Troubleshoot

```cisco
show interfaces fa0/3 switchport
show cdp neighbors
```

Expected:

```text
Access Mode VLAN: 10
Voice VLAN: 60
Cisco 7960 phone detected
```

For a phone plus downstream PC, port security maximum must allow two MAC addresses.

## Takeaway

One cable can carry logically separate voice and data networks; call registration is a separate service from VLAN connectivity.

---

# Part 15: Branch Router-on-a-Stick and Local DHCP

## What Is Router-on-a-Stick?

One physical router interface carries multiple VLANs through logical subinterfaces.

```cisco
interface g0/0.110
 encapsulation dot1Q 110
 ip address 10.20.10.1 255.255.255.0
```

The physical G0/0 link connects to a trunk on BRANCH-SW. Subinterface `.110` is the gateway for branch VLAN 110.

## Why Use It at the Branch?

The branch is small. A dedicated multilayer switching pair would be unnecessary. Router-on-a-stick provides a simple gateway and leaves room for future branch VLANs.

## Why Local DHCP?

R2-BRANCH assigns addresses locally:

```cisco
ip dhcp pool BRANCH-USERS
 network 10.20.10.0 255.255.255.0
 default-router 10.20.10.1
 dns-server 10.10.30.10
```

Clients can obtain local addresses without relying on DHCP broadcast relay across the WAN.

The Packet Tracer printer lacked static IP fields, so it received DHCP address `10.20.10.103` during testing.

## Verify and Troubleshoot

```cisco
show ip interface brief
show ip dhcp binding
show ip route
```

Expected connected route:

```text
C 10.20.10.0/24 is directly connected, GigabitEthernet0/0.110
```

If clients receive no address, check trunk VLAN 110, subinterface encapsulation, DHCP exclusions, and pool network.

## Takeaway

Router-on-a-stick is a cost-effective way to route branch VLANs over one physical link.

---

# Part 16: Serial WAN and DCE Clocking

## What Is the WAN Link?

The serial link simulates a provider-style point-to-point connection:

```text
R1-EDGE 10.255.1.1/30 <-> 10.255.1.2/30 R2-BRANCH
```

A `/30` subnet provides four addresses: network, two usable router addresses, and broadcast. It suits a two-device transit link.

## What Is DCE Clocking?

Serial communication needs timing. In a real WAN, the provider supplies it. In Packet Tracer, the cable's DCE end must provide a clock:

```cisco
interface serial0/0/0
 clock rate 64000
```

Only the DCE end accepts the command.

## Why Is This Different from Ethernet?

Ethernet interfaces negotiate link timing automatically. A simulated serial circuit explicitly models provider and customer timing roles.

## Verify and Troubleshoot

```cisco
show controllers serial 0/0/0
show ip interface brief
```

Required state is `up/up`. `up/down` often indicates encapsulation or clocking trouble. `down/down` suggests cable, module, shutdown, or remote-interface trouble.

## Takeaway

The serial WAN is a routed point-to-point link; its DCE side supplies timing for the circuit.

---

# Part 17: Branch-to-HQ Firewall Routing

## What Must Happen for Branch Traffic to Reach HQ?

Every device along the path needs a forward path and a return path.

```text
Branch PC -> R2 -> R1 -> ASA outside -> ASA inside -> CORE1 -> HQ
```

Important routes include:

```text
R1 knows branch through R2.
R1 knows HQ through ASA.
ASA knows branch through R1.
ASA knows HQ through CORE1.
R2 knows default through R1.
```

The ASA outside ACL permits branch source `10.20.10.0/24` toward HQ `10.10.0.0/16`.

## Why Are Return Routes Important?

A request may reach its destination, but the reply fails if the destination side does not know how to reach the source. Successful two-way communication requires symmetric knowledge, even if exact paths differ.

## Why Did Normal R2 Pings Fail While Branch PCs Worked?

R2-originated pings used source `10.255.1.2`. The ASA rule permitted branch-client source `10.20.10.0/24`. Client traffic matched; router-generated traffic did not.

This shows why source address matters during testing.

## Verify and Troubleshoot

Test from real clients, then inspect:

```cisco
show ip route
show access-list OUTSIDE-IN
```

Use hop-by-hop tests. Initial ping loss can occur while ARP and firewall state initialize.

## Takeaway

End-to-end routing means every hop knows the destination and the return path, while the firewall permits the intended source and destination.

---

# Part 18: ISP Simulation and NAT/PAT

## What Is NAT/PAT?

Internal devices use private addresses that are not routed on the public Internet. PAT translates many private sessions to one public address and distinguishes them by transport identifiers.

```text
10.10.10.100 -> 203.0.113.2
10.10.40.100 -> 203.0.113.2
10.20.10.100 -> 203.0.113.2
```

## How Is It Configured?

```cisco
interface g0/0
 ip nat outside

interface g0/1
 ip nat inside

interface s0/0/0
 ip nat inside

access-list 1 permit 10.10.0.0 0.0.255.255
access-list 1 permit 10.20.0.0 0.0.255.255
ip nat inside source list 1 interface g0/0 overload
```

`overload` enables PAT.

## Why Is Branch-to-HQ Traffic Not Translated?

Translation occurs when traffic exits NAT-outside G0/0 toward the ISP. Branch-to-HQ traffic travels between NAT-inside interfaces and therefore remains private.

## What Is `198.51.100.1`?

It is ISP Loopback0, used as a simulated Internet destination. Documentation address ranges avoid pretending a real public service exists.

## Verify and Troubleshoot

```cisco
show ip nat translations
show ip nat statistics
show access-lists 1
show ip route
```

If R1 reaches the Internet loopback but clients do not, inspect client gateways, ASA default route/inspection, NAT inside/outside roles, and ACL 1 matches.

## Takeaway

PAT lets the entire private enterprise share one public-facing address for outbound Internet sessions.

---

# Part 19: NTP and Syslog

## What Is NTP?

NTP synchronizes clocks. Accurate time is essential when comparing logs from several devices.

```cisco
ntp server 10.10.30.70
```

Without synchronized time, an event may appear to happen on one switch before its cause appears on another.

## What Is Syslog?

Syslog sends device events to a central server:

```cisco
logging 10.10.30.60
```

Instead of opening every switch to inspect its local messages, administrators review one central log source.

## How Was It Tested?

A harmless interface description change generated `%SYS-5-CONFIG_I`. SERVER-SYSLOG showed messages from HQ switches and routers.

R2 used source `10.255.1.2` because Packet Tracer did not support `logging source-interface`; ASA permits were added for that source.

## Verify and Troubleshoot

```cisco
show clock
show ntp associations
show logging
ping 10.10.30.70
ping 10.10.30.60
```

If reachability works but logs do not arrive, check Syslog service state, device logging target, firewall UDP 514 policy, and the actual source IP.

## Takeaway

NTP gives events trustworthy timestamps; Syslog puts those events in one place for investigation.

---

# Part 20: SNMP Monitoring

## What Is SNMP?

SNMP lets a monitoring system read device information such as hostname, interface state, traffic counters, and uptime.

```cisco
snmp-server community EnterpriseRO RO
```

`RO` means read-only. The monitoring server can inspect data but not change configuration.

## How Does Polling Work?

```text
SERVER-MONITORING asks a device for an OID.
Device returns the requested value.
```

Example OID:

```text
1.3.6.1.2.1.1.5.0 = sysName.0
```

## Why Use It?

Polling lets administrators detect outages and trends without logging into every device manually.

## Packet Tracer Limitation

This IOS supported only the basic read-only community. ACL-bound communities, SNMPv3, location/contact metadata, and trap configuration were unavailable.

In production, use SNMPv3 because SNMPv2c community strings are clear-text shared credentials.

## Verify and Troubleshoot

Confirm the running configuration and ping `10.10.30.50`. If a MIB browser exists, query `sysName.0` using community `EnterpriseRO`.

## Takeaway

SNMP is for structured device monitoring; the lab demonstrates polling foundations, not production-grade SNMP security.

---

# Part 21: OSPF and Floating Static Routes

## What Is OSPF?

OSPF is a dynamic routing protocol. Routers form neighbor relationships and exchange network information automatically.

Here:

```text
R2 advertises 10.20.10.0/24.
R1 advertises the default route.
```

Both use OSPF process 1 in Area 0 across the serial WAN.

## How Does It Work?

```cisco
router ospf 1
 network 10.255.1.0 0.0.0.3 area 0
```

R2 also advertises its branch LAN. R1 uses `default-information originate` to tell R2 where unknown/Internet traffic should go.

## Why Use OSPF for One Branch?

Static routes would be simpler for only one branch. OSPF is included to demonstrate enterprise dynamic routing and make future branches easier to add.

## What Is a Floating Static Route?

A static route with administrative distance 200 is less preferred than OSPF but remains available if OSPF disappears.

```cisco
ip route 10.20.10.0 255.255.255.0 10.255.1.2 200
```

## Verify and Troubleshoot

```cisco
show ip ospf neighbor
show ip route
show ip protocols
```

Healthy neighbor state:

```text
FULL/-
```

Our initial neighbor table was empty because passive-interface behavior prevented adjacency. Removing passive default in this two-router lab allowed Hellos to form the neighbor relationship.

Never remove working static routes until the expected OSPF routes appear.

## Takeaway

OSPF learns routes dynamically; floating static routes provide a less-preferred safety net.

---

# Part 22: DMZ Services and Isolation

## What Is a DMZ?

A DMZ is a separate network for services that may need exposure to less trusted users.

```text
DMZ-WEB  10.10.50.10
DMZ-DNS  10.10.50.20
DMZ-MAIL 10.10.50.30
Gateway  10.10.50.1 on ASA
```

## Why Not Put These Servers Inside?

Public-facing services have higher attack exposure. If one is compromised, the firewall should prevent it from freely initiating connections to internal servers and management systems.

## How Does Current Access Work?

```text
Management -> DMZ-WEB: allowed
Staff -> DMZ-WEB: allowed
Guest -> DMZ: denied by GUEST-IN
DMZ -> inside: denied by ASA security levels
```

Internal DNS contains `www.enterprise.local -> 10.10.50.10`, allowing internal users to locate the DMZ website.

## How Was the Timeout Diagnosed?

DMZ-DNS could browse DMZ-WEB locally, proving the web server and DMZ switch worked. ASA ACL counters showed HQ traffic. Detaching the problematic `INSIDE-IN` ACL restored ICMP. Simulation mode showed HTTP request and response completing; after ARP/TCP convergence, the browser worked.

This demonstrates fault isolation:

```text
Test local service first.
Then test gateway.
Then test routed/firewall path.
Then test application protocol.
```

## Verify and Troubleshoot

```text
Inside client: http://10.10.50.10 should load
Guest: ping 10.10.50.10 should fail
DMZ-WEB: ping 10.10.99.10 should fail
```

External publishing remains deferred. It would require public NAT/port forwarding and tightly scoped outside rules.

## Takeaway

The DMZ makes public-service access possible without treating those servers as trusted internal hosts.

---

# Part 23: Port Security and Unused-Port Hardening

## What Is Port Security?

Port security limits which and how many MAC addresses may use an access port.

```cisco
switchport port-security
switchport port-security maximum 1
switchport port-security mac-address sticky
switchport port-security violation restrict
```

Sticky learning records the first observed MAC as secure. `restrict` drops unauthorized traffic and increments a counter without shutting the whole port.

## Why Do Phone Ports Allow Two MACs?

A phone port may see:

- The phone MAC in Voice VLAN 60.
- The downstream PC MAC in Data VLAN 10.

Therefore those ports use maximum 2.

## Why Was AP01 Excluded?

Several wireless-client MAC addresses pass through one AP switch port. A limit of one would block valid clients.

## What Happens to Unused Ports?

```cisco
switchport mode access
switchport access vlan 999
shutdown
```

This prevents someone from plugging into an unused wall jack and immediately gaining network access.

## Verify and Troubleshoot

```cisco
show port-security
show port-security interface fa0/2
show port-security address
show interfaces status
```

Expected:

```text
Secure-up
Violation mode: Restrict
Violation count: 0
Unused ports: disabled, VLAN 999
```

If a legitimate replacement device is blocked, clear or update the sticky secure MAC rather than disabling security globally.

## Takeaway

Port security controls endpoint identity at the physical edge; shutting unused ports removes unnecessary entry points.

---

# Part 24: Redundancy and Final Validation

## Why Test Instead of Trusting Configuration?

A command in the running configuration proves only that it was entered. It does not prove the full packet path works.

Validation checks both positive and negative requirements:

```text
Allowed traffic must succeed.
Forbidden traffic must fail.
Backup paths must work after failure.
```

## Connectivity Tests

Verified clients:

```text
Staff -> internal servers, DMZ, branch, Internet
IT -> management, branch, Internet
Wi-Fi -> gateway, servers, Internet
Branch -> HQ servers, management, Internet
```

## Security Tests

Verified:

```text
Guest -> Internet: success
Guest -> internal/DMZ/branch: denied
DMZ -> gateway: success
DMZ -> inside: denied
```

A denied ping can be a successful security test.

## HSRP Failover Test

CORE1's VLAN 10 SVI was shut. CORE2 became active and Staff connectivity resumed. After restoration, preemption returned the active role to CORE1.

This proves more than `show standby brief`: it proves a real client can continue using the virtual gateway.

## EtherChannel Test

CORE1 Fa0/24 was shut. Port-channel1 remained operational through Fa0/23. After restoration, both members returned to `(P)`.

## STP Uplink Test

SW1's forwarding uplink was shut. Rapid PVST+ moved traffic to the alternate distribution path. The original link was restored afterward.

## OSPF Test

Both routers showed `FULL/-`; R1 learned the branch route and R2 learned the external default route. End-to-end traffic remained successful after static routes became floating backups.

## Why Restore and Save?

Failure testing intentionally changes interfaces. Every tested interface must be restored with `no shutdown`, verified, and saved:

```cisco
write memory
```

Then save the Packet Tracer project itself.

## A Practical Troubleshooting Method

When something fails, avoid changing several settings at once. Follow this sequence:

1. Define the expected source, destination, and protocol.
2. Check endpoint IP, mask, gateway, and DNS.
3. Check physical/interface state.
4. Check access VLAN and trunks.
5. Check SVI/gateway state.
6. Check routing in both directions.
7. Check ACL/firewall policy and counters.
8. Check the destination service.
9. Use Simulation mode when Packet Tracer behavior is unclear.
10. Make one minimal change, then retest.

## Final Takeaway

The project is not merely a collection of Cisco commands. It is a connected design in which:

```text
VLANs create boundaries.
Trunks transport those boundaries.
STP makes redundant Layer-2 paths safe.
EtherChannel combines links.
SVIs route between VLANs.
HSRP protects gateways.
ACLs and the firewall enforce policy.
DHCP and DNS make the network usable.
OSPF exchanges routes.
NAT/PAT provides Internet access.
NTP, Syslog, and SNMP support operations.
Port security hardens the edge.
Testing proves the design works.
```

---

# Complete Review Checklist

You should now be able to explain:

1. The role of every device in the topology.
2. Why the network uses access, distribution, and core layers.
3. How a VLAN differs from an IP subnet.
4. How 802.1Q carries multiple VLANs.
5. Why native VLAN mismatches are dangerous.
6. How LACP and STP solve different redundancy problems.
7. How SVIs and HSRP provide routed gateways.
8. Why DHCP relay is required across VLANs.
9. Why DNS failure differs from routing failure.
10. How ASA zones and ACL order affect traffic.
11. Why guest Internet works while guest internal access fails.
12. How Wi-Fi and phone traffic enter their VLANs.
13. How the branch reaches HQ and the Internet.
14. Why DCE clocking is required on the serial WAN.
15. How OSPF and floating static routes coexist.
16. How NAT/PAT translates private users.
17. Why NTP, Syslog, and SNMP matter operationally.
18. Why a DMZ reduces risk.
19. How port security and VLAN 999 harden access ports.
20. How failover tests prove resilience.

# Related Build Documentation

The numbered files `1` through `24` contain the exact configuration and verification record. Use this study guide to understand the concepts; use the numbered files to reproduce the lab.
