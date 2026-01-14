# Building Eldertree - Podcast Series

**The real journey of running Kubernetes on Raspberry Pis**

A documentary podcast series following the complete journey of building a highly available Kubernetes cluster on Raspberry Pi hardware. From initial setup through production deployment, including all the failures, troubleshooting, and lessons learned along the way.

## Target Audience

- DevOps engineers looking for real-world Kubernetes experience
- SRE professionals interested in home lab setups
- Kubernetes enthusiasts wanting to learn k3s
- Home lab hobbyists
- Software developers interested in infrastructure

## Episodes

| # | Title | Subtitle | Duration |
|---|-------|----------|----------|
| 1 | The Beginning | Setting up the Pi cluster hardware | ~15-20 min |
| 2 | NVMe Migration | Moving from SD cards to NVMe storage | ~20-25 min |
| 3 | Network Nightmares | DNS, firewall, and connectivity battles | ~25-30 min |
| 4 | The Flux Bootstrap | GitOps with Flux CD | ~15-20 min |
| 5 | Storage Wars | Longhorn distributed storage journey | ~25-30 min |
| 6 | Secrets & Vaults | HashiCorp Vault setup and HA | ~20-25 min |
| 7 | The HA Quest | Converting to 3-node high availability | ~35-45 min |
| 8 | When Everything Breaks | Troubleshooting war stories | ~30-35 min |
| 9 | The Monitoring Stack | Prometheus, Grafana, observability | ~20-25 min |
| 10 | Production Ready | Final architecture and lessons learned | ~25-30 min |

**Total Series Length:** ~4-5 hours

## Directory Structure

```
podcast/
├── README.md                      # This file
├── metadata.json                  # Series metadata for Spotify
├── episode-01-the-beginning/
│   ├── script.md                  # Podcast script (narrative)
│   └── show-notes.md              # Links, resources, timestamps
├── episode-02-nvme-migration/
│   └── ...
└── ...
```

## Generating Content

### 1. Export Raw Data

Run the export script to gather all conversation and documentation data:

```bash
cd scripts/podcast-export
python export.py --output ../../podcast/raw-data
```

This will create:
- `raw-data/raw-export.json` - Complete export
- `raw-data/episodes/*.json` - Data categorized by episode

### 2. Generate Episode Scripts

Use the generator script to create narrative scripts:

```bash
python generate_episodes.py --config config.yaml --data ../../podcast/raw-data
```

### 3. Review and Edit

Each episode script will need human review for:
- Accuracy of technical details
- Flow and pacing
- Personal anecdotes and commentary
- Transitions between sections

### 4. Generate Audio

Upload scripts to your chosen TTS service:
- **NotebookLM** - Free, good quality, supports sources
- **ElevenLabs** - High quality, natural voices, paid
- **Play.ht** - Good balance of quality and price
- **Amazon Polly** - AWS service, pay-per-use

### 5. Post-Production

- Add intro/outro music
- Normalize audio levels
- Add chapter markers
- Export as MP3 (192kbps recommended for spoken word)

### 6. Publish to Spotify

1. Create account on [Spotify for Podcasters](https://podcasters.spotify.com/)
2. Upload episodes with show notes
3. Add episode artwork
4. Schedule releases

## TTS Pronunciation Guide

Some technical terms need pronunciation hints:

| Term | Pronunciation |
|------|---------------|
| k3s | "k-threes" |
| k8s | "kubernetes" |
| etcd | "et-see-dee" |
| kubectl | "cube-control" |
| kube-vip | "cube-vip" |
| NVME | "en-vee-em-ee" |
| VXLAN | "vee-ex-lan" |

## License

This podcast content is based on the pi-fleet repository and is intended for educational purposes.

## Contributing

Found an error in an episode script? Open a PR or issue in the pi-fleet repository.
