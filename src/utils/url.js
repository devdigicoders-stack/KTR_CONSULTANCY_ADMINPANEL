export const getAssetUrl = (path) => {
  if (!path) return '';

  let cleanPath = path;

  // If path contains /uploads/, strip any leading domain (e.g. http://localhost:5000 or old domain)
  if (cleanPath.includes('/uploads/')) {
    cleanPath = cleanPath.substring(cleanPath.indexOf('/uploads/'));
  } else if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Get backend base URL from VITE_API_BASE_URL (e.g. https://api.ktrconsultants.in/api -> https://api.ktrconsultants.in)
  const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  let serverBase = '';

  if (apiBase) {
    serverBase = apiBase.replace(/\/api\/?$/, '');
  } else {
    // Default fallback if no env variable set
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        serverBase = 'http://localhost:5000';
      } else {
        serverBase = window.location.origin;
      }
    } else {
      serverBase = 'https://api.ktrconsultants.in';
    }
  }

  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${serverBase}${normalizedPath}`;
};
