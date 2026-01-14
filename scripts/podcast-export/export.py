#!/usr/bin/env python3
"""
Eldertree Podcast Export Tool

Exports Cursor chat sessions, documentation, git history, and GitHub issues
into structured data for podcast episode generation.

Usage:
    python export.py --output ./podcast-data
    python export.py --config config.yaml --output ./podcast-data
"""

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional, List, Dict

# yaml is optional - only needed if using config.yaml
try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

# Default paths
HOME = Path.home()
CURSOR_STORAGE = HOME / "Library/Application Support/Cursor/User/workspaceStorage"
PI_FLEET_ROOT = Path(__file__).parent.parent.parent
DOCS_DIR = PI_FLEET_ROOT / "docs"
BLOG_DIR = PI_FLEET_ROOT / "blog"


def find_relevant_workspaces() -> list[Path]:
    """Find Cursor workspaces related to raolivei/pi-fleet."""
    relevant_workspaces = []
    
    if not CURSOR_STORAGE.exists():
        print(f"Warning: Cursor storage not found at {CURSOR_STORAGE}")
        return relevant_workspaces
    
    for workspace_dir in CURSOR_STORAGE.iterdir():
        if not workspace_dir.is_dir():
            continue
        
        workspace_json = workspace_dir / "workspace.json"
        if workspace_json.exists():
            try:
                with open(workspace_json) as f:
                    data = json.load(f)
                folder = data.get("folder", "") or data.get("workspace", "")
                if "raolivei" in folder or "pi-fleet" in folder:
                    relevant_workspaces.append(workspace_dir)
            except (json.JSONDecodeError, IOError):
                continue
    
    return relevant_workspaces


def parse_chat_sessions(workspace_dir: Path) -> list[dict[str, Any]]:
    """Parse chat session JSON files from a workspace."""
    sessions = []
    chat_sessions_dir = workspace_dir / "chatSessions"
    
    if not chat_sessions_dir.exists():
        return sessions
    
    for session_file in chat_sessions_dir.glob("*.json"):
        try:
            with open(session_file) as f:
                session_data = json.load(f)
            
            # Extract relevant conversation data
            requests = session_data.get("requests", [])
            if not requests:
                continue
            
            session_info = {
                "session_id": session_data.get("sessionId", session_file.stem),
                "created_date": session_data.get("creationDate"),
                "last_message_date": session_data.get("lastMessageDate"),
                "workspace": str(workspace_dir),
                "conversations": []
            }
            
            for request in requests:
                message = request.get("message", {})
                response = request.get("response", [])
                
                # Extract message text
                message_text = message.get("text", "")
                
                # Extract response text (filter out tool invocations)
                response_text = ""
                for resp_part in response:
                    if isinstance(resp_part, dict):
                        value = resp_part.get("value", "")
                        if value and resp_part.get("kind") != "toolInvocationSerialized":
                            response_text += value
                    elif isinstance(resp_part, str):
                        response_text += resp_part
                
                if message_text or response_text:
                    session_info["conversations"].append({
                        "user": message_text,
                        "assistant": response_text[:10000] if response_text else "",  # Truncate very long responses
                        "request_id": request.get("requestId", "")
                    })
            
            if session_info["conversations"]:
                sessions.append(session_info)
                
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not parse {session_file}: {e}")
            continue
    
    return sessions


def read_documentation() -> list[dict[str, Any]]:
    """Read all markdown documentation files."""
    docs = []
    
    if not DOCS_DIR.exists():
        print(f"Warning: Docs directory not found at {DOCS_DIR}")
        return docs
    
    for doc_file in sorted(DOCS_DIR.glob("*.md")):
        try:
            content = doc_file.read_text()
            
            # Extract title from first heading
            title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            title = title_match.group(1) if title_match else doc_file.stem
            
            docs.append({
                "filename": doc_file.name,
                "title": title,
                "content": content,
                "path": str(doc_file.relative_to(PI_FLEET_ROOT)),
                "size": len(content)
            })
        except IOError as e:
            print(f"Warning: Could not read {doc_file}: {e}")
            continue
    
    return docs


def read_blog_posts() -> list[dict[str, Any]]:
    """Read existing blog posts."""
    posts = []
    
    if not BLOG_DIR.exists():
        print(f"Warning: Blog directory not found at {BLOG_DIR}")
        return posts
    
    for post_file in sorted(BLOG_DIR.glob("*.md")):
        if post_file.name in ["README.md", "BLOG_GUIDE.md", "BLOG_NEXT_STEPS.md", "BLOG_README.md"]:
            continue
        
        try:
            content = post_file.read_text()
            
            # Extract title from first heading
            title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            title = title_match.group(1) if title_match else post_file.stem
            
            # Extract date from filename if present
            date_match = re.search(r'(\d{4}-\d{2}-\d{2})', post_file.name)
            date = date_match.group(1) if date_match else None
            
            posts.append({
                "filename": post_file.name,
                "title": title,
                "date": date,
                "content": content,
                "path": str(post_file.relative_to(PI_FLEET_ROOT))
            })
        except IOError as e:
            print(f"Warning: Could not read {post_file}: {e}")
            continue
    
    return posts


