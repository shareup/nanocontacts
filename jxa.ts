/** Run a JXA script via osascript and return parsed JSON. */
export async function runJxa(script: string): Promise<unknown> {
  const cmd = new Deno.Command("osascript", {
    args: ["-l", "JavaScript", "-e", script],
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await cmd.output();
  const out = new TextDecoder().decode(stdout).trim();
  const err = new TextDecoder().decode(stderr).trim();
  if (code !== 0) {
    throw new Error(err || out || `osascript exited with code ${code}`);
  }
  if (!out) return null;
  try {
    return JSON.parse(out);
  } catch {
    throw new Error(`Failed to parse JXA output: ${out}`);
  }
}

/** Escape a value for safe embedding in a JXA script string literal. */
export function jxaStr(s: string): string {
  return JSON.stringify(s);
}
