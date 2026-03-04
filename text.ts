// MARK: - Sanitization

export function sanitize(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const code = text.charCodeAt(i);

    // Strip ANSI escape sequences
    if (ch === "\x1b" && i + 1 < text.length && text[i + 1] === "[") {
      let j = i + 2;
      while (j < text.length) {
        const c = text[j];
        if ((c >= "A" && c <= "Z") || (c >= "a" && c <= "z")) {
          i = j;
          break;
        }
        j++;
      }
      if (j >= text.length) i = j - 1;
      continue;
    }

    // Strip ASCII control chars (except \n and \t)
    if (code < 0x20 && ch !== "\n" && ch !== "\t") continue;

    // Strip C1 controls
    if (code >= 0x7f && code <= 0x9f) continue;

    result += ch;
  }
  return result;
}

// MARK: - Contact search results

interface ContactSummary {
  id: string;
  name: string;
  organization?: string;
  emails?: string[];
  phones?: string[];
}

export function printContactsText(contacts: ContactSummary[]): void {
  if (contacts.length === 0) {
    console.log("No contacts found.");
    return;
  }
  for (const c of contacts) {
    let line = sanitize(c.name);
    if (c.organization) line += `  ${sanitize(c.organization)}`;
    console.log(line);
    const details: string[] = [];
    if (c.emails) {
      for (const e of c.emails) details.push(sanitize(e));
    }
    if (c.phones) {
      for (const p of c.phones) details.push(sanitize(p));
    }
    if (details.length > 0) {
      console.log(`  ${details.join("  ")}`);
    }
    console.log(`  ID: ${c.id}`);
  }
}

// MARK: - Contact detail

interface LabeledValue {
  label: string;
  value: string;
}

interface AddressEntry {
  label: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface ContactDetail {
  id: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  organization?: string;
  jobTitle?: string;
  department?: string;
  birthday?: string;
  note?: string;
  emails?: LabeledValue[];
  phones?: LabeledValue[];
  addresses?: AddressEntry[];
  urls?: LabeledValue[];
}

function cleanLabel(label: string): string {
  // JXA labels look like "_$!<Work>!$_" — extract inner text
  const match = label.match(/^_\$!<(.+)>!\$_$/);
  return match ? match[1].toLowerCase() : label.toLowerCase();
}

export function printContactDetailText(contact: ContactDetail): void {
  const name = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(" ");
  if (name) console.log(`Name:         ${sanitize(name)}`);
  if (contact.organization) {
    console.log(`Organization: ${sanitize(contact.organization)}`);
  }
  if (contact.jobTitle) {
    console.log(`Title:        ${sanitize(contact.jobTitle)}`);
  }
  if (contact.department) {
    console.log(`Department:   ${sanitize(contact.department)}`);
  }
  if (contact.nickname) {
    console.log(`Nickname:     ${sanitize(contact.nickname)}`);
  }
  if (contact.birthday) {
    console.log(`Birthday:     ${contact.birthday}`);
  }
  console.log(`ID:           ${contact.id}`);

  if (contact.emails && contact.emails.length > 0) {
    console.log("");
    console.log("Emails:");
    for (const e of contact.emails) {
      console.log(`  ${cleanLabel(e.label).padEnd(12)} ${sanitize(e.value)}`);
    }
  }

  if (contact.phones && contact.phones.length > 0) {
    console.log("");
    console.log("Phones:");
    for (const p of contact.phones) {
      console.log(`  ${cleanLabel(p.label).padEnd(12)} ${sanitize(p.value)}`);
    }
  }

  if (contact.addresses && contact.addresses.length > 0) {
    console.log("");
    console.log("Addresses:");
    for (const a of contact.addresses) {
      const parts = [a.street, a.city, a.state, a.zip, a.country]
        .filter(Boolean)
        .map((s) => sanitize(s!));
      console.log(`  ${cleanLabel(a.label).padEnd(12)} ${parts.join(", ")}`);
    }
  }

  if (contact.urls && contact.urls.length > 0) {
    console.log("");
    console.log("URLs:");
    for (const u of contact.urls) {
      console.log(`  ${cleanLabel(u.label).padEnd(12)} ${sanitize(u.value)}`);
    }
  }

  if (contact.note) {
    console.log("");
    console.log("Note:");
    console.log(`  ${sanitize(contact.note)}`);
  }
}

// MARK: - Groups

interface GroupEntry {
  id: string;
  name: string;
}

export function printGroupsText(groups: GroupEntry[]): void {
  if (groups.length === 0) {
    console.log("No groups found.");
    return;
  }
  console.log("NAME");
  for (const g of groups) {
    console.log(sanitize(g.name));
  }
}

// MARK: - Create/update confirmation

interface CreatedResult {
  id: string;
  name: string;
  organization?: string;
}

export function printCreatedText(result: CreatedResult): void {
  console.log(`Created: ${sanitize(result.name)} (ID: ${result.id})`);
}

interface UpdatedResult {
  id: string;
  name: string;
}

export function printUpdatedText(result: UpdatedResult): void {
  console.log(`Updated: ${sanitize(result.name)}`);
}
