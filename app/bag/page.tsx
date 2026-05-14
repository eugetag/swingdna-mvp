"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoginRequiredNotice } from "@/components/login-required-notice";
import { SiteNav } from "@/components/site-nav";
import { getCurrentUserIdForWrite, useAuthUser } from "@/hooks/use-auth-user";
import { buildGolfBagClubInsert, type GolfBagClubInsert } from "@/lib/golfBagClubInsert";
import {
  BAG_CUSTOM_BRAND as CUSTOM_BRAND,
  BAG_CUSTOM_LOFT as CUSTOM_LOFT,
  BAG_CUSTOM_MODEL as CUSTOM_MODEL,
  golfBagClubRowToDraft,
} from "@/lib/golfBagClubFromRow";
import type { GolfBagClubRow } from "@/lib/reportAnalytics";
import { supabase } from "@/lib/supabaseClient";
import { trimStringish } from "@/lib/trimStringish";
import {
  CATEGORY_LABELS,
  CONFIDENCE_OPTIONS,
  FLEX_OPTIONS,
  type BagClubCategory,
  GOLF_BAG_CATALOG,
  getBrands,
  getLofts,
  getModels,
  resolveBrandLabel,
  resolveModelLabel,
  SHOT_SHAPE_OPTIONS,
} from "@/lib/golf-bag-catalog";

type FlexId = (typeof FLEX_OPTIONS)[number]["id"];
type ShotShapeId = (typeof SHOT_SHAPE_OPTIONS)[number]["id"];

type DraftClub = {
  clubCategory: BagClubCategory | "";
  brandId: string;
  brandCustomDetail: string;
  customBrandModel: string;
  modelId: string;
  modelCustomDetail: string;
  loftPreset: string;
  loftCustomDetail: string;
  shaft: string;
  flex: FlexId | "";
  carryYards: string;
  totalYards: string;
  shotShape: ShotShapeId | "";
  confidence: (typeof CONFIDENCE_OPTIONS)[number] | "";
};

type BagClub = DraftClub & { id: string };

const CATEGORY_ORDER = Object.keys(GOLF_BAG_CATALOG) as BagClubCategory[];

const initialDraft: DraftClub = {
  clubCategory: "",
  brandId: "",
  brandCustomDetail: "",
  customBrandModel: "",
  modelId: "",
  modelCustomDetail: "",
  loftPreset: "",
  loftCustomDetail: "",
  shaft: "",
  flex: "",
  carryYards: "",
  totalYards: "",
  shotShape: "",
  confidence: "",
};

const shellClass =
  "pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(250,204,21,0.08),transparent_50%),radial-gradient(ellipse_50%_35%_at_0%_100%,rgba(56,189,248,0.06),transparent_45%)]";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-zinc-900/50 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/45 focus:outline-none focus:ring-1 focus:ring-emerald-500/35";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const m = (error as { message?: string }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Could not save this club. Check your connection and Supabase policies.";
}

