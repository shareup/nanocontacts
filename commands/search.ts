import type { Flags } from "../main.ts";
import { parseLimit } from "../main.ts";
import { jxaStr, runJxa } from "../jxa.ts";
import { printContactsText } from "../text.ts";

export async function search(
  flags: Flags,
  positional: string[],
  json: boolean,
) {
  const query = positional[0] || flags["q"];
  if (!query) throw new Error("search query is required");
  const limit = parseLimit(flags, 20);

  // Use Contacts.app 'whose' filter for fast server-side search.
  // Searches first name, last name, and organization (case-insensitive).
  // Email/phone search is not supported by JXA whose — use grep on JSON output.
  const result = (await runJxa(`
    const app = Application('Contacts');
    const q = ${jxaStr(query)};
    const limit = ${limit};

    const byFirst = app.people.whose({firstName: {_contains: q}})();
    const byLast = app.people.whose({lastName: {_contains: q}})();
    const byOrg = app.people.whose({organization: {_contains: q}})();

    // Merge and deduplicate
    const seen = {};
    const all = byFirst.concat(byLast).concat(byOrg);
    const results = [];

    for (let i = 0; i < all.length && results.length < limit; i++) {
      const p = all[i];
      const pid = p.id();
      if (seen[pid]) continue;
      seen[pid] = true;

      const first = p.firstName() || '';
      const last = p.lastName() || '';
      const org = p.organization() || '';

      const emails = p.emails();
      const emailList = [];
      for (let j = 0; j < emails.length; j++) emailList.push(emails[j].value());

      const phones = p.phones();
      const phoneList = [];
      for (let j = 0; j < phones.length; j++) phoneList.push(phones[j].value());

      results.push({
        id: pid,
        name: (first + ' ' + last).trim(),
        organization: org || undefined,
        emails: emailList.length > 0 ? emailList : undefined,
        phones: phoneList.length > 0 ? phoneList : undefined,
      });
    }

    JSON.stringify(results);
  `)) as Array<{
    id: string;
    name: string;
    organization?: string;
    emails?: string[];
    phones?: string[];
  }>;

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printContactsText(result ?? []);
  }
}
