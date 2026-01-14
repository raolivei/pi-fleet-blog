# Episode {{ episode_number }}: {{ title }} - Show Notes

**{{ subtitle }}**

## Episode Summary

{{ summary }}

## Timestamps

{% for timestamp in timestamps %}
- **{{ timestamp.time }}** - {{ timestamp.topic }}
{% endfor %}

## Key Takeaways

{% for takeaway in takeaways %}
{{ loop.index }}. {{ takeaway }}
{% endfor %}

## Commands & Code Snippets

{% for snippet in snippets %}
### {{ snippet.title }}

```{{ snippet.language }}
{{ snippet.code }}
```

{% if snippet.explanation %}
> {{ snippet.explanation }}
{% endif %}

{% endfor %}

## Documentation References

{% for doc in documentation %}
- [{{ doc.title }}]({{ doc.url }}) - {{ doc.description }}
{% endfor %}

## Tools Mentioned

{% for tool in tools %}
- **{{ tool.name }}** - {{ tool.description }} ([{{ tool.url }}]({{ tool.url }}))
{% endfor %}

## Connect

- **GitHub:** [raolivei/pi-fleet](https://github.com/raolivei/pi-fleet)
- **Episode Source Data:** [podcast/episode-{{ episode_id }}/](https://github.com/raolivei/pi-fleet/tree/main/podcast/episode-{{ episode_id }})

---

*Building Eldertree - Episode {{ episode_number }} of 10*
