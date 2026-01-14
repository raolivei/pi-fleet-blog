#!/usr/bin/env python3
"""
Eldertree Podcast Episode Generator

Generates narrative podcast scripts from exported data using templates.

Usage:
    python generate_episodes.py --data ./podcast/raw-data --output ./podcast
"""

import argparse
import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Optional, List, Dict

# yaml is optional
try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

# Try to import jinja2 for templating
try:
    from jinja2 import Environment, FileSystemLoader
    HAS_JINJA2 = True
except ImportError:
    HAS_JINJA2 = False
    print("Warning: jinja2 not installed. Using simple string templates.")

PI_FLEET_ROOT = Path(__file__).parent.parent.parent
TEMPLATES_DIR = Path(__file__).parent / "templates"


def load_config(config_path: Path) -> dict:
    """Load episode configuration from YAML or JSON."""
    with open(config_path) as f:
        content = f.read()
    
    # Try YAML first if available
    if HAS_YAML and config_path.suffix in ['.yaml', '.yml']:
        return yaml.safe_load(content)
    
    # Fall back to JSON
    if config_path.suffix == '.json':
        return json.loads(content)
    
    # Try YAML if available, otherwise try JSON
    if HAS_YAML:
        return yaml.safe_load(content)
    
    # Last resort: try JSON
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        print(f"Error: Cannot parse {config_path}. Install PyYAML: pip3 install pyyaml")
        raise


def load_export_data(data_dir: Path) -> dict:
    """Load exported data."""
    main_export = data_dir / "raw-export.json"
    if not main_export.exists():
        raise FileNotFoundError(f"Export data not found at {main_export}")
    
    with open(main_export) as f:
        return json.load(f)


def extract_conversations_for_episode(
    episode_id: str, 
    categorized_data: dict,
    all_conversations: list
) -> list[dict]:
    """Extract relevant conversations for an episode."""
    conversations = []
    
    # Get items categorized for this episode
    episode_items = categorized_data.get(episode_id, [])
    
    for item in episode_items:
        if item.get("source_type") == "conversation":
            for conv in item.get("conversations", []):
                if conv.get("user") and conv.get("assistant"):
                    conversations.append({
                        "question": conv["user"][:500],  # Truncate
                        "answer": conv["assistant"][:2000]
                    })
    
    return conversations


def extract_docs_for_episode(
    episode_id: str,
    categorized_data: dict,
    config_episode: dict
) -> list[dict]:
    """Extract relevant documentation for an episode."""
    docs = []
    
    # Get items categorized for this episode
    episode_items = categorized_data.get(episode_id, [])
    
    for item in episode_items:
        if item.get("source_type") == "documentation":
            docs.append({
                "title": item.get("title", ""),
                "filename": item.get("filename", ""),
                "content_preview": item.get("content", "")[:1000]
            })
    
    return docs


def generate_narrative_content(
    episode_config: dict,
    docs: list,
    conversations: list,
    git_commits: list
) -> dict:
    """Generate narrative content structure for an episode."""
    
    episode_id = episode_config["id"]
    title = episode_config["title"]
    subtitle = episode_config["subtitle"]
    description = episode_config["description"]
    
    # Build introduction from description
    introduction = description.strip()
    
    # Generate acts based on available content
    acts = generate_acts(episode_id, docs, conversations)
    
    # Generate lessons learned
    lessons = generate_lessons(episode_id, docs)
    
    return {
        "introduction": introduction,
        "acts": acts,
        "lessons": lessons,
        "conversations_used": len(conversations),
        "docs_used": len(docs)
    }


