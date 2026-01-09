## Chapter 3: Operating System and Base Setup

### OS Choice: Debian 12 Bookworm

**Decision:** Debian 12 Bookworm

**Rationale:**

- [ ] Stability and reliability
- [ ] Excellent ARM64 support
- [ ] Long-term support
- [ ] Package availability
- [ ] Compatibility with K3s

### Initial Setup Process

1. **OS Installation**

   - [ ] Method used (Raspberry Pi Imager, manual, etc.)
   - [ ] Initial configuration steps
   - [ ] User setup and SSH configuration

2. **System Configuration**

   - [ ] Hostname: `eldertree`
   - [ ] Static IP configuration
   - [ ] SSH key setup
   - [ ] Firewall rules
   - [ ] System updates

3. **Prerequisites Installation**
   - [ ] Required packages
   - [ ] System dependencies
   - [ ] Network configuration

### Automation with Ansible

**Tool Choice:** Ansible for system configuration

**Benefits:**

- Idempotent configuration
- Version-controlled setup
- Reproducible deployments
- Clear separation of concerns

**Key Playbooks:**

- `setup-system.yml` - Base system configuration
- `install-k3s.yml` - K3s installation
- `bootstrap-flux.yml` - GitOps bootstrap

### Lessons Learned

- [ ] Importance of automation from the start
- [ ] Configuration management benefits
- [ ] Challenges with ARM64 packages

---
