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

// Helper to normalize document titles (removes suffixes like (1/2), Page 1, Part 2, etc.)
export const getNormalizedDocName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return 'Document';
  let clean = rawName.trim();
  clean = clean.replace(/\s*\(\s*\d+\s*[\/of]\s*\d+[^)]*\)/gi, '');
  clean = clean.replace(/\s*\(\s*(?:page|part|file)\s*\d+[^)]*\)/gi, '');
  clean = clean.replace(/\s*-\s*page\s*\d+/gi, '');
  clean = clean.replace(/\s*-\s*part\s*\d+/gi, '');
  clean = clean.replace(/\s*-\s*file\s*\d+/gi, '');
  clean = clean.replace(/\s*_\s*page\s*\d+/gi, '');
  return clean.trim() || rawName.trim();
};

export const extractDocTokens = (docItems) => {
  if (!docItems) return [];
  const items = Array.isArray(docItems) ? docItems : [docItems];
  return items.map(item => {
    if (!item) return '';
    if (typeof item === 'string') return item.trim();
    const rawId = item.id ? String(item.id).replace(/^group_/, '') : '';
    if (rawId) return rawId;
    if (item.docId) return String(item.docId);
    if (item.docType && item.docType !== 'customDocument' && item.docType !== 'folderDocument') {
      return item.docType;
    }
    return item.title || item.name || '';
  }).filter(Boolean);
};

