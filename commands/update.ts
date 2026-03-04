import type { Flags } from "../main.ts";
import { jxaStr, runJxa } from "../jxa.ts";
import { printUpdatedText } from "../text.ts";

export async function update(flags: Flags, json: boolean) {
  const id = flags["id"];
  if (!id) throw new Error("--id is required");

  const firstName = flags["first"] || flags["firstName"] || "";
  const lastName = flags["last"] || flags["lastName"] || "";
  const org = flags["org"] || flags["organization"] || "";
  const jobTitle = flags["title"] || flags["jobTitle"] || "";
  const note = flags["note"] || "";
  const addEmail = flags["add-email"] || "";
  const addPhone = flags["add-phone"] || "";

  const result = (await runJxa(`
    const app = Application('Contacts');
    const p = app.people.byId(${jxaStr(id)});

    if (${jxaStr(firstName)}) p.firstName = ${jxaStr(firstName)};
    if (${jxaStr(lastName)}) p.lastName = ${jxaStr(lastName)};
    if (${jxaStr(org)}) p.organization = ${jxaStr(org)};
    if (${jxaStr(jobTitle)}) p.jobTitle = ${jxaStr(jobTitle)};
    if (${jxaStr(note)}) p.note = ${jxaStr(note)};

    if (${jxaStr(addEmail)}) {
      p.emails.push(app.Email({label: '_$!<Other>!$_', value: ${jxaStr(addEmail)}}));
    }
    if (${jxaStr(addPhone)}) {
      p.phones.push(app.Phone({label: '_$!<Other>!$_', value: ${jxaStr(addPhone)}}));
    }

    app.save();

    const emails = p.emails();
    const emailList = [];
    for (let i = 0; i < emails.length; i++) emailList.push(emails[i].value());

    const phones = p.phones();
    const phoneList = [];
    for (let i = 0; i < phones.length; i++) phoneList.push(phones[i].value());

    JSON.stringify({
      id: p.id(),
      name: ((p.firstName() || '') + ' ' + (p.lastName() || '')).trim(),
      organization: p.organization() || undefined,
      emails: emailList.length > 0 ? emailList : undefined,
      phones: phoneList.length > 0 ? phoneList : undefined,
    });
  `)) as { id: string; name: string; organization?: string; emails?: string[]; phones?: string[] };

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printUpdatedText(result);
  }
}
