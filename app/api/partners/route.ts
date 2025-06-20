// app/api/partners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Partner from '@/models/Partner';
import { CreatePartnerRequest, PartnerFilters, ApiResponse } from '@/types/partners';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';
import { Logger } from '@/lib/logger';

// GET /api/partners - Get all partners with optional filtering
async function getPartnersHandler(request:NextRequest){
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const filters: PartnerFilters = {};

    // Build filters from query parameters
    if (searchParams.get('status')) filters.status = searchParams.get('status')!;
    if (searchParams.get('priority')) filters.priority = searchParams.get('priority')!;
    if (searchParams.get('region')) filters.region = searchParams.get('region')!;
    if (searchParams.get('industry')) filters.industry = searchParams.get('industry')!;
    if (searchParams.get('interest')) filters.interest = searchParams.get('interest')!;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Sort
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const partners = await Partner.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Partner.countDocuments(filters);

    const response: ApiResponse = {
      success: true,
      data: {
        partners,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch partners' 
      },
      { status: 500 }
    );
  }
}

// POST /api/partners - Create a new partner
async function createPartnersHandler(request:NextRequest) {
   try {
    await connectDB();

    const body: CreatePartnerRequest = await request.json();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'jobTitle', 'companyName', 'region', 'interest'];
    for (const field of requiredFields) {
      if (!body[field as keyof CreatePartnerRequest]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `${field} is required` 
          },
          { status: 400 }
        );
      }
    }

    // Check if partner with this email already exists
    const existingPartner = await Partner.findOne({ email: body.email });
    if (existingPartner) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A partner with this email already exists' 
        },
        { status: 409 }
      );
    }
    const performedBy = (request as any).user?.id || "unknown";
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    const partner = new Partner(body);
    await partner.save();
    await Logger.logPartnerCreation(
      partner._id.toString(),
      performedBy,
      partner.toObject(),
      ip,
      userAgent
    );

    const response: ApiResponse = {
      success: true,
      data: partner,
      message: "Partner created successfully",
    };

    return NextResponse.json(response, { status: 201 });
    

   
  } catch (error:any) {
    console.error('Error creating partner:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create partner' 
      },
      { status: 500 }
    );
  }
}





export const GET = withAuth(getPartnersHandler, {roles:['admin', 'super_admin']})
export const POST = withAuth(createPartnersHandler, {roles:['admin', 'super_admin']})

