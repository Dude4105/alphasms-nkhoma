@'
import json
from graphify.detect import detect
from pathlib import Path
result = detect(Path('.'))
print(json.dumps(result, ensure_ascii=False))
'@ | Out-File -FilePath graphify-out\.graphify_step_2_detect_files_3.py -Encoding utf8
& (Get-Content graphify-out\.graphify_python) graphify-out\.graphify_step_2_detect_files_3.py | Out-File -FilePath graphify-out\.graphify_detect.json -Encoding utf8
Remove-Item -ErrorAction SilentlyContinue graphify-out\.graphify_step_2_detect_files_3.py