export const createBrandedShareLink = async (clientId, docItems = null, axiosInstance = null) => {
  if (!clientId) return '';
  const tokens = docItems ? extractDocTokens(docItems) : [];

  try {
    if (axiosInstance) {
      const res = await axiosInstance.post(`/clients/shared/${clientId}/share-link`, { documents: tokens })
        .catch(() => axiosInstance.post(`/clients/${clientId}/share-link`, { documents: tokens }));
      if (res.data?.success && res.data?.shortUrl) {
        return res.data.shortUrl;
      }
    } else {
      const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ((typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:5000/api'
        : 'https://ktrconsultants.in/api');
      const response = await fetch(`${apiBase}/clients/shared/${clientId}/share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: tokens })
      });
      const resData = await response.json();
      if (resData?.success && resData?.shortUrl) {
        return resData.shortUrl;
      }
    }
  } catch (err) {
    console.warn('Failed to generate short branded link, using default fallback:', err);
  }

  return getPublicShareDocsUrl(clientId, docItems);
};

export const getPublicShareDocsUrl = (clientId, docItems = null) => {
  if (!clientId) return '';
  let baseUrl;
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      baseUrl = `${window.location.origin}/d/${clientId}`;
    } else {
      baseUrl = `https://ktrconsultants.in/d/${clientId}`;
    }
  } else {
    baseUrl = `https://ktrconsultants.in/d/${clientId}`;
  }

  if (!docItems || (Array.isArray(docItems) && docItems.length === 0)) {
    return baseUrl;
  }

  const tokens = extractDocTokens(docItems);

  if (tokens.length > 0) {
    return `${baseUrl}?docs=${encodeURIComponent(tokens.join(','))}`;
  }

  return baseUrl;
};

// Check if a document matches a requested token (id, docId, docType, title, name, files)
export const matchesDocToken = (doc, rawToken) => {
  if (!doc || !rawToken) return false;
  const token = String(rawToken).trim().toLowerCase();
  if (!token) return false;

  const cleanToken = token.replace(/^(group_|cd_|f_|legacy_)/, '');

  // 1. Exact ID checks (with or without prefixes)
  const docId = doc.id ? String(doc.id).toLowerCase() : '';
  const cleanDocId = docId.replace(/^(group_|cd_|f_|legacy_)/, '');
  if (docId === token || cleanDocId === cleanToken || cleanDocId === token || docId === cleanToken) {
    return true;
  }

  // 2. doc.groupId checks
  if (doc.groupId) {
    const groupId = String(doc.groupId).toLowerCase();
    const cleanGroupId = groupId.replace(/^(group_|cd_|f_|legacy_)/, '');
    if (groupId === token || cleanGroupId === cleanToken || cleanGroupId === token) {
      return true;
    }
  }

  // 3. doc.docId (MongoDB ObjectId) check
  if (doc.docId) {
    const mongoId = String(doc.docId).toLowerCase();
    if (mongoId === token || mongoId === cleanToken) {
      return true;
    }
  }

  // 4. doc.docType checks (e.g. panCardUrl, aadhaarUrl, photoUrl)
  if (doc.docType) {
    const dt = String(doc.docType).toLowerCase();
    const cleanDt = dt.replace(/^(legacy_)/, '');
    if (dt === token || cleanDt === cleanToken || cleanDt === token || `legacy_${cleanDt}` === token) {
      return true;
    }
  }

  // 5. doc.title & doc.name checks (Case-insensitive & normalized)
  const docTitle = (doc.title || doc.name || '').trim().toLowerCase();
  if (docTitle && (docTitle === token || docTitle === cleanToken)) {
    return true;
  }

  const normDocTitle = getNormalizedDocName(doc.title || doc.name || '').toLowerCase();
  const normToken = getNormalizedDocName(rawToken).toLowerCase();
  if (normDocTitle && (normDocTitle === normToken || normDocTitle === token || normDocTitle === cleanToken)) {
    return true;
  }

  // 6. Check files inside grouped document
  if (Array.isArray(doc.files) && doc.files.length > 0) {
    const fileMatched = doc.files.some(f => {
      if (!f) return false;
      const fId = f.id ? String(f.id).toLowerCase() : '';
      const cleanFId = fId.replace(/^(group_|cd_|f_|legacy_)/, '');
      if (fId === token || cleanFId === cleanToken || cleanFId === token) return true;

      if (f.docId) {
        const fMongoId = String(f.docId).toLowerCase();
        if (fMongoId === token || fMongoId === cleanToken) return true;
      }

      if (f.docType) {
        const fdt = String(f.docType).toLowerCase().replace(/^(legacy_)/, '');
        if (fdt === cleanToken || fdt === token) return true;
      }

      const fTitle = (f.fileTitle || f.title || f.name || '').trim().toLowerCase();
      if (fTitle && (fTitle === token || fTitle === cleanToken)) return true;

      const normFTitle = getNormalizedDocName(fTitle).toLowerCase();
      if (normFTitle && (normFTitle === normToken || normFTitle === token || normFTitle === cleanToken)) return true;

      return false;
    });

    if (fileMatched) return true;
  }

  // 7. Common synonyms / standard keyword fallback
  const isAadhaarToken = token.includes('adhar') || token.includes('aadhaar');
  const isAadhaarDoc = docTitle.includes('adhar') || docTitle.includes('aadhaar') || (doc.docType || '').toLowerCase().includes('aadhaar');
  if (isAadhaarToken && isAadhaarDoc) return true;

  const isPanToken = token === 'pan' || token === 'pancard' || token.includes('pan card') || token.includes('pancard');
  const isPanDoc = docTitle.includes('pan card') || docTitle.includes('pancard') || (doc.docType || '').toLowerCase().includes('pan');
  if (isPanToken && isPanDoc) return true;

  const isPhotoToken = token.includes('photo');
  const isPhotoDoc = docTitle.includes('photo') || (doc.docType || '').toLowerCase().includes('photo');
  if (isPhotoToken && isPhotoDoc) return true;

  return false;
};

export const getBankerShareMessage = (clientData, customUrl = null) => {
  const clientName = clientData?.fullName || clientData?.name || 'Client';

  let formattedLoan = 'As Applicable';
  if (clientData?.loanAmount) {
    const num = Number(clientData.loanAmount);
    if (!isNaN(num) && num > 0) {
      formattedLoan = `₹${num.toLocaleString('en-IN')}`;
    }
  }

  const caseType = clientData?.caseType || clientData?.loanType || 'Business Loan';
  const business = clientData?.companyName || clientData?.businessName || clientData?.businessType;
  const profession = clientData?.occupation || clientData?.designation || clientData?.employmentType;

  let businessOrProfessionLine = '';
  if (business) {
    businessOrProfessionLine = `Business: ${business}`;
  } else if (profession) {
    businessOrProfessionLine = `Profession: ${profession}`;
  }

  const shortUrl = customUrl || getPublicShareDocsUrl(clientData?._id || clientData?.id);

  const lines = [
    '📁 KTR Consultants – Loan File',
    '',
    `Client: ${clientName}`,
    `Loan Amount: ${formattedLoan}`,
    `Case Type: ${caseType}`
  ];

  if (businessOrProfessionLine) {
    lines.push(businessOrProfessionLine);
  }

  lines.push('', `🔗 Review Case & Documents: ${shortUrl}`);

  return lines.join('\n');
};

export const getSelectedDocsShareMessage = (clientData, docsToShare, customUrl = null) => {
  const clientName = clientData?.fullName || clientData?.name || 'Client';
  const shortUrl = customUrl || getPublicShareDocsUrl(clientData?._id || clientData?.id, docsToShare);

  if (!docsToShare || docsToShare.length === 0) {
    return getBankerShareMessage(clientData, shortUrl);
  }

  if (docsToShare.length === 1) {
    const doc = docsToShare[0];
    const docTitle = doc.title || doc.name || 'Document';
    return `📁 KTR Consultants – Document File\n\nClient: ${clientName}\nDocument: ${docTitle}\n\n🔗 Review Case & Documents: ${shortUrl}`;
  }

  const list = docsToShare.map((d, i) => {
    const title = d.title || d.name || 'Document';
    const filesCount = d.files?.length > 1 ? ` (${d.files.length} Files)` : '';
    return `${i + 1}. ${title}${filesCount}`;
  }).join('\n');

  return `📁 KTR Consultants – Loan File Documents\n\nClient: ${clientName}\n\nDocuments Included:\n${list}\n\n🔗 Review Case & Documents: ${shortUrl}`;
};
