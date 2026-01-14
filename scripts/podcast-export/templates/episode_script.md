# Episode {{ episode_number }}: {{ title }}

**{{ subtitle }}**

---

## Show Notes

- **Episode:** {{ episode_number }} of 10
- **Duration:** {{ duration }}
- **Topics:** {{ topics | join(", ") }}
- **Related Documentation:** {{ related_docs | join(", ") }}

---

## Script

### Opening

[Opening music fades in - 5 seconds]

Welcome back to Building Eldertree, the podcast where we document the real, unvarnished journey of running Kubernetes on Raspberry Pis.

I'm your host, Rafael Oliveira, and today we're diving into {{ title }}.

[Music fades out]

[pause]

---

### Introduction

{{ introduction }}

[pause]

So let's start from the beginning...

---

### Act I: {{ act1_title }}

{{ act1_content }}

[pause - 2 seconds]

---

### Act II: {{ act2_title }}

{{ act2_content }}

[pause - 2 seconds]

---

### Act III: {{ act3_title }}

{{ act3_content }}

[pause - 2 seconds]

---

### Lessons Learned

[Reflective music starts - low volume]

What did we learn from this experience?

{% for lesson in lessons %}
**Lesson {{ loop.index }}:** {{ lesson.title }}

{{ lesson.content }}

[pause]

{% endfor %}

---

### Closing

[Music swells slightly]

And that's a wrap on Episode {{ episode_number }}: {{ title }}.

{% if next_episode %}
In the next episode, we'll tackle {{ next_episode.title }}: {{ next_episode.subtitle }}. Trust me, you won't want to miss it.
{% else %}
This has been the final episode of Building Eldertree. Thank you for joining me on this journey.
{% endif %}

[pause]

If you found this helpful, please subscribe and share with other DevOps enthusiasts. Your support helps us keep creating content for the community.

Until next time, keep your clusters redundant and your firewalls properly configured.

[Outro music - 5 seconds]

---

## Resources Mentioned

{% for resource in resources %}
- [{{ resource.name }}]({{ resource.url }})
{% endfor %}

---

## Technical Commands Used

```bash
{% for command in commands %}
# {{ command.description }}
{{ command.code }}

{% endfor %}
```

---

*Episode generated from pi-fleet documentation and Cursor conversation history.*
*Last updated: {{ generated_at }}*
