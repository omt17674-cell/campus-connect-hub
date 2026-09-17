import { supabaseAdmin } from "../lib/supabase";
import { CampusEvent, Registration, AttendanceRecord, VerifiedAchievement } from "../lib/types";
import { db } from "./db";

export const supabaseSync = {
  // Check if Supabase tables are initialized and reachable
  async pingSupabase(): Promise<{ connected: boolean; error?: string }> {
    try {
      const { data, error } = await supabaseAdmin.from("events").select("id").limit(1);
      if (error) {
        return { connected: false, error: error.message };
      }
      return { connected: true };
    } catch (err) {
      return { connected: false, error: String(err) };
    }
  },

  // Pull latest events from Supabase or fallback to in-memory db
  async getEvents(): Promise<CampusEvent[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as CampusEvent[];
      }
    } catch (e) {
      console.warn("Supabase fetch events error, using server memory:", e);
    }
    return db.events;
  },

  // Save Event to Supabase
  async saveEvent(event: CampusEvent): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin.from("events").upsert(event);
      return !error;
    } catch (e) {
      console.warn("Supabase save event error:", e);
      return false;
    }
  },

  // Save Registration to Supabase
  async saveRegistration(reg: Registration): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin.from("registrations").upsert(reg);
      return !error;
    } catch (e) {
      console.warn("Supabase save registration error:", e);
      return false;
    }
  },

  // Save Attendance to Supabase
  async saveAttendance(att: AttendanceRecord): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin.from("attendance").upsert(att);
      return !error;
    } catch (e) {
      console.warn("Supabase save attendance error:", e);
      return false;
    }
  },

  // Seed Supabase with initial catalog if empty
  async seedSupabaseIfEmpty(): Promise<void> {
    try {
      const { data: existingEvents } = await supabaseAdmin.from("events").select("id").limit(1);
      if (!existingEvents || existingEvents.length === 0) {
        await supabaseAdmin.from("events").insert(db.events);
      }

      const { data: existingAccounts } = await supabaseAdmin.from("accounts").select("id").limit(1);
      if (!existingAccounts || existingAccounts.length === 0) {
        const mappedAccounts = db.accounts.map((a) => ({
          id: a.profile.id,
          name: a.name,
          roll_no: a.idOrRoll,
          email: a.email,
          role: a.role,
          department: a.profile.department,
          semester: a.profile.semester,
          year: a.profile.year,
          attendance_percentage: a.profile.attendancePercentage,
          points: a.profile.points,
          streak_days: a.profile.streakDays,
          volunteer_hours: a.profile.volunteerHours,
          avatar: a.profile.avatar,
        }));
        await supabaseAdmin.from("accounts").insert(mappedAccounts);
      }
    } catch (e) {
      console.warn("Initial Supabase seeding note (tables may need SQL migration):", e);
    }
  },
};
