import { search } from "./commands/search.ts";
import { show } from "./commands/show.ts";
import { groups } from "./commands/groups.ts";
import { create } from "./commands/create.ts";
import { update } from "./commands/update.ts";
import { me } from "./commands/me.ts";

export interface Flags {
  [key: string]: string;
}

export interface ParsedArgs {
  flags: Flags;
  positional: string[];
}

const booleanFlags = new Set(["json", "help", "h"]);

/** Check if a token looks like a flag (--long or -X single letter). */
function isFlag(token: string): boolean {
  if (token.startsWith("--")) return true;
  return token.startsWith("-") && token.length === 2;
}

export function parseArgs(args: string[]): ParsedArgs {
  const flags: Flags = {};
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      positional.push(...args.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (booleanFlags.has(key)) {
        flags[key] = "true";
      } else if (i + 1 < args.length && !isFlag(args[i + 1])) {
        flags[key] = args[++i];
      } else {
        die(`flag --${key} requires a value`);
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const key = arg.slice(1);
      if (booleanFlags.has(key)) {
        flags[key] = "true";
      } else if (i + 1 < args.length && !isFlag(args[i + 1])) {
        flags[key] = args[++i];
      } else {
        die(`flag -${key} requires a value`);
      }
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

export function die(msg: string): never {
  console.error(`nanocontacts: ${msg}`);
  Deno.exit(1);
}

export function parseIntFlag(
  value: string,
  name: string,
  _fallback: number,
): number {
  const n = parseInt(value, 10);
  if (isNaN(n)) die(`--${name} must be a number, got: ${value}`);
  return n;
}

export function parseLimit(flags: Flags, fallback: number): number {
  return Math.max(
    1,
    parseIntFlag(flags.limit || String(fallback), "limit", fallback),
  );
}

const validCommands = new Set([
  "search",
  "show",
  "me",
  "groups",
  "create",
  "update",
]);

function printUsage(): void {
  console.log(`Usage: nanocontacts <command> [options]

Commands:
  search     Search contacts by name or organization
  show       Show full contact details
  me         Show your own contact card
  groups     List contact groups
  create     Create a new contact
  update     Update an existing contact
  help       Show help for a command

Global options:
  --json     Output JSON instead of human-readable text

Run 'nanocontacts help <command>' for details.`);
}

function printCommandHelp(command: string): void {
  switch (command) {
    case "search":
      console.log(`Usage: nanocontacts search <query> [options]

Search contacts by name or organization (case-insensitive).
To search by email or phone, pipe JSON output through grep:
  nanocontacts search "" --json | grep "phone-number"

Options:
  --limit <n>   Max results (default: 20)
  --json        Output JSON`);
      break;
    case "show":
      console.log(`Usage: nanocontacts show --id <id> [--json]

Show full contact details including emails, phones, addresses, and URLs.

Options:
  --id <id>     Contact ID (required)
  --json        Output JSON`);
      break;
    case "me":
      console.log(`Usage: nanocontacts me [--json]

Show your own contact card (the "My Card" in Contacts.app).`);
      break;
    case "groups":
      console.log(`Usage: nanocontacts groups [--json]

List all contact groups.`);
      break;
    case "create":
      console.log(`Usage: nanocontacts create --first <name> --last <name> [options]

Create a new contact. At least --first or --last is required.

Options:
  --first <name>    First name
  --last <name>     Last name
  --org <name>      Organization
  --title <title>   Job title
  --email <addr>    Email address
  --phone <number>  Phone number
  --note <text>     Note
  --json            Output JSON`);
      break;
    case "update":
      console.log(`Usage: nanocontacts update --id <id> [options]

Update an existing contact.

Options:
  --id <id>            Contact ID (required)
  --first <name>       Set first name
  --last <name>        Set last name
  --org <name>         Set organization
  --title <title>      Set job title
  --note <text>        Set note
  --add-email <addr>   Add email address
  --add-phone <number> Add phone number
  --json               Output JSON`);
      break;
    default:
      die(`unknown command: ${command}`);
  }
}

async function main() {
  const [command, ...rest] = Deno.args;

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    Deno.exit(0);
  }

  if (command === "help") {
    const sub = rest[0];
    if (sub) {
      printCommandHelp(sub);
    } else {
      printUsage();
    }
    Deno.exit(0);
  }

  if (!validCommands.has(command)) {
    die(`unknown command: ${command}`);
  }

  const { flags, positional } = parseArgs(rest);
  const json = flags.json === "true";

  if (flags.help === "true" || flags.h === "true") {
    printCommandHelp(command);
    Deno.exit(0);
  }

  try {
    switch (command) {
      case "search":
        await search(flags, positional, json);
        break;
      case "show":
        await show(flags, json);
        break;
      case "me":
        await me(json);
        break;
      case "groups":
        await groups(json);
        break;
      case "create":
        await create(flags, json);
        break;
      case "update":
        await update(flags, json);
        break;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    die(msg);
  }
}

main();
