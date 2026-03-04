import { runJxa } from "../jxa.ts";
import { printGroupsText } from "../text.ts";

export async function groups(json: boolean) {
  const result = (await runJxa(`
    const app = Application('Contacts');
    const groups = app.groups();
    const results = [];
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      results.push({
        id: g.id(),
        name: g.name(),
      });
    }
    JSON.stringify(results);
  `)) as Array<{ id: string; name: string }>;

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printGroupsText(result ?? []);
  }
}
