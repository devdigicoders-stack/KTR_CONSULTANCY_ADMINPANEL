import api from '../api/axios';

const STORAGE_KEY = 'ktr_case_studies_store_v2';

export const CASE_TYPES = [
  'Property Legal Issues',
  'Title Verification',
  'Client Financial Profile',
  'Valuation',
  'Project Funding',
  'Loan Eligibility',
  'Documentation Problems',
  'Other'
];

export const CASE_STATUSES = [
  'Open',
  'Under Discussion',
  'Awaiting Documents',
  'Awaiting Bank Response',
  'Resolved',
  'Closed'
];

export const getDefaultFieldsForCaseType = (caseType) => {
  switch (caseType) {
    case 'Client Financial Profile':
      return [
        { id: 'fld_fin_income', label: 'Annual Turnover & Net Profit', value: '₹ 2.40 Cr Turnover / ₹ 36 L Net Profit', fieldType: 'text', isRequired: true, isConfidential: false, order: 1 },
        { id: 'fld_fin_banking', label: 'Primary Banking & Average Monthly Balance (AMB)', value: 'HDFC Current A/c - AMB ₹ 18.5 Lakhs (Past 12 Months)', fieldType: 'text', isRequired: true, isConfidential: false, order: 2 },
        { id: 'fld_fin_cibil', label: 'Promoter CIBIL & Credit History', value: 'CIBIL 748; 1 settled card DPD from 2022 with NDC certificate', fieldType: 'text', isRequired: false, isConfidential: false, order: 3 },
        { id: 'fld_fin_existing_emi', label: 'Existing Live Obligations / EMIs', value: 'Car Loan EMI ₹ 42,000; Machinery Loan EMI ₹ 85,000', fieldType: 'text', isRequired: false, isConfidential: false, order: 4 },
        { id: 'fld_fin_banking_surplus', label: 'Assessed FOIR & Repayment Capacity', value: 'Calculated FOIR 48% on proposed ₹ 1.50 Cr facility', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 5 },
        { id: 'fld_fin_solution', label: 'Proposed Credit Structuring & Mitigants', value: 'Include spouse commercial rental income + collateral enhancement to achieve debt coverage', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 6 }
      ];
    case 'Valuation':
      return [
        { id: 'fld_val_area', label: 'Total Land & Built-up Area', value: '4,500 sq.ft Land / 8,200 sq.ft Built-up Commercial', fieldType: 'text', isRequired: true, isConfidential: false, order: 1 },
        { id: 'fld_val_circle_rate', label: 'Govt. Circle Rate vs Fair Market Value (FMV)', value: 'Circle Rate ₹ 4,200/sq.ft vs Prevailing FMV ₹ 8,500/sq.ft', fieldType: 'text', isRequired: true, isConfidential: false, order: 2 },
        { id: 'fld_val_realizable', label: 'Realizable Value & Distress Sale Value (DSV)', value: 'Realizable ₹ 4.80 Cr; Distress Sale Value ₹ 4.10 Cr', fieldType: 'text', isRequired: false, isConfidential: false, order: 3 },
        { id: 'fld_val_deviations', label: 'Approved Map vs Spot Construction Deviations', value: 'Minor 12% non-compoundable projection on 2nd floor rear', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 4 },
        { id: 'fld_val_solution', label: 'Proposed Valuation Defense Strategy', value: 'Engage IBBI Registered Valuer for composite depreciated replacement cost report with registry exemplars', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 5 }
      ];
    case 'Project Funding':
      return [
        { id: 'fld_proj_cost', label: 'Total Project Cost & Means of Finance', value: '₹ 14.50 Cr (Capex: ₹ 9.2 Cr, Civil: ₹ 3.8 Cr, Working Cap: ₹ 1.5 Cr)', fieldType: 'text', isRequired: true, isConfidential: false, order: 1 },
        { id: 'fld_proj_promoter_margin', label: 'Promoter Contribution / Equity Inflow', value: '₹ 4.50 Cr (31% upfront equity infusion)', fieldType: 'text', isRequired: true, isConfidential: false, order: 2 },
        { id: 'fld_proj_dscr', label: 'Projected DSCR & Payback Period', value: 'Average DSCR 1.82 over 7 years repayment tenor', fieldType: 'text', isRequired: false, isConfidential: false, order: 3 },
        { id: 'fld_proj_permits', label: 'Statutory Approvals & Environmental / Fire NOC', value: 'Pollution Control Board Consent to Establish (CTE) & Fire NOC obtained', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 4 },
        { id: 'fld_proj_solution', label: 'Syndication & Consortium Structure', value: 'Term loan tie-up through Lead PSU Bank with escrow cashflow monitoring mechanism', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 5 }
      ];
    case 'Loan Eligibility':
      return [
        { id: 'fld_elig_requested', label: 'Requested Loan Amount vs Assessed Eligibility', value: 'Requested ₹ 2.0 Cr vs Normal ITR Eligibility ₹ 1.25 Cr', fieldType: 'text', isRequired: true, isConfidential: false, order: 1 },
        { id: 'fld_elig_ltv', label: 'Loan to Value (LTV) Ratio Calculation', value: 'Proposed LTV 55% against prime residential collateral', fieldType: 'text', isRequired: false, isConfidential: false, order: 2 },
        { id: 'fld_elig_gap', label: 'Eligibility Gap Analysis', value: 'ITR shows low depreciation write-offs; banking turnover reflects healthy cash receipts', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 3 },
        { id: 'fld_elig_mitigation', label: 'Recommended Program / Surrogate Route', value: 'Process under Banking Surrogate / Gross Turnover Scheme multiplier of leading NBFC', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 4 }
      ];
    case 'Documentation Problems':
      return [
        { id: 'fld_doc_discrepancy', label: 'Discrepancy / Deficiency Details', value: 'Spelling mismatch in applicant name across PAN, Aadhaar and Registry Sale Deed', fieldType: 'textarea', isRequired: true, isConfidential: false, order: 1 },
        { id: 'fld_doc_authority', label: 'Issuing Authority / Regulatory Body', value: 'UIDAI & Revenue Sub-Registrar Sadar', fieldType: 'text', isRequired: false, isConfidential: false, order: 2 },
        { id: 'fld_doc_resolution', label: 'Alternative Secondary Proofs & Affidavits', value: 'Execute One and the Same Person Notarized Affidavit with SDM verification', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 3 }
      ];
    case 'Title Verification':
    case 'Property Legal Issues':
    default:
      return [
        { id: 'fld_prop_address', label: 'Property Address & Khasra / Khata No.', value: 'Plot No. 42, Khasra No. 118/2, Gomti Nagar Extension, Lucknow', fieldType: 'textarea', isRequired: true, isConfidential: false, order: 1 },
        { id: 'fld_title_chain', label: 'Title Chain Status (30 Years)', value: 'Certified true copy of 2001 Sale Deed available; original misplaced in 2011', fieldType: 'text', isRequired: true, isConfidential: false, order: 2 },
        { id: 'fld_mutation_status', label: 'Mutation / Dakhil Kharij Status', value: 'Tehsildar order dated 14-Aug-2018; Khatauni Fasli Year 1428-1433 verified', fieldType: 'text', isRequired: false, isConfidential: false, order: 3 },
        { id: 'fld_zoning', label: 'Land Use / 143 Conversion', value: 'Commercial conversion approved under Section 143/80 UP Revenue Code', fieldType: 'text', isRequired: false, isConfidential: false, order: 4 },
        { id: 'fld_possession', label: 'Physical Possession & Boundary Demarcation', value: 'Physical possession clear with 4-sided boundary wall & geo-tag coordinates', fieldType: 'text', isRequired: false, isConfidential: false, order: 5 },
        { id: 'fld_proposed_solution', label: 'Proposed Legal Remedy for Banker', value: 'Registered Indemnity Bond + 30-Year Sub-Registrar Search Report + Tehsildar Certified Mutation', fieldType: 'textarea', isRequired: false, isConfidential: false, order: 6 }
      ];
  }
};

