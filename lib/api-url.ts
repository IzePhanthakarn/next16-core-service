const ensureProtocol = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `http://${url}`;
};

const trimSlashes = (value: string) => value.replace(/^\/+/, "").replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined.");
  }

  const normalizedUrl = ensureProtocol(apiUrl).replace(/\/+$/g, "");
  const normalizedVersion = apiVersion ? trimSlashes(apiVersion) : "";

  return normalizedVersion
    ? `${normalizedUrl}/${normalizedVersion}`
    : normalizedUrl;
};