def generate_acts(episode_id: str, docs: list, conversations: list) -> list[dict]:
    """Generate act structure based on episode content."""
    
    # Default act structures based on episode type
    act_templates = {
        "01-the-beginning": [
            {"title": "The Vision", "theme": "Why build a Pi cluster?"},
            {"title": "The Hardware", "theme": "Unboxing and assembly"},
            {"title": "First Boot", "theme": "Initial OS installation"}
        ],
        "02-nvme-migration": [
            {"title": "The Problem with SD Cards", "theme": "Why migrate to NVMe"},
            {"title": "The Migration Process", "theme": "Step by step"},
            {"title": "Boot Configuration Hell", "theme": "Making it actually boot"}
        ],
        "03-network-nightmares": [
            {"title": "DNS, The Silent Killer", "theme": "When names don't resolve"},
            {"title": "Firewall Follies", "theme": "UFW and the packets it ate"},
            {"title": "Cross-Node Communication", "theme": "Flannel and VXLAN troubles"}
        ],
        "04-flux-bootstrap": [
            {"title": "Why GitOps?", "theme": "The philosophy"},
            {"title": "The Bootstrap", "theme": "Setting up Flux"},
            {"title": "Declarative Everything", "theme": "Living the dream"}
        ],
        "05-storage-wars": [
            {"title": "Local Path Limitations", "theme": "Single point of failure"},
            {"title": "Enter Longhorn", "theme": "First attempt (failure)"},
            {"title": "The Breakthrough", "theme": "Making it work"}
        ],
        "06-secrets-vaults": [
            {"title": "Secrets Management 101", "theme": "Why Vault?"},
            {"title": "The Unseal Dance", "theme": "Vault initialization"},
            {"title": "HA Configuration", "theme": "Raft consensus"}
        ],
        "07-ha-quest": [
            {"title": "Single Point of Failure", "theme": "The wake-up call"},
            {"title": "The Conversion", "theme": "Worker to control plane"},
            {"title": "The Test", "theme": "Pulling the plug on node-1"}
        ],
        "08-troubleshooting": [
            {"title": "Emergency Mode Adventures", "theme": "When boot fails"},
            {"title": "SSH Lockouts", "theme": "Permission denied"},
            {"title": "The Recovery Toolkit", "theme": "How we fix things"}
        ],
        "09-monitoring-stack": [
            {"title": "Why Observe?", "theme": "Visibility matters"},
            {"title": "Prometheus Setup", "theme": "Metrics collection"},
            {"title": "Grafana Dashboards", "theme": "Making sense of data"}
        ],
        "10-production-ready": [
            {"title": "The Final Architecture", "theme": "What we built"},
            {"title": "Real Applications", "theme": "Actually using the cluster"},
            {"title": "Lessons for the Journey", "theme": "What we learned"}
        ]
    }
    
    acts = act_templates.get(episode_id, [
        {"title": "Part One", "theme": "Introduction"},
        {"title": "Part Two", "theme": "The Journey"},
        {"title": "Part Three", "theme": "Resolution"}
    ])
    
    # Enrich acts with content from docs and conversations
    for i, act in enumerate(acts):
        act["content"] = generate_act_content(act, docs, conversations, i)
    
    return acts


def generate_act_content(act: dict, docs: list, conversations: list, act_index: int) -> str:
    """Generate content for a single act."""
    
    content_parts = []
    
    # Add theme introduction
    content_parts.append(f"Let's talk about {act['theme'].lower()}.")
    content_parts.append("")
    
    # Add relevant doc content
    if docs and act_index < len(docs):
        doc = docs[act_index]
        preview = doc.get("content_preview", "")[:500]
        if preview:
            # Clean up the preview
            preview = re.sub(r'#+ ', '', preview)  # Remove markdown headers
            preview = re.sub(r'\n+', ' ', preview)  # Collapse newlines
            content_parts.append(preview)
            content_parts.append("")
    
    # Add relevant conversation excerpt
    if conversations and act_index < len(conversations):
        conv = conversations[act_index]
        question = conv.get("question", "")
        if question:
            content_parts.append(f"At one point, I asked: \"{question[:200]}...\"")
            content_parts.append("")
    
    # Add placeholder for manual expansion
    content_parts.append("[Expand with specific details, commands, and personal commentary]")
    
    return "\n".join(content_parts)


