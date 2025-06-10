import { withAuth } from "@/lib/api-middleware";
import { connectDB } from "@/lib/db";
import { returnError, returnSuccess } from "@/lib/response";
import Subscriber from "@/models/Subscriber";
import { NextRequest } from "next/server";



// GET - Fetch users with filtering and pagination
async function getSubScribersHandler(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    // const queryParams = Object.fromEntries(url.searchParams.entries());
    // const validatedParams = getUsersSchema.parse(queryParams);
    
 
   
    // Get total count for pagination
    const total = await Subscriber.countDocuments();
    
    // Get users
    const users = await Subscriber.find()
     
      .limit(10)
     
      .sort('-1')
   

    

    return returnSuccess({
      data: {
        subscribers:users,
        pagination: {
          page:1,
          limit:10,
          total,
      
        },
       
      },
      message: 'Users retrieved successfully'
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return returnError({
        message: 'Invalid query parameters',
        error: error.errors,
        status: 400,
      });
    }

    return returnError({
      message: 'Failed to fetch users',
      error: error.message,
      status: 500,
    });
  }
}

export const GET = withAuth(getSubScribersHandler, { roles: ['admin', 'super_admin'] });