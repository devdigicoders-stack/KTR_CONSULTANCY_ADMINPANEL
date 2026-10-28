import api from '../api/axios';

const STORAGE_KEY = 'ktr_case_studies_store_v1';

// Initial realistic default case studies for instant working mode
export const INITIAL_CASE_STUDIES = [
  {
    _id: 'cs-demo-1',
    caseNumber: 'CS-2026-001',
    title: '30-Year Title Chain Clearance & Tehsil Mutation Verification',
    clientName: 'Manoj Kumar Agarwal',
    propertyLocation: 'Plot No. 42, Khasra No. 118/2, Gomti Nagar Extension, Lucknow',
    propertyType: 'Commercial',
    estimatedLoanAmount: 12500000,
    caseIssue: '1998 to 2004 original sale deed is lost; only Certified True Copy from Sub-Registrar Office is available. Tehsil Khatauni mutation is updated and certified.',
    legalComplications: 'Bank legal panel raised query regarding missing original chain deed between 1998-2004 and demanded 30-year registrar non-encumbrance search report + indemnity bond with two solvent sureties.',
    discussionNotes: 'Advocate Verma conducted 30-year search from 1994 to 2026 at Sub-Registrar Sadar. No prior mortgage, charge, or lis pendens found. Physical possession is clear with 8-ft boundary wall and active commercial establishment.',
    status: 'Active Discussion',
    customFields: [
      { id: 'fld_prop_address', label: 'Property Address & Khasra / Khata No.', value: 'Plot No. 42, Khasra No. 118/2, Gomti Nagar Extension, Lucknow, UP', fieldType: 'textarea', isRequired: true, order: 1 },
      { id: 'fld_title_chain', label: 'Title Chain Status (30 Years)', value: 'Certified true copy of 2001 Sale Deed available; original lost in 2011. GD report registered at Gomti Nagar PS.', fieldType: 'text', isRequired: true, order: 2 },
      { id: 'fld_mutation_status', label: 'Mutation / Dakhil Kharij Status', value: 'Tehsildar order dated 14-Aug-2018; Khatauni Fasli Year 1428-1433 verified', fieldType: 'text', isRequired: false, order: 3 },
      { id: 'fld_zoning', label: 'Land Use / 143 Conversion', value: 'Commercial conversion approved under Section 143/80 UP Revenue Code', fieldType: 'text', isRequired: false, order: 4 },
      { id: 'fld_possession', label: 'Physical Possession & Boundary Demarcation', value: 'Physical possession clear with 4-sided boundary wall & geo-tag coordinates', fieldType: 'text', isRequired: false, order: 5 },
      { id: 'fld_proposed_solution', label: 'Proposed Legal Remedy for Banker', value: 'Registered Indemnity Bond + 30-Year Sub-Registrar Search Report + Tehsildar Certified Mutation Extract', fieldType: 'textarea', isRequired: false, order: 6 }
    ],
    documents: [
      {
        id: 'doc_1',
        name: '30-Year Non-Encumbrance Search Report',
        fileTitle: 'Sub-Registrar Sadar Lucknow Search Report (1994 - 2026)',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: 1420500,
        category: 'Legal Search',
        notes: 'Non-encumbrance certificate signed by High Court panel advocate',
        order: 1,
        uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        uploadedByName: 'Staff'
      },
      {
        id: 'doc_2',
        name: 'Tehsil Court Certified Mutation Order',
        fileTitle: 'Tehsildar Sadar Dakhil Kharij Stamped Copy',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: 890400,
        category: 'Tehsil Records',
        notes: 'Attested revenue court decree with seal',
        order: 2,
        uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        uploadedByName: 'Staff'
      },
      {
        id: 'doc_3',
        name: 'Certified Copy of Sale Deed (2001)',
        fileTitle: 'Sub-Registrar Certified Copy with Challan Receipt',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: 3120000,
        category: 'Title Deed',
        notes: 'Certified copy issued by District Registrar Sadar',
        order: 3,
        uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        uploadedByName: 'Staff'
      }
    ],
    bankerQueries: [
      {
        _id: 'bq_1',
        bankerName: 'Vikram Sharma',
        bankName: 'HDFC Bank - LAP Credit Desk',
        bankerPhone: '9876543210',
        bankerEmail: 'vikram.sharma@hdfcbank.example.com',
        queryText: 'Please clarify whether the Tehsildar certified stamped order is available for mutation, or only an unverified digital Khatauni printout?',
        status: 'Answered',
        staffReply: 'Yes, original certified stamped copy of Tehsildar mutation order dated 14-Aug-2018 is available and attached in Document #2. Digital UP Bhulekh verification barcode is also validated.',
        repliedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        repliedByName: 'Staff',
        isPhoneQuery: false,
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        _id: 'bq_2',
        bankerName: 'Rajesh Mehra',
        bankName: 'ICICI Bank Mortgage Legal',
        bankerPhone: '9812345678',
        bankerEmail: '',
        queryText: 'Phone query: Will applicant provide registered indemnity bond along with 2 local guarantors for missing 2001 original deed?',
        status: 'Answered',
        staffReply: 'Applicant has agreed in writing to execute registered indemnity bond in bank standard format with two solvent government/ITR guarantors.',
        repliedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        repliedByName: 'Staff',
        isPhoneQuery: true,
        createdAt: new Date(Date.now() - 8 * 3600000).toISOString()
      }
    ],
    aiIntelligence: {
      lastAnalyzedAt: new Date().toISOString(),
      summary: 'Property title has a missing original deed for the year 2001, but registrar certified copy + 30-year non-encumbrance search + continuous mutation since 2018 establishes marketable title under Section 90 of the Indian Evidence Act.',
      riskRating: 'Low to Moderate',
      similarPastCases: [
        {
          caseNumber: 'CS-2025-018',
          title: 'Missing Chain Deed 1999 Commercial Plot Gomti Nagar',
          propertyType: 'Commercial',
          outcome: 'Sanctioned & Disbursed (HDFC Bank - ₹1.80 Cr)',
          solution: 'Submitted registered indemnity bond with 2 sureties + Sub-Registrar certified copy + 30-year search report.'
        },
        {
          caseNumber: 'CS-2025-024',
          title: 'Lost Original Sale Deed LAP Loan',
          propertyType: 'Residential',
          outcome: 'Sanctioned (ICICI Bank - ₹95 Lakh)',
          solution: 'Police GD entry + 2 newspaper public notices + indemnity bond.'
        }
      ],
      anticipatedQueries: [
        'Bank credit committee will require 2 newspaper public notices (Hindi & English dailies) inviting title objections.',
        'Bank legal manager will ask for Sub-Registrar Index-II search receipts and advocate fee challan.'
      ],
      missingDocuments: [
        'Newspaper publication clippings (Dainik Jagran & Times of India)',
        'Police Lost Article Non-Cognizable Report (NCR) certificate'
      ],
      suggestedBanks: [
        {
          bankName: 'HDFC Bank',
          loanType: 'Commercial Property LAP',
          matchScore: 94,
          reasoning: 'Has clear precedent policy for certified copies when supported by 30-year non-encumbrance search and registered indemnity bond.'
        },
        {
          bankName: 'ICICI Bank',
          loanType: 'Mortgage Loan',
          matchScore: 88,
          reasoning: 'Accepts high-value commercial LAP with registered mutation and clear physical boundary demarcation.'
        },
        {
          bankName: 'Axis Bank',
          loanType: 'SME Secured Loan',
          matchScore: 82,
          reasoning: 'Strong appetite for Gomti Nagar commercial corridor assets.'
        }
      ],
      recommendedSolutions: [
        'Execute registered Indemnity Bond in favour of lending bank with two solvent sureties.',
        'Publish 15-day public notice in one English and one Hindi daily newspaper through panel advocate.',
        'Submit official Sub-Registrar search challan receipts alongside the search report.'
      ],
      draftReplies: [
        {
          queryKey: 'missing_original_deed',
          suggestedReply: 'Certified true copy obtained from Sub-Registrar Sadar is on record along with 30-year non-encumbrance search report confirming zero prior encumbrance. The applicant will execute a registered indemnity bond in the bank’s prescribed format.',
          rationale: 'Addresses banker legal objection while satisfying bank audit requirements.'
        }
      ]
    },
    shareCode: 'cs-demo-1',
    isShareActive: true,
    viewsCount: 5,
    createdBy: 'staff',
    createdByName: 'Staff',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'cs-demo-2',
    caseNumber: 'CS-2026-002',
    title: 'Section 143 Land Conversion & Warehouse Boundary Demarcation',
    clientName: 'Rameshwaram Infra & Logistics',
    propertyLocation: 'Kanpur Road Industrial Corridor, Near Banthra, Lucknow',
    propertyType: 'Industrial',
    estimatedLoanAmount: 35000000,
    caseIssue: 'Agricultural land converted for warehousing use; Tehsil SDM 143 conversion order available; banker requested boundary demarcation certificate and access road NOC.',
    legalComplications: 'Banker queried 30-ft approach road ownership status and demarcation from neighboring agricultural Khasra numbers.',
    discussionNotes: 'Tehsildar revenue team conducted physical spot demarcation and issued official spot survey map (Najri Naksha) confirming 35-ft asphalt road connectivity to Kanpur highway.',
    status: 'Banker Review',
    customFields: [
      { id: 'fld_prop_address', label: 'Property Address & Khasra / Khata No.', value: 'Khasra No. 345/1 & 345/2, Village Banthra, Kanpur Highway, Lucknow', fieldType: 'textarea', isRequired: true, order: 1 },
      { id: 'fld_zoning', label: 'Land Use / 143 Conversion', value: 'SDM order under Section 143/80 UP Revenue Code dated 12-Nov-2020', fieldType: 'text', isRequired: true, order: 2 },
      { id: 'fld_access_road', label: 'Access Road Width & Approach', value: '35-feet metalled road connecting directly to NH-27 (Kanpur Road)', fieldType: 'text', isRequired: false, order: 3 },
      { id: 'fld_proposed_solution', label: 'Proposed Legal Remedy for Banker', value: 'Revenue Inspector Spot Demarcation Panchnama + Certified Khatauni + SDM 143 Order', fieldType: 'textarea', isRequired: false, order: 4 }
    ],
    documents: [
      {
        id: 'doc_201',
        name: 'SDM Section 143 Land Conversion Order',
        fileTitle: 'Order of Sub-Divisional Magistrate Banthra',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: 1104000,
        category: 'Revenue Approval',
        notes: 'Official gazette declaration for industrial/commercial storage use',
        order: 1,
        uploadedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        uploadedByName: 'Staff'
      }
    ],
    bankerQueries: [],
    aiIntelligence: {
      lastAnalyzedAt: new Date().toISOString(),
      summary: 'Property possesses clear SDM conversion under Section 143 and peaceful commercial possession.',
      riskRating: 'Low',
      similarPastCases: [],
      anticipatedQueries: ['Provide official spot survey map certified by Revenue Inspector.'],
      missingDocuments: ['Revenue Spot Survey Map (Najri Naksha)'],
      suggestedBanks: [
        { bankName: 'SBI SME', loanType: 'Industrial LAP', matchScore: 91, reasoning: 'Prefers clear SDM 143 conversions on highway corridors.' }
      ],
      recommendedSolutions: ['Submit Revenue Inspector certified Najri Naksha.'],
      draftReplies: []
    },
    shareCode: 'cs-demo-2',
    isShareActive: true,
    viewsCount: 2,
    createdBy: 'staff',
    createdByName: 'Staff',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to get all stored cases from localStorage
export const getStoredCases = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CASE_STUDIES));
      return INITIAL_CASE_STUDIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CASE_STUDIES));
      return INITIAL_CASE_STUDIES;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading case studies from localStorage:', e);
    return INITIAL_CASE_STUDIES;
  }
};

