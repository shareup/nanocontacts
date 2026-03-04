import { runJxa } from "../jxa.ts";
import { printContactDetailText } from "../text.ts";

export async function me(json: boolean) {
  const result = await runJxa(`
    const app = Application('Contacts');
    const p = app.myCard();

    const emails = p.emails();
    const emailList = [];
    for (let i = 0; i < emails.length; i++) {
      emailList.push({ label: emails[i].label(), value: emails[i].value() });
    }

    const phones = p.phones();
    const phoneList = [];
    for (let i = 0; i < phones.length; i++) {
      phoneList.push({ label: phones[i].label(), value: phones[i].value() });
    }

    const addresses = p.addresses();
    const addressList = [];
    for (let i = 0; i < addresses.length; i++) {
      const a = addresses[i];
      addressList.push({
        label: a.label(),
        street: a.street() || undefined,
        city: a.city() || undefined,
        state: a.state() || undefined,
        zip: a.zip() || undefined,
        country: a.country() || undefined,
      });
    }

    const urls = p.urls();
    const urlList = [];
    for (let i = 0; i < urls.length; i++) {
      urlList.push({ label: urls[i].label(), value: urls[i].value() });
    }

    JSON.stringify({
      id: p.id(),
      firstName: p.firstName() || undefined,
      lastName: p.lastName() || undefined,
      nickname: p.nickname() || undefined,
      organization: p.organization() || undefined,
      jobTitle: p.jobTitle() || undefined,
      department: p.department() || undefined,
      birthday: p.birthDate() ? p.birthDate().toISOString() : undefined,
      note: p.note() || undefined,
      emails: emailList.length > 0 ? emailList : undefined,
      phones: phoneList.length > 0 ? phoneList : undefined,
      addresses: addressList.length > 0 ? addressList : undefined,
      urls: urlList.length > 0 ? urlList : undefined,
    });
  `);

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    // deno-lint-ignore no-explicit-any
    printContactDetailText(result as any);
  }
}
