from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
renderer = Path('/home/mudassar/.codex/plugins/cache/openai-primary-runtime/documents/26.1105.12137/skills/documents/render_docx.py')
for doc in sorted((root / 'samples').glob('*.docx')):
    subprocess.run([sys.executable, str(renderer), str(doc), '--output_dir', str(root / 'previews' / doc.stem), '--emit_pdf'], check=True)
