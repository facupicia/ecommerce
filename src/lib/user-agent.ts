export function parseUserAgent(ua: string): { browser: string; os: string } {
  const browser =
    /Edg\//.test(ua)
      ? "Edge"
      : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
      ? "Firefox"
      : /Safari\//.test(ua)
      ? "Safari"
      : "Otro";
  const os =
    /Windows/.test(ua)
      ? "Windows"
      : /Mac OS X/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iOS/.test(ua)
      ? "iOS"
      : /Linux/.test(ua)
      ? "Linux"
      : "Otro";
  return { browser, os };
}
