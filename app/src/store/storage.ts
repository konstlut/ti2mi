const STORAGE_PREFIX = 'ti2mi-';

export function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    console.warn(`Failed to save ${key} to localStorage`);
  }
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function remove(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function exportProfile(): string {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      data[key] = localStorage.getItem(key)!;
    }
  }
  return JSON.stringify(data, null, 2);
}

export function importProfile(json: string): boolean {
  try {
    const data = JSON.parse(json) as Record<string, string>;
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.setItem(key, value);
      }
    }
    return true;
  } catch {
    return false;
  }
}