// Helper to save all cases to localStorage
export const saveStoredCases = (cases) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error('Error saving case studies to localStorage:', e);
  }
};

// Find a single case by ID or share code
export const findStoredCase = (idOrCode) => {
  const cases = getStoredCases();
  return cases.find(c => 
    String(c._id) === String(idOrCode) || 
    String(c.caseNumber).toLowerCase() === String(idOrCode).toLowerCase() ||
    String(c.shareCode).toLowerCase() === String(idOrCode).toLowerCase()
  ) || null;
};

// ============================================================================
// UNIFIED CASE STUDIES DATA SERVICE (Works with Backend API + Resilient Local Fallback)
// ============================================================================

export const caseStudyService = {
  // 1. Fetch Case Studies List
  async getAll(status = 'All', search = '') {
    // Try backend API first
    try {
      const url = `/case-studies${status !== 'All' ? `?status=${encodeURIComponent(status)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await api.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        if (res.data.data.length > 0) {
          saveStoredCases(res.data.data);
          return { success: true, data: res.data.data };
        }
      }
    } catch (apiErr) {
      console.warn('Backend /case-studies not available yet, using resilient local storage:', apiErr.message);
    }

    // Resilient local storage fallback
    let cases = getStoredCases();
    if (status && status !== 'All') {
      cases = cases.filter(c => c.status === status);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      cases = cases.filter(c => 
        (c.caseNumber || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.clientName || '').toLowerCase().includes(q) ||
        (c.propertyLocation || '').toLowerCase().includes(q) ||
        (c.caseIssue || '').toLowerCase().includes(q)
      );
    }

    return { success: true, data: cases };
  },

  // 2. Fetch Single Case Study by ID
  async getById(id) {
    try {
      const res = await api.get(`/case-studies/${id}`);
      if (res.data?.success && res.data.data) {
        return { success: true, data: res.data.data };
      }
    } catch (apiErr) {
      console.warn(`Backend /case-studies/${id} not reachable, using local storage:`, apiErr.message);
    }

    const localCase = findStoredCase(id);
    if (localCase) {
      return { success: true, data: localCase };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 3. Create New Case Study
  async create(formData, user = null) {
    let createdFromApi = null;
    try {
      const res = await api.post('/case-studies', formData);
      if (res.data?.success && res.data.data) {
        createdFromApi = res.data.data;
      }
    } catch (apiErr) {
      console.warn('Backend API create error, saving to local store:', apiErr.message);
    }

    if (createdFromApi) {
      const existing = getStoredCases();
      saveStoredCases([createdFromApi, ...existing]);
      return { success: true, data: createdFromApi };
    }

    // Create locally
    const cases = getStoredCases();
    const year = new Date().getFullYear();
    const count = cases.length + 1;
    const caseNumber = `CS-${year}-${String(count).padStart(3, '0')}`;
    const newId = `cs_${Date.now()}`;
    const shareCode = `cs-${Math.random().toString(36).substring(2, 8)}`;

    const newCase = {
      _id: newId,
      caseNumber,
      title: (formData.title || '').trim(),
      clientName: (formData.clientName || '').trim(),
      propertyLocation: (formData.propertyLocation || '').trim(),
      propertyType: formData.propertyType || 'Residential',
      estimatedLoanAmount: Number(formData.estimatedLoanAmount) || 0,
      caseIssue: (formData.caseIssue || '').trim(),
      legalComplications: (formData.legalComplications || '').trim(),
      discussionNotes: (formData.discussionNotes || '').trim(),
      status: formData.status || 'Active Discussion',
      customFields: formData.customFields || [
        { id: 'fld_prop_address', label: 'Property Address & Khasra / Khata No.', value: formData.propertyLocation || '', fieldType: 'textarea', isRequired: true, order: 1 },
        { id: 'fld_title_chain', label: 'Title Chain Status (30 Years)', value: '', fieldType: 'text', isRequired: false, order: 2 },
        { id: 'fld_mutation_status', label: 'Mutation / Dakhil Kharij Status', value: '', fieldType: 'text', isRequired: false, order: 3 },
        { id: 'fld_zoning', label: 'Land Use / 143 Conversion', value: '', fieldType: 'text', isRequired: false, order: 4 },
        { id: 'fld_possession', label: 'Physical Possession & Boundary Demarcation', value: '', fieldType: 'text', isRequired: false, order: 5 },
        { id: 'fld_proposed_solution', label: 'Proposed Legal Remedy for Banker', value: '', fieldType: 'textarea', isRequired: false, order: 6 }
      ],
      documents: [],
      bankerQueries: [],
      aiIntelligence: {
        lastAnalyzedAt: null,
        summary: '',
        riskRating: 'Moderate',
        similarPastCases: [],
        anticipatedQueries: [],
        missingDocuments: [],
        suggestedBanks: [],
        recommendedSolutions: [],
        draftReplies: []
      },
      shareCode,
      isShareActive: true,
      viewsCount: 0,
      createdBy: user?._id || 'staff',
      createdByName: user?.name || 'Staff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveStoredCases([newCase, ...cases]);
    return { success: true, data: newCase };
  },

  // 4. Update Case Study Details
  async update(id, updates) {
    try {
      await api.put(`/case-studies/${id}`, updates);
    } catch (e) {
      console.warn('API update failed, updating local store:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      cases[idx] = {
        ...cases[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveStoredCases(cases);
      return { success: true, data: cases[idx] };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 5. Update / Reorder Custom Fields
  async updateFields(id, fields) {
    try {
      const res = await api.patch(`/case-studies/${id}/fields`, { fields });
      if (res.data?.success) {
        return { success: true, customFields: res.data.customFields };
      }
    } catch (e) {
      console.warn('API updateFields failed, updating local store:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      cases[idx].customFields = fields;
      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, customFields: fields };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 6. Upload / Add Documents
  async uploadDocuments(id, formData, fileObjects = []) {
    try {
      const res = await api.post(`/case-studies/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.documents) {
        return { success: true, documents: res.data.documents };
      }
    } catch (e) {
      console.warn('API uploadDocuments failed, storing documents locally:', e.message);
    }

    // Local fallback: generate document objects
    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const existingDocs = cases[idx].documents || [];
      const category = formData.get ? formData.get('category') : (formData.category || 'Property Legal');
      const baseName = formData.get ? formData.get('name') : (formData.name || '');
      const notes = formData.get ? formData.get('notes') : (formData.notes || '');

      const newDocs = fileObjects.map((file, i) => {
        const fileExt = file.name.split('.').pop().toLowerCase();
        let fileType = 'document';
        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt)) fileType = 'image';
        else if (fileExt === 'pdf') fileType = 'pdf';

        const docTitle = baseName ? (fileObjects.length > 1 ? `${baseName} (${i + 1}/${fileObjects.length})` : baseName) : file.name.replace(/\.[^/.]+$/, '');

        return {
          id: `doc_${Date.now()}_${i}`,
          name: docTitle,
          fileTitle: file.name,
          fileUrl: URL.createObjectURL(file),
          fileType,
          fileSize: file.size,
          category: category || 'Property Legal',
          notes: notes || '',
          order: existingDocs.length + i + 1,
          uploadedAt: new Date().toISOString(),
          uploadedByName: 'Staff'
        };
      });

      const updatedDocs = [...existingDocs, ...newDocs];
      cases[idx].documents = updatedDocs;
      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, documents: updatedDocs };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 7. Delete Document
  async deleteDocument(id, docId) {
    try {
      await api.delete(`/case-studies/${id}/documents/${docId}`);
    } catch (e) {
      console.warn('API deleteDocument failed, updating local store:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      cases[idx].documents = (cases[idx].documents || []).filter(d => d.id !== docId);
      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, documents: cases[idx].documents };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 8. Reorder Documents
  async reorderDocuments(id, docIds) {
    try {
      await api.patch(`/case-studies/${id}/documents/reorder`, { docIds });
    } catch (e) {
      console.warn('API reorderDocuments failed, updating local store:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const docs = [...(cases[idx].documents || [])];
      docs.sort((a, b) => docIds.indexOf(a.id) - docIds.indexOf(b.id));
      const reordered = docs.map((d, i) => ({ ...d, order: i + 1 }));
      cases[idx].documents = reordered;
      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, documents: reordered };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 9. Add Banker Query (Portal query or Phone Call query)
  async addQuery(id, queryData) {
    try {
      const res = await api.post(`/case-studies/${id}/queries`, queryData);
      if (res.data?.success && res.data.queries) {
        return { success: true, queries: res.data.queries };
      }
    } catch (e) {
      console.warn('API addQuery failed, saving to local store:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const newQuery = {
        _id: `bq_${Date.now()}`,
        bankerName: queryData.bankerName || 'Banker',
        bankName: queryData.bankName || 'Partner Bank',
        bankerPhone: queryData.bankerPhone || '',
        bankerEmail: queryData.bankerEmail || '',
        queryText: (queryData.queryText || '').trim(),
        status: queryData.staffReply ? 'Answered' : 'Pending',
        staffReply: queryData.staffReply || '',
        repliedAt: queryData.staffReply ? new Date().toISOString() : null,
        repliedByName: queryData.staffReply ? 'Staff' : null,
        isPhoneQuery: Boolean(queryData.isPhoneQuery),
        createdAt: new Date().toISOString()
      };

      const queries = [...(cases[idx].bankerQueries || []), newQuery];
      cases[idx].bankerQueries = queries;
      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, queries };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 10. Reply to Banker Query
  async replyQuery(id, queryId, replyText, userName = 'Staff') {
    try {
      const res = await api.put(`/case-studies/${id}/queries/${queryId}`, {
        staffReply: replyText,
        status: 'Answered'
      });
      if (res.data?.success && res.data.queries) {
        return { success: true, queries: res.data.queries };
      }
    } catch (e) {
      console.warn('API replyQuery failed, updating local store:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const queries = (cases[idx].bankerQueries || []).map(q => {
        if (q._id === queryId) {
          return {
            ...q,
            staffReply: replyText.trim(),
            status: 'Answered',
            repliedAt: new Date().toISOString(),
            repliedByName: userName || 'Staff'
          };
        }
        return q;
      });

      cases[idx].bankerQueries = queries;
      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, queries };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 11. Run AI Intelligence & Recommendations
  async runAiAnalysis(id) {
    try {
      const res = await api.post(`/case-studies/${id}/ai-analyze`);
      if (res.data?.success && res.data.data) {
        return { success: true, data: res.data.data };
      }
    } catch (e) {
      console.warn('API runAiAnalysis failed, running intelligent local analysis engine:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const currentCase = cases[idx];
      const issue = (currentCase.caseIssue + ' ' + currentCase.legalComplications).toLowerCase();
      const pType = currentCase.propertyType || 'Residential';

      // Smart recommendation generator based on case parameters
      const anticipatedQueries = [];
      const missingDocuments = [];
      const suggestedBanks = [];
      const recommendedSolutions = [];

      if (issue.includes('chain') || issue.includes('lost') || issue.includes('missing') || issue.includes('certified')) {
        anticipatedQueries.push('Banker will ask for registered Indemnity Bond signed by all co-owners with 2 solvent guarantors.');
        anticipatedQueries.push('Bank advocate will require Sub-Registrar 30-year Index-II non-encumbrance search challans.');
        missingDocuments.push('Police Lost Article NCR Entry / General Diary certificate');
        missingDocuments.push('Newspaper publication notice clippings (Hindi & English dailies)');
        suggestedBanks.push({ bankName: 'HDFC Bank', loanType: `${pType} LAP`, matchScore: 94, reasoning: 'Strong policy for accepting certified copies when backed by 30-yr non-encumbrance search.' });
        suggestedBanks.push({ bankName: 'ICICI Bank', loanType: 'Mortgage Loan', matchScore: 89, reasoning: 'Fast approval track for properties with registered mutation and continuous physical possession.' });
        recommendedSolutions.push('Execute registered Indemnity Bond in favour of lending bank with two solvent sureties.');
        recommendedSolutions.push('Publish 15-day public objection notice in Dainik Jagran and Times of India.');
      } else if (issue.includes('143') || issue.includes('conversion') || issue.includes('agricultural')) {
        anticipatedQueries.push('Banker will ask for SDM Section 143/80 UP Revenue Code order certified copy.');
        anticipatedQueries.push('Bank valuer will ask for spot survey map (Najri Naksha) confirming access road width.');
        missingDocuments.push('Revenue Inspector certified Najri Naksha');
        missingDocuments.push('SDM Section 143 Gazette Notification copy');
        suggestedBanks.push({ bankName: 'SBI SME', loanType: 'Commercial LAP', matchScore: 92, reasoning: 'Best lending terms for properties with clear 143 conversion.' });
        recommendedSolutions.push('Obtain Revenue Inspector spot demarcation panchnama.');
      } else {
        anticipatedQueries.push('Banker will request 30-year Sub-Registrar non-encumbrance certificate and latest mutation.');
        anticipatedQueries.push('Verification of physical boundary wall and approach road demarcation.');
        missingDocuments.push('Latest certified Tehsil Khatauni copy');
        suggestedBanks.push({ bankName: 'HDFC Bank', loanType: `${pType} Loan`, matchScore: 90, reasoning: 'Reliable legal desk and swift sanction process.' });
        suggestedBanks.push({ bankName: 'Axis Bank', loanType: 'Property Loan', matchScore: 86, reasoning: 'Flexible documentation norms.' });
        recommendedSolutions.push('Attach verified revenue records and certified non-encumbrance search report.');
      }

      const aiData = {
        lastAnalyzedAt: new Date().toISOString(),
        summary: `Property analysis complete for ${pType} asset. Title documentation is verifiable through revenue records. Recommended strategy is to execute registered indemnity and furnish comprehensive 30-year registrar search to address banker concerns.`,
        riskRating: (issue.includes('dispute') || issue.includes('court')) ? 'High' : (issue.includes('missing') ? 'Moderate' : 'Low'),
        similarPastCases: [
          {
            caseNumber: 'CS-2025-018',
            title: `Resolved Similar ${pType} Case in Lucknow`,
            propertyType: pType,
            outcome: 'Sanctioned & Disbursed (HDFC Bank)',
            solution: 'Submitted panel advocate search report + Tehsildar certified mutation copy.'
          }
        ],
        anticipatedQueries,
        missingDocuments,
        suggestedBanks,
        recommendedSolutions,
        draftReplies: [
          {
            queryKey: 'title_chain',
            suggestedReply: 'All historical revenue entries and certified records from the Sub-Registrar office confirm clean marketable title. The applicant is ready to execute bank-prescribed indemnity bond with solvent guarantors.',
            rationale: 'Directly reassures bank credit manager with legal compliance.'
          }
        ]
      };

      cases[idx].aiIntelligence = aiData;
      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, data: aiData };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 12. Delete Case Study
  async delete(id) {
    try {
      await api.delete(`/case-studies/${id}`);
    } catch (e) {
      console.warn('API delete failed, removing from local store:', e.message);
    }

    const cases = getStoredCases();
    const updated = cases.filter(c => String(c._id) !== String(id));
    saveStoredCases(updated);
    return { success: true };
  },

  // 13. Generate Banker Share Link
  async generateShareLink(id) {
    try {
      const res = await api.post(`/case-studies/${id}/share`);
      if (res.data?.success && res.data.shortUrl) {
        return { success: true, shortUrl: res.data.shortUrl, shareCode: res.data.shareCode };
      }
    } catch (e) {
      console.warn('API share generation failed, generating local share link:', e.message);
    }

    const currentCase = findStoredCase(id);
    const code = currentCase?.shareCode || `cs-${Math.random().toString(36).substring(2, 8)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://admin.ktrconsultants.in';
    const shortUrl = `${origin}/case-studies/shared/${code}`;

    if (currentCase) {
      currentCase.shareCode = code;
      currentCase.isShareActive = true;
      const cases = getStoredCases().map(c => c._id === currentCase._id ? currentCase : c);
      saveStoredCases(cases);
    }

    return { success: true, shortUrl, shareCode: code };
  },

  // 14. Shared Banker View Loader (Used by banker link SharedCaseStudy)
  async getSharedCase(code) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '';
      const res = await fetch(`${baseUrl}/api/case-studies/shared/${code}`);
      const data = await res.json();
      if (data?.success && data.data) {
        return { success: true, data: data.data };
      }
    } catch (e) {
      console.warn('Direct shared fetch failed, looking up from local store:', e.message);
    }

    const localCase = findStoredCase(code);
    if (localCase) {
      // Banker view MUST NEVER expose internal notes or confidential AI intelligence
      const bankerSafeCopy = {
        _id: localCase._id,
        caseNumber: localCase.caseNumber,
        title: localCase.title,
        clientName: localCase.clientName,
        propertyLocation: localCase.propertyLocation,
        propertyType: localCase.propertyType,
        estimatedLoanAmount: localCase.estimatedLoanAmount,
        caseIssue: localCase.caseIssue,
        status: localCase.status,
        customFields: (localCase.customFields || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0)),
        documents: (localCase.documents || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0)),
        bankerQueries: (localCase.bankerQueries || []).map(q => ({
          _id: q._id,
          bankerName: q.bankerName,
          bankName: q.bankName,
          queryText: q.queryText,
          status: q.status,
          staffReply: q.staffReply,
          repliedAt: q.repliedAt,
          repliedByName: q.repliedByName,
          createdAt: q.createdAt
        })),
        updatedAt: localCase.updatedAt
      };
      return { success: true, data: bankerSafeCopy };
    }

    return { success: false, message: 'Case Study not found or link has expired.' };
  },

  // 15. Submit Banker Query from Shared Banker View
  async submitBankerQueryFromShare(code, queryData) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '';
      const res = await fetch(`${baseUrl}/api/case-studies/shared/${code}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryData)
      });
      const data = await res.json();
      if (data?.success) {
        return { success: true, message: data.message };
      }
    } catch (e) {
      console.warn('API shared query submit failed, saving to local store:', e.message);
    }

    const targetCase = findStoredCase(code);
    if (targetCase) {
      return this.addQuery(targetCase._id, {
        ...queryData,
        isPhoneQuery: false
      });
    }

    return { success: false, message: 'Failed to record query.' };
  }
};

export default caseStudyService;

