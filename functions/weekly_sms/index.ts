import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import twilio from "https://esm.sh/twilio@4.18.0";

// Read environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TWILIO_SID = Deno.env.get("TWILIO_SID")!;
const TWILIO_AUTH = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const TO_NUMBER = Deno.env.get("USER_PHONE_NUMBER")!;

// Supabase client
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

serve(async (_req: Request) => {
  try {
    // Fetch last 7 readings
    const { data, error } = await supabase
      .from("readings")
      .select("units, ts")
      .order("ts", { ascending: false })
      .limit(7);

    if (error) throw error;

    const weeklySum = data.reduce((sum: number, r: any) => sum + r.units, 0);

    // Send SMS via Twilio
    const client = twilio(TWILIO_SID, TWILIO_AUTH);
    await client.messages.create({
      from: TWILIO_FROM,
      to: TO_NUMBER,
      body: `Your electricity usage in last 7 days: ${weeklySum} units`
    });

    return new Response(JSON.stringify({ success: true, weeklySum }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
