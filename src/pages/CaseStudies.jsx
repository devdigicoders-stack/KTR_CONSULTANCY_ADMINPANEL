import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, Plus, Search, Eye, Share2, MoreVertical, Trash2, 
  FileText, Clock, AlertCircle, CheckCircle, ChevronRight, MessageSquare,
  Sparkles, RefreshCw, X, Copy, Lock, MapPin, IndianRupee, Layers, ArrowLeft,
  Filter, ShieldCheck, Briefcase, FileCheck, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import caseStudyService, { CASE_TYPES, CASE_STATUSES } from '../utils/caseStudyStore';

export const getCaseStatusBadge = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Under Discussion':
    case 'Active Discussion':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Awaiting Documents':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Awaiting Bank Response':
    case 'Banker Review':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Resolved':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Closed':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

export const getCaseTypeBadge = (type) => {
  switch (type) {
    case 'Client Financial Profile':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Property Legal Issues':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Title Verification':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Valuation':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Project Funding':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Loan Eligibility':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Documentation Problems':
      return 'bg-orange-50 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const CaseStudies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCaseType, setSelectedCaseType] = useState('All');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    caseType: 'Property Legal Issues',
    title: '',
    clientName: '',
    propertyLocation: '',
    propertyType: 'Residential',
    estimatedLoanAmount: '',
    caseIssue: '',
    legalComplications: '',
    discussionNotes: '',
    status: 'Open'
  });

  // Share Modal State
  const [shareModalData, setShareModalData] = useState(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await caseStudyService.getAll(selectedStatus, selectedCaseType, searchQuery);
      if (res.success) {
        setCases(res.data || []);
      }
    } catch (err) {
      console.error('Fetch Case Studies Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [selectedStatus, selectedCaseType]);

  // Close 3-dot dropdown on window click
  useEffect(() => {
    const handleCloseMenu = () => setOpenMenuId(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Case title is required');
      return;
    }

    try {
      setCreating(true);
      const res = await caseStudyService.create(formData, user);
      if (res.success && res.data) {
        toast.success('Case discussion created successfully!');
        setShowCreateModal(false);
        setFormData({
          caseType: 'Property Legal Issues',
          title: '',
          clientName: '',
          propertyLocation: '',
          propertyType: 'Residential',
          estimatedLoanAmount: '',
          caseIssue: '',
          legalComplications: '',
          discussionNotes: '',
          status: 'Open'
        });
        navigate(`/case-studies/${res.data._id}`);
      }
    } catch (err) {
      toast.error('Failed to create Case');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCase = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete Case "${title}"?`)) return;
    try {
      await caseStudyService.delete(id);
      toast.success('Case deleted');
      setCases(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      toast.error('Failed to delete Case');
    }
  };

  const handleOpenShare = async (caseStudy) => {
    try {
      const res = await caseStudyService.generateShareLink(caseStudy._id, {
        recipientName: 'Expert / Banker',
        recipientType: 'Banker'
      }, user?.name || 'Staff');
      if (res.success) {
        setShareModalData({
          title: caseStudy.title,
          caseNumber: caseStudy.caseNumber,
          shortUrl: res.shortUrl
        });
      }
    } catch (err) {
      toast.error('Failed to generate share link');
    }
  };

  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      c.title.toLowerCase().includes(q) ||
      c.caseNumber.toLowerCase().includes(q) ||
      (c.caseType && c.caseType.toLowerCase().includes(q)) ||
      (c.clientName && c.clientName.toLowerCase().includes(q)) ||
      (c.propertyLocation && c.propertyLocation.toLowerCase().includes(q)) ||
      (c.caseIssue && c.caseIssue.toLowerCase().includes(q))
    );

    const matchesType = selectedCaseType === 'All' || c.caseType === selectedCaseType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-[#f59e0b] shadow-xs">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-[#081326]">Case Studies & Expert Discussions</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Universal Case System
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Discuss financial profiles, property legal issues, valuation, funding, or documentation with bankers, advocates, and experts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchCases()}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors cursor-pointer border border-gray-200"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[#081326] text-white hover:bg-[#11203d] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#f59e0b] stroke-[3]" />
            <span>New Case Discussion</span>
          </button>
        </div>
      </div>

      {/* Case Type Horizontal Pills */}
      <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-gray-400" /> Type:
          </span>
          <button
            onClick={() => setSelectedCaseType('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCaseType === 'All'
                ? 'bg-[#081326] text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Types
          </button>
          {CASE_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedCaseType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCaseType === type
                  ? 'bg-[#081326] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          <button
            onClick={() => setSelectedStatus('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'All'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Status ({cases.length})
          </button>
          {CASE_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === status
                  ? 'bg-[#081326] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by case #, client, issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b] shadow-xs"
          />
        </div>
      </div>

      {/* Case Studies List */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-gray-400 bg-white rounded-2xl border border-gray-100">
          Loading case discussions...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 space-y-3">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">No Case Discussions Found</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Create a discussion case to organize customizable fields, documents, and query threads with external recipients.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] inline-flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Create First Case Discussion</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCases.map((cs) => {
            const pendingQueries = (cs.bankerQueries || []).filter(q => q.status !== 'Resolved' && q.status !== 'Closed').length;
            const docCount = cs.documents?.length || 0;

            return (
              <div
                key={cs._id}
                onClick={() => navigate(`/case-studies/${cs._id}`)}
                className="bg-white hover:bg-slate-50/70 border border-gray-200 hover:border-amber-300 rounded-2xl p-4 transition-all shadow-xs cursor-pointer flex items-center justify-between gap-3 group"
              >
                {/* Left Section: Case Number & Title */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="px-2.5 py-1 bg-[#081326] text-amber-400 rounded-lg text-xs font-mono font-bold shrink-0 shadow-2xs">
                    {cs.caseNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`${getCaseTypeBadge(cs.caseType)} px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0`}>
                        {cs.caseType || 'Property Legal Issues'}
                      </span>
                      <h3 className="text-sm font-black text-[#081326] truncate group-hover:text-amber-600 transition-colors">
                        {cs.title}
                      </h3>
                      <span className={`${getCaseStatusBadge(cs.status)} px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0`}>
                        {cs.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1 flex-wrap">
                      {cs.clientName && (
                        <span className="text-gray-800 font-bold">
                          Client: {cs.clientName}
                        </span>
                      )}
                      {cs.propertyLocation && (
                        <>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="flex items-center gap-1 text-gray-600 truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{cs.propertyLocation}</span>
                          </span>
                        </>
                      )}
                      {cs.estimatedLoanAmount > 0 && (
                        <>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-emerald-700 font-bold">
                            ₹ {Number(cs.estimatedLoanAmount).toLocaleString('en-IN')}
                          </span>
                        </>
                      )}
                      {docCount > 0 && (
                        <>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded text-[10px] font-bold border border-blue-200">
                            {docCount} {docCount === 1 ? 'Doc' : 'Docs'}
                          </span>
                        </>
                      )}
                      {pendingQueries > 0 && (
                        <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5 text-amber-700" />
                          {pendingQueries} Query Pending
                        </span>
                      )}
                      {cs.aiIntelligence?.lastAnalyzedAt && (
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-purple-200 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-purple-600" /> AI Ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Controls */}
                <div className="flex items-center gap-1 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleOpenShare(cs)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === cs._id ? null : cs._id);
                    }}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      openMenuId === cs._id ? 'bg-amber-100 text-[#081326]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* 3-Dot Dropdown Menu */}
                  {openMenuId === cs._id && (
                    <div
                      className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs font-bold text-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          navigate(`/case-studies/${cs._id}`);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View & Configure</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          handleOpenShare(cs);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Share Case Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          navigate(`/case-studies/${cs._id}?tab=queries`);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span>Queries & Discussion</span>
                      </button>

                      <div className="my-1 border-t border-gray-100"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          handleDeleteCase(cs._id, cs.title);
                        }}
                        className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Delete Case</span>
                      </button>
                    </div>
                  )}

                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Case Study Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#f59e0b] stroke-[2.5]" />
                <h3 className="font-black text-base text-[#081326]">Create New Case Discussion</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Case Category / Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.caseType}
                  onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                >
                  {CASE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Pre-configures appropriate custom fields for this specific matter type.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Case Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turnover Banking Surrogate & FOIR Optimization / 30-Year Title Chain Gap"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reference Client / Entity</label>
                  <input
                    type="text"
                    placeholder="e.g. M/s Ramesh Enterprises"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Value / Loan (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000000"
                    value={formData.estimatedLoanAmount}
                    onChange={(e) => setFormData({ ...formData, estimatedLoanAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Location / Regional Context</label>
                <input
                  type="text"
                  placeholder="e.g. Gomti Nagar Extension, Lucknow, UP"
                  value={formData.propertyLocation}
                  onChange={(e) => setFormData({ ...formData, propertyLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Core Problem / Subject Matter</label>
                <textarea
                  rows="2"
                  placeholder="Summarize the primary complication or discussion focus..."
                  value={formData.caseIssue}
                  onChange={(e) => setFormData({ ...formData, caseIssue: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Technical / Legal Details</label>
                <textarea
                  rows="2"
                  placeholder="Specific regulatory, credit, or legal observations..."
                  value={formData.legalComplications}
                  onChange={(e) => setFormData({ ...formData, legalComplications: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Internal Notes (Staff Only - Never Shared)</label>
                <textarea
                  rows="2"
                  placeholder="Internal tactical observations, strategy, and banker preferences..."
                  value={formData.discussionNotes}
                  onChange={(e) => setFormData({ ...formData, discussionNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-[#081326] text-white rounded-xl text-xs font-bold hover:bg-[#11203d] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{creating ? 'Creating...' : 'Create & Open Case'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081326]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#f59e0b]">
                  <Share2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#081326]">Share Case Discussion</h3>
                  <p className="text-[11px] text-gray-500 font-medium">{shareModalData.caseNumber}</p>
                </div>
              </div>
              <button onClick={() => setShareModalData(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Secure Shareable Link</label>
                <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={shareModalData.shortUrl}
                    className="flex-1 px-2.5 py-1.5 bg-transparent text-xs font-mono font-bold text-gray-800 outline-none select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareModalData.shortUrl);
                      toast.success('Share link copied to clipboard!');
                    }}
                    className="px-3 py-1.5 bg-[#081326] text-white rounded-lg text-xs font-bold hover:bg-[#11203d] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `📁 KTR Consultants – Case Discussion\n\nCase: ${shareModalData.caseNumber} - ${shareModalData.title}\n🔗 Review Case Details & Documents:\n${shareModalData.shortUrl}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: shareModalData.title,
                          url: shareModalData.shortUrl
                        });
                        return;
                      } catch (e) {}
                    }
                    navigator.clipboard.writeText(shareModalData.shortUrl);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Link</span>
                </button>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 text-[11px] text-amber-900 font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Lock className="w-3.5 h-3.5 text-amber-700" /> Secure Participant View
                </p>
                <p className="text-[10px] text-amber-800">
                  Recipients (Bankers, Advocates, Valuers, CAs) view case details in exact serial order, examine documents, and raise queries. Internal staff notes and audit logs remain strictly hidden.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStudies;
