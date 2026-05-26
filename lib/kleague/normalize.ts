const TEAM_CODE_BY_ALIAS: Record<string, string> = {
  "01": "01",
  ulsan: "01",
  ulsanhd: "01",
  ulsanhdfc: "01",
  "\uc6b8\uc0b0": "01",
  "\uc6b8\uc0b0hd": "01",
  "\uc6b8\uc0b0hdfc": "01",

  "03": "03",
  pohang: "03",
  "\ud3ec\ud56d": "03",
  "\ud3ec\ud56d\uc2a4\ud2f8\ub7ec\uc2a4": "03",

  "04": "04",
  jeju: "04",
  jejusk: "04",
  "\uc81c\uc8fc": "04",
  "\uc81c\uc8fcsk": "04",

  "05": "05",
  jeonbuk: "05",
  jeonbukhdy: "05",
  "\uc804\ubd81": "05",
  "\uc804\ubd81\ud604\ub300": "05",

  "09": "09",
  seoul: "09",
  fcseoul: "09",
  "\uc11c\uc6b8": "09",
  "fc\uc11c\uc6b8": "09",

  "10": "10",
  daejeon: "10",
  daejeonhana: "10",
  "\ub300\uc804": "10",
  "\ub300\uc804\ud558\ub098": "10",
  "\ub300\uc804\ud558\ub098\uc2dc\ud2f0\uc98c": "10",

  "18": "18",
  incheon: "18",
  "\uc778\ucc9c": "18",
  "\uc778\ucc9c\uc720\ub098\uc774\ud2f0\ub4dc": "18",

  "21": "21",
  gangwon: "21",
  gangwonfc: "21",
  "\uac15\uc6d0": "21",
  "\uac15\uc6d0fc": "21",

  "22": "22",
  gwangju: "22",
  gwangjufc: "22",
  "\uad11\uc8fc": "22",
  "\uad11\uc8fcfc": "22",

  "26": "26",
  bucheon: "26",
  bucheonfc1995: "26",
  "\ubd80\ucc9c": "26",
  "\ubd80\ucc9cfc1995": "26",

  "27": "27",
  anyang: "27",
  fcanyang: "27",
  "\uc548\uc591": "27",
  "fc\uc548\uc591": "27",

  "35": "35",
  gimcheon: "35",
  "\uae40\ucc9c": "35",
  "\uae40\ucc9c\uc0c1\ubb34": "35"
};

const TEAM_NAME_BY_CODE: Record<string, string> = {
  "01": "\uc6b8\uc0b0 HD",
  "03": "\ud3ec\ud56d \uc2a4\ud2f8\ub7ec\uc2a4",
  "04": "\uc81c\uc8fc SK",
  "05": "\uc804\ubd81 \ud604\ub300",
  "09": "FC\uc11c\uc6b8",
  "10": "\ub300\uc804\ud558\ub098\uc2dc\ud2f0\uc98c",
  "18": "\uc778\ucc9c \uc720\ub098\uc774\ud2f0\ub4dc",
  "21": "\uac15\uc6d0FC",
  "22": "\uad11\uc8fcFC",
  "26": "\ubd80\ucc9cFC1995",
  "27": "FC\uc548\uc591",
  "35": "\uae40\ucc9c \uc0c1\ubb34"
};

export function normalizeTeamCode(teamName: string) {
  return TEAM_CODE_BY_ALIAS[normalizeKey(teamName)];
}

export function normalizeTeamName(teamCode: string | undefined, teamName: string) {
  const code = TEAM_CODE_BY_ALIAS[normalizeKey(teamCode ?? "")] ?? normalizeTeamCode(teamName);
  return TEAM_NAME_BY_CODE[code ?? ""] ?? teamName;
}

export function makeTeamKey(teamCode: string | undefined, teamName: string) {
  return normalizeTeamName(teamCode, teamName) || teamCode || normalizeKey(teamName);
}

export function makePlayerKey(playerId: string | undefined, playerName: string, teamCode: string | undefined, teamName: string) {
  if (playerId) return playerId;
  return `${normalizePlayerName(playerName)}-${makeTeamKey(teamCode, teamName)}`;
}

export function normalizePlayerName(name: string) {
  const cleanName = name.replace(/\s+/g, " ").trim();
  const englishMap: Record<string, string> = {
    "STEFAN MUGOSA": "\ubb34\uace0\uc0ac",
    "HOJAE LEE": "\uc774\ud638\uc7ac",
    "YAGO CARIELLO RIBEIRO": "\uc57c\uace0",
    "ABDALLAH HLEIHIL": "\uc544\ubd80\ub2ec\ub77c",
    "DAEWON KIM": "\uae40\ub300\uc6d0",
    "DONGGYEONG LEE": "\uc774\ub3d9\uacbd",
    "MATHEUS OLIVEIRA SANTOS": "\ub9c8\ud14c\uc6b0\uc2a4",
    "MINKYU SONG": "\uc1a1\ubbfc\uaddc"
  };

  return englishMap[cleanName.toUpperCase()] ?? cleanName;
}

export function splitRecentForm(form: string | null | undefined) {
  return (form ?? "")
    .split("")
    .filter((value) => value === "W" || value === "D" || value === "L");
}

export function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  return 0;
}

function normalizeKey(value: string) {
  return value
    .replace(/\s+/g, "")
    .replace(/[._-]/g, "")
    .toLowerCase();
}
