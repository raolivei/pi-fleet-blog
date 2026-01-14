# Eldertree Podcast Export Tools

Tools for exporting Cursor conversation history, documentation, and git history into podcast-ready episode scripts.

## Quick Start

```bash
# 1. Install dependencies
pip3 install -r requirements.txt

# 2. Export all data sources
python3 export.py --output ../../podcast/raw-data

# 3. Generate episode scripts
python3 generate_episodes.py --data ../../podcast/raw-data --output ../../podcast
```

## Files

| File | Description |
|------|-------------|
| `export.py` | Main export script - gathers all data sources |
| `generate_episodes.py` | Episode generator - creates narrative scripts |
| `config.yaml` | Episode definitions and TTS configuration |
| `templates/` | Markdown templates for scripts and show notes |
| `requirements.txt` | Python dependencies |

## Export Options

```bash
# Full export (includes GitHub issues)
python3 export.py --output ../../podcast/raw-data

# Quick export (no GitHub API calls)
python3 export.py --no-github --output ../../podcast/raw-data
```

## Generate Options

```bash
# Generate all episodes
python3 generate_episodes.py --data ../../podcast/raw-data --output ../../podcast

# Generate specific episode
python3 generate_episodes.py --episode 07-ha-quest --data ../../podcast/raw-data --output ../../podcast
```

## Output Structure

After running both scripts:

```
podcast/
├── raw-data/
│   ├── raw-export.json      # Complete export data
│   ├── episodes/*.json      # Categorized by episode
│   └── EXPORT_SUMMARY.md    # Export statistics
├── episode-01-the-beginning/
│   ├── script.md            # Podcast script
│   └── show-notes.md        # Episode show notes
├── episode-02-nvme-migration/
│   └── ...
└── metadata.json            # Spotify metadata
```

## Next Steps After Generation

1. **Review Scripts** - Edit `script.md` files to add personal commentary
2. **Expand Placeholders** - Replace `[Expand with specific details...]` sections
3. **Add Timestamps** - Update `[TBD]` timestamps in show notes after recording
4. **Generate Audio** - Upload scripts to NotebookLM or ElevenLabs
5. **Publish** - Use Spotify for Podcasters to upload episodes
