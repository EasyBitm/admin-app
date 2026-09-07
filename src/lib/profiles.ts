import { supabase, supabaseAuth } from "./supabaseClient";

// ============================================
// PROFILE FUNCTIONS
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  }
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

// ============================================
// AVATAR / PROFILE PICTURE FUNCTIONS
// ============================================

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function deleteAvatar(
  avatarUrl: string,
  userId: string
): Promise<void> {
  // Extract path from URL
  const urlParts = avatarUrl.split("/");
  const fileName = urlParts[urlParts.length - 1];

  const { error } = await supabase.storage.from("avatars").remove([fileName]);

  if (error) throw error;
}

// ============================================
// STUDY / PROGRESS FUNCTIONS
// ============================================

export interface Study {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject_type: string | null;
  total_topics: number;
  completed_topics: number;
  is_active: boolean;
  progress_percentage: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressEntry {
  id: string;
  study_id: string;
  user_id: string;
  topic_name: string;
  status: "not_started" | "in_progress" | "completed";
  notes: string | null;
  time_spent_minutes: number;
  score: number | null;
  max_score: number | null;
  last_studied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string;
  achieved_at: string;
  is_active: boolean;
}

// --- Studies ---

export async function getStudies(userId: string): Promise<Study[]> {
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Study[];
}

export async function getStudyById(studyId: string): Promise<Study | null> {
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("id", studyId)
    .single();

  if (error) throw error;
  return data as Study | null;
}

export async function createStudy(
  userId: string,
  study: {
    title: string;
    description?: string;
    subject_type?: string;
    color?: string;
  }
): Promise<Study> {
  const { data, error } = await supabase
    .from("studies")
    .insert({
      user_id: userId,
      title: study.title,
      description: study.description || null,
      subject_type: study.subject_type || null,
      color: study.color || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Study;
}

export async function updateStudy(
  studyId: string,
  updates: {
    title?: string;
    description?: string;
    subject_type?: string;
    color?: string;
    is_active?: boolean;
  }
): Promise<Study> {
  const { data, error } = await supabase
    .from("studies")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", studyId)
    .select()
    .single();

  if (error) throw error;
  return data as Study;
}

export async function deleteStudy(studyId: string): Promise<void> {
  const { error } = await supabase.from("studies").delete().eq("id", studyId);
  if (error) throw error;
}

// --- Progress Entries ---

export async function getProgressEntries(
  userId: string,
  studyId?: string
): Promise<ProgressEntry[]> {
  const query = supabase
    .from("progress_entries")
    .select("*")
    .eq("user_id", userId)
    .order("last_studied_at", { ascending: false, nullsFirst: true });

  if (studyId) {
    query.eq("study_id", studyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ProgressEntry[];
}

export async function createProgressEntry(
  userId: string,
  entry: {
    study_id: string;
    topic_name: string;
    status?: "not_started" | "in_progress" | "completed";
    notes?: string;
    time_spent_minutes?: number;
    score?: number;
    max_score?: number;
  }
): Promise<ProgressEntry> {
  const { data, error } = await supabase
    .from("progress_entries")
    .insert({
      user_id: userId,
      study_id: entry.study_id,
      topic_name: entry.topic_name,
      status: entry.status || "not_started",
      notes: entry.notes || null,
      time_spent_minutes: entry.time_spent_minutes || 0,
      score: entry.score || null,
      max_score: entry.max_score || null,
      last_studied_at: entry.status === "completed" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProgressEntry;
}

export async function updateProgressEntry(
  entryId: string,
  updates: {
    status?: "not_started" | "in_progress" | "completed";
    notes?: string;
    time_spent_minutes?: number;
    score?: number;
    max_score?: number;
    last_studied_at?: string;
  }
): Promise<ProgressEntry> {
  const { data, error } = await supabase
    .from("progress_entries")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      last_studied_at:
        updates.status === "completed"
          ? new Date().toISOString()
          : updates.last_studied_at || undefined,
    })
    .eq("id", entryId)
    .select()
    .single();

  if (error) throw error;
  return data as ProgressEntry;
}

export async function deleteProgressEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from("progress_entries")
    .delete()
    .eq("id", entryId);
  if (error) throw error;
}

// --- Milestones ---

export async function getMilestones(userId: string): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("achieved_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Milestone[];
}

export async function addMilestone(
  userId: string,
  milestone: {
    title: string;
    description?: string;
    icon?: string;
  }
): Promise<Milestone> {
  const { data, error } = await supabase
    .from("milestones")
    .insert({
      user_id: userId,
      title: milestone.title,
      description: milestone.description || null,
      icon: milestone.icon || "star",
      achieved_at: new Date().toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Milestone;
}

// ============================================
// SUMMARY HELPERS
// ============================================

export async function getProgressSummary(userId: string) {
  const [studies, milestones] = await Promise.all([
    getStudies(userId),
    getMilestones(userId),
  ]);

  const totalTopics = studies.reduce((sum, s) => sum + s.total_topics, 0);
  const completedTopics = studies.reduce(
    (sum, s) => sum + s.completed_topics,
    0
  );
  const totalProgress = studies.reduce((sum, s) => sum + s.progress_percentage, 0);
  const avgProgress =
    studies.length > 0 ? totalProgress / studies.length : 0;

  return {
    studies,
    milestones,
    totalTopics,
    completedTopics,
    avgProgress,
    studiesCount: studies.length,
    milestonesCount: milestones.length,
  };
}
