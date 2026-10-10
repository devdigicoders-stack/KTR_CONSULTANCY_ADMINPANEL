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
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `${window.location.origin}/d/${clientId}`;
    }
    return `https://ktrconsultants.in/d/${clientId}`;
  }
  return `https://ktrconsultants.in/d/${clientId}`;
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
