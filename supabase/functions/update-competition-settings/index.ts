import { json as rawJson, fail as rawFail, cors, client, admin, body } from "../_shared/core.ts";

Deno.serve(async (req) => {
  const json = (payload: unknown, status = 200) => rawJson(payload, status, req);
  const fail = (message: string, status = 400, details?: unknown) => rawFail(message, status, details, req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  const adm = await admin(req);
  if (!adm) return fail("Unauthorized", 401);

  let b: any = {};
  try {
    b = await body(req);
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const db = client();

  // Find latest active event
  const { data: event, error: eventError } = await db
    .from("events")
    .select("id,status")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventError) return fail("Gagal membaca event kompetisi", 500);
  if (!event) return fail("Event tidak ditemukan", 404);

  // Validate status if provided
  if (b?.status !== undefined) {
    if (!["draft", "open", "closed"].includes(b.status)) return fail("Status event tidak valid", 400);
    if (typeof b.registration_open !== "boolean" || b.registration_open !== (b.status === "open")) {
      return fail("Status dan pendaftaran tidak konsisten", 400);
    }
    const { data: statusRows, error: statusError } = await db.rpc("update_competition_status", {
      p_event_id: event.id,
      p_status: b.status,
      p_registration_open: b.registration_open,
      p_admin_id: adm.id,
    });
    if (statusError || !statusRows?.[0]) return fail("Gagal memperbarui status kompetisi", 500);
  }

  // Build competition_settings updates
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
    updated_by: adm.id,
  };

  if (typeof b?.registration_open === "boolean") {
    updates.registration_open = b.registration_open;
  }
  if (typeof b?.replay_allowed === "boolean") {
    updates.replay_allowed = b.replay_allowed;
  }
  if (
    Number.isInteger(b?.reflex_duration_seconds) &&
    b.reflex_duration_seconds >= 1 &&
    b.reflex_duration_seconds <= 120
  ) {
    updates.reflex_duration_seconds = b.reflex_duration_seconds;
  }
  if (
    Number.isInteger(b?.reflex_rounds) &&
    b.reflex_rounds >= 1 &&
    b.reflex_rounds <= 20
  ) {
    updates.reflex_rounds = b.reflex_rounds;
  }
  if (
    Number.isInteger(b?.memory_rounds) &&
    b.memory_rounds >= 1 &&
    b.memory_rounds <= 8
  ) {
    updates.memory_rounds = b.memory_rounds;
  }
  if (
    Number.isInteger(b?.memory_max_lives) &&
    b.memory_max_lives >= 1 &&
    b.memory_max_lives <= 3
  ) {
    updates.memory_max_lives = b.memory_max_lives;
  }
  if (
    Number.isInteger(b?.quiz_questions_count) &&
    b.quiz_questions_count >= 1 &&
    b.quiz_questions_count <= 20
  ) {
    updates.quiz_questions_count = b.quiz_questions_count;
  }
  if (
    Number.isInteger(b?.quiz_time_per_question_seconds) &&
    b.quiz_time_per_question_seconds >= 1 &&
    b.quiz_time_per_question_seconds <= 60
  ) {
    updates.quiz_time_per_question_seconds = b.quiz_time_per_question_seconds;
  }

  const { data: updatedSetting, error } = await db
    .from("competition_settings")
    .upsert(
      {
        event_id: event.id,
        ...updates,
      },
      { onConflict: "event_id" },
    )
    .select("*")
    .single();

  if (error) {
    return fail("Gagal memperbarui pengaturan kompetisi", 500);
  }

  // Audit activity log
  await db.from("admin_activity").insert({
    admin_id: adm.id,
    action: "update_competition_settings",
    target_type: "competition_settings",
    target_id: updatedSetting.id,
    payload: {
      status: b.status,
      registration_open: updatedSetting.registration_open,
    },
  });

  return json({
    success: true,
    settings: {
      registration_open: updatedSetting.registration_open,
      status: b?.status || event.status,
      updated_at: updatedSetting.updated_at,
      updated_by: updatedSetting.updated_by,
    },
  });
});
