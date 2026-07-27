"use client";

import * as React from "react";
import type { AiInsightSection, CleaningProposalStatus, DatasetProfile, DecisionRecommendation } from "@/lib/types";

const STORAGE_KEY = "datapilot:active-dataset";

interface DatasetContextValue {
  profile: DatasetProfile | null;
  isHydrated: boolean;
  setProfile: (profile: DatasetProfile) => void;
  clearProfile: () => void;
  updateIssueStatus: (issueId: string, status: CleaningProposalStatus) => void;
  setAiAnalystNotes: (notes: AiInsightSection[]) => void;
  setDecisionRecommendations: (recommendations: DecisionRecommendation[]) => void;
}

const DatasetContext = React.createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = React.useState<DatasetProfile | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
      if (raw) setProfileState(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setProfile = React.useCallback((next: DatasetProfile) => {
    setProfileState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage full or unavailable — keep in-memory state only
    }
  }, []);

  const clearProfile = React.useCallback(() => {
    setProfileState(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const patchProfile = React.useCallback((patch: (prev: DatasetProfile) => DatasetProfile) => {
    setProfileState((prev) => {
      if (!prev) return prev;
      const next = patch(prev);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage full or unavailable — keep in-memory state only
      }
      return next;
    });
  }, []);

  const updateIssueStatus = React.useCallback(
    (issueId: string, status: CleaningProposalStatus) => {
      patchProfile((prev) => ({
        ...prev,
        issues: prev.issues.map((issue) => (issue.id === issueId ? { ...issue, status } : issue)),
      }));
    },
    [patchProfile]
  );

  /**
   * Persists Gemini-authored AI Analyst Notes (generated on /insights) onto
   * the profile so a later report export can include them without
   * re-generating. Kept separate from the deterministic `insights` field.
   */
  const setAiAnalystNotes = React.useCallback(
    (notes: AiInsightSection[]) => {
      patchProfile((prev) => ({ ...prev, aiAnalystNotes: notes }));
    },
    [patchProfile]
  );

  /**
   * Persists Gemini-authored decision-support recommendations (generated
   * on /insights) onto the profile for the same reason as above.
   */
  const setDecisionRecommendations = React.useCallback(
    (recommendations: DecisionRecommendation[]) => {
      patchProfile((prev) => ({ ...prev, decisionRecommendations: recommendations }));
    },
    [patchProfile]
  );

  const value = React.useMemo(
    () => ({
      profile,
      isHydrated,
      setProfile,
      clearProfile,
      updateIssueStatus,
      setAiAnalystNotes,
      setDecisionRecommendations,
    }),
    [profile, isHydrated, setProfile, clearProfile, updateIssueStatus, setAiAnalystNotes, setDecisionRecommendations]
  );

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset() {
  const ctx = React.useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used within a DatasetProvider");
  return ctx;
}

/**
 * Returns the uploaded dataset's profile, or null if the user hasn't
 * uploaded anything yet in this session. Pages must handle the null case
 * with a real empty state (see <NoDatasetState />) — there is no fake
 * sample-data fallback.
 */
export function useActiveDataset() {
  const { profile, isHydrated } = useDataset();
  return { profile, isHydrated };
}

/**
 * Approve/reject actions for cleaning-suggestion proposals. This only
 * records the user's decision on `DataIssue.status` — it never mutates
 * the underlying dataset (no auto-apply).
 */
export function useCleaningProposals() {
  const { updateIssueStatus } = useDataset();
  return { updateIssueStatus };
}

/**
 * Setters for persisting the Gemini-authored AI Analyst Notes and
 * decision-support recommendations generated on /insights, so report
 * export can include them without re-generating.
 */
export function useAiContent() {
  const { setAiAnalystNotes, setDecisionRecommendations } = useDataset();
  return { setAiAnalystNotes, setDecisionRecommendations };
}
