"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUserIdForWrite } from "@/hooks/use-auth-user";
import { supabase } from "@/lib/supabaseClient";
import {
  buildSwingPhotoStoragePath,
  SWING_PHASE_LABELS,
  SWING_PHASE_NAMES,
  SWING_PHOTO_BUCKET,
  type SwingPhaseName,
  type SwingPhasePhotoRow,
} from "@/lib/swingPhasePhotos";
import { trimStringish } from "@/lib/trimStringish";

function emptyNotesRecord(): Record<SwingPhaseName, string> {
  return {
    setup: "",
    takeaway: "",
    backswing: "",
    transition: "",
    downswing: "",
    impact: "",
    follow_through: "",
  };
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const m = (error as { message?: string }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong.";
}

const LOGIN_SAVE_MSG =
  "You must be signed in to save swing phase photos. Open Log in from the menu and try again.";

export function SwingDnaPositionsSection() {
  const [actorUserId, setActorUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<SwingPhasePhotoRow[]>([]);
  const [notesDraft, setNotesDraft] = useState<Record<SwingPhaseName, string>>(emptyNotesRecord);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingPhase, setUploadingPhase] = useState<SwingPhaseName | null>(null);
  const [phaseErrors, setPhaseErrors] = useState<Partial<Record<SwingPhaseName, string>>>({});

  const rowByPhase = useMemo(() => {
    const m = new Map<SwingPhaseName, SwingPhasePhotoRow>();
    for (const r of rows) {
      if (SWING_PHASE_NAMES.includes(r.phase_name)) m.set(r.phase_name, r);
    }
    return m;
  }, [rows]);

  const loadRowsForUser = useCallback(async (uid: string) => {
    setLoadError(null);
    const { data, error } = await supabase
      .from("swing_phase_photos")
      .select("*")
      .eq("user_id", uid)
      .order("phase_name", { ascending: true });
    if (error) {
      setLoadError(error.message);
      setRows([]);
      setNotesDraft(emptyNotesRecord());
      return;
    }
    const list = (data ?? []) as SwingPhasePhotoRow[];
    setRows(list);
    const next = emptyNotesRecord();
    for (const r of list) {
      if (SWING_PHASE_NAMES.includes(r.phase_name)) {
        next[r.phase_name] = r.notes ?? "";
      }
    }
    setNotesDraft(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const uid = await getCurrentUserIdForWrite();
      if (cancelled) return;
      setActorUserId(uid);
      if (!uid) {
        setRows([]);
        setNotesDraft(emptyNotesRecord());
        setLoading(false);
        return;
      }
      await loadRowsForUser(uid);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRowsForUser]);

  async function handleFile(phase: SwingPhaseName, file: File | null) {
    if (!file) return;
    setPhaseErrors((e) => ({ ...e, [phase]: undefined }));
    const uid = await getCurrentUserIdForWrite();
    if (!uid) {
      setPhaseErrors((e) => ({ ...e, [phase]: LOGIN_SAVE_MSG }));
      return;
    }
    setActorUserId(uid);
    const path = buildSwingPhotoStoragePath(uid, phase, file);
    if (!path) {
      setPhaseErrors((e) => ({
        ...e,
        [phase]: "Use JPEG, PNG, WebP, or GIF under 8 MB.",
      }));
      return;
    }

    setUploadingPhase(phase);
    try {
      const { error: upErr } = await supabase.storage.from(SWING_PHOTO_BUCKET).upload(path, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(SWING_PHOTO_BUCKET).getPublicUrl(path);
      const imageUrl = pub.publicUrl;
      const notes = trimStringish(notesDraft[phase]) || null;

      const { error: dbErr } = await supabase.from("swing_phase_photos").upsert(
        {
          user_id: uid,
          phase_name: phase,
          image_url: imageUrl,
          notes,
        },
        { onConflict: "user_id,phase_name" },
      );
      if (dbErr) throw dbErr;

      await loadRowsForUser(uid);
    } catch (err) {
      setPhaseErrors((e) => ({ ...e, [phase]: getErrorMessage(err) }));
    } finally {
      setUploadingPhase(null);
    }
  }

  async function saveNote(phase: SwingPhaseName) {
    const row = rowByPhase.get(phase);
    if (!row) return;
    setPhaseErrors((e) => ({ ...e, [phase]: undefined }));
    const uid = await getCurrentUserIdForWrite();
    if (!uid) {
      setPhaseErrors((e) => ({ ...e, [phase]: LOGIN_SAVE_MSG }));
      return;
    }
    setActorUserId(uid);
    try {
      const { error } = await supabase
        .from("swing_phase_photos")
        .update({ notes: trimStringish(notesDraft[phase]) || null })
        .eq("id", row.id)
        .eq("user_id", uid);
      if (error) throw error;
      await loadRowsForUser(uid);
    } catch (err) {
      setPhaseErrors((e) => ({ ...e, [phase]: getErrorMessage(err) }));
    }
  }

  async function clearPhase(phase: SwingPhaseName) {
    const row = rowByPhase.get(phase);
    if (!row) return;
    setPhaseErrors((e) => ({ ...e, [phase]: undefined }));
    const uid = await getCurrentUserIdForWrite();
    if (!uid) {
      setPhaseErrors((e) => ({ ...e, [phase]: LOGIN_SAVE_MSG }));
      return;
    }
    setActorUserId(uid);
    setUploadingPhase(phase);
    try {
      const marker = `/object/public/${SWING_PHOTO_BUCKET}/`;
      const idx = row.image_url.indexOf(marker);
      const path = idx >= 0 ? row.image_url.slice(idx + marker.length) : null;
      if (path) {
        await supabase.storage.from(SWING_PHOTO_BUCKET).remove([path]);
      }
      const { error } = await supabase.from("swing_phase_photos").delete().eq("id", row.id).eq("user_id", uid);
      if (error) throw error;
      setNotesDraft((d) => ({ ...d, [phase]: "" }));
      await loadRowsForUser(uid);
    } catch (err) {
      setPhaseErrors((e) => ({ ...e, [phase]: getErrorMessage(err) }));
    } finally {
      setUploadingPhase(null);
    }
  }

  const cardClass =
    "relative flex flex-col rounded-xl border border-sky-500/20 bg-gradient-to-b from-sky-500/[0.06] via-zinc-950/50 to-zinc-950/90 p-4 shadow-[0_0_32px_-18px_rgba(56,189,248,0.2)]";

  return (
    <section className="relative mt-10 overflow-hidden rounded-2xl border border-sky-500/25 bg-gradient-to-b from-sky-500/[0.07] via-zinc-950/85 to-zinc-950 p-6 shadow-[0_0_48px_-24px_rgba(56,189,248,0.22)] sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent"
      />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-sky-500/20 pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-300/90">
              Sequence capture
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              SwingDNA positions
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-sky-100/65">
              One frame per phase — DTL or face-on. Uploads sync to your vault and feed Coach AI alongside LM data.
            </p>
          </div>
        </div>

        {loadError ? (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {loadError}
          </div>
        ) : null}

        {!loading && actorUserId == null ? (
          <div className="mb-4 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
            {LOGIN_SAVE_MSG}
          </div>
        ) : null}

        {loading ? (
          <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SWING_PHASE_NAMES.map((p) => (
              <div key={p} className="h-64 rounded-xl bg-white/[0.06]" />
            ))}
          </div>
        ) : actorUserId != null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SWING_PHASE_NAMES.map((phase) => {
              const row = rowByPhase.get(phase);
              const busy = uploadingPhase === phase;
              const err = phaseErrors[phase];
              return (
                <div key={phase} className={cardClass}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">{SWING_PHASE_LABELS[phase]}</h3>
                    {row ? (
                      <button
                        type="button"
                        onClick={() => void clearPhase(phase)}
                        disabled={busy}
                        className="shrink-0 text-[11px] font-medium text-zinc-500 underline-offset-2 hover:text-red-300 hover:underline disabled:opacity-40"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-3 aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    {row?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.image_url}
                        alt={SWING_PHASE_LABELS[phase]}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-3 text-center text-[11px] text-zinc-500">
                        No photo yet
                      </div>
                    )}
                  </div>

                  <label className="mt-3 block">
                    <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Upload
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={busy}
                      className="block w-full cursor-pointer text-xs text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-sky-500/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-sky-100 hover:file:bg-sky-500/30"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        e.target.value = "";
                        void handleFile(phase, f);
                      }}
                    />
                  </label>

                  {busy ? (
                    <p className="mt-2 text-[11px] text-sky-200/80" aria-live="polite">
                      Working…
                    </p>
                  ) : null}
                  {err ? (
                    <p className="mt-2 text-[11px] text-red-300" role="alert">
                      {err}
                    </p>
                  ) : null}

                  <label className="mt-3 block" htmlFor={`phase-note-${phase}`}>
                    <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Notes
                    </span>
                    <textarea
                      id={`phase-note-${phase}`}
                      rows={2}
                      disabled={!row || busy}
                      className="w-full resize-none rounded-lg border border-white/10 bg-zinc-900/60 px-2.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30 disabled:opacity-40"
                      placeholder={row ? "Caption for this frame…" : "Upload a photo first"}
                      value={notesDraft[phase]}
                      onChange={(e) =>
                        setNotesDraft((d) => ({
                          ...d,
                          [phase]: e.target.value,
                        }))
                      }
                    />
                  </label>
                  {row ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void saveNote(phase)}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-white disabled:opacity-40"
                    >
                      Save note
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