def get_git_history(limit: int = 200) -> list[dict[str, Any]]:
    """Get git commit history."""
    commits = []
    
    try:
        result = subprocess.run(
            ["git", "log", f"--max-count={limit}", "--pretty=format:%H|%ai|%s|%b|||"],
            cwd=PI_FLEET_ROOT,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"Warning: Could not get git history: {result.stderr}")
            return commits
        
        raw_commits = result.stdout.split("|||")
        for raw_commit in raw_commits:
            raw_commit = raw_commit.strip()
            if not raw_commit:
                continue
            
            parts = raw_commit.split("|", 3)
            if len(parts) >= 3:
                commits.append({
                    "hash": parts[0][:8],
                    "full_hash": parts[0],
                    "date": parts[1],
                    "subject": parts[2],
                    "body": parts[3] if len(parts) > 3 else ""
                })
    except Exception as e:
        print(f"Warning: Could not get git history: {e}")
    
    return commits


def get_github_issues(repo: str = "raolivei/pi-fleet", limit: int = 100) -> list[dict[str, Any]]:
    """Fetch GitHub issues and PRs using gh CLI."""
    issues = []
    
    try:
        # Check if gh is available
        result = subprocess.run(["which", "gh"], capture_output=True)
        if result.returncode != 0:
            print("Warning: GitHub CLI (gh) not found. Skipping GitHub issues.")
            return issues
        
        # Fetch issues
        result = subprocess.run(
            ["gh", "issue", "list", "--repo", repo, "--limit", str(limit), 
             "--state", "all", "--json", "number,title,body,state,createdAt,closedAt,labels"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0 and result.stdout:
            issues.extend(json.loads(result.stdout))
        
        # Fetch PRs
        result = subprocess.run(
            ["gh", "pr", "list", "--repo", repo, "--limit", str(limit),
             "--state", "all", "--json", "number,title,body,state,createdAt,mergedAt,labels"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0 and result.stdout:
            prs = json.loads(result.stdout)
            for pr in prs:
                pr["type"] = "pr"
            issues.extend(prs)
            
    except Exception as e:
        print(f"Warning: Could not fetch GitHub issues: {e}")
    
    return issues


def categorize_content(docs: list, conversations: list) -> dict[str, list]:
    """Categorize content by episode theme based on keywords."""
    
    # Episode themes and their associated keywords
    episode_keywords = {
        "01-the-beginning": [
            "raspberry", "pi", "cluster", "hardware", "setup", "initial",
            "flash", "install", "sd card", "boot", "first"
        ],
        "02-nvme-migration": [
            "nvme", "ssd", "migration", "storage", "hat", "pcie",
            "boot from", "disk", "drive"
        ],
        "03-network-nightmares": [
            "network", "dns", "firewall", "ufw", "connectivity", "ping",
            "ip", "ethernet", "flannel", "vxlan", "port", "router"
        ],
        "04-flux-bootstrap": [
            "flux", "gitops", "bootstrap", "kustomize", "reconcile",
            "source", "helm release", "git"
        ],
        "05-storage-wars": [
            "longhorn", "storage class", "pvc", "persistent", "volume",
            "replica", "csi", "local-path"
        ],
        "06-secrets-vaults": [
            "vault", "secret", "unseal", "token", "external secrets",
            "hashicorp", "raft"
        ],
        "07-ha-quest": [
            "high availability", "ha", "control plane", "etcd", "quorum",
            "kube-vip", "failover", "leader"
        ],
        "08-troubleshooting": [
            "troubleshoot", "fix", "error", "issue", "problem", "debug",
            "crash", "fail", "recover", "emergency"
        ],
        "09-monitoring-stack": [
            "prometheus", "grafana", "monitor", "metric", "alert",
            "dashboard", "observability", "keda"
        ],
        "10-production-ready": [
            "deploy", "production", "app", "ingress", "certificate",
            "cloudflare", "tunnel", "final"
        ]
    }
    
    categorized = {key: [] for key in episode_keywords.keys()}
    categorized["uncategorized"] = []
    
    def find_category(text: str) -> str:
        text_lower = text.lower()
        scores = {}
        
        for episode, keywords in episode_keywords.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                scores[episode] = score
        
        if scores:
            return max(scores, key=scores.get)
        return "uncategorized"
    
    # Categorize documentation
    for doc in docs:
        category = find_category(doc["title"] + " " + doc.get("content", "")[:500])
        doc["source_type"] = "documentation"
        categorized[category].append(doc)
    
    # Categorize conversations
    for conv in conversations:
        combined_text = ""
        for c in conv.get("conversations", []):
            combined_text += c.get("user", "") + " " + c.get("assistant", "")[:500]
        
        category = find_category(combined_text[:2000])
        conv["source_type"] = "conversation"
        categorized[category].append(conv)
    
    return categorized


def export_data(output_dir: Path, include_github: bool = True) -> dict[str, Any]:
    """Export all data sources."""
    
    print("=" * 60)
    print("Eldertree Podcast Export Tool")
    print("=" * 60)
    
    # Find relevant workspaces
    print("\n[1/6] Finding Cursor workspaces...")
    workspaces = find_relevant_workspaces()
    print(f"      Found {len(workspaces)} relevant workspaces")
    
    # Parse chat sessions
    print("\n[2/6] Parsing chat sessions...")
    all_sessions = []
    for workspace in workspaces:
        sessions = parse_chat_sessions(workspace)
        all_sessions.extend(sessions)
    print(f"      Parsed {len(all_sessions)} chat sessions")
    
    total_conversations = sum(len(s.get("conversations", [])) for s in all_sessions)
    print(f"      Total conversations: {total_conversations}")
    
    # Read documentation
    print("\n[3/6] Reading documentation...")
    docs = read_documentation()
    print(f"      Found {len(docs)} documentation files")
    
    # Read blog posts
    print("\n[4/6] Reading blog posts...")
    blog_posts = read_blog_posts()
    print(f"      Found {len(blog_posts)} blog posts")
    
    # Get git history
    print("\n[5/6] Getting git history...")
    git_history = get_git_history()
    print(f"      Found {len(git_history)} commits")
    
    # Get GitHub issues
    github_issues = []
    if include_github:
        print("\n[6/6] Fetching GitHub issues...")
        github_issues = get_github_issues()
        print(f"      Found {len(github_issues)} issues/PRs")
    else:
        print("\n[6/6] Skipping GitHub issues (disabled)")
    
    # Categorize content
    print("\n[*] Categorizing content by episode theme...")
    categorized = categorize_content(docs, all_sessions)
    
    for episode, items in categorized.items():
        if items:
            print(f"      {episode}: {len(items)} items")
    
    # Prepare export data
    export = {
        "metadata": {
            "exported_at": datetime.now().isoformat(),
            "pi_fleet_root": str(PI_FLEET_ROOT),
            "cursor_storage": str(CURSOR_STORAGE),
            "stats": {
                "workspaces": len(workspaces),
                "chat_sessions": len(all_sessions),
                "conversations": total_conversations,
                "documentation_files": len(docs),
                "blog_posts": len(blog_posts),
                "git_commits": len(git_history),
                "github_issues": len(github_issues)
            }
        },
        "chat_sessions": all_sessions,
        "documentation": docs,
        "blog_posts": blog_posts,
        "git_history": git_history,
        "github_issues": github_issues,
        "categorized_by_episode": categorized
    }
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Write main export file
    main_export_file = output_dir / "raw-export.json"
    with open(main_export_file, "w") as f:
        json.dump(export, f, indent=2, default=str)
    print(f"\n[✓] Main export saved to: {main_export_file}")
    
    # Write categorized episode data
    episodes_dir = output_dir / "episodes"
    episodes_dir.mkdir(exist_ok=True)
    
    for episode_name, items in categorized.items():
        if not items:
            continue
        
        episode_file = episodes_dir / f"{episode_name}.json"
        with open(episode_file, "w") as f:
            json.dump({
                "episode": episode_name,
                "item_count": len(items),
                "items": items
            }, f, indent=2, default=str)
    
    print(f"[✓] Episode data saved to: {episodes_dir}")
    
    # Write summary
    summary_file = output_dir / "EXPORT_SUMMARY.md"
    with open(summary_file, "w") as f:
        f.write("# Eldertree Podcast Export Summary\n\n")
        f.write(f"**Exported:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("## Statistics\n\n")
        f.write(f"- Chat Sessions: {len(all_sessions)}\n")
        f.write(f"- Total Conversations: {total_conversations}\n")
        f.write(f"- Documentation Files: {len(docs)}\n")
        f.write(f"- Blog Posts: {len(blog_posts)}\n")
        f.write(f"- Git Commits: {len(git_history)}\n")
        f.write(f"- GitHub Issues/PRs: {len(github_issues)}\n\n")
        f.write("## Content by Episode\n\n")
        for episode, items in categorized.items():
            if items:
                f.write(f"- **{episode}**: {len(items)} items\n")
        f.write("\n## Files Generated\n\n")
        f.write("- `raw-export.json` - Complete export data\n")
        f.write("- `episodes/*.json` - Data categorized by episode theme\n")
    
    print(f"[✓] Summary saved to: {summary_file}")
    print("\n" + "=" * 60)
    print("Export complete!")
    print("=" * 60)
    
    return export


def main():
    parser = argparse.ArgumentParser(
        description="Export Eldertree journey data for podcast generation"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=PI_FLEET_ROOT / "podcast" / "raw-data",
        help="Output directory for exported data"
    )
    parser.add_argument(
        "--no-github",
        action="store_true",
        help="Skip fetching GitHub issues (faster, works offline)"
    )
    parser.add_argument(
        "--config", "-c",
        type=Path,
        help="Path to config.yaml for episode definitions"
    )
    
    args = parser.parse_args()
    
    export_data(args.output, include_github=not args.no_github)


if __name__ == "__main__":
    main()
