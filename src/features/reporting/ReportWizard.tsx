import React, { useState } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { ReportForm } from './components/ReportForm';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { AIAnalysisCard } from './components/AIAnalysisCard';
import { DuplicateDetectionCard } from './components/DuplicateDetectionCard';
import { findPotentialDuplicate } from './utils/similarity';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { getLevelConfig } from '../../utils/levelUtils';
import { Issue, IssueStatus, IssueCategory, Severity } from '../../types';

interface AIAnalysis {
  category: string;
  severity: string;
  summary: string;
  confidence: number;
  isValidIssue: boolean;
  reason: string;
  suggestedAction: string;
}

// Helpers to safely map string outcomes to type-safe enums
function parseCategory(cat: string): IssueCategory {
  const upper = cat.toUpperCase().replace(/\s+/g, '_');
  if (Object.values(IssueCategory).includes(upper as any)) {
    return upper as IssueCategory;
  }
  for (const enumVal of Object.values(IssueCategory)) {
    if (upper.includes(enumVal) || enumVal.includes(upper)) {
      return enumVal;
    }
  }
  return IssueCategory.OTHER;
}

function parseSeverity(sev: string): Severity {
  const upper = sev.toUpperCase();
  if (Object.values(Severity).includes(upper as any)) {
    return upper as Severity;
  }
  return Severity.MEDIUM;
}

