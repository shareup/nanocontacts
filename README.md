**_Experimental. Shouldn't be considered production ready yet._**

# nanocontacts

A standalone CLI for searching, viewing, creating, and updating contacts in Apple Contacts via JXA.

Human-readable text output by default; pass `--json` for structured JSON.

## Install

```bash
./install.sh
```

This creates `~/bin/nanocontacts`. Make sure `~/bin` is in your `PATH`.

Requires [Deno](https://deno.land) 2+.

## Permissions (macOS)

Grant Automation access for your terminal to control Contacts.app:

- System Settings > Privacy & Security > Automation
- Enable your terminal app -> Contacts

If the toggle does not appear, run `nanocontacts groups` once and allow the system prompt.

## Commands

### search

Search contacts by name or organization (case-insensitive). To search by email or phone, pipe JSON output through `grep`.

```bash
nanocontacts search "Jenny"
nanocontacts search "Acme" --limit 5
nanocontacts search "Jenny" --json
```

### show

Show full contact details (emails, phones, addresses, URLs, notes).

```bash
nanocontacts show --id "UUID:ABPerson"
nanocontacts show --id "UUID:ABPerson" --json
```

### me

Show your own contact card (the "My Card" in Contacts.app).

```bash
nanocontacts me
nanocontacts me --json
```

### groups

List contact groups.

```bash
nanocontacts groups
nanocontacts groups --json
```

### create

Create a new contact. At least `--first` or `--last` is required.

```bash
nanocontacts create --first "Jane" --last "Doe" --email "jane@example.com" --phone "+15551234567"
nanocontacts create --first "Jane" --last "Doe" --org "Acme" --title "Engineer" --json
```

### update

Update an existing contact. Uses `--add-email` and `--add-phone` to append (not replace).

```bash
nanocontacts update --id "UUID:ABPerson" --first "Jane" --last "Smith"
nanocontacts update --id "UUID:ABPerson" --add-email "new@example.com" --json
nanocontacts update --id "UUID:ABPerson" --add-phone "+15559876543"
```

## Global Options

| Flag | Description |
|------|-------------|
| `--json` | Output JSON instead of human-readable text |

## JSON Shapes

### search

```json
[
  {
    "id": "UUID:ABPerson",
    "name": "Jane Doe",
    "organization": "Acme",
    "emails": ["jane@example.com"],
    "phones": ["+15551234567"]
  }
]
```

### show

```json
{
  "id": "UUID:ABPerson",
  "firstName": "Jane",
  "lastName": "Doe",
  "organization": "Acme",
  "jobTitle": "Engineer",
  "emails": [{ "label": "_$!<Work>!$_", "value": "jane@acme.com" }],
  "phones": [{ "label": "_$!<Mobile>!$_", "value": "+15551234567" }],
  "addresses": [{ "label": "_$!<Work>!$_", "street": "123 Main St", "city": "Springfield", "state": "IL", "zip": "62704", "country": "US" }],
  "urls": [{ "label": "_$!<HomePage>!$_", "value": "https://example.com" }]
}
```

### groups

```json
[
  { "id": "UUID:ABGroup", "name": "Coworkers" }
]
```

### create

```json
{
  "id": "UUID:ABPerson",
  "name": "Jane Doe",
  "organization": "Acme"
}
```

### update

```json
{
  "id": "UUID:ABPerson",
  "name": "Jane Smith",
  "emails": ["jane@example.com", "new@example.com"],
  "phones": ["+15551234567"]
}
```

## Testing

See `TEST.md` for integration test instructions.

## Skill Install

To use as a Claude Code skill:

```bash
cd ~/.claude/skills
git clone https://github.com/shareup/nanocontacts.git
```

## Development

```bash
deno task check   # Type-check
deno task run -- groups
```

## License

MIT
