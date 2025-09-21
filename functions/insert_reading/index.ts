import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Secrets (add केलेले URL आणि ANON_KEY)
const supabase = createClient(
  Deno.env.get("URL")!,      // Key नाव 'URL'
  Deno.env.get("ANON_KEY")!  // Key नाव 'ANON_KEY'
);

serve(async (req) => {
  try {
    const { value } = await req.json();

    // Example insert
    const { data, error } = await supabase
      .from("readings")
      .insert({ value });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
