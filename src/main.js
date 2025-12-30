import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Configure marked for code highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {}
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});

// Load and render blog content
async function loadBlog() {
  try {
    // In development, load from public/content
    // In production, it will be in the dist folder
    const response = await fetch('/content/BLOG.md');
    if (!response.ok) {
      throw new Error(`Failed to load blog: ${response.status}`);
    }
    const markdown = await response.text();
    const html = marked.parse(markdown);
    
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = html;
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  } catch (error) {
    console.error('Error loading blog:', error);
    document.getElementById('content').innerHTML = 
      '<div class="error">Error loading blog content. Please check the console.</div>';
  }
}

// Initialize
loadBlog();