export function ReportWizard() {
  const { addIssue, updateIssue, issues } = useApp();
  const { profile } = useAuth();

  // 1. Core State Ownership (File object for API payload + Preview URL for viewport)
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  
  // 2. Status & Pipeline States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  // Duplicate detection state
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{
    existingIssue: Issue;
    distanceMeters: number;
    similarityScore: number;
    latitude: number;
    longitude: number;
  } | null>(null);

  // 3. Real Full-Stack API integration flow calling server.ts endpoint
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !image) {
      setError("Please provide either a detailed description or an evidence photograph.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("description", description);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`The server returned an unexpected response format (${contentType || "unknown"}). This usually means the backend server is still initializing or there is a routing conflict. Please wait a few seconds and try again.`);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }
      setAnalysis({
        category: data.category,
        severity: data.severity,
        summary: data.summary,
        confidence: data.confidence,
        isValidIssue: data.isValidIssue,
        reason: data.reason,
        suggestedAction: data.suggestedAction,
      });
    } catch (err: any) {
      console.error("Gemini pipeline dispatch failed:", err);
      setError(err.message || "A connection anomaly occurred while dispatching the payload to the Gemini server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setDescription('');
    setAnalysis(null);
    setError(null);
    setDuplicateCheckResult(null);
  };

  const runDuplicateCheck = (lat: number, lng: number) => {
    if (!analysis) return;

    const parsedCategory = parseCategory(analysis.category);
    const parsedSeverity = parseSeverity(analysis.severity);

    const checkResult = findPotentialDuplicate(
      {
        category: parsedCategory,
        severity: parsedSeverity,
        description: description,
        latitude: lat,
        longitude: lng,
      },
      issues
    );

    if (checkResult.isDuplicate && checkResult.existingIssue) {
      setDuplicateCheckResult({
        existingIssue: checkResult.existingIssue,
        distanceMeters: checkResult.distanceMeters,
        similarityScore: checkResult.similarityScore,
        latitude: lat,
        longitude: lng,
      });
    } else {
      saveNewIssue(lat, lng, false);
    }
  };

  const saveNewIssue = (lat: number, lng: number, isPotentialDuplicate: boolean) => {
    if (!analysis) return;

    const uniqueId = `issue-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newIssue: Issue = {
      id: uniqueId,
      description: description,
      category: parseCategory(analysis.category),
      severity: parseSeverity(analysis.severity),
      status: IssueStatus.PENDING_VERIFICATION,
      coordinates: { latitude: lat, longitude: lng },
      imageUrl: imagePreview || undefined,
      trustScore: analysis.confidence,
      isPotentialDuplicate: isPotentialDuplicate,
      aiAnalysis: {
        category: analysis.category,
        severity: analysis.severity,
        summary: analysis.summary,
        confidence: analysis.confidence,
        isValidIssue: analysis.isValidIssue,
        reason: analysis.reason,
        suggestedAction: analysis.suggestedAction,
      },
      reporter: {
        id: profile?.id || "user-anon",
        username: profile?.username || "Citizen",
        karmaPoints: profile?.karma_points || 0,
        level: getLevelConfig(profile?.karma_points || 0).level,
        avatarUrl: profile?.avatar_url,
      },
      votes: [],
      consensusScore: 0,
      requiredConsensus: 15,
      timeline: [
        {
          status: IssueStatus.PENDING_VERIFICATION,
          timestamp: new Date().toISOString(),
          actor: 'CITIZEN' as const
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addIssue(newIssue);

    if (isPotentialDuplicate) {
      alert(`Consensus filing success! Your community report has been marked as a "Potential Duplicate" but was successfully submitted for peer verification and added to the map.`);
    } else {
      alert(`Consensus filing success! Your community report has been submitted to the verification queue and logged onto the public map as pending.`);
    }

    handleReset();
  };

  const handleSupportExistingIssue = () => {
    if (!duplicateCheckResult) return;

    const existing = duplicateCheckResult.existingIssue;
    const currentSupportCount = existing.supporterCount || 0;
    const currentTrust = existing.trustScore || 50;

    const updatedIssue: Issue = {
      ...existing,
      supporterCount: currentSupportCount + 1,
      trustScore: Math.min(100, currentTrust + 12),
      consensusScore: existing.consensusScore + 5,
      updatedAt: new Date().toISOString()
    };

    updateIssue(updatedIssue);

    alert(`Endorsement success! You have supported the existing report (ID: ${existing.id.slice(0, 8)}). The issue's trust ranking has been promoted and consensus queue priority boosted!`);
    handleReset();
  };

  const handleSubmitFinalReport = () => {
    if (!analysis) return;

    // Define standard SF Center coordinates as baseline
    const SF_LAT = 37.7749;
    const SF_LNG = -122.4194;
    
    // Default coordinates with a dynamic slight random dispersion
    let latitude = SF_LAT + (Math.random() - 0.5) * 0.03;
    let longitude = SF_LNG + (Math.random() - 0.5) * 0.03;

    // Try to retrieve actual geolocation if supported by browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          runDuplicateCheck(latitude, longitude);
        },
        () => {
          runDuplicateCheck(latitude, longitude);
        }
      );
    } else {
      runDuplicateCheck(latitude, longitude);
    }
  };

  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setImage(file);
    setImagePreview(previewUrl);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 text-slate-100" id="report-wizard-container">

      {/* Visual Header */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-900">
        <div className="p-2 bg-emerald-600/10 text-emerald-400 rounded-xl">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">AI-Assisted Report Wizard</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Upload physical evidence & detail neighborhood incidents; AI auto-indexes municipal routing.</p>
        </div>
      </div>

      {/* Dynamic Main Workspace State Routing */}
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setError(null)} />
      ) : duplicateCheckResult ? (
        <DuplicateDetectionCard
          existingIssue={duplicateCheckResult.existingIssue}
          distanceMeters={duplicateCheckResult.distanceMeters}
          similarityScore={duplicateCheckResult.similarityScore}
          onSupportExisting={handleSupportExistingIssue}
          onCreateAnyway={() => saveNewIssue(duplicateCheckResult.latitude, duplicateCheckResult.longitude, true)}
          onBack={() => setDuplicateCheckResult(null)}
        />
      ) : analysis ? (
        <AIAnalysisCard 
          analysis={analysis} 
          onReset={handleReset} 
          onSubmitReport={handleSubmitFinalReport} 
        />
      ) : (
        <div className="space-y-6 bg-slate-950/40 p-5 rounded-2xl border border-slate-900">
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-2xs text-slate-400 font-mono leading-normal">
              PRO-TIP: Entering physical descriptions of utility failures (e.g. "clogged sewer drainage") or street hazards will stream real-time insights from Google Gemini!
            </p>
          </div>

          {/* Child Component: Image Evidence drag-and-drop file inputs */}
          <ImageUpload imagePreview={imagePreview} onImageChange={handleImageChange} />

          {/* Child Component: Description Form and Simulated Analysis Catalyst */}
          <ReportForm 
            description={description}
            onDescriptionChange={setDescription}
            onSubmit={handleAnalyze}
            isLoading={isLoading}
            canAnalyze={description.trim().length > 0 || !!image}
          />
        </div>
      )}
    </div>
  );
}
