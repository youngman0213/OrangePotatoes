# GitHub에 올리는 쉬운 방법

이 프로젝트를 `https://github.com/youngman0213/OrangePotatoes`에 올릴 때는 PowerShell에서 아래 한 줄만 실행하면 됩니다.

```powershell
.\publish-to-github.ps1
```

처음 실행 전에 Git for Windows가 설치되어 있어야 합니다.

https://git-scm.com/download/win

PowerShell 실행 정책 때문에 스크립트가 막히면, 현재 PowerShell 창에서 아래 명령을 한 번 실행한 뒤 다시 시도하세요.

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\publish-to-github.ps1
```

GitHub 로그인 창이 뜨면 로그인하고 권한을 허용하면 됩니다.
