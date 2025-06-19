// app/api/partners/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Partner from "@/models/Partner";
import { UpdatePartnerRequest, ApiResponse } from "@/types/partners";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { AppAssert } from "@/utils/appAssert";
import { returnError } from "@/lib/response";

// GET /api/partners/[id] - Get a specific partner
export async function GET(request: NextRequest) {
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
export async function PUT(request: NextRequest) {
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

    const response: ApiResponse = {
      success: true,
      data: partner,
      message: "Partner updated successfully",
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error updating partner:", error);

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
export async function DELETE(request: NextRequest) {
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

    const response: ApiResponse = {
      success: true,
      message: "Partner deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete partner",
      },
      { status: 500 }
    );
  }
}
