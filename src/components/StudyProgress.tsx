"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  CircleDot,
  Flag,
  Clock,
  Star,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Award,
  X,
} from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

interface StudyProgressProps {
  userId: string;
  userEmail: string;
  userFullName: string | null;
  avatarUrl: string | null;
}

interface Study {
  id: string;
  title: string;
  description: string | null;
  subject_type: string | null;
  total_topics: number;
  completed_topics: number;
  progress_percentage: number;
  color: string | null;
  created_at: string;
}

interface ProgressEntry {
  id: string;
  topic_name: string;
  status: "not_started" | "in_progress" | "completed";
  notes: string | null;
  time_spent_minutes: number;
  score: number | null;
  max_score: number | null;
  last_studied_at: string | null;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  achieved_at: string;
}

const statusConfig = {
  not_started: {
    icon: Circle,
    color: "bg-muted text-muted",
    label: "Not Started",
  },
  in_progress: {
    icon: CircleDot,
    color: "bg-accent/20 text-accent",
    label: "In Progress",
  },
  completed: {
    icon: CheckCircle2,
    color: "bg-accent text-white",
    label: "Completed",
  },
};

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StudyProgress({
  userId,
  userEmail,
  userFullName,
  avatarUrl,
}: StudyProgressProps) {
  const [studies, setStudies] = useState<Study[]>([]);
  const [progressEntries, setProgressEntries] = useState<Record<string, ProgressEntry[]>>({});
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStudy, setActiveStudy] = useState<string | null>(null);
  const [showAddStudy, setShowAddStudy] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState<string | null>(null);
  const [expandedStudies, setExpandedStudies] = useState<Set<string>>(new Set());
  const [profileDirty, setProfileDirty] = useState(false);

  // Add study form state
  const [newStudyTitle, setNewStudyTitle] = useState("");
  const [newStudyDesc, setNewStudyDesc] = useState("");
  const [newStudyType, setNewStudyType] = useState("");

  // Add topic form state
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicNotes, setNewTopicNotes] = useState("");

  // Profile form state
  const [editName, setEditName] = useState(userFullName || "");
  const [editBio, setEditBio] = useState("");

  // Load data
  const loadData = async () => {
    try {
      const { getStudies, getProgressEntries, getMilestones } = await import(
        "../lib/profiles"
      );

      const [studiesData, entriesData, milestonesData] = await Promise.all([
        getStudies(userId),
        Promise.resolve({}), // placeholder, will be loaded per study
        getMilestones(userId),
      ]);

      setStudies(studiesData);
      setMilestones(milestonesData);
      setActiveStudy(studiesData[0]?.id || null);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load progress entries for a study
  const loadProgressEntries = async (studyId: string) => {
    try {
      const { getProgressEntries } = await import("../lib/profiles");
      const entries = await getProgressEntries(userId, studyId);
      setProgressEntries((prev) => ({ ...prev, [studyId]: entries }));
    } catch (err) {
      console.error("Failed to load entries:", err);
    }
  };

  // Create a new study
  const createStudy = async () => {
    if (!newStudyTitle.trim()) return;

    try {
      const { createStudy: createStudyFn } = await import("../lib/profiles");
      const study = await createStudyFn(userId, {
        title: newStudyTitle,
        description: newStudyDesc || undefined,
        subject_type: newStudyType || undefined,
        color: studies.length % 2 === 0 ? "#22c55e" : "#a855f7",
      });

      setStudies((prev) => [study, ...prev]);
      setActiveStudy(study.id);
      setNewStudyTitle("");
      setNewStudyDesc("");
      setNewStudyType("");
      setShowAddStudy(false);
      setProfileDirty(true);
    } catch (err) {
      console.error("Failed to create study:", err);
      alert("Failed to create study.");
    }
  };

  // Create a new topic
  const createTopic = async (studyId: string) => {
    if (!newTopicName.trim()) return;

    try {
      const { createProgressEntry } = await import("../lib/profiles");
      const entry = await createProgressEntry(userId, {
        study_id: studyId,
        topic_name: newTopicName,
        status: "not_started",
        notes: newTopicNotes || undefined,
      });

      setProgressEntries((prev) => ({
        ...prev,
        [studyId]: [...(prev[studyId] || []), entry],
      }));

      // Refresh study data
      const { getStudies } = await import("../lib/profiles");
      const studiesData = await getStudies(userId);
      setStudies(studiesData);
      setProfileDirty(true);

      setNewTopicName("");
      setNewTopicNotes("");
      setShowAddTopic(null);
    } catch (err) {
      console.error("Failed to create topic:", err);
      alert("Failed to add topic.");
    }
  };

  // Update topic status
  const updateTopicStatus = async (entryId: string, studyId: string, status: ProgressEntry["status"]) => {
    try {
      const { updateProgressEntry } = await import("../lib/profiles");
      const entry = await updateProgressEntry(entryId, { status });

      setProgressEntries((prev) => ({
        ...prev,
        [studyId]: prev[studyId].map((e) => (e.id === entryId ? entry : e)),
      }));

      // Refresh study data
      const { getStudies } = await import("../lib/profiles");
      const studiesData = await getStudies(userId);
      setStudies(studiesData);
      setProfileDirty(true);
    } catch (err) {
      console.error("Failed to update topic:", err);
    }
  };

  // Delete topic
  const deleteTopic = async (entryId: string, studyId: string) => {
    if (!confirm("Delete this topic?")) return;

    try {
      const { deleteProgressEntry } = await import("../lib/profiles");
      await deleteProgressEntry(entryId);

      setProgressEntries((prev) => ({
        ...prev,
        [studyId]: (prev[studyId] || []).filter((e) => e.id !== entryId),
      }));

      // Refresh study data
      const { getStudies } = await import("../lib/profiles");
      const studiesData = await getStudies(userId);
      setStudies(studiesData);
      setProfileDirty(true);
    } catch (err) {
      console.error("Failed to delete topic:", err);
    }
  };

  // Update profile
  const updateProfile = async () => {
    try {
      const { updateProfile: updateProfileFn } = await import("../lib/profiles");
      await updateProfileFn(userId, {
        full_name: editName || undefined,
        bio: editBio || undefined,
      });

      setProfileDirty(false);
      setShowEditProfile(false);
      alert("Profile updated!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ProfileAvatar avatarUrl={avatarUrl} userId={userId} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">{editName || "New User"}</h1>
            <p className="text-muted">{userEmail}</p>
            {editBio && <p className="mt-1 text-sm text-muted">{editBio}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditProfile(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-accent"
          >
            <Edit2 size={14} />
            Edit Profile
          </button>
          <span className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-muted">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-muted">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowEditProfile(false)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm transition-colors hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover-red"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Active Studies"
          value={studies.length}
          color="accent"
        />
        <StatCard
          icon={CheckCircle2}
          label="Topics Done"
          value={Math.round(
            studies.reduce((sum, s) => sum + s.completed_topics, 0)
          )}
          color="accent"
        />
        <StatCard
          icon={Flag}
          label="Total Topics"
          value={studies.reduce((sum, s) => sum + s.total_topics, 0)}
          color="accent-2"
        />
        <StatCard
          icon={Award}
          label="Milestones"
          value={milestones.length}
          color="accent"
        />
      </div>

      {/* Overall Progress Bar */}
      {(studies.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Overall Progress</span>
            <span className="font-medium">
              {Math.round(
                studies.reduce((sum, s) => sum + s.progress_percentage, 0) /
                  studies.length
              )}
              %
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  studies.reduce((sum, s) => sum + s.progress_percentage, 0) /
                    studies.length
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Add Study Button */}
      <div className="flex justify-end">
        {showAddStudy ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowAddStudy(false)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted hover:text-foreground"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddStudy(true)}
            className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover-red"
          >
            <Plus size={16} />
            New Study
          </button>
        )}
      </div>

      {/* Add Study Form */}
      {showAddStudy && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
          <h3 className="text-lg font-medium">Create New Study</h3>
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Study title (e.g., BITM Semester 1)"
              value={newStudyTitle}
              onChange={(e) => setNewStudyTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && createStudy()}
            />
            <textarea
              placeholder="Description (optional)"
              value={newStudyDesc}
              onChange={(e) => setNewStudyDesc(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              rows={2}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Subject type (e.g., Programming, Database)"
                value={newStudyType}
                onChange={(e) => setNewStudyType(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button
                onClick={createStudy}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover-red"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Studies List */}
      {studies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-surface-2 flex items-center justify-center">
            <BookOpen size={32} className="text-muted" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No studies yet</h3>
          <p className="mt-1 text-sm text-muted">
            Create your first study to start tracking your progress
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {studies.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              entries={progressEntries[study.id] || []}
              isExpanded={expandedStudies.has(study.id) ? true : false}
              isActive={activeStudy === study.id ? true : false}
              onToggle={() => {
                setExpandedStudies((prev) => {
                  const next = new Set(prev);
                  if (next.has(study.id)) {
                    next.delete(study.id);
                  } else {
                    next.add(study.id);
                  }
                  return next;
                });
              }}
              onSelect={() => setActiveStudy(study.id)}
              onAddTopic={() => setShowAddTopic(showAddTopic === study.id ? null : study.id)}
              onDelete={() => {
                if (confirm(`Delete "${study.title}" and all its topics?`)) {
                  // Delete study
                }
              }}
              onCreateTopic={(name) => createTopic(study.id)}
              onUpdateTopicStatus={updateTopicStatus}
              onDeleteTopic={deleteTopic}
              showAddTopicForm={showAddTopic === study.id}
              setShowAddTopicForm={() => setShowAddTopic(null)}
              newTopicName={newTopicName}
              setNewTopicName={setNewTopicName}
              newTopicNotes={newTopicNotes}
              setNewTopicNotes={setNewTopicNotes}
            />
          ))}
        </div>
      )}

      {/* Milestones Section */}
      {milestones.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star size={20} className="text-accent" />
            Milestones
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-4"
              >
                <div className="mt-0.5 h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Flag size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium">{m.title}</div>
                  {m.description && (
                    <div className="mt-1 text-xs text-muted">{m.description}</div>
                  )}
                  <div className="mt-1 text-xs text-muted">
                    Achieved {formatDate(m.achieved_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  const colorClass =
    color === "accent"
      ? "text-accent"
      : color === "accent-2"
      ? "text-accent-2"
      : "text-muted";

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className={`${colorClass} mb-2`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

// Study Card Component
function StudyCard({
  study,
  entries,
  isExpanded,
  isActive,
  onToggle,
  onSelect,
  onAddTopic,
  onDelete,
  onCreateTopic,
  onUpdateTopicStatus,
  onDeleteTopic,
  showAddTopicForm,
  setShowAddTopicForm,
  newTopicName,
  setNewTopicName,
  newTopicNotes,
  setNewTopicNotes,
}: {
  study: Study;
  entries: ProgressEntry[];
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onAddTopic: () => void;
  onDelete: () => void;
  onCreateTopic: (name: string) => void;
  onUpdateTopicStatus: (id: string, studyId: string, status: ProgressEntry["status"]) => void;
  onDeleteTopic: (id: string, studyId: string) => void;
  showAddTopicForm: boolean;
  setShowAddTopicForm: (v: boolean) => void;
  newTopicName: string;
  setNewTopicName: (v: string) => void;
  newTopicNotes: string;
  setNewTopicNotes: (v: string) => void;
}) {
  const statusIcon = statusConfig[entries[0]?.status || "not_started"].icon;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isActive
          ? "border-accent/50 bg-accent/5 shadow-lg shadow-accent/10"
          : "border-border bg-surface"
      }`}
    >
      {/* Study Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-surface-2"
      >
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-lg"
            style={{
              backgroundColor: study.color
                ? `${study.color}20`
                : "var(--color-surface-2)",
              color: study.color || "var(--color-muted)",
            }}
          >
            {study.subject_type?.[0] || study.title[0]}
          </div>
          <div>
            <div className="font-medium">{study.title}</div>
            <div className="text-xs text-muted">
              {study.total_topics} topics •{" "}
              {Math.round(study.progress_percentage)}% complete
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all"
              style={{ width: `${study.progress_percentage}%` }}
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="rounded p-1 text-muted transition-colors hover:text-foreground"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Study Description */}
          {study.description && (
            <p className="text-sm text-muted">{study.description}</p>
          )}

          {/* Topics List */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Topics</span>
              <button
                onClick={onAddTopic}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"
              >
                <Plus size={12} />
                Add Topic
              </button>
            </div>

            {entries.length === 0 ? (
              <p className="text-sm text-muted py-2">No topics added yet</p>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => {
                  const StatusIcon = statusConfig[entry.status].icon;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-lg bg-surface-2 p-3 transition-colors hover:bg-surface/80"
                    >
                      <button
                        onClick={() =>
                          onUpdateTopicStatus(
                            entry.id,
                            study.id,
                            entry.status === "completed"
                              ? "not_started"
                              : entry.status === "in_progress"
                              ? "completed"
                              : "in_progress"
                          )
                        }
                        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                          statusConfig[entry.status].color
                        }`}
                      >
                        <StatusIcon size={14} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {entry.topic_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          {entry.time_spent_minutes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {formatTime(entry.time_spent_minutes)}
                            </span>
                          )}
                          {entry.score !== null && entry.max_score !== null && (
                            <span className="text-accent">
                              Score: {entry.score}/{entry.max_score}
                            </span>
                          )}
                          {entry.last_studied_at && (
                            <span>Studied {formatDate(entry.last_studied_at)}</span>
                          )}
                        </div>
                        {entry.notes && (
                          <div className="mt-1 text-xs text-muted line-clamp-2">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onDeleteTopic(entry.id, study.id)}
                          className="rounded p-1 text-muted transition-colors hover:text-red"
                          title="Delete topic"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Topic Form */}
          {showAddTopicForm && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
              <input
                type="text"
                placeholder="Topic name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCreateTopic(newTopicName);
                }}
              />
              <textarea
                placeholder="Notes (optional)"
                value={newTopicNotes}
                onChange={(e) => setNewTopicNotes(e.target.value)}
                className="mt-2 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                rows={2}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowAddTopicForm(false)}
                  className="text-xs text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onCreateTopic(newTopicName)}
                  className="rounded bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover-red"
                >
                  Add Topic
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
