import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { businesses } from "@/lib/demo/businesses";
import { sectors } from "@/lib/demo/sectors";
import {
  saveDynamicBusiness,
  dynamicSlugExists,
} from "@/lib/demo/dynamic-businesses";
import type { BusinessData } from "@/lib/demo/types";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_SLUG = 80;

export async function POST(req: NextRequest) {
  // Auth
  const apiKey = process.env.DEMO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate required fields
  const { slug, sectorId, businessName, address, phone, email } = body as {
    slug?: string;
    sectorId?: string;
    businessName?: string;
    address?: string;
    phone?: string;
    email?: string;
  };

  const missing: string[] = [];
  if (!slug) missing.push("slug");
  if (!sectorId) missing.push("sectorId");
  if (!businessName) missing.push("businessName");
  if (!address) missing.push("address");
  if (!phone) missing.push("phone");
  if (!email) missing.push("email");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  // Validate slug format
  if (slug!.length > MAX_SLUG || !SLUG_RE.test(slug!)) {
    return NextResponse.json(
      {
        error: `Invalid slug. Must match ${SLUG_RE.source} and be ≤${MAX_SLUG} chars`,
      },
      { status: 400 },
    );
  }

  // Validate sectorId exists
  if (!sectors[sectorId!]) {
    return NextResponse.json(
      { error: `Unknown sectorId: ${sectorId}. Valid: ${Object.keys(sectors).join(", ")}` },
      { status: 400 },
    );
  }

  // Validate rating if provided
  const rating =
    typeof body.rating === "number" ? body.rating : 4.5;
  if (rating < 0 || rating > 5) {
    return NextResponse.json(
      { error: "rating must be between 0 and 5" },
      { status: 400 },
    );
  }

  // Check for slug conflicts
  if (businesses[slug!]) {
    return NextResponse.json(
      { error: "Slug already exists (static)" },
      { status: 409 },
    );
  }

  try {
    const exists = await dynamicSlugExists(slug!);
    if (exists) {
      return NextResponse.json(
        { error: "Slug already exists (dynamic)" },
        { status: 409 },
      );
    }

    // Build BusinessData
    const sector = sectors[sectorId!];
    const data: BusinessData = {
      slug: slug!,
      sectorId: sectorId!,
      businessName: businessName!,
      address: address!,
      phone: phone!,
      email: email!,
      whatsapp: (body.whatsapp as string) ?? undefined,
      rating,
      reviewCount: typeof body.reviewCount === "number" ? body.reviewCount : 0,
      hours: (body.hours as Record<string, string>) ?? sector.defaultHours,
      reviews: Array.isArray(body.reviews) ? body.reviews : [],
      heroImage: (body.heroImage as string) ?? undefined,
      mapEmbedUrl: (body.mapEmbedUrl as string) ?? undefined,
    };

    await saveDynamicBusiness(data);

    // Revalidate demo page paths
    revalidatePath(`/demo/${slug}`);
    revalidatePath(`/en/demo/${slug}`);

    return NextResponse.json({
      success: true,
      demoUrl: `https://t800labs.com/demo/${slug}`,
      slug,
    });
  } catch (err) {
    console.error("Failed to register demo business:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
