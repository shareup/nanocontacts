#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

SCRIPT_DIR="$(pwd)"
mkdir -p ~/bin

cat > ~/bin/nanocontacts << EOF
#!/bin/bash
exec deno run --allow-all "${SCRIPT_DIR}/main.ts" "\$@"
EOF
chmod +x ~/bin/nanocontacts

echo "nanocontacts installed to ~/bin/nanocontacts"
if ! echo "$PATH" | tr ':' '\n' | grep -qx "$HOME/bin"; then
    echo "Warning: ~/bin is not in your PATH. Add it to your shell profile."
fi