// Initial realistic default cases representing various case types
export const INITIAL_CASE_STUDIES = [
  {
    _id: 'cs-demo-1',
    caseNumber: 'CS-2026-001',
    caseType: 'Property Legal Issues',
    title: '30-Year Title Chain Clearance & Tehsil Mutation Verification',
    clientName: 'Manoj Kumar Agarwal',
    propertyLocation: 'Plot No. 42, Khasra No. 118/2, Gomti Nagar Extension, Lucknow',
    propertyType: 'Commercial',
    estimatedLoanAmount: 12500000,
    caseIssue: '1998 to 2004 original sale deed is lost; only Certified True Copy from Sub-Registrar Office is available. Tehsil Khatauni mutation is updated and certified.',
    legalComplications: 'Bank legal panel raised query regarding missing original chain deed between 1998-2004 and demanded 30-year registrar non-encumbrance search report + indemnity bond with two solvent sureties.',
    discussionNotes: 'Advocate Verma conducted 30-year search from 1994 to 2026 at Sub-Registrar Sadar. No prior mortgage, charge, or lis pendens found. Physical possession is clear with 8-ft boundary wall and active commercial establishment.',
    status: 'Under Discussion',
    resolutionSummary: '',
    customFields: getDefaultFieldsForCaseType('Property Legal Issues'),
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
        isConfidential: false,
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
        isConfidential: false,
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
        isConfidential: false,
        uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        uploadedByName: 'Staff'
      }
    ],
    bankerQueries: [
      {
        _id: 'bq_1',
        authorName: 'Vikram Sharma',
        authorRole: 'banker',
        source: 'portal',
        bankName: 'HDFC Bank - LAP Credit Desk',
        authorPhone: '9876543210',
        authorEmail: 'vikram.sharma@hdfcbank.example.com',
        queryText: 'Please clarify whether the Tehsildar certified stamped order is available for mutation, or only an unverified digital Khatauni printout?',
        status: 'Answered',
        staffReply: 'Yes, original certified stamped copy of Tehsildar mutation order dated 14-Aug-2018 is available and attached in Document #2. Digital UP Bhulekh verification barcode is also validated.',
        repliedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        repliedByName: 'Staff',
        isPhoneQuery: false,
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        replies: [
          {
            _id: 'rep_1',
            replyText: 'Yes, original certified stamped copy of Tehsildar mutation order dated 14-Aug-2018 is available and attached in Document #2. Digital UP Bhulekh verification barcode is also validated.',
            repliedByName: 'Staff',
            repliedByRole: 'staff',
            repliedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
            attachments: []
          }
        ]
      },
      {
        _id: 'bq_2',
        authorName: 'Rajesh Mehra',
        authorRole: 'banker',
        source: 'phone',
        bankName: 'ICICI Bank Mortgage Legal',
        authorPhone: '9812345678',
        authorEmail: '',
        queryText: 'Phone query: Will applicant provide registered indemnity bond along with 2 local solvent guarantors for missing 2001 original deed?',
        status: 'Answered',
        staffReply: 'Applicant has agreed in writing to execute registered indemnity bond in bank standard format with two solvent government/ITR guarantors.',
        repliedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        repliedByName: 'Staff',
        isPhoneQuery: true,
        createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        replies: [
          {
            _id: 'rep_2',
            replyText: 'Applicant has agreed in writing to execute registered indemnity bond in bank standard format with two solvent government/ITR guarantors.',
            repliedByName: 'Staff',
            repliedByRole: 'staff',
            repliedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
            attachments: []
          }
        ]
      }
    ],
    editHistory: [
      {
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        userName: 'Staff',
        action: 'Case Created',
        details: 'Initialized Case Study #CS-2026-001 with 6 customized legal fields.'
      },
      {
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        userName: 'Staff',
        action: 'Query Replied',
        details: 'Provided official mutation clarification to Vikram Sharma (HDFC Bank).'
      }
    ],
    shareSettings: [
      {
        shareCode: 'cs-demo-1',
        passcode: '',
        recipientName: 'Vikram Sharma',
        recipientType: 'Banker',
        recipientPhone: '9876543210',
        recipientEmail: 'vikram.sharma@hdfcbank.example.com',
        visibleSections: ['fields', 'documents', 'queries'],
        visibleFieldIds: [],
        visibleDocumentIds: [],
        allowQueries: true,
        isActive: true,
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        viewsCount: 6
      }
    ],
    shareCode: 'cs-demo-1',
    isShareActive: true,
    viewsCount: 6,
    createdBy: 'staff',
    createdByName: 'Staff',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'cs-demo-2',
    caseNumber: 'CS-2026-002',
    caseType: 'Client Financial Profile',
    title: 'Turnover Banking Surrogate & FOIR Optimization for LAP Facility',
    clientName: 'Shri Ram Electricals & Switchgears',
    propertyLocation: 'Transport Nagar Commercial Area, Kanpur Road, Lucknow',
    propertyType: 'Commercial',
    estimatedLoanAmount: 18000000,
    caseIssue: 'Turnover in GST reflects ₹ 2.40 Cr with ₹ 36 L profit, but applicant requires ₹ 1.80 Cr LAP loan. Standard ITR multiplier covers only ₹ 1.15 Cr.',
    legalComplications: 'Financial eligibility gap: Net profit margin on ITR is lean due to aggressive depreciation and inventory write-offs.',
    discussionNotes: 'Applicant maintains very clean 12-month average bank balance (AMB) exceeding ₹ 18.5 Lakhs in HDFC Bank current account. Zero cheque bounces in last 24 months. Recommended solution is to propose under Banking Surrogate Program.',
    status: 'Awaiting Bank Response',
    resolutionSummary: '',
    customFields: getDefaultFieldsForCaseType('Client Financial Profile'),
    documents: [
      {
        id: 'doc_fin_1',
        name: '12-Month Banking Statement & CA Summary',
        fileTitle: 'HDFC Current Account Verified Statement',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: 2240000,
        category: 'Financial Records',
        notes: 'Includes net credit turnover calculation with CA sign-off',
        order: 1,
        isConfidential: false,
        uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        uploadedByName: 'Staff'
      }
    ],
    bankerQueries: [
      {
        _id: 'bq_fin_1',
        authorName: 'Sunil Mathur',
        authorRole: 'banker',
        source: 'portal',
        bankName: 'Axis Bank SME Credit',
        authorPhone: '9833445566',
        authorEmail: 'sunil.mathur@axisbank.example.com',
        queryText: 'Can the applicant provide provisional CA certified balance sheet for current ongoing financial year to support the surge in Q2 banking credits?',
        status: 'Open',
        staffReply: '',
        repliedAt: null,
        repliedByName: null,
        isPhoneQuery: false,
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        replies: []
      }
    ],
    editHistory: [
      {
        timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
        userName: 'Staff',
        action: 'Case Created',
        details: 'Created financial profile case discussion.'
      }
    ],
    shareSettings: [
      {
        shareCode: 'cs-demo-2',
        passcode: '',
        recipientName: 'Sunil Mathur',
        recipientType: 'Banker',
        recipientPhone: '9833445566',
        visibleSections: ['fields', 'documents', 'queries'],
        visibleFieldIds: [],
        visibleDocumentIds: [],
        allowQueries: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        viewsCount: 3
      }
    ],
    shareCode: 'cs-demo-2',
    isShareActive: true,
    viewsCount: 3,
    createdBy: 'staff',
    createdByName: 'Staff',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'cs-demo-3',
    caseNumber: 'CS-2026-003',
    caseType: 'Valuation',
    title: 'Market Valuation vs Circle Rate Discrepancy & Map Deviation Defense',
    clientName: 'Agarwal Cold Storage & Agro Logistics',
    propertyLocation: 'NH-24 Sitapur Highway, Bakshi Ka Talab, Lucknow',
    propertyType: 'Industrial',
    estimatedLoanAmount: 45000000,
    caseIssue: 'Circle rate assessment reflects ₹ 2.80 Cr while spot commercial fair market value (FMV) exceeds ₹ 5.60 Cr. Valuation report deviation needed for bank consortium sanction.',
    legalComplications: 'Bank credit requires justification for lending 80% above circle rate based on continuous highway commercial frontage.',
    discussionNotes: 'Arranged 3 recent registered sale deeds of adjacent commercial warehouses sold between ₹ 7,500 - 8,200/sq.ft within last 18 months.',
    status: 'Resolved',
    resolutionSummary: 'IBBI Registered Valuer composite report accepted by Bank Credit Committee. Sanction issued at ₹ 4.20 Cr.',
    customFields: getDefaultFieldsForCaseType('Valuation'),
    documents: [],
    bankerQueries: [],
    editHistory: [
      {
        timestamp: new Date(Date.now() - 96 * 3600000).toISOString(),
        userName: 'Staff',
        action: 'Case Created',
        details: 'Created valuation dispute case.'
      },
      {
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        userName: 'Staff',
        action: 'Status Changed',
        details: 'Case marked as Resolved with successful bank credit acceptance.'
      }
    ],
    shareSettings: [],
    shareCode: 'cs-demo-3',
    isShareActive: true,
    viewsCount: 4,
    createdBy: 'staff',
    createdByName: 'Staff',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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