def generate_lessons(episode_id: str, docs: list) -> list[dict]:
    """Generate lessons learned for an episode."""
    
    # Default lessons by episode
    lesson_templates = {
        "01-the-beginning": [
            {"title": "Start Small", "content": "You don't need a massive cluster to learn. Three nodes is plenty."},
            {"title": "Document Everything", "content": "Future you will thank present you for those notes."}
        ],
        "02-nvme-migration": [
            {"title": "Boot Configuration Matters", "content": "The bootloader is finicky. Respect it."},
            {"title": "Test Before Committing", "content": "Always have a fallback boot option."}
        ],
        "03-network-nightmares": [
            {"title": "Check the Firewall First", "content": "UFW can silently drop packets with no logs."},
            {"title": "DNS is Everything", "content": "When DNS breaks, everything breaks."}
        ],
        "04-flux-bootstrap": [
            {"title": "GitOps Changes Everything", "content": "Once you go declarative, you never go back."},
            {"title": "Start with the Basics", "content": "Master Kustomize before adding complexity."}
        ],
        "05-storage-wars": [
            {"title": "Persistence Requires Planning", "content": "Think about storage before you need it."},
            {"title": "Never Give Up", "content": "Sometimes you need fresh eyes and a new day."}
        ],
        "06-secrets-vaults": [
            {"title": "Secrets Are Serious", "content": "Never commit secrets to git. Ever."},
            {"title": "Plan for Unsealing", "content": "Vault needs to be unsealed after every restart."}
        ],
        "07-ha-quest": [
            {"title": "HA is Worth It", "content": "The peace of mind is invaluable."},
            {"title": "Test Your Failover", "content": "HA that's never tested isn't really HA."}
        ],
        "08-troubleshooting": [
            {"title": "Have a Recovery Plan", "content": "Know how to get back in when locked out."},
            {"title": "Logs Are Your Friend", "content": "journalctl and kubectl logs will save you."}
        ],
        "09-monitoring-stack": [
            {"title": "Observe Before Optimizing", "content": "You can't fix what you can't see."},
            {"title": "Alerts Should Be Actionable", "content": "Only alert on things you can and will fix."}
        ],
        "10-production-ready": [
            {"title": "Simplicity Wins", "content": "The best infrastructure is the one you understand."},
            {"title": "It's a Journey", "content": "Infrastructure is never done, just better."}
        ]
    }
    
    return lesson_templates.get(episode_id, [
        {"title": "Keep Learning", "content": "Every failure is a lesson in disguise."}
    ])


