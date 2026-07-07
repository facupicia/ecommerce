export const fetcher = async <T = unknown>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const err: any = new Error("Fetch failed");
    err.status = res.status;
    try {
      err.info = await res.json();
    } catch {
      err.info = null;
    }
    throw err;
  }

  return res.json();
};

export const fetcherPost = <T = unknown>(url: string, body: unknown): Promise<T> =>
  fetcher<T>(url, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const fetcherPatch = <T = unknown>(url: string, body: unknown): Promise<T> =>
  fetcher<T>(url, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const fetcherDelete = <T = unknown>(url: string): Promise<T> =>
  fetcher<T>(url, { method: "DELETE" });
