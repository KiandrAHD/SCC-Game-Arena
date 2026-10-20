import { json as rawJson, fail as rawFail, cors, client, body } from "../_shared/core.ts";
Deno.serve(async (req) => {
  const json = (payload: unknown, status = 200) => rawJson(payload, status, req);
  const fail = (message: string, status = 400, details?: unknown) => rawFail(message, status, details, req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail("Method not allowed", 405);
  try {
    const b = await body(req);
    const fullName = typeof b?.full_name === "string" ? b.full_name.trim() : "";
    const att = Number(b?.attendance_number);
    const cls = typeof b?.class_name === "string" ? b.class_name.trim() : "";
    if (fullName.length < 1 || fullName.length > 40)
      return fail("Validasi gagal", 400, {
        full_name: "Nama harus 1-40 karakter",
      });
    if (!Number.isInteger(att) || att < 1 || att > 40)
      return fail("Validasi gagal", 400, {
        attendance_number: "Nomor absen tidak valid",
      });
    if (!cls)
      return fail("Validasi gagal", 400, { class_name: "Kelas wajib diisi" });

    const db = client();
    const { data: event, error: eventError } = await db
      .from("events")
      .select("id,status,allowed_classes,attendance_min,attendance_max")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (eventError) return fail("Gagal memeriksa status kompetisi", 500);
    if (!event || event.status !== "open")
      return fail("Kompetisi tidak menerima pendaftaran", 503);
    const { data: setting, error: settingError } = await db
      .from("competition_settings")
      .select("registration_open")
      .eq("event_id", event.id)
      .maybeSingle();
    if (settingError) return fail("Gagal memeriksa pengaturan kompetisi", 500);
    if (!setting || !setting.registration_open) {
      return fail("Kompetisi tidak menerima pendaftaran", 503);
    }
    if (!event.allowed_classes.includes(cls))
      return fail("Validasi gagal", 400, { class_name: "Kelas tidak valid" });
    if (att < event.attendance_min || att > event.attendance_max)
      return fail("Validasi gagal", 400, {
        attendance_number: "Nomor absen di luar rentang",
      });

    const entropy = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(entropy, (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    const tokenHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(token),
    );
    const tokenHash = Array.from(new Uint8Array(tokenHashBuffer), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");

    const displayName = `${fullName.split(/\s+/)[0]}_${String(att).padStart(2, "0")}_${cls}`;
    const { data: participant, error } = await db
      .from("participants")
      .insert({
        event_id: event.id,
        full_name: fullName,
        display_name: displayName,
        attendance_number: att,
        class_name: cls,
        entry_token_hash: tokenHash,
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "registered",
      })
      .select("id,display_name")
      .single();

    if (error) {
      if (error.code === "23505")
        return fail("Kombinasi kelas dan nomor absen sudah terdaftar", 409);
      return fail("Gagal mendaftarkan peserta", 500);
    }

    return json({
      success: true,
      participant_id: participant.id,
      token,
      display_name: participant.display_name,
    });
  } catch {
    return fail("Bad Request", 400);
  }
});