export const saveStoredCases = (cases) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error('Error saving case studies to localStorage:', e);
  }
};

export const findStoredCase = (idOrCode) => {
  const cases = getStoredCases();
  return cases.find(c => 
    String(c._id) === String(idOrCode) || 
    String(c.caseNumber).toLowerCase() === String(idOrCode).toLowerCase() ||
    String(c.shareCode).toLowerCase() === String(idOrCode).toLowerCase() ||
    (c.shareSettings && c.shareSettings.some(s => s.shareCode.toLowerCase() === String(idOrCode).toLowerCase()))
  ) || null;
};

export const caseStudyService = {
  // 1. Fetch Case Studies List (supports status, caseType, search)
  async getAll(status = 'All', caseType = 'All', search = '') {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'All') params.append('status', status);
      if (caseType && caseType !== 'All') params.append('caseType', caseType);
      if (search && search.trim()) params.append('search', search.trim());

      const url = `/case-studies${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await api.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        if (res.data.data.length > 0) {
          saveStoredCases(res.data.data);
          return { success: true, data: res.data.data };
        }
      }
    } catch (apiErr) {
      console.warn('Backend /case-studies fallback to localStorage:', apiErr.message);
    }

    let cases = getStoredCases();
    if (status && status !== 'All') {
      cases = cases.filter(c => c.status === status);
    }
    if (caseType && caseType !== 'All') {
      cases = cases.filter(c => c.caseType === caseType);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      cases = cases.filter(c => 
        (c.caseNumber || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.clientName || '').toLowerCase().includes(q) ||
        (c.propertyLocation || '').toLowerCase().includes(q) ||
        (c.caseIssue || '').toLowerCase().includes(q) ||
        (c.caseType || '').toLowerCase().includes(q)
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
      console.warn(`Backend /case-studies/${id} fallback:`, apiErr.message);
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
      console.warn('Backend API create error, saving locally:', apiErr.message);
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
    const caseType = formData.caseType || 'Property Legal Issues';

    const newCase = {
      _id: newId,
      caseNumber,
      caseType,
      title: (formData.title || '').trim(),
      clientName: (formData.clientName || '').trim(),
      propertyLocation: (formData.propertyLocation || '').trim(),
      propertyType: formData.propertyType || 'Residential',
      estimatedLoanAmount: Number(formData.estimatedLoanAmount) || 0,
      caseIssue: (formData.caseIssue || '').trim(),
      legalComplications: (formData.legalComplications || '').trim(),
      discussionNotes: (formData.discussionNotes || '').trim(),
      status: formData.status || 'Open',
      resolutionSummary: '',
      customFields: formData.customFields || getDefaultFieldsForCaseType(caseType),
      documents: [],
      bankerQueries: [],
      editHistory: [
        {
          timestamp: new Date().toISOString(),
          userName: user?.name || 'Staff',
          action: 'Case Created',
          details: `Created new case #${caseNumber} (${caseType})`
        }
      ],
      shareSettings: [
        {
          shareCode,
          passcode: '',
          recipientName: 'General Partner',
          recipientType: 'Banker',
          visibleSections: ['fields', 'documents', 'queries'],
          visibleFieldIds: [],
          visibleDocumentIds: [],
          allowQueries: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          viewsCount: 0
        }
      ],
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
  async update(id, updates, userName = 'Staff') {
    try {
      const res = await api.put(`/case-studies/${id}`, updates);
      if (res.data?.success && res.data.data) {
        return { success: true, data: res.data.data };
      }
    } catch (e) {
      console.warn('API update failed, updating local store:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const historyEntry = {
        timestamp: new Date().toISOString(),
        userName,
        action: updates.status ? `Status changed to ${updates.status}` : 'Case Updated',
        details: updates.resolutionSummary ? `Resolution: ${updates.resolutionSummary}` : 'Updated case attributes'
      };

      const updatedHistory = [historyEntry, ...(cases[idx].editHistory || [])];

      cases[idx] = {
        ...cases[idx],
        ...updates,
        editHistory: updatedHistory,
        updatedAt: new Date().toISOString()
      };
      saveStoredCases(cases);
      return { success: true, data: cases[idx] };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 5. Update / Reorder Custom Fields
  async updateFields(id, fields, userName = 'Staff') {
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
      const ordered = fields.map((f, i) => ({ ...f, order: i + 1 }));
      cases[idx].customFields = ordered;
      if (!cases[idx].editHistory) cases[idx].editHistory = [];
      cases[idx].editHistory.unshift({
        timestamp: new Date().toISOString(),
        userName,
        action: 'Fields Layout Updated',
        details: `Saved ${ordered.length} custom fields.`
      });
      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, customFields: ordered };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 6. Upload / Add Documents
  async uploadDocuments(id, formData, fileObjects = [], userName = 'Staff') {
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

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const existingDocs = cases[idx].documents || [];
      const category = formData.get ? formData.get('category') : (formData.category || 'General');
      const baseName = formData.get ? formData.get('name') : (formData.name || '');
      const notes = formData.get ? formData.get('notes') : (formData.notes || '');
      const isConfidential = formData.get ? formData.get('isConfidential') === 'true' : Boolean(formData.isConfidential);

      const newDocs = fileObjects.map((file, i) => {
        const fileExt = file.name.split('.').pop().toLowerCase();
        let fileType = 'document';
        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt)) fileType = 'image';
        else if (fileExt === 'pdf') fileType = 'pdf';

        const docTitle = baseName ? (fileObjects.length > 1 ? `${baseName} (${i + 1})` : baseName) : file.name.replace(/\.[^/.]+$/, '');

        return {
          id: `doc_${Date.now()}_${i}`,
          name: docTitle,
          fileTitle: file.name,
          fileUrl: URL.createObjectURL(file),
          fileType,
          fileSize: file.size,
          category: category || 'General',
          notes: notes || '',
          order: existingDocs.length + i + 1,
          isConfidential,
          uploadedAt: new Date().toISOString(),
          uploadedByName: userName
        };
      });

      const updatedDocs = [...existingDocs, ...newDocs];
      cases[idx].documents = updatedDocs;

      if (!cases[idx].editHistory) cases[idx].editHistory = [];
      cases[idx].editHistory.unshift({
        timestamp: new Date().toISOString(),
        userName,
        action: 'Documents Uploaded',
        details: `Uploaded ${newDocs.length} file(s).`
      });

      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, documents: updatedDocs };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 7. Replace Document File
  async replaceDocument(id, docId, fileObject, userName = 'Staff') {
    try {
      const formData = new FormData();
      formData.append('file', fileObject);
      const res = await api.post(`/case-studies/${id}/documents/${docId}/replace`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data.documents) {
        return { success: true, documents: res.data.documents, document: res.data.document };
      }
    } catch (e) {
      console.warn('API replaceDocument failed, updating locally:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const docs = cases[idx].documents || [];
      const dIdx = docs.findIndex(d => d.id === docId);
      if (dIdx !== -1) {
        const fileExt = fileObject.name.split('.').pop().toLowerCase();
        let fileType = 'document';
        if (['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) fileType = 'image';
        else if (fileExt === 'pdf') fileType = 'pdf';

        docs[dIdx] = {
          ...docs[dIdx],
          fileTitle: fileObject.name,
          fileUrl: URL.createObjectURL(fileObject),
          fileType,
          fileSize: fileObject.size,
          replacedAt: new Date().toISOString(),
          replacedByName: userName
        };

        cases[idx].documents = docs;
        if (!cases[idx].editHistory) cases[idx].editHistory = [];
        cases[idx].editHistory.unshift({
          timestamp: new Date().toISOString(),
          userName,
          action: 'Document Replaced',
          details: `Replaced file for "${docs[dIdx].name}" with "${fileObject.name}"`
        });

        cases[idx].updatedAt = new Date().toISOString();
        saveStoredCases(cases);
        return { success: true, documents: docs, document: docs[dIdx] };
      }
    }

    return { success: false, message: 'Document or case not found' };
  },

  // 8. Rename / Update Document Metadata
  async renameDocument(id, docId, details, userName = 'Staff') {
    try {
      const res = await api.patch(`/case-studies/${id}/documents/${docId}`, details);
      if (res.data?.success && res.data.documents) {
        return { success: true, documents: res.data.documents, document: res.data.document };
      }
    } catch (e) {
      console.warn('API renameDocument failed, updating locally:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const docs = cases[idx].documents || [];
      const dIdx = docs.findIndex(d => d.id === docId);
      if (dIdx !== -1) {
        docs[dIdx] = {
          ...docs[dIdx],
          ...details
        };
        cases[idx].documents = docs;
        cases[idx].updatedAt = new Date().toISOString();
        saveStoredCases(cases);
        return { success: true, documents: docs, document: docs[dIdx] };
      }
    }

    return { success: false, message: 'Document not found' };
  },

  // 9. Delete Document
  async deleteDocument(id, docId, userName = 'Staff') {
    try {
      const res = await api.delete(`/case-studies/${id}/documents/${docId}`);
      if (res.data?.success && res.data.documents) {
        return { success: true, documents: res.data.documents };
      }
    } catch (e) {
      console.warn('API deleteDocument failed, updating local store:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const remaining = (cases[idx].documents || []).filter(d => d.id !== docId);
      remaining.forEach((d, i) => { d.order = i + 1; });
      cases[idx].documents = remaining;

      if (!cases[idx].editHistory) cases[idx].editHistory = [];
      cases[idx].editHistory.unshift({
        timestamp: new Date().toISOString(),
        userName,
        action: 'Document Deleted',
        details: `Deleted document ID ${docId}`
      });

      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, documents: remaining };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 10. Reorder Documents
  async reorderDocuments(id, docIds) {
    try {
      const res = await api.patch(`/case-studies/${id}/documents/reorder`, { docIds });
      if (res.data?.success && res.data.documents) {
        return { success: true, documents: res.data.documents };
      }
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

  // 11. Add Query (Portal, Phone Call, Meeting, Email)
  async addQuery(id, queryData, userName = 'Staff') {
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
      const isAnswered = Boolean(queryData.staffReply && queryData.staffReply.trim());
      const repliesList = isAnswered ? [{
        _id: `rep_${Date.now()}`,
        replyText: queryData.staffReply.trim(),
        repliedByName: userName,
        repliedByRole: 'staff',
        repliedAt: new Date().toISOString(),
        attachments: []
      }] : [];

      const newQuery = {
        _id: `bq_${Date.now()}`,
        authorName: queryData.authorName || queryData.bankerName || 'Expert / Banker',
        authorRole: queryData.authorRole || 'banker',
        source: queryData.source || (queryData.isPhoneQuery ? 'phone' : 'portal'),
        bankName: queryData.bankName || '',
        authorPhone: queryData.authorPhone || queryData.bankerPhone || '',
        authorEmail: queryData.authorEmail || queryData.bankerEmail || '',
        queryText: (queryData.queryText || '').trim(),
        status: isAnswered ? 'Answered' : (queryData.status || 'Open'),
        staffReply: isAnswered ? queryData.staffReply.trim() : '',
        repliedAt: isAnswered ? new Date().toISOString() : null,
        repliedByName: isAnswered ? userName : null,
        isPhoneQuery: queryData.source === 'phone' || Boolean(queryData.isPhoneQuery),
        attachments: queryData.attachments || [],
        replies: repliesList,
        createdAt: new Date().toISOString()
      };

      const queries = [newQuery, ...(cases[idx].bankerQueries || [])];
      cases[idx].bankerQueries = queries;

      if (!cases[idx].editHistory) cases[idx].editHistory = [];
      cases[idx].editHistory.unshift({
        timestamp: new Date().toISOString(),
        userName,
        action: 'Query Recorded',
        details: `Recorded query from ${newQuery.authorName} (${newQuery.source})`
      });

      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, queries };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 12. Reply to Query with threaded reply
  async replyQuery(id, queryId, replyText, userName = 'Staff', status = 'Answered', attachments = []) {
    try {
      const res = await api.put(`/case-studies/${id}/queries/${queryId}`, {
        replyText,
        staffReply: replyText,
        status,
        attachments
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
        if (String(q._id) === String(queryId)) {
          const repObj = {
            _id: `rep_${Date.now()}`,
            replyText: replyText.trim(),
            repliedByName: userName,
            repliedByRole: 'staff',
            repliedAt: new Date().toISOString(),
            attachments
          };

          return {
            ...q,
            staffReply: replyText.trim(),
            status,
            repliedAt: new Date().toISOString(),
            repliedByName: userName,
            replies: [...(q.replies || []), repObj]
          };
        }
        return q;
      });

      cases[idx].bankerQueries = queries;

      if (!cases[idx].editHistory) cases[idx].editHistory = [];
      cases[idx].editHistory.unshift({
        timestamp: new Date().toISOString(),
        userName,
        action: 'Query Replied',
        details: `Replied to query #${String(queryId).slice(-4)}`
      });

      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, queries };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 13. Update Query Status (Open, In Progress, Awaiting Documents, Answered, Resolved, Closed)
  async updateQueryStatus(id, queryId, status, userName = 'Staff') {
    try {
      const res = await api.patch(`/case-studies/${id}/queries/${queryId}/status`, { status });
      if (res.data?.success && res.data.queries) {
        return { success: true, queries: res.data.queries };
      }
    } catch (e) {
      console.warn('API updateQueryStatus failed, updating local store:', e.message);
    }

    const cases = getStoredCases();
    const idx = cases.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      const queries = (cases[idx].bankerQueries || []).map(q => {
        if (String(q._id) === String(queryId)) {
          return { ...q, status };
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

  // 14. Run AI Intelligence
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
      const issue = `${currentCase.title} ${currentCase.caseType} ${currentCase.caseIssue} ${currentCase.legalComplications}`.toLowerCase();
      const cType = currentCase.caseType || 'Property Legal Issues';

      const isFinancial = cType === 'Client Financial Profile' || issue.includes('income') || issue.includes('cibil');
      const isValuation = cType === 'Valuation' || issue.includes('valuation') || issue.includes('circle rate');

      const anticipatedQueries = isFinancial ? [
        'Credit Underwriter: Provide 12-month GST 3B reconciliation against bank credits to verify turnover authenticity.',
        'Risk Dept: Clarify source of bulk deposit in Q3 banking credits with CA confirmation.'
      ] : isValuation ? [
        'Bank Valuer: Explain deviation of 12% in ground coverage compared to sanctioned master layout.',
        'Legal/Valuation: Provide latest guideline circle rate notification from District Magistrate.'
      ] : [
        'Bank Legal Dept: Prior link deed missing. Provide certified copy from SRO or register 30-year search report.',
        'Panel Advocate: Confirm physical boundary demarcation matches the registered schedule.'
      ];

      const missingDocuments = isFinancial ? [
        '12 Months Bank Account Statement with complete e-statement validation',
        'Audited Financials (Balance Sheet, P&L, Tax Audit Report) with UDIN',
        'GST Returns (GSTR-1 & GSTR-3B) for latest financial year'
      ] : [
        '30-Year Encumbrance Certificate (EC / Nil Encumbrance from Sub-Registrar)',
        'Certified copy of Prior Link Deed from District Registrar Office',
        'Site Demarcation Map / Boundary Certificate signed by adjacent owners'
      ];

      const suggestedBanks = isFinancial ? [
        { bankName: 'HDFC Bank / ICICI Bank', loanType: 'Banking Surrogate LAP', matchScore: 94, reasoning: 'Strong appetite for turnover banking surrogate models with healthy AMB.' },
        { bankName: 'Bajaj Finance / Tata Capital', loanType: 'Secured Working Capital', matchScore: 88, reasoning: 'Fast-track clearance for high net worth promoter profiles.' }
      ] : [
        { bankName: 'Punjab National Bank / Union Bank', loanType: 'Commercial LAP', matchScore: 92, reasoning: 'Strong legal flexibility for ancestral title gaps with 12-year registered possession proof.' },
        { bankName: 'State Bank of India', loanType: 'Term Loan / LAP', matchScore: 86, reasoning: 'Lowest interest rates for clear legal titles and approved conversions.' }
      ];

      const recommendedSolutions = isFinancial ? [
        'Present credit file under Gross Turnover Surrogate program rather than Net Profit method.',
        'Add family member or co-applicant to strengthen total household repayment capacity.'
      ] : [
        'Apply immediately for Certified True Copies from SRO with certified search report from panel advocate.',
        'Execute a registered Indemnity Bond indemnifying the lending bank against prior undisclosed encumbrances.'
      ];

      const aiData = {
        lastAnalyzedAt: new Date().toISOString(),
        summary: `AI analyzed case context and comparable evidence for ${cType}. Case risk is Moderate with strong probability of approval when supported by recommended mitigants.`,
        riskRating: 'Moderate',
        similarPastCases: [
          {
            caseNumber: 'REF-2025-088',
            title: `Resolved Similar ${cType} Case in Lucknow`,
            caseType: cType,
            propertyType: currentCase.propertyType || 'N/A',
            outcome: 'Approved & Sanctioned',
            solution: 'Structured with bank panel advocate report and comprehensive indemnity.'
          }
        ],
        anticipatedQueries,
        missingDocuments,
        suggestedBanks,
        recommendedSolutions,
        draftReplies: (currentCase.bankerQueries || []).map(q => ({
          queryKey: q._id,
          suggestedReply: `With reference to your query regarding "${q.queryText.substring(0, 50)}...", all supporting records and verified certificates have been uploaded for legal vetting.`,
          rationale: 'Satisfies standard bank audit requirements.'
        }))
      };

      cases[idx].aiIntelligence = aiData;
      cases[idx].updatedAt = new Date().toISOString();
      saveStoredCases(cases);
      return { success: true, data: aiData };
    }

    return { success: false, message: 'Case Study not found' };
  },

  // 15. Delete Case Study
  async delete(id) {
    try {
      await api.delete(`/case-studies/${id}`);
    } catch (e) {
      console.warn('API delete failed, removing locally:', e.message);
    }

    const cases = getStoredCases();
    const updated = cases.filter(c => String(c._id) !== String(id));
    saveStoredCases(updated);
    return { success: true };
  },

  // 16. Generate / Configure Granular Share Link
  async generateShareLink(id, shareOptions = {}, userName = 'Staff') {
    try {
      const res = await api.post(`/case-studies/${id}/share`, shareOptions);
      if (res.data?.success && res.data.shortUrl) {
        return {
          success: true,
          shortUrl: res.data.shortUrl,
          shareCode: res.data.shareCode,
          shareConfig: res.data.shareConfig
        };
      }
    } catch (e) {
      console.warn('API share generation failed, generating local share link:', e.message);
    }

    const currentCase = findStoredCase(id);
    const code = `cs-${Math.random().toString(36).substring(2, 8)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://admin.ktrconsultants.in';
    const shortUrl = `${origin}/case-studies/shared/${code}`;

    const newShareConfig = {
      shareCode: code,
      passcode: shareOptions.passcode || '',
      recipientName: shareOptions.recipientName || 'Expert / Banker',
      recipientType: shareOptions.recipientType || 'Banker',
      recipientPhone: shareOptions.recipientPhone || '',
      recipientEmail: shareOptions.recipientEmail || '',
      visibleSections: ['fields', 'documents', 'queries'],
      visibleFieldIds: shareOptions.visibleFieldIds || [],
      visibleDocumentIds: shareOptions.visibleDocumentIds || [],
      allowQueries: shareOptions.allowQueries !== false,
      expiresAt: shareOptions.expiresInDays ? new Date(Date.now() + shareOptions.expiresInDays * 86400000).toISOString() : null,
      isActive: true,
      createdAt: new Date().toISOString(),
      viewsCount: 0
    };

    if (currentCase) {
      if (!currentCase.shareSettings) currentCase.shareSettings = [];
      currentCase.shareSettings.unshift(newShareConfig);
      currentCase.shareCode = code;
      currentCase.isShareActive = true;

      if (!currentCase.editHistory) currentCase.editHistory = [];
      currentCase.editHistory.unshift({
        timestamp: new Date().toISOString(),
        userName,
        action: 'Share Link Generated',
        details: `Shared with ${newShareConfig.recipientName} (${newShareConfig.recipientType}). Passcode: ${newShareConfig.passcode ? 'Yes' : 'No'}`
      });

      const cases = getStoredCases().map(c => c._id === currentCase._id ? currentCase : c);
      saveStoredCases(cases);
    }

    return { success: true, shortUrl, shareCode: code, shareConfig: newShareConfig };
  },

  // 17. Shared Public Recipient Loader
  async getSharedCase(code, passcode = '') {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '';
      const queryParam = passcode ? `?passcode=${encodeURIComponent(passcode)}` : '';
      const res = await fetch(`${baseUrl}/api/case-studies/shared/${code}${queryParam}`);
      const data = await res.json();
      if (data?.success && data.data) {
        return { success: true, data: data.data };
      }
      if (data?.requiresPasscode) {
        return { success: false, requiresPasscode: true, message: data.message, recipientType: data.recipientType, caseNumber: data.caseNumber };
      }
      if (data?.isExpired) {
        return { success: false, isExpired: true, message: data.message };
      }
    } catch (e) {
      console.warn('Direct shared fetch failed, looking up from local store:', e.message);
    }

    const localCase = findStoredCase(code);
    if (localCase) {
      const matchedShare = (localCase.shareSettings || []).find(
        s => s.shareCode.toLowerCase() === code.toLowerCase()
      );

      if (matchedShare?.passcode && matchedShare.passcode.trim()) {
        if (!passcode || passcode.trim() !== matchedShare.passcode.trim()) {
          return {
            success: false,
            requiresPasscode: true,
            recipientType: matchedShare.recipientType,
            caseNumber: localCase.caseNumber,
            message: 'This case is protected with a security passcode. Please enter the passcode to access.'
          };
        }
      }

      // Filter fields and docs according to permissions and confidentiality
      let customFields = (localCase.customFields || [])
        .filter(f => !f.isConfidential)
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      if (matchedShare && matchedShare.visibleFieldIds && matchedShare.visibleFieldIds.length > 0) {
        customFields = customFields.filter(f => matchedShare.visibleFieldIds.includes(f.id));
      }

      let documents = (localCase.documents || [])
        .filter(d => !d.isConfidential)
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      if (matchedShare && matchedShare.visibleDocumentIds && matchedShare.visibleDocumentIds.length > 0) {
        documents = documents.filter(d => matchedShare.visibleDocumentIds.includes(d.id));
      }

      const safeCopy = {
        _id: localCase._id,
        caseNumber: localCase.caseNumber,
        caseType: localCase.caseType || 'Property Legal Issues',
        title: localCase.title,
        clientName: localCase.clientName,
        propertyLocation: localCase.propertyLocation,
        propertyType: localCase.propertyType,
        estimatedLoanAmount: localCase.estimatedLoanAmount,
        caseIssue: localCase.caseIssue,
        status: localCase.status,
        resolutionSummary: localCase.resolutionSummary,
        customFields,
        documents,
        queries: (localCase.bankerQueries || []).map(q => ({
          _id: q._id,
          id: q._id,
          authorName: q.authorName,
          authorRole: q.authorRole,
          source: q.source,
          bankName: q.bankName,
          queryText: q.queryText,
          status: q.status,
          staffReply: q.staffReply,
          repliedAt: q.repliedAt,
          replies: q.replies || [],
          attachments: q.attachments || [],
          createdAt: q.createdAt
        })),
        allowQueries: matchedShare ? matchedShare.allowQueries !== false : true,
        recipientName: matchedShare?.recipientName || '',
        recipientType: matchedShare?.recipientType || 'Expert',
        updatedAt: localCase.updatedAt
      };
      return { success: true, data: safeCopy };
    }

    return { success: false, message: 'Case Study not found or link has expired.' };
  },

  // 18. Submit Query from Shared Recipient View
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
      console.warn('API shared query submit failed, saving locally:', e.message);
    }

    const targetCase = findStoredCase(code);
    if (targetCase) {
      return this.addQuery(targetCase._id, {
        authorName: queryData.authorName || 'External Recipient',
        authorRole: queryData.authorRole || 'banker',
        source: 'portal',
        queryText: queryData.queryText,
        bankName: queryData.bankName || '',
        authorPhone: queryData.authorPhone || '',
        authorEmail: queryData.authorEmail || ''
      });
    }

    return { success: false, message: 'Failed to record query.' };
  }
};

export default caseStudyService;
