import type { Flags } from "../main.ts";
import { jxaStr, runJxa } from "../jxa.ts";
import { printCreatedText } from "../text.ts";

export async function create(flags: Flags, json: boolean) {
  const firstName = flags["first"] || flags["firstName"] || "";
  const lastName = flags["last"] || flags["lastName"] || "";
  if (!firstName && !lastName) throw new Error("--first and/or --last is required");

  const org = flags["org"] || flags["organization"] || "";
  const jobTitle = flags["title"] || flags["jobTitle"] || "";
  const note = flags["note"] || "";
  const email = flags["email"] || "";
  const phone = flags["phone"] || "";

  const result = (await runJxa(`
    const app = Application('Contacts');
    const props = {};
    if (${jxaStr(firstName)}) props.firstName = ${jxaStr(firstName)};
    if (${jxaStr(lastName)}) props.lastName = ${jxaStr(lastName)};
    if (${jxaStr(org)}) props.organization = ${jxaStr(org)};
    if (${jxaStr(jobTitle)}) props.jobTitle = ${jxaStr(jobTitle)};
    if (${jxaStr(note)}) props.note = ${jxaStr(note)};

    const person = app.Person(props);
    app.people.push(person);

    if (${jxaStr(email)}) {
      person.emails.push(app.Email({label: '_$!<Other>!$_', value: ${jxaStr(email)}}));
    }
    if (${jxaStr(phone)}) {
      person.phones.push(app.Phone({label: '_$!<Other>!$_', value: ${jxaStr(phone)}}));
    }

    app.save();

    JSON.stringify({
      id: person.id(),
      name: ((person.firstName() || '') + ' ' + (person.lastName() || '')).trim(),
      organization: person.organization() || undefined,
    });
  `)) as { id: string; name: string; organization?: string };

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printCreatedText(result);
  }
}
