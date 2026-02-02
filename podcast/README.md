# Building Eldertree - Audio Series

**The real journey of running Kubernetes on Raspberry Pis**

A documentary audio series following the complete journey of building a highly available Kubernetes cluster on Raspberry Pi hardware. From initial setup through production deployment, including all the failures, troubleshooting, and lessons learned along the way.

> **Audio Policy:** All audio is recorded with the author's real human voice. No AI TTS. No voice cloning. No hybrid approaches. See [`docs/AUDIO_SYSTEM.md`](../docs/AUDIO_SYSTEM.md) for the complete system specification.

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
├── metadata.json                  # Series metadata
├── episode-01-the-beginning/
│   ├── script.md                  # Episode script (reference for recording)
│   └── show-notes.md              # Links, resources, timestamps
├── episode-02-nvme-migration/
│   └── ...
└── ...
```

## Recording Workflow

> Full workflow documented in [`docs/AUDIO_SYSTEM.md`](../docs/AUDIO_SYSTEM.md)

### Quick Reference

**Before Recording (5 min)**
1. Read the script once, silently
2. Note 2-3 key points to hit naturally
3. Clear throat, drink water, settle in

**Recording (20-30 min max)**
1. Start immediately—don't wait for "ready"
2. Speak naturally—not audiobook narration
3. Deviate from script when natural
4. If you stumble, pause 3 seconds, restart the sentence
5. Hard stop at 30 minutes

**Editing (10-15 min max)**
- Trim long silences (>4 sec) to 2 sec
- Remove coughs, interruptions
- Keep natural pauses, light stumbles, breath sounds
- Do NOT over-edit for polish

**Export**
- Format: MP3, 128kbps
- Naming: `eldertree-audio-YYYY-MM-DD-title-slug.mp3`

### Quality Bar

- Clear enough to understand 95%+ on first listen
- Natural pacing with real pauses
- Consistent volume (no major peaks/drops)
- Background noise minimal but not zero
- Your actual voice, not a performance

## Technical Terms Reference

Some technical terms for recording clarity:

| Term | Spoken As |
|------|-----------|
| k3s | "k-threes" |
| k8s | "kubernetes" or "k-eights" |
| etcd | "et-see-dee" |
| kubectl | "cube-control" or "cube-c-t-l" |
| kube-vip | "cube-vip" |
| NVMe | "en-vee-em-ee" |
| VXLAN | "vee-ex-lan" |

## Publishing

1. Upload to chosen platform (Spotify for Podcasters, etc.)
2. Add show notes from `show-notes.md`
3. Add episode artwork
4. No scheduled releases—publish when ready

## License

This content is based on the pi-fleet repository and is intended for educational purposes.

## Contributing

Found an error in an episode script? Open a PR or issue in the pi-fleet repository.