function dashToEmpty(s: string): string {
  return s.trim() === "—" ? "" : s;
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function flexLabel(id: FlexId | ""): string {
  if (!id) return "—";
  return FLEX_OPTIONS.find((x) => x.id === id)?.label ?? id;
}

function shotLabel(id: ShotShapeId | ""): string {
  if (!id) return "—";
  return SHOT_SHAPE_OPTIONS.find((x) => x.id === id)?.label ?? id;
}

function isCustomBrandDraft(d: Pick<DraftClub, "brandId">) {
  return d.brandId === CUSTOM_BRAND;
}

function isCustomModelDraft(d: Pick<DraftClub, "modelId">) {
  return d.modelId === CUSTOM_MODEL;
}

function resolvedBrandLabel(
  c: Pick<DraftClub, "clubCategory" | "brandId" | "brandCustomDetail">,
) {
  if (!c.clubCategory || !c.brandId) return "—";
  if (isCustomBrandDraft(c)) return c.brandCustomDetail.trim() || "Custom brand";
  return resolveBrandLabel(c.clubCategory, c.brandId);
}

function resolvedModelLabel(
  c: Pick<
    DraftClub,
    | "clubCategory"
    | "brandId"
    | "modelId"
    | "modelCustomDetail"
    | "customBrandModel"
  >,
) {
  if (!c.clubCategory) return "—";
  if (isCustomBrandDraft(c)) return c.customBrandModel.trim() || "—";
  if (isCustomModelDraft(c)) return c.modelCustomDetail.trim() || "Custom model";
  return resolveModelLabel(c.clubCategory, c.brandId, c.modelId);
}

function resolvedLoftLabel(
  c: Pick<DraftClub, "brandId" | "modelId" | "loftPreset" | "loftCustomDetail">,
) {
  if (isCustomBrandDraft(c)) return c.loftCustomDetail.trim() || "—";
  if (isCustomModelDraft(c)) return c.loftCustomDetail.trim() || "—";
  if (c.loftPreset === CUSTOM_LOFT) return c.loftCustomDetail.trim() || "—";
  if (c.loftPreset.trim()) return c.loftPreset.trim();
  return c.loftCustomDetail.trim() || "—";
}

export default function BagPage() {
  const auth = useAuthUser();
  const [draft, setDraft] = useState<DraftClub>(initialDraft);
  const [clubs, setClubs] = useState<BagClub[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bagListLoading, setBagListLoading] = useState(false);
  const [bagLoadError, setBagLoadError] = useState<string | null>(null);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);

  const brands = useMemo(() => {
    if (!draft.clubCategory) return [];
    return getBrands(draft.clubCategory);
  }, [draft.clubCategory]);

  const models = useMemo(() => {
    if (!draft.clubCategory || !draft.brandId || draft.brandId === CUSTOM_BRAND)
      return [];
    return getModels(draft.clubCategory, draft.brandId);
  }, [draft.clubCategory, draft.brandId]);

  const catalogLofts = useMemo(() => {
    if (
      !draft.clubCategory ||
      !draft.brandId ||
      draft.brandId === CUSTOM_BRAND ||
      draft.modelId === CUSTOM_MODEL ||
      !draft.modelId
    )
      return [];
    return getLofts(draft.clubCategory, draft.brandId, draft.modelId);
  }, [draft.clubCategory, draft.brandId, draft.modelId]);

  const update = useCallback(<K extends keyof DraftClub>(key: K, value: DraftClub[K]) => {
    setSaveSuccess(false);
    setSaveError(null);
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (auth.status !== "signed_in") {
      setClubs([]);
      setBagListLoading(false);
      setBagLoadError(null);
      setEditingClubId(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setBagListLoading(true);
      setBagLoadError(null);
      const uid = await getCurrentUserIdForWrite();
      if (!uid || cancelled) {
        if (!cancelled) setBagListLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("golf_bag_clubs")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        setBagLoadError(error.message);
        setClubs([]);
      } else {
        const rows = (data ?? []) as GolfBagClubRow[];
        setClubs(rows.map((r) => ({ id: r.id, ...golfBagClubRowToDraft(r) })));
      }
      setBagListLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.status]);

  function cancelEditClub() {
    setEditingClubId(null);
    setDraft(initialDraft);
    setSaveError(null);
  }

  function startEditClub(c: BagClub) {
    setSaveSuccess(false);
    setSaveError(null);
    const { id, ...rest } = c;
    setDraft(rest);
    setEditingClubId(id);
  }

  function setClubCategory(next: BagClubCategory) {
    setSaveSuccess(false);
    setSaveError(null);
    setDraft((prev) => ({
      ...prev,
      clubCategory: next,
      brandId: "",
      brandCustomDetail: "",
      customBrandModel: "",
      modelId: "",
      modelCustomDetail: "",
      loftPreset: "",
      loftCustomDetail: "",
    }));
  }

  function setBrandId(next: string) {
    setSaveSuccess(false);
    setSaveError(null);
    setDraft((prev) => ({
      ...prev,
      brandId: next,
      brandCustomDetail: "",
      customBrandModel: "",
      modelId: "",
      modelCustomDetail: "",
      loftPreset: "",
      loftCustomDetail: "",
    }));
  }

  function setModelId(next: string) {
    setSaveSuccess(false);
    setSaveError(null);
    setDraft((prev) => ({
      ...prev,
      modelId: next,
      modelCustomDetail: next === CUSTOM_MODEL ? prev.modelCustomDetail : "",
      loftPreset: "",
      loftCustomDetail: "",
    }));
  }

  async function handleAddClub(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.clubCategory || draft.confidence === "") return;

    if (isCustomBrandDraft(draft)) {
      if (
        !draft.brandCustomDetail.trim().length ||
        !draft.customBrandModel.trim().length
      )
        return;
    }

    if (draft.modelId === CUSTOM_MODEL && !draft.modelCustomDetail.trim()) {
      return;
    }

    const needsCatalogLoftPreset =
      !isCustomBrandDraft(draft) &&
      !isCustomModelDraft(draft) &&
      catalogLofts.length > 0 &&
      !draft.loftPreset.trim().length;

    if (needsCatalogLoftPreset) {
      return;
    }

    setSaveError(null);
    setSaveSuccess(false);

    if (auth.status !== "signed_in") {
      setSaveError("You need to be logged in to save clubs to your bag.");
      return;
    }

    const userId = await getCurrentUserIdForWrite();
    if (!userId) {
      setSaveError("You need to be logged in to save clubs to your bag.");
      return;
    }

    setIsSaving(true);

    try {
      const loftDisplay = resolvedLoftLabel(draft);
      const shapeDisplay = shotLabel(draft.shotShape);
      const flexDisplay = flexLabel(draft.flex);

      const base = buildGolfBagClubInsert({
        clubTypeLabel: CATEGORY_LABELS[draft.clubCategory],
        brandLabel: dashToEmpty(resolvedBrandLabel(draft)),
        modelLabel: dashToEmpty(resolvedModelLabel(draft)),
        loftLabel: dashToEmpty(loftDisplay),
        shaft: draft.shaft,
        flexLabel: dashToEmpty(flexDisplay),
        carryYards: draft.carryYards,
        totalYards: draft.totalYards,
        shotShapeLabel: dashToEmpty(shapeDisplay),
        confidence: draft.confidence as number,
      });

      if (editingClubId) {
        const { error } = await supabase
          .from("golf_bag_clubs")
          .update(base)
          .eq("id", editingClubId)
          .eq("user_id", userId);
        if (error) throw error;
        setClubs((prev) =>
          prev.map((c) => (c.id === editingClubId ? { ...draft, id: editingClubId } : c)),
        );
        setEditingClubId(null);
        setDraft(initialDraft);
        setSaveSuccess(true);
        return;
      }

      const row: GolfBagClubInsert = { ...base, user_id: userId };

      const { data, error } = await supabase
        .from("golf_bag_clubs")
        .insert(row)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      const savedId = data?.id ?? newId();
      setClubs((prev) => [...prev, { ...draft, id: savedId }]);
      setDraft(initialDraft);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(getErrorMessage(err));
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteClub(id: string) {
    setSaveError(null);
    setSaveSuccess(false);
    const userId = await getCurrentUserIdForWrite();
    if (!userId) {
      setSaveError("You need to be logged in to delete clubs.");
      return;
    }
    const snapshot = clubs;
    setClubs((prev) => prev.filter((c) => c.id !== id));
    if (editingClubId === id) {
      setEditingClubId(null);
      setDraft(initialDraft);
    }
    const { error } = await supabase.from("golf_bag_clubs").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      setClubs(snapshot);
      setSaveError(getErrorMessage(error));
    }
  }

  function labelClub(c: BagClub) {
    if (!c.clubCategory) return "Club";
    const cat = CATEGORY_LABELS[c.clubCategory];
    const brand = resolvedBrandLabel(c);
    const model = resolvedModelLabel(c);
    const loft = resolvedLoftLabel(c);
    const head = [brand, model].filter(Boolean).join(" ");
    const loftShown = loft && loft !== "—";
    if (loftShown && head) return `${cat} · ${loft} — ${head}`;
    if (head) return `${cat} — ${head}`;
    return cat;
  }

  const customBrandSelected = isCustomBrandDraft(draft);
  const customModelSelected = isCustomModelDraft(draft);
  const catalogBrandSelected =
    !!draft.clubCategory && !!draft.brandId && draft.brandId !== CUSTOM_BRAND;
  const modelSelectDisabled =
    !draft.clubCategory || draft.brandId === "" || customBrandSelected;
  const hasCatalogLofts =
    catalogBrandSelected && !customModelSelected && catalogLofts.length > 0;
  const loftSelectDisabled =
    modelSelectDisabled || !draft.modelId || customModelSelected || catalogLofts.length === 0;
  const loftCustomVisible =
    customBrandSelected ||
    customModelSelected ||
    draft.loftPreset === CUSTOM_LOFT ||
    (catalogBrandSelected && !customModelSelected && catalogLofts.length === 0);

  const loftManualHint = customBrandSelected
    ? "Optional outside the SwingDNA loft matrix — stamping, irons set builds, wedges with mixed soles …"
    : customModelSelected
      ? "Optional — obscure lofts, old stamping, wedges with mixed grinds …"
      : draft.loftPreset === CUSTOM_LOFT
        ? "Describe loft, grind, shaft length notation, bounce pairings …"
        : "No presets for this pairing — dial in stamping or iron number.";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div aria-hidden className={shellClass} />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.3),rgba(9,9,11,0.95))]"
      />

      <header className="border-b border-white/5 bg-zinc-950/70 backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/90 to-emerald-700/80 text-sm font-semibold tracking-tight text-zinc-950 shadow-[0_0_24px_rgba(52,211,153,0.35)]">
              S
            </span>
            <span className="font-semibold tracking-tight text-white">
              Swing<span className="text-emerald-400/90">DNA</span>
            </span>
          </Link>
          <SiteNav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
            Bag workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your gamer set
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Log each stick with loft, shaft, distances, shot tendency, and how much you trust it under
            pressure. Add as many clubs as you carry.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {clubs.length === 0
              ? "No clubs yet — build your bag below."
              : `${clubs.length} club${clubs.length === 1 ? "" : "s"} on file`}
          </p>
        </div>

        {auth.status === "loading" ? (
          <div className="mt-10 h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" aria-busy />
        ) : auth.status === "signed_out" ? (
          <div className="mt-10 space-y-3">
            <LoginRequiredNotice />
            <p className="text-center text-xs text-zinc-500">
              After you sign in, clubs you have already saved load here automatically.
            </p>
          </div>
        ) : null}

        {auth.status === "signed_in" ? (
          <>
            {bagLoadError ? (
              <div
                className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
                role="alert"
              >
                Could not load your saved bag: {bagLoadError}
              </div>
            ) : null}

            <form
              onSubmit={handleAddClub}
              className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 sm:p-8"
            >
              <h2 className="text-lg font-semibold text-white">
                {editingClubId ? "Edit club" : "Add a club"}
              </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="club-type" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Club type
              </label>
              <select
                id="club-type"
                className={`${fieldClass} appearance-none bg-zinc-900/70 disabled:opacity-50`}
                value={draft.clubCategory}
                onChange={(e) => setClubCategory(e.target.value as BagClubCategory)}
                required
              >
                <option value="">Select …</option>
                {CATEGORY_ORDER.map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="brand" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Brand
              </label>
              <select
                id="brand"
                className={`${fieldClass} appearance-none bg-zinc-900/70 disabled:opacity-50`}
                value={draft.brandId}
                onChange={(e) => setBrandId(e.target.value)}
                disabled={!draft.clubCategory}
                required
              >
                <option value="">Select …</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
                <option value={CUSTOM_BRAND}>Other manufacturer…</option>
              </select>
              <p className="mt-1.5 text-[11px] leading-snug text-zinc-500">
                Tour Edge, Honma, Epon, Bettinardi blanks, boutique builds … pick Other and spell it out.
              </p>
            </div>

            {customBrandSelected ? (
              <>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="brand-custom" className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Manufacturer name
                  </label>
                  <input
                    id="brand-custom"
                    className={fieldClass}
                    value={draft.brandCustomDetail}
                    onChange={(e) => update("brandCustomDetail", e.target.value)}
                    placeholder="e.g., Tour Edge, Honma Golf, Vega, Orion…"
                    required
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label
                    htmlFor="custom-brand-model"
                    className="mb-1.5 block text-xs font-medium text-zinc-400"
                  >
                    Model
                  </label>
                  <input
                    id="custom-brand-model"
                    className={fieldClass}
                    value={draft.customBrandModel}
                    onChange={(e) => update("customBrandModel", e.target.value)}
                    placeholder="e.g., Exotics C722 / TR20 / Miura KM-701…"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="model" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Model
                </label>
                <select
                  id="model"
                  className={`${fieldClass} appearance-none bg-zinc-900/70 disabled:opacity-50`}
                  value={draft.modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  disabled={modelSelectDisabled}
                  required={catalogBrandSelected}
                >
                  <option value="">Select …</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                  <option value={CUSTOM_MODEL}>Other · custom model…</option>
                </select>
                <p className="mt-1.5 text-[11px] leading-snug text-zinc-500">
                  Vintage, proto, or off-menu heads from this OEM? Pick Other · custom model above.
                </p>
              </div>
            )}

            {catalogBrandSelected && customModelSelected ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <label htmlFor="model-custom" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Custom model details
                </label>
                <input
                  id="model-custom"
                  className={fieldClass}
                  value={draft.modelCustomDetail}
                  onChange={(e) => update("modelCustomDetail", e.target.value)}
                  placeholder="e.g., Titleist 975J 8.5° proto, TaylorMade R11 TP small batch…"
                  required
                />
              </div>
            ) : null}

            <div
              className={hasCatalogLofts ? "" : "sm:col-span-2 lg:col-span-3"}
            >
              {hasCatalogLofts ? (
                <label htmlFor="loft" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Loft / spec
                </label>
              ) : (
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Loft / spec</span>
              )}
              {hasCatalogLofts ? (
                <select
                  id="loft"
                  className={`${fieldClass} appearance-none bg-zinc-900/70 disabled:opacity-50`}
                  value={draft.loftPreset}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSaveSuccess(false);
                    setSaveError(null);
                    setDraft((prev) => ({
                      ...prev,
                      loftPreset: v,
                      loftCustomDetail: v === CUSTOM_LOFT ? prev.loftCustomDetail : "",
                    }));
                  }}
                  disabled={loftSelectDisabled}
                  required={hasCatalogLofts}
                >
                  <option value="">Select …</option>
                  {catalogLofts.map((loft) => (
                    <option key={loft} value={loft}>
                      {loft}
                    </option>
                  ))}
                  <option value={CUSTOM_LOFT}>Other · custom loft/spec…</option>
                </select>
              ) : (
                <p className="mb-2 text-[11px] text-zinc-500">
                  {customBrandSelected
                    ? "These manufacturers sit outside our OEM matrix — loft + spec stays free-form below."
                    : customModelSelected
                      ? "Loft is free-form for non-catalog heads from this OEM."
                      : "No catalog lofts for this combo — enter details manually."}
                </p>
              )}
            </div>

            {loftCustomVisible ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <label htmlFor="loft-custom" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Custom loft / spec{" "}
                  <span className="font-normal text-zinc-500">(optional unless “Other loft” chosen)</span>
                </label>
                <textarea
                  id="loft-custom"
                  rows={2}
                  className={`${fieldClass} resize-y`}
                  value={draft.loftCustomDetail}
                  onChange={(e) => update("loftCustomDetail", e.target.value)}
                  placeholder="e.g., 62° wedge with 10° bounce, 4-iron weakened to 21°, 35&quot; plumber neck…"
                />
                <p className="mt-1 text-[11px] text-zinc-500">{loftManualHint}</p>
              </div>
            ) : null}

            <div className="sm:col-span-2 lg:col-span-3">
              <label htmlFor="shaft" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Shaft
              </label>
              <input
                id="shaft"
                className={fieldClass}
                value={draft.shaft}
                onChange={(e) => update("shaft", e.target.value)}
                placeholder="e.g., MCA Tensei 1K Black 65 TX"
              />
            </div>
            <div>
              <label htmlFor="flex" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Flex
              </label>
              <select
                id="flex"
                className={`${fieldClass} appearance-none bg-zinc-900/70`}
                value={draft.flex}
                onChange={(e) => update("flex", e.target.value as FlexId | "")}
                required
              >
                <option value="">Select …</option>
                {FLEX_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="carry" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Carry distance (yards)
              </label>
              <input
                id="carry"
                type="number"
                min={0}
                step={1}
                className={fieldClass}
                value={draft.carryYards}
                onChange={(e) => update("carryYards", e.target.value)}
                placeholder="260"
              />
            </div>
            <div>
              <label htmlFor="total" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Total distance (yards)
              </label>
              <input
                id="total"
                type="number"
                min={0}
                step={1}
                className={fieldClass}
                value={draft.totalYards}
                onChange={(e) => update("totalYards", e.target.value)}
                placeholder="280"
              />
            </div>
            <div>
              <label
                htmlFor="shot-shape"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Shot shape tendency
              </label>
              <select
                id="shot-shape"
                className={`${fieldClass} appearance-none bg-zinc-900/70`}
                value={draft.shotShape}
                onChange={(e) => update("shotShape", e.target.value as ShotShapeId | "")}
                required
              >
                <option value="">Select …</option>
                {SHOT_SHAPE_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="confidence" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Confidence rating
              </label>
              <select
                id="confidence"
                className={`${fieldClass} appearance-none bg-zinc-900/70`}
                value={draft.confidence === "" ? "" : String(draft.confidence)}
                onChange={(e) =>
                  update(
                    "confidence",
                    e.target.value === "" ? "" : (Number(e.target.value) as DraftClub["confidence"]),
                  )
                }
                required
              >
                <option value="">Select …</option>
                {CONFIDENCE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {saveError ? (
            <div
              className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100"
              role="alert"
            >
              {saveError}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSaving || bagListLoading}
              className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-10 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_36px_rgba(16,185,129,0.28)] transition enabled:hover:from-emerald-400 enabled:hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving…" : editingClubId ? "Save changes" : "Add club to bag"}
            </button>
            {editingClubId ? (
              <button
                type="button"
                onClick={cancelEditClub}
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        {saveSuccess ? (
          <div
            className="mt-6 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
            role="status"
            aria-live="polite"
          >
            Saved to your bag in Supabase.
          </div>
        ) : null}

        <section className="mt-14" aria-label="Saved clubs">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
            <h2 className="text-xl font-semibold tracking-tight text-white">Bag slots</h2>
            <p className="text-sm text-zinc-500">
              {bagListLoading ? "Loading…" : `${clubs.length} total`}
            </p>
          </div>

          {bagListLoading ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]"
                  aria-hidden
                />
              ))}
            </div>
          ) : clubs.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-zinc-900/20 px-6 py-16 text-center">
              <p className="text-sm text-zinc-400">
                Your bag is empty. Add your driver, woods, irons, wedges, and putter to unlock gapping context.
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {clubs.map((c) => (
                <li
                  key={c.id}
                  className="group relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-zinc-950/40 p-6 transition hover:border-emerald-500/25"
                >
                  <div className="mb-4 h-px w-10 bg-gradient-to-r from-emerald-400/80 to-transparent transition group-hover:w-14" />
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-snug text-white">{labelClub(c)}</h3>
                    <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => startEditClub(c)}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-emerald-500/40 hover:text-emerald-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteClub(c.id)}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:border-red-500/40 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-zinc-500">Loft / spec</dt>
                      <dd className="max-w-[55%] whitespace-pre-wrap text-right text-zinc-200">
                        {resolvedLoftLabel(c)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-zinc-500">Shaft</dt>
                      <dd className="max-w-[60%] text-right text-zinc-200">
                        {trimStringish(c.shaft) || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-zinc-500">Flex</dt>
                      <dd className="text-right text-zinc-200">{flexLabel(c.flex)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-zinc-500">Carry / total</dt>
                      <dd className="text-right tabular-nums text-zinc-200">
                        {c.carryYards !== "" ? c.carryYards : "—"} yd
                        <span className="text-zinc-600"> · </span>
                        {c.totalYards !== "" ? c.totalYards : "—"} yd
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
                      <dt className="text-zinc-500">Shape</dt>
                      <dd className="text-right text-zinc-200">{shotLabel(c.shotShape)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-zinc-500">Confidence</dt>
                      <dd>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs tabular-nums text-emerald-200">
                          {c.confidence === "" ? "—" : c.confidence}
                          {c.confidence !== "" ? (
                            <span className="text-emerald-500/80">/10</span>
                          ) : null}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </section>
          </>
        ) : null}

      </main>
    </div>
  );
}
