#!/usr/bin/env python3
"""Rewrite app imports from @/shared/components/ui/<X> to @realestate/ui."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APPS = [ROOT / "portal", ROOT / "backoffice"]
PKG = "@realestate/ui"

# Components to migrate (folder name under shared/components/ui)
PRIMITIVES = [
    "Button",
    "IconButton",
    "Alert",
    "Badge",
    "Skeleton",
    "TextField",
    "Select",
    "Switch",
    "Tabs",
    "DotProgress",
    "NumberStepper",
    "RangeSlider",
    "Dialog",
    "Card",
    "Cards",
    "DropdownList",
    "Dropdown",
    "AutoComplete",
    "Stepper",
    "DataGrid",
]

# Import path fragment -> preferred named exports when converting default imports
DEFAULT_TO_NAMED = {
    "Alert": "Alert",
    "Dialog": "Dialog",
    "Select": "Select",
    "Switch": "Switch",
    "Skeleton": "Skeleton",
    "AutoComplete": "AutoComplete",
    "DataGrid": "DataGrid",
    "DropdownList": "DropdownList",
    "IconButton": "IconButton",
    "DotProgress": "DotProgress",
    "NumberStepper": "NumberStepper",
    "RangeSlider": "RangeSlider",
    "Stepper": "Stepper",
    "Badge": "Badge",  # sometimes default
}

SKIP_PARTS = {"node_modules", ".next", "legacy", "Showcase"}


def should_skip(path: Path) -> bool:
    return any(p in path.parts for p in SKIP_PARTS)


def rewrite_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    # Type-only special cases for AutoComplete Option
    text = re.sub(
        r"""import\s+AutoComplete\s*,\s*\{\s*([^}]*Option[^}]*)\}\s+from\s+['"]@/shared/components/ui/AutoComplete(?:/AutoComplete)?['"]""",
        lambda m: f'import {{ AutoComplete, type AutoCompleteOption as Option }} from "{PKG}"'
        if "type" not in m.group(1)
        else f'import {{ AutoComplete, type AutoCompleteOption as Option }} from "{PKG}"',
        text,
    )
    text = re.sub(
        r"""import\s+AutoComplete\s*,\s*\{\s*type\s+Option\s+as\s+(\w+)\s*\}\s+from\s+['"]@/shared/components/ui/AutoComplete(?:/AutoComplete)?['"]""",
        rf'import {{ AutoComplete, type AutoCompleteOption as \1 }} from "{PKG}"',
        text,
    )

    for comp in PRIMITIVES:
        # from '@/shared/components/ui/Comp' or .../Comp/Comp or .../Comp/Something
        pattern = rf"""(['"])@/shared/components/ui/{comp}(?:/[^'"]*)?\1"""

        def repl_path(m: re.Match) -> str:
            return f'{m.group(1)}{PKG}{m.group(1)}'

        # Default import: import X from '@/shared/.../Comp'
        def repl_default(m: re.Match) -> str:
            name = m.group(1)
            named = DEFAULT_TO_NAMED.get(comp, name)
            # Keep local alias if different
            if name == named:
                return f'import {{ {named} }} from "{PKG}"'
            return f'import {{ {named} as {name} }} from "{PKG}"'

        text = re.sub(
            rf"""import\s+(\w+)\s+from\s+{pattern}""",
            repl_default,
            text,
        )

        # Default + named: import X, { A, B } from '...'
        text = re.sub(
            rf"""import\s+(\w+)\s*,\s*\{{([^}}]+)\}}\s+from\s+{pattern}""",
            lambda m: f'import {{ {DEFAULT_TO_NAMED.get(comp, m.group(1))} as {m.group(1)}, {m.group(2).strip()} }} from "{PKG}"'
            if m.group(1) != DEFAULT_TO_NAMED.get(comp, m.group(1))
            else f'import {{ {DEFAULT_TO_NAMED.get(comp, m.group(1))}, {m.group(2).strip()} }} from "{PKG}"',
            text,
        )

        # Named imports only: import { A, B } from '...'
        text = re.sub(
            rf"""import\s+(\{{[^}}]+\}})\s+from\s+{pattern}""",
            rf'import \1 from "{PKG}"',
            text,
        )

        # type imports: import type { X } from '...'
        text = re.sub(
            rf"""import\s+type\s+(\{{[^}}]+\}})\s+from\s+{pattern}""",
            rf'import type \1 from "{PKG}"',
            text,
        )

        # Remaining path references (dynamic import etc.)
        text = re.sub(pattern, repl_path, text)

    # Card folder sometimes Card/Card
    text = re.sub(
        r"""from\s+(['"])@/shared/components/ui/Card(?:/[^'"]*)?\1""",
        f'from "{PKG}"',
        text,
    )

    # Fix duplicate imports from same package on consecutive lines — leave for now
    # Fix `import { Alert as Alert }` style if any
    text = re.sub(r"import \{\s*(\w+)\s+as\s+\1\s*\}", r"import { \1 }", text)

    # Merge AlertVariant: import Alert, { type AlertVariant }
    text = re.sub(
        rf"""import\s+\{{\s*Alert\s*\}}\s+from\s+["']{re.escape(PKG)}["'];\s*import\s+type\s+\{{\s*AlertVariant\s*\}}\s+from\s+["']{re.escape(PKG)}["']""",
        f'import {{ Alert, type AlertVariant }} from "{PKG}"',
        text,
    )

    # Fix malformed quote endings from prior runs
    for bad, good in [
        (f'{PKG}"\'', f'{PKG}"'),
        (f"{PKG}'\"", f'{PKG}"'),
        (f'{PKG}""', f'{PKG}"'),
    ]:
        text = text.replace(bad, good)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for app in APPS:
        for path in app.rglob("*"):
            if path.suffix not in {".ts", ".tsx"} or should_skip(path):
                continue
            # Don't rewrite inside shared component source folders we're about to archive
            # (except BaseForm and other consumers)
            rel = str(path.relative_to(app))
            if "/shared/components/ui/" in rel.replace("\\", "/"):
                parts = Path(rel).parts
                try:
                    idx = parts.index("ui")
                    folder = parts[idx + 1] if idx + 1 < len(parts) else ""
                except ValueError:
                    folder = ""
                # Still rewrite BaseForm and Property* that consume primitives
                if folder in PRIMITIVES and folder not in {"Card"}:
                    # Skip the component's own implementation files
                    if folder in path.parts and path.parent.name == folder:
                        continue
            if rewrite_file(path):
                changed.append(str(path.relative_to(ROOT)))
    print(f"updated {len(changed)} files")
    for c in changed[:40]:
        print(" ", c)
    if len(changed) > 40:
        print(f"  ... +{len(changed) - 40} more")


if __name__ == "__main__":
    main()
