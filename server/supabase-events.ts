/**
 * Supabase Event Management Service
 * Handles all event CRUD operations with Supabase database
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️  Supabase credentials not configured");
}

// Create Supabase admin client (server-side)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM - HH:MM
  venue: string;
  organizer_name: string;
  organizer_email: string;
  capacity: number;
  registered_count: number;
  banner_image: string;
  status: "upcoming" | "live" | "completed" | "cancelled";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  registered_at: string;
  status: "confirmed" | "cancelled";
}

export const supabaseEvents = {
  /**
   * Get all events (public - for students)
   */
  async getEvents(status?: string): Promise<CampusEvent[]> {
    try {
      let query = supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Error fetching events:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("❌ Supabase fetch events error:", err);
      return [];
    }
  },

  /**
   * Get specific event by ID
   */
  async getEventById(eventId: string): Promise<CampusEvent | null> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("❌ Error fetching event:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("❌ Supabase fetch event error:", err);
      return null;
    }
  },

  /**
   * Create new event (Admin only)
   */
  async createEvent(eventData: Omit<CampusEvent, "id" | "created_at" | "updated_at">): Promise<CampusEvent | null> {
    try {
      const newEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("events")
        .insert([newEvent])
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating event:", error);
        return null;
      }

      console.log(`✅ Event created: ${newEvent.title}`);
      return data;
    } catch (err) {
      console.error("❌ Supabase create event error:", err);
      return null;
    }
  },

  /**
   * Update event (Admin only)
   */
  async updateEvent(eventId: string, updates: Partial<CampusEvent>): Promise<CampusEvent | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", eventId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating event:", error);
        return null;
      }

      console.log(`✅ Event updated: ${eventId}`);
      return data;
    } catch (err) {
      console.error("❌ Supabase update event error:", err);
      return null;
    }
  },

  /**
   * Delete event (Admin only)
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);

      if (error) {
        console.error("❌ Error deleting event:", error);
        return false;
      }

      console.log(`✅ Event deleted: ${eventId}`);
      return true;
    } catch (err) {
      console.error("❌ Supabase delete event error:", err);
      return false;
    }
  },

  /**
   * Register student for event
   */
  async registerForEvent(
    eventId: string,
    studentId: string,
    studentName: string,
    studentEmail: string
  ): Promise<EventRegistration | null> {
    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("student_id", studentId)
        .eq("status", "confirmed")
        .single();

      if (existing) {
        console.warn("⚠️  Student already registered for this event");
        return null;
      }

      // Check event capacity
      const event = await this.getEventById(eventId);
      if (!event) {
        console.error("❌ Event not found");
        return null;
      }

      if (event.registered_count >= event.capacity) {
        console.warn("⚠️  Event capacity full");
        return null;
      }

      // Create registration
      const registration: EventRegistration = {
        id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        event_id: eventId,
        student_id: studentId,
        student_name: studentName,
        student_email: studentEmail,
        registered_at: new Date().toISOString(),
        status: "confirmed",
      };

      const { data, error } = await supabase
        .from("event_registrations")
        .insert([registration])
        .select()
        .single();

      if (error) {
        console.error("❌ Error registering for event:", error);
        return null;
      }

      // Increment registered count
      await this.updateEvent(eventId, {
        registered_count: event.registered_count + 1,
      });

      console.log(`✅ Student registered: ${studentName} → ${event.title}`);
      return data;
    } catch (err) {
      console.error("❌ Supabase register event error:", err);
      return null;
    }
  },

  /**
   * Get event registrations (Admin only)
   */
  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("status", "confirmed")
        .order("registered_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching registrations:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("❌ Supabase fetch registrations error:", err);
      return [];
    }
  },

  /**
   * Get student's registered events
   */
  async getStudentEvents(studentId: string): Promise<CampusEvent[]> {
    try {
      // Get registrations for this student
      const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("student_id", studentId)
        .eq("status", "confirmed");

      if (regError) {
        console.error("❌ Error fetching student registrations:", regError);
        return [];
      }

      if (!registrations || registrations.length === 0) {
        return [];
      }

      // Get events for these registrations
      const eventIds = registrations.map((r: any) => r.event_id);
      const { data: events, error: eventError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds)
        .order("created_at", { ascending: false });

      if (eventError) {
        console.error("❌ Error fetching events:", eventError);
        return [];
      }

      return events || [];
    } catch (err) {
      console.error("❌ Supabase fetch student events error:", err);
      return [];
    }
  },

  /**
   * Check if Supabase is connected
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from("events").select("id").limit(1);

      if (error) {
        console.error("❌ Supabase connection failed:", error.message);
        return false;
      }

      console.log("✅ Supabase connected successfully");
      return true;
    } catch (err) {
      console.error("❌ Supabase connection error:", err);
      return false;
    }
  },
};

export default supabaseEvents;
