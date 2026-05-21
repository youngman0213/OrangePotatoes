export function normalizeTeamCode(teamName: string) {
  const key = normalizeKey(teamName);
  const teamMap: Record<string, string> = {
    "울산": "01",
    "울산hd": "01",
    "울산hdfc": "01",
    "포항": "03",
    "포항스틸러스": "03",
    "제주": "04",
    "제주sk": "04",
    "전북": "05",
    "전북현대": "05",
    "서울": "09",
    "fc서울": "09",
    "대전": "10",
    "대전하나시티즌": "10",
    "인천": "18",
    "인천유나이티드": "18",
    "강원": "21",
    "강원fc": "21",
    "광주": "22",
    "광주fc": "22",
    "부천": "26",
    "부천fc1995": "26",
    "안양": "27",
    "fc안양": "27",
    "김천": "35",
    "김천상무": "35"
  };

  return teamMap[key];
}

export function normalizeTeamName(teamCode: string | undefined, teamName: string) {
  const teamMap: Record<string, string> = {
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

  return teamMap[teamCode ?? ""] ?? teamName;
}

export function makeTeamKey(teamCode: string | undefined, teamName: string) {
  return teamCode || normalizeTeamCode(teamName) || normalizeKey(teamName);
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
  return value.replace(/\s+/g, "").replace(/FC|HD|SK/gi, (match) => match.toLowerCase()).toLowerCase();
}
