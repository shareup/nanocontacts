# nanocontacts Integration Tests

Run these tests on a Mac with Contacts.app access granted.

## Setup

1. Ensure `nanocontacts` is installed: `./install.sh`
2. Verify: `nanocontacts help` — should print usage

## Help

```bash
# Top-level help
nanocontacts help
# Expected: lists all commands, global options, "Run 'nanocontacts help <command>' for details."

nanocontacts --help
# Expected: same as above

nanocontacts -h
# Expected: same as above

# Per-command help
nanocontacts help search
# Expected: usage for search with --limit and --json options

nanocontacts help show
nanocontacts help groups
nanocontacts help create
nanocontacts help update
# Each should print command-specific usage

# Inline help
nanocontacts search --help
# Expected: search command help
```

## groups

```bash
nanocontacts groups
# Expected: text output with NAME header, one group per line (or "No groups found.")

nanocontacts groups --json
# Expected: JSON array of { id, name } objects
```

## search

```bash
# Pick a name you know exists in your contacts
nanocontacts search "test"
# Expected: text output with name, contact details, and ID per result

nanocontacts search "test" --json
# Expected: JSON array of { id, name, organization?, emails?, phones? }

nanocontacts search "test" --limit 3
# Expected: at most 3 results

nanocontacts search "xyznonexistent"
# Expected: "No contacts found."

nanocontacts search "xyznonexistent" --json
# Expected: []
```

## show

Use an ID from the search results above.

```bash
nanocontacts show --id "<ID>"
# Expected: text output with Name, Organization, ID, Emails, Phones, etc.

nanocontacts show --id "<ID>" --json
# Expected: JSON object with all contact fields
```

## me

```bash
nanocontacts me
# Expected: text output with your own contact details (Name, ID, Emails, Phones, etc.)

nanocontacts me --json
# Expected: JSON object with all fields from your "My Card"
```

## Edge Cases

```bash
# Unknown command
nanocontacts foobar 2>&1
# Expected: stderr "nanocontacts: unknown command: foobar", exit 1

# Missing search query
nanocontacts search 2>&1
# Expected: stderr error about missing query, exit 1

# Missing --id for show
nanocontacts show 2>&1
# Expected: stderr "nanocontacts: --id is required", exit 1

# Invalid --limit
nanocontacts search "test" --limit abc 2>&1
# Expected: stderr "nanocontacts: --limit must be a number, got: abc", exit 1

# No args
nanocontacts
# Expected: usage text, exit 0

# Dash-leading values (regression: values starting with - must not be misread as flags)
nanocontacts create --first "Test" --last "Dash" --note "-follow up later" --json
# Expected: JSON { id, name: "Test Dash" } — the note is accepted, not treated as a flag
# Clean up: delete "Test Dash" from Contacts.app after verifying
```

## Search Scope

```bash
# Search matches name and organization only — not email or phone.
# To find contacts by email/phone, pipe JSON through grep:
nanocontacts search "" --limit 100 --json | grep "example.com"
# Expected: returns lines matching the email from JSON output

# Verify search is fast (no full-scan of all contacts)
time nanocontacts search "a" --limit 5
# Expected: completes in under 2 seconds
```

## Write Commands

**Stop and ask the user for approval before running create/update tests.** These modify real contacts.

```bash
# Create
nanocontacts create --first "Test" --last "Contact" --email "test@example.com"
# Expected: "Created: Test Contact (ID: ...)"

nanocontacts create --first "Test2" --last "Contact2" --json
# Expected: JSON { id, name }

# Update (use ID from create above)
nanocontacts update --id "<ID>" --title "QA Tester"
# Expected: "Updated: Test Contact"

nanocontacts update --id "<ID>" --add-email "extra@example.com" --json
# Expected: JSON { id, name, emails, ... }
```

After testing, manually delete the test contacts from Contacts.app.

## Type Check

```bash
deno check main.ts
# Expected: no errors
```
