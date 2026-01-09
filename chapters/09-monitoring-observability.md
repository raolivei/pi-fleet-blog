## Chapter 9: Monitoring and Observability

### Monitoring Stack

**Components:**

- **Prometheus:** Metrics collection and storage
- **Grafana:** Visualization and dashboards
- **kube-state-metrics:** Kubernetes object metrics
- **node-exporter:** Node-level metrics

### Deployment

**Method:** Helm chart (`monitoring-stack`)
**Namespace:** `observability`
**Storage:** 8Gi persistent volume for Prometheus

### Grafana Dashboards

**Dashboards Created:**

- Pi Fleet Overview
- Hardware Health (Raspberry Pi specific)
- Kubernetes Cluster Overview
- [Add other dashboards]

### Metrics Collection

**Sources:**

- Kubernetes API (via kube-state-metrics)
- Node metrics (via node-exporter)
- Application metrics (if exposed)
- Custom metrics (if configured)

### Alerting

**Status:** [Configured / Planned]
**Channels:** [Email / Slack / etc.]

### Access

- **Grafana:** https://grafana.eldertree.local
- **Prometheus:** https://prometheus.eldertree.local

### Lessons Learned

- [ ] Monitoring is essential from day one
- [ ] Raspberry Pi-specific metrics are valuable
- [ ] Persistent storage for Prometheus is critical
- [ ] Grafana dashboards save time in troubleshooting

---