def generate_episode_script(
    episode_config: dict,
    narrative: dict,
    episode_number: int,
    next_episode: Optional[dict],
    output_dir: Path
) -> Path:
    """Generate the final episode script."""
    
    episode_id = episode_config["id"]
    title = episode_config["title"]
    subtitle = episode_config["subtitle"]
    duration = episode_config.get("estimated_duration", "20-30 minutes")
    
    # Build script content
    script = []
    
    # Header
    script.append(f"# Episode {episode_number}: {title}")
    script.append("")
    script.append(f"**{subtitle}**")
    script.append("")
    script.append("---")
    script.append("")
    
    # Show notes section
    script.append("## Show Notes")
    script.append("")
    script.append(f"- **Episode:** {episode_number} of 10")
    script.append(f"- **Duration:** ~{duration}")
    script.append(f"- **Topics:** {subtitle}")
    script.append(f"- **Source Data:** {narrative['docs_used']} docs, {narrative['conversations_used']} conversations")
    script.append("")
    script.append("---")
    script.append("")
    
    # Script section
    script.append("## Script")
    script.append("")
    
    # Opening
    script.append("### Opening")
    script.append("")
    script.append("[Opening music fades in - 5 seconds]")
    script.append("")
    script.append("Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.")
    script.append("")
    script.append(f"I'm your host, and today we're diving into Episode {episode_number}: {title}.")
    script.append("")
    script.append("[Music fades out]")
    script.append("")
    script.append("[pause]")
    script.append("")
    script.append("---")
    script.append("")
    
    # Introduction
    script.append("### Introduction")
    script.append("")
    script.append(narrative["introduction"])
    script.append("")
    script.append("[pause]")
    script.append("")
    script.append("So let's start from the beginning...")
    script.append("")
    script.append("---")
    script.append("")
    
    # Acts
    for i, act in enumerate(narrative["acts"], 1):
        script.append(f"### Act {i}: {act['title']}")
        script.append("")
        script.append(f"*{act['theme']}*")
        script.append("")
        script.append(act["content"])
        script.append("")
        script.append("[pause - 2 seconds]")
        script.append("")
        script.append("---")
        script.append("")
    
    # Lessons Learned
    script.append("### Lessons Learned")
    script.append("")
    script.append("[Reflective music starts - low volume]")
    script.append("")
    script.append("What did we learn from this experience?")
    script.append("")
    
    for i, lesson in enumerate(narrative["lessons"], 1):
        script.append(f"**Lesson {i}: {lesson['title']}**")
        script.append("")
        script.append(lesson["content"])
        script.append("")
        script.append("[pause]")
        script.append("")
    
    script.append("---")
    script.append("")
    
    # Closing
    script.append("### Closing")
    script.append("")
    script.append("[Music swells slightly]")
    script.append("")
    script.append(f"And that's a wrap on Episode {episode_number}: {title}.")
    script.append("")
    
    if next_episode:
        script.append(f"In the next episode, we'll tackle {next_episode['title']}: {next_episode['subtitle']}. Trust me, you won't want to miss it.")
    else:
        script.append("This has been the final episode of Building Eldertree. Thank you for joining me on this incredible journey.")
    
    script.append("")
    script.append("[pause]")
    script.append("")
    script.append("If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.")
    script.append("")
    script.append("Until next time, keep your clusters redundant and your firewalls properly configured.")
    script.append("")
    script.append("[Outro music - 5 seconds]")
    script.append("")
    script.append("---")
    script.append("")
    script.append(f"*Episode generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*")
    script.append("")
    script.append("*This is a draft script. Please review and expand with personal commentary before recording.*")
    
    # Write script
    script_path = output_dir / f"episode-{episode_id}" / "script.md"
    script_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(script_path, "w") as f:
        f.write("\n".join(script))
    
    return script_path


def generate_show_notes(
    episode_config: dict,
    narrative: dict,
    episode_number: int,
    docs: list,
    output_dir: Path
) -> Path:
    """Generate show notes for an episode."""
    
    episode_id = episode_config["id"]
    title = episode_config["title"]
    subtitle = episode_config["subtitle"]
    
    notes = []
    
    notes.append(f"# Episode {episode_number}: {title} - Show Notes")
    notes.append("")
    notes.append(f"**{subtitle}**")
    notes.append("")
    
    # Summary
    notes.append("## Episode Summary")
    notes.append("")
    notes.append(narrative["introduction"])
    notes.append("")
    
    # Timestamps (placeholder)
    notes.append("## Timestamps")
    notes.append("")
    notes.append("- **0:00** - Introduction")
    for i, act in enumerate(narrative["acts"], 1):
        notes.append(f"- **[TBD]** - Act {i}: {act['title']}")
    notes.append("- **[TBD]** - Lessons Learned")
    notes.append("- **[TBD]** - Closing")
    notes.append("")
    
    # Key Takeaways
    notes.append("## Key Takeaways")
    notes.append("")
    for i, lesson in enumerate(narrative["lessons"], 1):
        notes.append(f"{i}. **{lesson['title']}** - {lesson['content']}")
    notes.append("")
    
    # Documentation References
    if docs:
        notes.append("## Documentation References")
        notes.append("")
        for doc in docs[:5]:  # Limit to 5
            notes.append(f"- [{doc['title']}](https://github.com/raolivei/pi-fleet/blob/main/docs/{doc['filename']})")
        notes.append("")
    
    # Related Keywords
    notes.append("## Topics Covered")
    notes.append("")
    keywords = episode_config.get("keywords", [])[:10]
    notes.append(", ".join(keywords))
    notes.append("")
    
    # Connect
    notes.append("## Connect")
    notes.append("")
    notes.append("- **GitHub Repository:** [raolivei/pi-fleet](https://github.com/raolivei/pi-fleet)")
    notes.append(f"- **Episode Folder:** [podcast/episode-{episode_id}/](https://github.com/raolivei/pi-fleet/tree/main/podcast/episode-{episode_id})")
    notes.append("")
    notes.append("---")
    notes.append("")
    notes.append(f"*Building Eldertree - Episode {episode_number} of 10*")
    
    # Write notes
    notes_path = output_dir / f"episode-{episode_id}" / "show-notes.md"
    notes_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(notes_path, "w") as f:
        f.write("\n".join(notes))
    
    return notes_path


