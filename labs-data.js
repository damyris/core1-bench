/* Labs content: 12 exam-style PBQ labs (4 per course) and the diagrams they label.
   Shapes are documented in labs.js. Diagram slot x/y are in the drawing's viewBox (w x h).
   Drawings use currentColor and theme variables only, so they follow every theme. */
(function(){
const sel=(label,o,a,x)=>({type:"select",label,o,a,x});
const txt=(label,ans,x,ph)=>Object.assign({type:"text",label,ans,x},ph?{ph}:{});
const chk=(label,a,x)=>({type:"check",label,a,x});
/* a setting that ships turned on, so the learner has to switch it off */
const chkOn=(label,a,x)=>({type:"check",label,a,x,init:true});
const S='fill="none" stroke="currentColor" stroke-width="2"';
const T='style="fill:var(--dim)" font-size="14" font-family="inherit" text-anchor="middle"';

const DIAGRAMS={
motherboard:{w:400,h:320,svg:`<svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" role="img"><title>Motherboard layout with numbered connectors</title>
<rect x="10" y="10" width="380" height="300" rx="8" ${S}/>
<rect x="20" y="20" width="40" height="130" ${S}/><text x="40" y="90" ${T}>I/O</text>
<rect x="170" y="40" width="80" height="80" ${S}/><rect x="185" y="55" width="50" height="50" ${S} stroke-dasharray="3 3"/>
<rect x="275" y="30" width="8" height="150" ${S}/><rect x="287" y="30" width="8" height="150" ${S}/><rect x="299" y="30" width="8" height="150" ${S}/><rect x="311" y="30" width="8" height="150" ${S}/>
<rect x="350" y="90" width="25" height="100" ${S}/><path d="M357 100v80M368 100v80" ${S} stroke-dasharray="2 4"/>
<rect x="80" y="140" width="110" height="10" ${S}/><circle cx="196" cy="145" r="4" ${S}/>
<rect x="40" y="200" width="210" height="12" ${S}/><rect x="40" y="235" width="50" height="10" ${S}/>
<circle cx="300" cy="240" r="16" ${S}/>
<rect x="345" y="215" width="30" height="12" ${S}/><rect x="345" y="232" width="30" height="12" ${S}/><rect x="345" y="249" width="30" height="12" ${S}/><rect x="345" y="266" width="30" height="12" ${S}/>
<rect x="230" y="285" width="60" height="14" ${S}/><path d="M238 292h44" ${S} stroke-dasharray="2 4"/>
</svg>`},
floorplan:{w:400,h:300,svg:`<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img"><title>Office floor plan with numbered security points</title>
<rect x="10" y="10" width="380" height="280" ${S} stroke-dasharray="8 6"/>
<path d="M60 30h310v190H230M180 220H60V30" ${S}/>
<path d="M160 30v90h-20M150 120H60M280 30v90h-20M290 120h80" ${S}/>
<path d="M180 190h50M180 190v30M230 190v30" ${S}/>
<rect x="140" y="150" width="40" height="20" ${S}/>
<path d="M262 128l14-6v12z" ${S}/>
<circle cx="165" cy="255" r="5" ${S}/><circle cx="185" cy="255" r="5" ${S}/><circle cx="205" cy="255" r="5" ${S}/><circle cx="225" cy="255" r="5" ${S}/><circle cx="245" cy="255" r="5" ${S}/>
<text x="110" y="70" ${T}>Offices</text><text x="325" y="70" ${T}>Servers</text><text x="220" y="165" ${T}>Lobby</text><text x="90" y="250" ${T}>Parking</text>
</svg>`},
fstree:{w:400,h:420,svg:`<svg viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" role="img"><title>Linux directory tree with numbered boxes</title>
<rect x="180" y="10" width="40" height="26" rx="4" ${S}/><text x="200" y="29" fill="currentColor" font-size="16" text-anchor="middle">/</text>
<path d="M200 36v329M185 95h30M185 185h30M185 275h30M185 365h30" ${S}/>
<rect x="10" y="60" width="175" height="70" rx="4" ${S}/><text x="97" y="120" ${T}>system config</text>
<rect x="215" y="60" width="175" height="70" rx="4" ${S}/><text x="302" y="120" ${T}>log files</text>
<rect x="10" y="150" width="175" height="70" rx="4" ${S}/><text x="97" y="210" ${T}>users' homes</text>
<rect x="215" y="150" width="175" height="70" rx="4" ${S}/><text x="302" y="210" ${T}>core commands</text>
<rect x="10" y="240" width="175" height="70" rx="4" ${S}/><text x="97" y="300" ${T}>temp files</text>
<rect x="215" y="240" width="175" height="70" rx="4" ${S}/><text x="302" y="300" ${T}>process info</text>
<rect x="10" y="330" width="175" height="70" rx="4" ${S}/><text x="97" y="390" ${T}>kernel, boot</text>
<rect x="215" y="330" width="175" height="70" rx="4" ${S}/><text x="302" y="390" ${T}>device files</text>
</svg>`},
};

const LABS=[
/* ---------- A+ Core 1 ---------- */
{id:"lab:core1:soho-router",c:"core1",d:2,title:"Set up a SOHO router",
 scenario:"A six-person dental office has a new wireless router. Set it up so their PCs get addresses automatically and the Wi-Fi is locked down.",
 parts:[
  {kind:"config",task:"The office network is 192.168.10.0/24. The router takes the first usable address and hands out .100 to .150 to the PCs.",rows:[
    [txt("Router LAN IP",["192.168.10.1"],"The first usable address in 192.168.10.0/24 is .1, and the router's LAN IP becomes every PC's default gateway.","192.168.10.x")],
    [txt("Subnet mask",["255.255.255.0","/24"],"A /24 prefix is 24 network bits, which is 255.255.255.0.")],
    [chk("DHCP server enabled",true,"DHCP has to be on for the PCs to get addresses automatically.")],
    [txt("DHCP range start",["192.168.10.100"],"The pool starts at the first address you were told to hand out, .100.","192.168.10.x")],
    [txt("DHCP range end",["192.168.10.150"],"The pool ends at .150, leaving the rest free for static devices like printers.","192.168.10.x")],
    [sel("DNS server",["192.168.10.255","8.8.8.8","255.255.255.0","169.254.1.1"],1,"8.8.8.8 is a public DNS resolver; .255 is the broadcast address, 255.255.255.0 is a mask and 169.254.x.x is APIPA.")],
  ]},
  {kind:"config",task:"Now lock down the wireless and admin settings.",rows:[
    [sel("Wireless security",["Open","WEP","WPA2-Personal (TKIP)","WPA3-Personal"],3,"WPA3-Personal (SAE) is the strongest option here; WEP and TKIP are broken.")],
    [chkOn("WPS enabled",false,"WPS PINs can be brute-forced, so turn WPS off.")],
    [chk("Change the default admin password",true,"Default router logins are published online, so change them first.")],
    [chkOn("Remote management from the internet",false,"WAN-side admin exposes the router's login page to attackers.")],
    [chk("Update the firmware",true,"Firmware updates patch known router vulnerabilities.")],
  ]},
 ]},
{id:"lab:core1:motherboard",c:"core1",d:3,title:"Build the motherboard",
 scenario:"You're building a PC for a video editor. Before installing parts, identify each connector on the board.",
 parts:[
  {kind:"diagram",task:"Place a label on each numbered spot. Some labels are not on this board.",art:"motherboard",
   labels:["CPU socket","DIMM slots","24-pin ATX power","M.2 slot","PCIe x16 slot","CMOS battery","SATA ports","Front-panel header","AGP slot","IDE connector","Molex connector"],
   slots:[
    {n:1,x:210,y:80,a:0,why:"The large square socket near the top holds the processor, under the cooler."},
    {n:2,x:297,y:105,a:1,why:"The long, thin slots beside the CPU hold the RAM modules."},
    {n:3,x:362,y:140,a:2,why:"The wide connector on the board edge takes the main 24-pin power cable from the PSU."},
    {n:4,x:135,y:145,a:3,why:"The short slot with a single mounting screw holds an M.2 SSD."},
    {n:5,x:145,y:206,a:4,why:"The longest expansion slot, closest to the CPU, is PCIe x16 for the graphics card."},
    {n:6,x:300,y:240,a:5,why:"The coin cell (CR2032) keeps the clock and firmware settings when the PC is unplugged."},
    {n:7,x:360,y:246,a:6,why:"The small stacked ports on the edge connect SATA drives."},
    {n:8,x:260,y:292,a:7,why:"The small pin header on the bottom edge connects the case power button, reset button and LEDs."},
   ]},
 ]},
{id:"lab:core1:connectors",c:"core1",d:3,title:"Sort the connectors",
 scenario:"A box of cables turned up in the supply closet. Sort each connector by what it's used for.",
 parts:[
  {kind:"buckets",task:"Put each connector in the bucket for its main use.",buckets:["Video","Network & telecom","Storage","Peripherals & charging"],items:[
    {t:"HDMI",b:0,x:"HDMI carries digital video and audio to TVs and monitors."},
    {t:"DisplayPort",b:0,x:"DisplayPort is a digital video connector common on PC monitors."},
    {t:"DVI",b:0,x:"DVI is an older video connector for monitors."},
    {t:"RJ45",b:1,x:"RJ45 terminates twisted-pair Ethernet cable."},
    {t:"RJ11",b:1,x:"RJ11 connects phone lines and DSL modems."},
    {t:"F-type",b:1,x:"F-type screws onto coaxial cable, as used by cable modems."},
    {t:"SATA",b:2,x:"SATA connects internal hard drives and SSDs."},
    {t:"eSATA",b:2,x:"eSATA connects external SATA drives."},
    {t:"USB-C",b:3,x:"USB-C is a reversible, general-purpose connector for devices and charging (it can carry video too, but that's not its main job)."},
    {t:"Lightning",b:3,x:"Lightning is Apple's connector for charging and syncing older iPhones and iPads."},
  ]},
 ]},
{id:"lab:core1:cloud",c:"core1",d:4,title:"Cloud and virtualization",
 scenario:"A growing company is moving services to the cloud. Match each need to the right service model, then the right deployment model.",
 parts:[
  {kind:"buckets",task:"Which service model is each one?",buckets:["IaaS","PaaS","SaaS"],items:[
    {t:"Email and Office apps used in the browser",b:2,x:"SaaS: you just use the finished application; the provider runs everything else."},
    {t:"Shared documents in Google Workspace",b:2,x:"SaaS: a complete application delivered over the internet."},
    {t:"Rent virtual machines and patch the OS yourself",b:0,x:"IaaS: the provider gives you compute; you manage the OS and up."},
    {t:"Virtual networks and storage you configure yourself",b:0,x:"IaaS: raw infrastructure building blocks."},
    {t:"Upload code and the platform runs it, no servers to patch",b:1,x:"PaaS: the provider runs the OS and runtime; you bring the code."},
    {t:"A managed database and runtime for your web app",b:1,x:"PaaS: a platform to build on, without managing servers."},
  ]},
  {kind:"buckets",task:"Which deployment model is each one?",buckets:["Public","Private","Hybrid","Community"],items:[
    {t:"Anyone can sign up and share the provider's hardware",b:0,x:"Public cloud: shared, multitenant infrastructure open to anyone."},
    {t:"A bank runs its own cloud in its own data center",b:1,x:"Private cloud: used by one organization only."},
    {t:"Infrastructure dedicated to one company, hosted by a provider",b:1,x:"Still private: one organization, whoever runs the hardware."},
    {t:"Payroll stays on-site while the website runs in a public cloud",b:2,x:"Hybrid: a mix of private/on-premises and public cloud."},
    {t:"On-site servers burst into a public cloud at busy times",b:2,x:"Hybrid: cloud bursting joins private and public resources."},
    {t:"Several hospitals share a cloud built for healthcare rules",b:3,x:"Community cloud: shared by organizations with common needs."},
  ]},
 ]},

/* ---------- A+ Core 2 ---------- */
{id:"lab:core2:malware",c:"core2",d:2,title:"Identify the malware",
 scenario:"The help desk logged a week of odd tickets. Work out what kind of malware is behind each one.",
 parts:[
  {kind:"buckets",task:"How does it spread, or what does it do?",buckets:["Virus","Worm","Trojan","Ransomware"],items:[
    {t:"Attaches to a program and spreads when that file is run",b:0,x:"A virus needs a host file and a user action to spread."},
    {t:"A macro in a shared document copies itself into other documents",b:0,x:"Macro viruses ride inside documents and spread when they're opened."},
    {t:"Spreads across the network by itself, with no user action",b:1,x:"A worm self-replicates over the network."},
    {t:"Exploits an unpatched service to jump from PC to PC",b:1,x:"Worms use network vulnerabilities to spread on their own."},
    {t:"A free game download secretly opens a backdoor",b:2,x:"A Trojan hides malware inside something the user wants."},
    {t:"A 'disk cleaner' utility installs a remote access tool",b:2,x:"A Trojan pretends to be useful software."},
    {t:"Encrypts the user's files and demands payment for the key",b:3,x:"Ransomware holds data hostage for payment."},
    {t:"Locks the screen with a message demanding bitcoin",b:3,x:"Screen-locking ransomware also demands payment."},
  ]},
  {kind:"buckets",task:"Now the stealthier ones.",buckets:["Rootkit","Keylogger","Spyware","Cryptominer"],items:[
    {t:"Hides in the OS or boot process so antivirus can't see it",b:0,x:"A rootkit gains deep, hidden access, often needing a boot-time scan or reimage."},
    {t:"Antivirus finds nothing, but an offline boot-time scan finds hidden files",b:0,x:"Rootkits hide from tools running inside the infected OS, so scanning from outside it finds them."},
    {t:"Records every key pressed to capture passwords",b:1,x:"A keylogger captures keystrokes."},
    {t:"A hidden log file holds everything typed, including passwords",b:1,x:"A record of every keystroke is the work of a keylogger."},
    {t:"Tracks browsing habits and sends them to a third party",b:2,x:"Spyware secretly collects information about the user."},
    {t:"Takes screenshots in the background and uploads them",b:2,x:"Spyware gathers personal data without consent."},
    {t:"CPU sits near 100% with no apps open",b:3,x:"A cryptominer uses the PC's processing power to mine cryptocurrency."},
    {t:"Fans run loud all night and the power bill jumps",b:3,x:"Constant heavy load from mining is the giveaway."},
  ]},
 ]},
{id:"lab:core2:windows-tools",c:"core2",d:1,title:"Windows tools and commands",
 scenario:"You're on the help desk queue. Pick the right Windows tool for each ticket, then the right command.",
 parts:[
  {kind:"buckets",task:"Which tool do you open?",buckets:["Event Viewer","Device Manager","Disk Management","Task Scheduler","Services"],items:[
    {t:"Find out why the PC restarted unexpectedly last night",b:0,x:"Event Viewer's System log records shutdowns, crashes and their causes."},
    {t:"Read the error logged when an app crashed",b:0,x:"Event Viewer's Application log holds app errors."},
    {t:"Roll back a network card driver",b:1,x:"Device Manager manages drivers, including Roll Back Driver."},
    {t:"See which device has a yellow warning icon",b:1,x:"Device Manager flags devices with problems."},
    {t:"Initialize a new drive and create a partition",b:2,x:"Disk Management initializes, partitions and formats drives."},
    {t:"Change the drive letter of a USB drive",b:2,x:"Disk Management assigns drive letters."},
    {t:"Run a cleanup script every Friday at 6 pm",b:3,x:"Task Scheduler runs programs on a schedule or trigger."},
    {t:"Set the Print Spooler to start automatically",b:4,x:"Services sets each service's startup type."},
    {t:"Restart a stopped service",b:4,x:"Services starts, stops and restarts services."},
  ]},
  {kind:"buckets",task:"Which command fixes it?",buckets:["sfc","DISM","gpupdate","chkdsk"],items:[
    {t:"Scan and repair protected Windows system files",b:0,x:"sfc /scannow checks protected system files and replaces bad ones from cached copies."},
    {t:"sfc found corrupt files it could not repair",b:1,x:"DISM /Online /Cleanup-Image /RestoreHealth repairs the component store sfc repairs from; then run sfc again."},
    {t:"Repair the Windows image that system files are restored from",b:1,x:"DISM services and repairs the Windows image."},
    {t:"Apply a new Group Policy now instead of waiting",b:2,x:"gpupdate /force reapplies Group Policy immediately."},
    {t:"A new drive-mapping policy hasn't reached a user's PC",b:2,x:"gpupdate pulls the latest Group Policy right away."},
    {t:"Find and fix file system errors and bad sectors",b:3,x:"chkdsk /f fixes file system errors; /r also finds bad sectors."},
    {t:"The PC lost power mid-write and the disk now shows errors",b:3,x:"Interrupted writes cause file system errors, which chkdsk repairs."},
  ]},
 ]},
{id:"lab:core2:harden",c:"core2",d:2,title:"Harden a workstation",
 scenario:"A new laptop is going to the finance team. Policy: complex passwords of at least 12 characters, changed every 90 days, lockout after 5 failed tries, screen locks after 5 idle minutes.",
 parts:[
  {kind:"config",task:"Set the account and password policy to match the company policy.",rows:[
    [txt("Minimum password length (characters)",["12"],"Policy says at least 12 characters.","number")],
    [txt("Maximum password age (days)",["90"],"Policy says passwords change every 90 days.","number")],
    [chk("Password must meet complexity requirements",true,"Policy asks for complex passwords: a mix of character types is harder to guess.")],
    [txt("Account lockout threshold (failed attempts)",["5"],"Policy locks the account after 5 failed tries, which stops brute-force guessing.","number")],
    [sel("Screen lock timeout",["Never","5 minutes","30 minutes","1 hour"],1,"Policy locks the screen after 5 idle minutes.")],
    [chkOn("Guest account enabled",false,"The Guest account allows sign-in without a password, so keep it disabled.")],
  ]},
  {kind:"config",task:"Now protect the device itself.",rows:[
    [chkOn("AutoRun enabled",false,"AutoRun can launch malware from a USB stick as soon as it's inserted.")],
    [chk("BitLocker drive encryption",true,"BitLocker encrypts the drive, so data stays safe if the laptop is stolen.")],
    [chk("Windows Defender Firewall on",true,"The host firewall blocks unsolicited inbound connections.")],
    [sel("Built-in Administrator account",["Leave enabled with its default name","Disable it","Share its password with the team"],1,"Attackers target the built-in Administrator, so disable it and use named admin accounts.")],
    [sel("The user's everyday account type",["Local administrator","Standard user"],1,"Least privilege: daily work as a standard user limits what malware can do.")],
  ]},
 ]},
{id:"lab:core2:physical",c:"core2",d:2,title:"Secure the floor plan",
 scenario:"You're reviewing physical security for a small office with a server room. Place each control where it belongs.",
 parts:[
  {kind:"diagram",task:"Place a control on each numbered spot. Two controls don't belong on a floor plan.",art:"floorplan",
   labels:["Fencing","Bollards","Access control vestibule","Security guard","Video surveillance (CCTV)","Badge reader","Biometric lock","Cable lock","Privacy screen"],
   slots:[
    {n:1,x:30,y:150,a:0,why:"A perimeter fence is the outermost layer, keeping people to controlled entry points."},
    {n:2,x:205,y:255,a:1,why:"Bollards in front of the entrance stop vehicles from ramming the building."},
    {n:3,x:205,y:205,a:2,why:"An access control vestibule (mantrap) between two doors stops tailgating."},
    {n:4,x:160,y:160,a:3,why:"A guard at the lobby desk checks IDs and signs in visitors."},
    {n:5,x:265,y:135,a:4,why:"A camera covering the lobby records who comes and goes."},
    {n:6,x:140,y:100,a:5,why:"A badge reader on the office door lets only employees in."},
    {n:7,x:320,y:100,a:6,why:"The server room is the most sensitive space, so it gets a biometric lock."},
   ]},
 ]},

/* ---------- Linux+ ---------- */
{id:"lab:linux:permissions",c:"linux",d:3,title:"Set file permissions",
 scenario:"The team shares /srv/reports/build.sh. alice maintains it, the devs group runs it, and nobody else may touch it.",
 parts:[
  {kind:"config",task:"Tick the permissions each class needs.",head:["","Read","Write","Execute"],rows:[
    [chk("Owner: read",true,"alice maintains the script, so she needs to read it."),chk("Owner: write",true,"alice edits the script, so she needs write."),chk("Owner: execute",true,"alice runs it too, so she needs execute.")],
    [chk("Group: read",true,"A shell script must be readable to run."),chk("Group: write",false,"The devs only run it, so no write."),chk("Group: execute",true,"The devs run it, so they need execute.")],
    [chk("Other: read",false,"Nobody else may touch it."),chk("Other: write",false,"Nobody else may touch it."),chk("Other: execute",false,"Nobody else may touch it.")],
  ]},
  {kind:"config",task:"Now write it out and apply it.",rows:[
    [txt("Octal mode",["750","0750"],"rwx = 4+2+1 = 7, r-x = 4+1 = 5, --- = 0, so 750.","e.g. 644")],
    [txt("Owner",["alice"],"alice maintains the script, so she owns it.")],
    [txt("Group",["devs"],"The devs group runs it, so it's the group owner.")],
    [sel("Command to set the mode",["chmod 750 build.sh","chown 750 build.sh","chmod 570 build.sh","umask 750"],0,"chmod sets the mode; chown changes ownership and umask only sets defaults for new files.")],
    [sel("Command to set owner and group",["chown alice:devs build.sh","chmod alice:devs build.sh","chgrp alice build.sh","usermod -g devs alice"],0,"chown user:group sets both at once.")],
  ]},
 ]},
{id:"lab:linux:fhs",c:"linux",d:1,title:"Map the filesystem",
 scenario:"A new admin keeps asking where things live. Label the directory tree for them.",
 parts:[
  {kind:"diagram",task:"Place the right directory on each box. The hint in each box says what lives there.",art:"fstree",
   labels:["/etc","/var/log","/home","/bin","/tmp","/proc","/boot","/dev","/opt","/srv","/mnt"],
   slots:[
    {n:1,x:97,y:85,a:0,why:"System-wide configuration files live in /etc."},
    {n:2,x:302,y:85,a:1,why:"Log files, such as messages, secure and the journal, live under /var/log."},
    {n:3,x:97,y:175,a:2,why:"Regular users' home directories are under /home."},
    {n:4,x:302,y:175,a:3,why:"/bin holds essential commands like ls and cp (on many distros it now links to /usr/bin)."},
    {n:5,x:97,y:265,a:4,why:"/tmp is for temporary files and is often cleared at boot."},
    {n:6,x:302,y:265,a:5,why:"/proc is a virtual filesystem the kernel fills with process and system information."},
    {n:7,x:97,y:355,a:6,why:"/boot holds the kernel, initramfs and boot loader files."},
    {n:8,x:302,y:355,a:7,why:"/dev holds device files such as /dev/sda."},
   ]},
 ]},
{id:"lab:linux:commands",c:"linux",d:1,title:"Command to task",
 scenario:"You're on call for a busy web server. Sort the commands you'd reach for by what they look at.",
 parts:[
  {kind:"buckets",task:"Which area does each command deal with?",buckets:["Processes","Disk & storage","Network","Packages"],items:[
    {t:"ps aux",b:0,x:"ps lists running processes."},
    {t:"top",b:0,x:"top shows live process CPU and memory use."},
    {t:"kill 4321",b:0,x:"kill sends a signal to a process by PID."},
    {t:"df -h",b:1,x:"df shows free space per mounted filesystem."},
    {t:"du -sh /var",b:1,x:"du shows how much space a directory uses."},
    {t:"lsblk",b:1,x:"lsblk lists block devices and their partitions."},
    {t:"ip addr",b:2,x:"ip addr shows interface addresses."},
    {t:"ss -tulpn",b:2,x:"ss lists listening sockets and the processes that own them."},
    {t:"dnf install httpd",b:3,x:"dnf is the package manager on RHEL-family systems."},
    {t:"apt update",b:3,x:"apt is the package manager on Debian-family systems."},
  ]},
 ]},
{id:"lab:linux:static-net",c:"linux",d:1,title:"Static network config",
 scenario:"web01 needs a static address on ens192: 10.20.30.15 on a /24, gateway 10.20.30.1, DNS 10.20.30.53. Then let SSH through the firewall in the public zone.",
 parts:[
  {kind:"config",task:"Fill in the NetworkManager connection settings.",rows:[
    [sel("IPv4 method",["auto (DHCP)","manual","link-local","disabled"],1,"A static address means ipv4.method manual.")],
    [txt("Address/prefix",["10.20.30.15/24"],"The address with its prefix length: /24 is 255.255.255.0.","address/prefix")],
    [txt("Gateway",["10.20.30.1"],"The gateway is the router address you were given.")],
    [txt("DNS server",["10.20.30.53"],"The DNS server address you were given.")],
    [sel("Apply the change",["nmcli connection up ens192","ip link delete ens192","systemctl stop NetworkManager","dhclient ens192"],0,"Bringing the connection up again applies the new settings.")],
  ]},
  {kind:"config",task:"Now open SSH in the firewall.",rows:[
    [txt("Port/protocol to allow",["22/tcp","tcp/22","22"],"SSH listens on TCP port 22.","port/proto")],
    [sel("firewalld command",["firewall-cmd --permanent --zone=public --add-port=22/tcp","firewall-cmd --zone=public --remove-port=22/tcp","iptables -F","systemctl stop firewalld"],0,"--add-port opens the port in the zone, and --permanent keeps it after a reload or reboot.")],
    [chk("Run firewall-cmd --reload afterwards",true,"--permanent only writes the config; --reload applies it to the running firewall.")],
    [chk("Also allow 23/tcp (Telnet)",false,"Telnet is unencrypted, and SSH replaces it.")],
  ]},
 ]},
];

const api={LABS,DIAGRAMS};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else window.LabData=api;
})();
