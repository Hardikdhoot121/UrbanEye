import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { IssueStatus, IssueCategory, Severity, Issue } from '../../types';
import { 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Navigation, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Maximize2, 
  Award, 
  CheckCircle2, 
  User, 
  Calendar, 
  Tag, 
  ArrowLeft,
  XCircle,
  Activity,
  Layers,
  Sparkles,
  Inbox,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

// Default map center: San Francisco, CA
const SF_CENTER: [number, number] = [37.7749, -122.4194];

export function MapVisualizer() {
  const { issues, userProfile, castVote } = useApp();
  
  // App state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedIssueForDetails, setSelectedIssueForDetails] = useState<Issue | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Geolocation and map status toast/notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Map elements references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Show a non-blocking toast
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper emoji resolver based on category
  const getCategoryEmoji = (cat: IssueCategory) => {
    switch (cat) {
      case IssueCategory.WATER_SUPPLY: return '💧';
      case IssueCategory.TRANSPORTATION: return '🚧';
      case IssueCategory.STREETLIGHTS: return '💡';
      case IssueCategory.WASTE_MANAGEMENT: return '♻️';
      case IssueCategory.PUBLIC_SAFETY: return '🚨';
      case IssueCategory.UTILITIES: return '⚡';
      case IssueCategory.SEWAGE_DRAINAGE: return '🌊';
      case IssueCategory.ENVIRONMENT: return '🌿';
      case IssueCategory.INFRASTRUCTURE: return '🏗️';
      default: return '📍';
    }
  };

  // 1. Filter and Search logic
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Status filtering
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'PENDING' && issue.status !== IssueStatus.PENDING_VERIFICATION) return false;
        if (filterStatus === 'VERIFIED' && issue.status !== IssueStatus.COMMUNITY_VERIFIED) return false;
        if (filterStatus === 'RESOLVED' && issue.status !== IssueStatus.RESOLVED) return false;
        if (filterStatus === 'APPROVED' && issue.status !== IssueStatus.APPROVED) return false;
      }
      if (filterStatus !== 'CLOSED' && issue.status === IssueStatus.CLOSED) return false;

      // Search Query filtering (checks: ID, street/description, category, reporter, summary)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const idMatch = issue.id.toLowerCase().includes(q);
        const descMatch = issue.description.toLowerCase().includes(q);
        const catMatch = issue.category.toLowerCase().includes(q);
        const reporterMatch = issue.reporter.username.toLowerCase().includes(q);
        const summaryMatch = issue.aiAnalysis.summary.toLowerCase().includes(q);

        if (!idMatch && !descMatch && !catMatch && !reporterMatch && !summaryMatch) {
          return false;
        }
      }

      return true;
    });
  }, [issues, filterStatus, searchQuery]);

  // Keep selected details issue updated with fresh store updates
  const updatedDetailsIssue = useMemo(() => {
    if (!selectedIssueForDetails) return null;
    let target = issues.find(i => i.id === selectedIssueForDetails.id) || selectedIssueForDetails;
    if (target.mergedIntoId) {
       target = issues.find(i => i.id === target.mergedIntoId) || target;
    }
    return target;
  }, [issues, selectedIssueForDetails]);

  // Custom marker generator using L.divIcon
  const createCustomMarker = (category: string, status: string, isSelected: boolean) => {
    let colorClass = 'bg-slate-500 border-slate-300 ring-slate-500/30';
    let pulseColorClass = 'bg-slate-500/20';
    
    if (status === IssueStatus.APPROVED) {
      colorClass = 'bg-emerald-500 border-emerald-300 ring-emerald-500/30';
      pulseColorClass = 'bg-emerald-500/20';
    } else if (status === IssueStatus.COMMUNITY_VERIFIED) {
      colorClass = 'bg-amber-400 border-amber-300 ring-amber-400/30';
      pulseColorClass = 'bg-amber-400/20';
    } else if (status === IssueStatus.RESOLVED) {
      colorClass = 'bg-sky-500 border-sky-300 ring-sky-500/30';
      pulseColorClass = 'bg-sky-500/20';
    } else if (status === IssueStatus.REJECTED) {
      colorClass = 'bg-red-500 border-red-300 ring-red-500/30';
      pulseColorClass = 'bg-red-500/20';
    } else if (status === IssueStatus.PENDING_VERIFICATION) {
      colorClass = 'bg-slate-400 border-slate-300 ring-slate-400/30';
      pulseColorClass = 'bg-slate-400/20';
    } else if (status === IssueStatus.CLOSED) {
      colorClass = 'bg-slate-700 border-slate-600 ring-slate-700/30';
      pulseColorClass = 'hidden';
    }

    const emoji = getCategoryEmoji(category as IssueCategory);
    
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="absolute inline-flex h-8 w-8 rounded-full opacity-75 animate-ping ${pulseColorClass}"></span>
          <div class="relative w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg ring-4 ${colorClass} ${isSelected ? 'scale-125 border-white ring-emerald-500/40' : 'ring-transparent'}">
            <span class="text-[12px] leading-none select-none">${emoji}</span>
          </div>
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  const getPopupHTML = (issue: Issue) => {
    const badgeColors = {
      APPROVED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      COMMUNITY_VERIFIED: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      PENDING_VERIFICATION: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
      RESOLVED: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      REJECTED: 'text-red-400 bg-red-500/10 border-red-500/20',
      CLOSED: 'text-slate-500 bg-slate-700/10 border-slate-700/20'
    }[issue.status] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';

    const statusLabel = {
      APPROVED: 'Approved',
      COMMUNITY_VERIFIED: 'Verified',
      PENDING_VERIFICATION: 'Pending',
      RESOLVED: 'Resolved',
      REJECTED: 'Rejected',
      CLOSED: 'Closed/Merged',
    }[issue.status] || issue.status;

    const confidenceStr = issue.aiAnalysis.confidence > 1 
      ? `${Math.round(issue.aiAnalysis.confidence)}%` 
      : `${Math.round(issue.aiAnalysis.confidence * 100)}%`;

    return `
      <div class="p-4 text-slate-100 font-sans space-y-3.5 select-none" style="font-family: inherit;">
        <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <span class="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">${issue.category.replace('_', ' ')}</span>
          <div class="flex items-center gap-1">
            ${issue.isPotentialDuplicate ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border text-rose-400 bg-rose-500/10 border-rose-500/20">DUP</span>` : ''}
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${badgeColors}">
              ${statusLabel}
            </span>
          </div>
        </div>

        <h4 class="text-xs font-bold text-white leading-snug m-0 line-clamp-2">${issue.aiAnalysis.summary}</h4>

        <div class="grid grid-cols-2 gap-x-3 gap-y-2 py-2 text-[10px] font-mono border-t border-b border-slate-800/60">
          <div>
            <p class="text-slate-500 uppercase m-0 leading-none">Reporter</p>
            <p class="text-slate-300 font-medium mt-1 mb-0 truncate">${issue.reporter.username}</p>
          </div>
          <div>
            <p class="text-slate-500 uppercase m-0 leading-none">AI Confidence</p>
            <p class="text-slate-300 font-medium mt-1 mb-0">${confidenceStr}</p>
          </div>
          <div>
            <p class="text-slate-500 uppercase m-0 leading-none">Consensus</p>
            <p class="text-emerald-400 font-bold mt-1 mb-0">${issue.consensusScore >= 0 ? '+' : ''}${issue.consensusScore} PTS</p>
          </div>
          <div>
            <p class="text-slate-500 uppercase m-0 leading-none">Severity</p>
            <p class="text-amber-500 font-bold mt-1 mb-0">${issue.severity}</p>
          </div>
        </div>

        <button 
          id="view-details-${issue.id}" 
          data-issue-id="${issue.id}"
          class="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer border-none shadow-md hover:shadow-emerald-950/20"
        >
          View Full Details
        </button>
      </div>
    `;
  };

  // 2. Map Initialization Effect
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Initialize leaflet map
      const map = L.map(mapContainerRef.current, {
        center: SF_CENTER,
        zoom: 13,
        zoomControl: false // Disable default so we can place custom layout / Leaflet default at right
      });

      // Add gorgeous dark basemap tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(map);

      // Re-add standard zoom control inside custom placement
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      // Safe cleanup
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 3. Sync Markers with Filtered Issues list
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Plot fresh markers
    filteredIssues.forEach((issue) => {
      const isCurrentlySelected = selectedIssue?.id === issue.id;
      const marker = L.marker([issue.coordinates.latitude, issue.coordinates.longitude], {
        icon: createCustomMarker(issue.category, issue.status, isCurrentlySelected)
      });

      // Bind custom popup structure
      marker.bindPopup(getPopupHTML(issue), {
        className: 'dark-leaflet-popup',
        maxWidth: 300,
        minWidth: 240
      });

      // Marker click state update
      marker.on('click', () => {
        setSelectedIssue(issue);
      });

      if (mapRef.current) {
        marker.addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    });
  }, [filteredIssues, selectedIssue]);

  // 4. Delegate Popup Button Clicks to React Details State
  useEffect(() => {
    if (!mapRef.current) return;

    const handlePopupOpen = (e: any) => {
      const popupNode = e.popup.getElement();
      if (popupNode) {
        const btn = popupNode.querySelector('[id^="view-details-"]');
        if (btn) {
          const issueId = btn.getAttribute('data-issue-id');
          const issue = issues.find(i => i.id === issueId);
          if (issue) {
            // Clone the button to remove any residual event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
              setSelectedIssueForDetails(issue);
            });
          }
        }
      }
    };

    mapRef.current.on('popupopen', handlePopupOpen);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('popupopen', handlePopupOpen);
      }
    };
  }, [issues]);

  // 5. Fly to selected issue on change
  useEffect(() => {
    if (selectedIssue && mapRef.current) {
      const { latitude, longitude } = selectedIssue.coordinates;
      mapRef.current.setView([latitude, longitude], 15);
    }
  }, [selectedIssue]);

  // Map Utility Action Handlers
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      triggerToast('Detecting your coordinates...', 'info');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
            triggerToast('Viewport updated to your local position.', 'success');
          }
        },
        (error) => {
          console.error("Error accessing location:", error);
          triggerToast('Location access denied. Centered back to San Francisco.', 'error');
          if (mapRef.current) {
            mapRef.current.setView(SF_CENTER, 13);
          }
        }
      );
    } else {
      triggerToast('Geolocation API is not supported by your browser.', 'error');
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView(SF_CENTER, 13);
      setSelectedIssue(null);
      triggerToast('Map viewport reset to default SF parameters.', 'success');
    }
  };

  // Inline Consensus cast vote helper on the details subpage
  const handleCastVoteOnDetails = (isApproved: boolean) => {
    if (!updatedDetailsIssue) return;
    
    const activeVoter = {
      id: userProfile?.id || 'user-hardik',
      username: userProfile?.username || 'Hardik Dhoot',
      karmaPoints: userProfile?.karmaPoints || 350,
      voteWeight: Math.max(1, Math.floor((userProfile?.karmaPoints || 350) / 100))
    };

    // Check if voter has already voted
    const alreadyVoted = updatedDetailsIssue.votes?.some(v => v.userId === activeVoter.id);
    if (alreadyVoted) {
      triggerToast('You have already contributed your consensus vote on this issue!', 'error');
      return;
    }

    castVote(updatedDetailsIssue.id, isApproved, activeVoter);
    triggerToast(
      isApproved 
        ? `Consensus verification cast successfully! +${activeVoter.voteWeight} weight added.` 
        : `Consensus flag registered. -${activeVoter.voteWeight} weight added.`, 
      isApproved ? 'success' : 'error'
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col space-y-4 text-slate-100" id="map-visualizer-parent">
      
      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border text-xs max-w-sm flex items-center space-x-3 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/30'
                : toastMessage.type === 'error'
                ? 'bg-red-950/95 text-red-200 border-red-500/30'
                : 'bg-slate-900/95 text-slate-200 border-slate-800'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <XCircle className="w-4.5 h-4.5 text-red-400 shrink-0" />}
            {toastMessage.type === 'info' && <Activity className="w-4.5 h-4.5 text-emerald-400 animate-pulse shrink-0" />}
            <span className="font-mono text-3xs font-semibold leading-relaxed">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!updatedDetailsIssue ? (
          /* ================= INTERACTIVE MAP VIEWPORT ================= */
          <motion.div 
            key="map-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col space-y-4 min-h-0"
          >
            {/* Upper controls / Filters / Search Box HUD */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
                  <Navigation className="w-5.5 h-5.5 text-emerald-400 rotate-45" />
                  <span>Interactive Incident Map</span>
                </h2>
                <p className="text-slate-400 text-xs">Explore peer audited street-level anomalies and live municipal ledgers.</p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search box input */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID, reporter, category, street..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-colors"
                  />
                </div>

                {/* Filter Chips Container */}
                <div className="flex items-center space-x-1.5 overflow-x-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {['ALL', 'PENDING', 'VERIFIED', 'APPROVED', 'RESOLVED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-3xs font-mono font-bold uppercase tracking-wider transition-all ${
                        filterStatus === status 
                          ? 'bg-emerald-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {status === 'ALL' ? 'All' : status.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Canvas Split Grid */}
            <div className="flex-1 bg-slate-950 border border-slate-900 rounded-2xl relative overflow-hidden flex flex-col lg:flex-row min-h-0 shadow-2xl">
              
              {/* Actual Leaflet Map Canvas */}
              <div className="flex-1 relative min-h-[300px] z-10">
                <div ref={mapContainerRef} className="w-full h-full" id="leaflet-map-element" />

                {/* Overlaid Map Utilities Controls */}
                <div className="absolute top-4 left-4 z-40 flex flex-col space-y-2 pointer-events-auto">
                  <button
                    onClick={handleLocateMe}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 rounded-xl shadow-2xl transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-mono font-semibold"
                    title="Locate Me"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Locate Me</span>
                  </button>
                  <button
                    onClick={handleResetView}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl shadow-2xl transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-mono font-semibold"
                    title="Reset Map View"
                  >
                    <Maximize2 className="w-4 h-4 text-emerald-400" />
                    <span>Reset View</span>
                  </button>
                </div>

                {/* Responsive counter notification bubble */}
                <div className="absolute bottom-4 left-4 z-40 pointer-events-none bg-slate-900/90 border border-slate-850 px-3 py-2 rounded-xl text-3xs font-mono text-slate-300 tracking-wider flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Plotted {filteredIssues.length} of {issues.length} records</span>
                </div>
              </div>

              {/* Selection Summary Side Panel (Desktop only or scroll below) */}
              <div className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-850 p-5 flex flex-col justify-between overflow-y-auto space-y-4">
                {selectedIssue ? (
                  <div className="space-y-4.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Active Incident HUD</span>
                        <button 
                          onClick={() => setSelectedIssue(null)}
                          className="text-slate-500 hover:text-slate-300 text-3xs font-mono transition-colors"
                        >
                          ✕ DESELECT
                        </button>
                      </div>

                      {/* Header content and Category */}
                      <div className="flex items-start space-x-3 bg-slate-950 p-3.5 rounded-xl border border-slate-850/60">
                        <span className="text-3xl p-2.5 bg-slate-900 rounded-xl border border-slate-800 leading-none">
                          {getCategoryEmoji(selectedIssue.category)}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                            {selectedIssue.category.replace('_', ' ')}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className={`px-1.5 py-0.5 rounded text-3xs font-mono font-bold uppercase tracking-widest ${
                              selectedIssue.status === IssueStatus.APPROVED
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : selectedIssue.status === IssueStatus.COMMUNITY_VERIFIED
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : selectedIssue.status === IssueStatus.RESOLVED
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : selectedIssue.status === IssueStatus.REJECTED
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : selectedIssue.status === IssueStatus.CLOSED
                                ? 'bg-slate-700/10 text-slate-500 border border-slate-700/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>
                              {selectedIssue.status.replace('_', ' ')}
                            </span>
                            {selectedIssue.isPotentialDuplicate && (
                              <span className="px-1.5 py-0.5 rounded text-3xs font-mono font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Potential Duplicate
                              </span>
                            )}
                            <span className="text-3xs text-slate-500 font-mono">ID: {selectedIssue.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-1">
                        <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">AI Consensus Summary</p>
                        <h4 className="text-sm font-semibold text-slate-200 leading-snug">
                          {selectedIssue.aiAnalysis.summary}
                        </h4>
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Reporter Description</p>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-850/60 p-3 rounded-xl italic">
                          &ldquo;{selectedIssue.description}&rdquo;
                        </p>
                      </div>

                      {/* Dynamic trust indicators */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 space-y-3">
                        <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Audit Score Ledger</span>
                        </p>
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <p className="text-3xs text-slate-500 font-mono uppercase">Consensus</p>
                            <p className={`text-base font-bold font-mono mt-0.5 ${selectedIssue.consensusScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {selectedIssue.consensusScore >= 0 ? '+' : ''}{selectedIssue.consensusScore} PTS
                            </p>
                          </div>
                          <div>
                            <p className="text-3xs text-slate-500 font-mono uppercase">AI Confidence</p>
                            <p className="text-base font-bold font-mono mt-0.5 text-slate-200">
                              {selectedIssue.aiAnalysis.confidence > 1 
                                ? `${Math.round(selectedIssue.aiAnalysis.confidence)}%`
                                : `${Math.round(selectedIssue.aiAnalysis.confidence * 100)}%`
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location metadata */}
                      <div className="space-y-1.5 text-3xs text-slate-400 font-mono">
                        <div className="flex justify-between">
                          <span>Reporter Profile:</span>
                          <span className="text-slate-300 font-bold">{selectedIssue.reporter.username} (Lvl {selectedIssue.reporter.level})</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timestamp:</span>
                          <span className="text-slate-300">{formatDate(selectedIssue.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GPS Coordinates:</span>
                          <span className="text-slate-300 font-mono">{selectedIssue.coordinates.latitude.toFixed(4)}, {selectedIssue.coordinates.longitude.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Details Transition button */}
                    <div className="pt-4 border-t border-slate-800">
                      <Button
                        variant="primary"
                        className="w-full py-2.5 flex items-center justify-center space-x-1.5 text-xs font-bold"
                        onClick={() => setSelectedIssueForDetails(selectedIssue)}
                      >
                        <span>Examine Full Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Map Center instructions placeholder */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-400">
                      <MapPin className="w-5 h-5 animate-bounce text-emerald-400" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Select Location Marker</h3>
                      <p className="text-3xs text-slate-500 max-w-xs leading-relaxed">
                        Click on any pulsing coordinates on the left map layer to load municipal telemetry, AI confidence grids, and full audit logs.
                      </p>
                    </div>
                  </div>
                )}

                {/* Status indicator legend overlay */}
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-2 text-[10px]">
                  <p className="font-mono text-slate-500 uppercase tracking-wider text-3xs">Map Legend</p>
                  <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-3xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400 block shrink-0"></span>
                      <span>Pending Verification</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 block shrink-0"></span>
                      <span>Verified Consensus</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 block shrink-0"></span>
                      <span>Admin Approved</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500 block shrink-0"></span>
                      <span>Resolved Work</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 block shrink-0"></span>
                      <span>Rejected Report</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ================= DEEP ISSUE DETAILS SUBPAGE ================= */
          <motion.div
            key="details-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col space-y-6 overflow-y-auto"
          >
            {/* Top Navigation Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-5">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedIssueForDetails(null)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors flex items-center space-x-1.5 text-xs font-mono cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  <span>Back to Map</span>
                </button>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-white">Diagnostic Ledger Details</h1>
                  <p className="text-slate-400 text-xs">Autonomous peer verification audit trail and historical timeline</p>
                </div>
              </div>

              {/* Fresh status marker */}
              <div className="flex items-center space-x-2.5">
                {updatedDetailsIssue.isPotentialDuplicate && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border bg-rose-500/10 text-rose-400 border-rose-500/25">
                    Potential Duplicate
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border ${
                  updatedDetailsIssue.status === IssueStatus.APPROVED
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : updatedDetailsIssue.status === IssueStatus.COMMUNITY_VERIFIED
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    : updatedDetailsIssue.status === IssueStatus.RESOLVED
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                    : updatedDetailsIssue.status === IssueStatus.REJECTED
                    ? 'bg-red-500/10 text-red-400 border-red-500/25'
                    : updatedDetailsIssue.status === IssueStatus.CLOSED
                    ? 'bg-slate-700/10 text-slate-500 border-slate-700/25'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/25'
                }`}>
                  {updatedDetailsIssue.status.replace('_', ' ')}
                </span>
                <span className="text-3xs text-slate-500 font-mono">ID: {updatedDetailsIssue.id}</span>
              </div>
            </div>

            {/* Deep diagnostics dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Asset, Reporter and AI diagnostics */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Evidence Image Card or Gradient fallback */}
                <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-900 bg-slate-950 flex items-center justify-center">
                  {updatedDetailsIssue.imageUrl ? (
                    <img 
                      src={updatedDetailsIssue.imageUrl} 
                      alt="Verified Evidence" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-3 select-none">
                      <span className="text-5xl leading-none">{getCategoryEmoji(updatedDetailsIssue.category)}</span>
                      <div>
                        <p className="text-3xs font-mono text-emerald-400 uppercase tracking-widest">No evidence photo submitted</p>
                        <p className="text-slate-500 text-xs mt-1">Classification is based on citizen descriptive metadata logs.</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-800 px-3 py-1.5 rounded-xl text-3xs font-mono text-slate-400 uppercase tracking-wider">
                    🛰️ Visual Stream
                  </div>
                </div>

                {/* Descriptions grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reporter description */}
                  <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-2 shadow-lg">
                    <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Citizen Description Log</p>
                    <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                      &ldquo;{updatedDetailsIssue.description}&rdquo;
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-3xs font-mono text-slate-400">
                        Log submitted by <span className="text-slate-200 font-semibold">{updatedDetailsIssue.reporter.username}</span> (Lvl {updatedDetailsIssue.reporter.level})
                      </span>
                    </div>
                  </div>

                  {/* AI verification reasoning */}
                  <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-2 shadow-lg">
                    <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Autonomous Model Reasoning</p>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-900 min-h-[80px]">
                      {updatedDetailsIssue.aiAnalysis.reason || 'Classification logs successfully match high-density road anomalies and are verified via historic database logs.'}
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-3xs font-mono text-slate-400">
                        Validation Confidence Score: <span className="text-slate-200 font-semibold">{updatedDetailsIssue.aiAnalysis.confidence > 1 ? updatedDetailsIssue.aiAnalysis.confidence : Math.round(updatedDetailsIssue.aiAnalysis.confidence * 100)}%</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Suggested actions block */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-lg space-y-3.5">
                  <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Suggested dispatch workflow advice</p>
                  <div className="flex items-start space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Suggested Response Advice:</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {updatedDetailsIssue.aiAnalysis.suggestedAction || 'Queue verified incident on district dispatch board for priority fast-set repair.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Voter Panel inside Details page if they are pending */}
                {updatedDetailsIssue.status === IssueStatus.PENDING_VERIFICATION && (
                  <div className="bg-slate-900/95 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Cast Consensus Audit</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      You are logged in as <span className="text-emerald-400 font-bold">{userProfile?.username || 'Hardik Dhoot'}</span>. Your profile allows you to cast a consensus vote with a weight of <span className="text-emerald-400 font-mono font-bold">+{Math.max(1, Math.floor((userProfile?.karmaPoints || 350) / 100))}</span> points.
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3.5 pt-1">
                      <button
                        onClick={() => handleCastVoteOnDetails(true)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl text-xs transition-all shadow-lg hover:shadow-emerald-950/20 cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify Report (+{Math.max(1, Math.floor((userProfile?.karmaPoints || 350) / 100))} Pts)</span>
                      </button>
                      <button
                        onClick={() => handleCastVoteOnDetails(false)}
                        className="flex-1 bg-red-650 hover:bg-red-550 text-white font-bold py-3 px-5 rounded-xl text-xs transition-all shadow-lg hover:shadow-red-950/20 cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Flag as Spam/Fake (-{Math.max(1, Math.floor((userProfile?.karmaPoints || 350) / 100))} Pts)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Consensus parameters & voter timeline */}
              <div className="space-y-6">
                
                {/* Consensus Score Card and Progress Bar */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Consensus Analytics</p>
                    <span className="text-3xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/15">
                      Target: {updatedDetailsIssue.requiredConsensus || 70} Pts
                    </span>
                  </div>

                  <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-900">
                    <p className="text-3xl font-extrabold font-mono text-slate-100">
                      {updatedDetailsIssue.consensusScore >= 0 ? '+' : ''}{updatedDetailsIssue.consensusScore || 0}
                    </p>
                    <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider mt-1">Consensus Score (PTS)</p>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-3xs font-mono text-slate-500 uppercase">
                      <span>Verification Progress</span>
                      <span>{Math.min(100, Math.max(0, Math.round(((updatedDetailsIssue.consensusScore || 0) / (updatedDetailsIssue.requiredConsensus || 70)) * 100)))}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-950 rounded-full border border-slate-900 overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.max(0, Math.round(((updatedDetailsIssue.consensusScore || 0) / (updatedDetailsIssue.requiredConsensus || 70)) * 100)))}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="border-t border-slate-800 pt-4 space-y-2.5 text-2xs text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="text-slate-300 font-semibold">{updatedDetailsIssue.coordinates.latitude.toFixed(4)}, {updatedDetailsIssue.coordinates.longitude.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Severity Level:</span>
                      <span className="text-amber-500 font-bold">{updatedDetailsIssue.severity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date Submitted:</span>
                      <span className="text-slate-300">{formatDate(updatedDetailsIssue.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Voter Timeline Feed */}
                <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-lg space-y-4">
                  <p className="text-3xs font-mono text-slate-500 uppercase tracking-widest">Verification Audit Logs</p>
                  
                  {updatedDetailsIssue.votes && updatedDetailsIssue.votes.length > 0 ? (
                    <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                      {updatedDetailsIssue.votes.map((v, idx) => (
                        <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-200">{v.username}</span>
                              <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded">Lvl {v.karmaPoints > 500 ? 8 : 2}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              v.isApproved 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10' 
                                : 'bg-red-500/15 text-red-400 border border-red-500/10'
                            }`}>
                              {v.isApproved ? 'VERIFIED' : 'SPAM'}
                            </span>
                          </div>
                          <div className="flex justify-between text-3xs text-slate-500 font-mono">
                            <span>Contribution Weight:</span>
                            <span className={v.isApproved ? 'text-emerald-400' : 'text-red-400'}>
                              {v.isApproved ? '+' : '-'}{v.voteWeight} Pts
                            </span>
                          </div>
                          <p className="text-3xs text-slate-500 text-right font-mono">{formatDate(v.timestamp)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-950 border border-dashed border-slate-800 rounded-xl space-y-2">
                      <Inbox className="w-8 h-8 text-slate-650 mx-auto" />
                      <p className="text-xs text-slate-500 italic">No voter audit timeline recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
