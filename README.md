# Gmail Cleanup
Gmail scripts to process emails

## Cleanup-Emails.gs

This script:
- Loops through Gmail categories (`updates` and `promotions` in this setup)
- Archives emails with a `Keep` tag after 3 days (for example, `Keep/Shopping` nested tag is archived)
- Archives emails with an `Important` tag after 3 days
- Deletes remaining messages after 3 days, as long as no thread is newer than 3 days

I use this in conjuction with an allowlist filter. As an example:

```
Matches: from:(homedepot.com OR amazon.com)
Do this: Apply label "Keep/Shopping"
```

