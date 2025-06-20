// app/api/partners/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Partner from "@/models/Partner";
import { UpdatePartnerRequest, ApiResponse } from "@/types/partners";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { returnError } from "@/lib/response";
import { withAuth } from "@/lib/api-middleware";
import { Logger } from "@/lib/logger";

// GET /api/partners/[id] - Get a specific partner
async function getPartner(request: NextRequest) {
  const id = request.url.split("/").pop();
  if (!id) return returnError({ message: "Invalid request", status: 400 });
  const params = { id };
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid partner ID",
        },
        { status: 400 }
      );
    }

    const partner = await Partner.findById(params.id);

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found",
        },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: partner,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching partner:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch partner",
      },
      { status: 500 }
    );
  }
}

// PUT /api/partners/[id] - Update a specific partner
async function updatePartner(request: NextRequest) {
  try {
    const id = request.url.split("/").pop();
    if (!id) return returnError({ message: "Invalid request", status: 400 });
    const params = { id };
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid partner ID",
        },
        { status: 400 }
      );
    }

    // Get the original partner data for logging
    const originalPartner = await Partner.findById(params.id);
    if (!originalPartner) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found",
        },
        { status: 404 }
      );
    }

    const body: UpdatePartnerRequest = await request.json();

    const partner = await Partner.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found",
        },
        { status: 404 }
      );
    }

    // Log the update
    const performedBy = (request as any).user?.id || "unknown"; // Assuming user info is available from auth middleware
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await Logger.logPartnerUpdate(
      params.id,
      performedBy,
      originalPartner.toObject(),
      partner.toObject(),
      ip,
      userAgent
    );

    const response: ApiResponse = {
      success: true,
      data: partner,
      message: "Partner updated successfully",
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error updating partner:", error);

    // Log the failed update
    try {
      const performedBy = (request as any).user?.id || "unknown";
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || undefined;
      const id = request.url.split("/").pop();

      await Logger.log({
        action: 'update',
        entity: 'Partner',
        entityId: id || 'unknown',
        performedBy,
        metadata: {
          error: error.message
        },
        ip,
        userAgent,
        severity: 'medium',
        status: 'failed'
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update partner",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/partners/[id] - Delete a specific partner
async function deletePartner(request: NextRequest) {
  const id = request.url.split("/").pop();
  if (!id) return returnError({ message: "Invalid request", status: 400 });
  const params = { id };
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid partner ID",
        },
        { status: 400 }
      );
    }

    const partner = await Partner.findByIdAndDelete(params.id);

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found",
        },
        { status: 404 }
      );
    }

    // Log the deletion
    const performedBy = (request as any).user?.id || "unknown";
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await Logger.logPartnerDeletion(
      params.id,
      performedBy,
      partner.toObject(),
      ip,
      userAgent
    );

    const response: ApiResponse = {
      success: true,
      message: "Partner deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting partner:", error);

    // Log the failed deletion
    try {
      const performedBy = (request as any).user?.id || "unknown";
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || undefined;

      await Logger.log({
        action: 'delete',
        entity: 'Partner',
        entityId: params.id,
        performedBy,
        metadata: {
          error: (error as Error).message
        },
        ip,
        userAgent,
        severity: 'high',
        status: 'failed'
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete partner",
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getPartner, {roles:["admin", "super_admin"]})
export const PUT = withAuth(updatePartner, {roles:["admin", "super_admin"]})
export const DELETE = withAuth(deletePartner, {roles:["admin", "super_admin"]})