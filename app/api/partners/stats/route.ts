// app/api/partners/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Partner from '@/models/Partner';
import { ApiResponse } from '@/types/partners';
import { connectDB } from '@/lib/db';
import { returnError, returnSuccess } from '@/lib/response';
import { withAuth } from '@/lib/api-middleware';

// GET /api/partners/stats - Get partner statistics
async function getStats(request:NextRequest) {
  try {
    await connectDB();

    const [
      totalPartners,
      statusStats,
      priorityStats,
      regionStats,
      industryStats,
      recentPartners,
      approvedPartners,
      pendingPartners,
    ] = await Promise.all([
      Partner.countDocuments(),
      Partner.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Partner.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Partner.aggregate([
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Partner.aggregate([
        { $match: { industry: { $ne: null } } },
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Partner.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email companyName industry status createdAt'),
      Partner.countDocuments({status:'approved'}),
      Partner.countDocuments({status:"pending"})
    ]);

   
    return returnSuccess({data:{stats:{
        totalPartners,
        statusStats,
        priorityStats,
        regionStats,
        industryStats,
        recentPartners,
         approvedPartners,
      pendingPartners,
      }}, status:201})
  } catch (error:any) {
    console.log('Error fetching partner stats:', error);
    return returnError({message:error.message ||'Failed to fetch partner statistics', error:error, status:500  })
   
  }
}

export const GET = withAuth(getStats, {roles:["admin", "super_admin"]})




