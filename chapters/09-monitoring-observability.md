## Chapter 9: Monitoring and Observability

### Monitoring Stack

**Components:**

- **Prometheus:** Metrics collection and storage (7-day retention)
- **Grafana:** Visualization and dashboards
- **Pushgateway:** Metrics push endpoint for batch jobs
- **kube-state-metrics:** Kubernetes object metrics
- **node-exporter:** Node-level metrics

### Deployment

**Method:** Helm chart (`monitoring-stack`)
**Namespace:** `observability`
**Storage:** 8Gi persistent volume for Prometheus, 2Gi for Grafana

### Metrics Collection

**Scrape Targets:**

- Kubernetes API (via kube-state-metrics)
- Node metrics (via node-exporter)
- Pi-hole (DNS and ad-blocking stats)
- HashiCorp Vault (seal status, request metrics)
- Traefik (ingress metrics)
- PostgreSQL (database metrics)
- Redis (cache metrics)
- Application metrics (SwimTO, OpenClaw)

### Grafana Dashboards

**Dashboards Created:**

- Pi Fleet Overview (cluster-wide health)
- Hardware Health (Raspberry Pi specific: temperature, CPU, memory)
- Kubernetes Cluster Overview
- Vault Health and Seal Status
- Traefik Ingress Metrics

### Access

- **Grafana:** https://grafana.eldertree.local
- **Prometheus:** https://prometheus.eldertree.local
- **Pushgateway:** https://pushgateway.eldertree.local

**Grafana Credentials:** Stored in Vault at `secret/monitoring/grafana`

### Lessons Learned

- Monitoring is essential from day one
- Raspberry Pi-specific metrics (temperature!) are valuable for hardware health
- Persistent storage for Prometheus is critical (7-day retention fits in 8Gi)
- Grafana dashboards save significant time in troubleshooting
- Pushgateway is useful for collecting metrics from short-lived jobs

---
