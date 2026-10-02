export const getAssetUrl = (path) => {
  if (!path) return '';

  let cleanPath = String(path).trim();

  // If path contains /uploads/ or uploads/, strip any leading domain (e.g. http://localhost:5000, old IPs, or staging domains)
  if (cleanPath.includes('/uploads/')) {
    cleanPath = cleanPath.substring(cleanPath.indexOf('/uploads/'));
  } else if (cleanPath.includes('uploads/')) {
    cleanPath = '/' + cleanPath.substring(cleanPath.indexOf('uploads/'));
  } else if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  let serverBase;

  if (apiBase) {
    serverBase = apiBase.replace(/\/api\/?$/, '');
  } else {
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

export const getPublicShareDocsUrl = (clientId) => {
  if (!clientId) return '';
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/shared-docs/${clientId}`;
  }
  return `https://admin.ktrconsultants.in/shared-docs/${clientId}`;
};