def main():
    parser = argparse.ArgumentParser(
        description="Generate podcast episode scripts from exported data"
    )
    parser.add_argument(
        "--data", "-d",
        type=Path,
        default=PI_FLEET_ROOT / "podcast" / "raw-data",
        help="Path to exported data directory"
    )
    parser.add_argument(
        "--config", "-c",
        type=Path,
        default=Path(__file__).parent / "config.yaml",
        help="Path to episode configuration"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=PI_FLEET_ROOT / "podcast",
        help="Output directory for generated episodes"
    )
    parser.add_argument(
        "--episode", "-e",
        type=str,
        help="Generate only specific episode (e.g., '01-the-beginning')"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Eldertree Podcast Episode Generator")
    print("=" * 60)
    
    # Load configuration
    print("\n[1/4] Loading configuration...")
    config = load_config(args.config)
    episodes_config = config.get("episodes", [])
    print(f"      Found {len(episodes_config)} episode definitions")
    
    # Load export data
    print("\n[2/4] Loading export data...")
    try:
        export_data = load_export_data(args.data)
        categorized = export_data.get("categorized_by_episode", {})
        all_conversations = export_data.get("chat_sessions", [])
        print(f"      Loaded {len(all_conversations)} chat sessions")
    except FileNotFoundError:
        print("      Warning: No export data found. Run export.py first!")
        print("      Generating with template content only...")
        export_data = {}
        categorized = {}
        all_conversations = []
    
    # Generate episodes
    print("\n[3/4] Generating episode scripts...")
    
    generated = []
    for i, ep_config in enumerate(episodes_config, 1):
        episode_id = ep_config["id"]
        
        if args.episode and episode_id != args.episode:
            continue
        
        print(f"      Generating Episode {i}: {ep_config['title']}...")
        
        # Extract content for this episode
        docs = extract_docs_for_episode(episode_id, categorized, ep_config)
        conversations = extract_conversations_for_episode(episode_id, categorized, all_conversations)
        
        # Generate narrative structure
        narrative = generate_narrative_content(
            ep_config, docs, conversations, 
            export_data.get("git_history", [])
        )
        
        # Get next episode for teaser
        next_episode = episodes_config[i] if i < len(episodes_config) else None
        
        # Generate script
        script_path = generate_episode_script(
            ep_config, narrative, i, next_episode, args.output
        )
        
        # Generate show notes
        notes_path = generate_show_notes(
            ep_config, narrative, i, docs, args.output
        )
        
        generated.append({
            "episode": episode_id,
            "script": str(script_path),
            "notes": str(notes_path)
        })
    
    # Summary
    print("\n[4/4] Generation complete!")
    print(f"\n      Generated {len(generated)} episodes:")
    for ep in generated:
        print(f"      - {ep['episode']}")
    
    print("\n" + "=" * 60)
    print("Next Steps:")
    print("1. Review generated scripts in podcast/episode-*/script.md")
    print("2. Expand [placeholder] sections with personal commentary")
    print("3. Add specific commands, errors, and solutions from your journey")
    print("4. Use AI TTS (NotebookLM, ElevenLabs) to generate audio")
    print("5. Publish to Spotify via podcasters.spotify.com")
    print("=" * 60)


if __name__ == "__main__":
    main()
