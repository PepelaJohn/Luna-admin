// app/api/financial-records/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
import FinancialRecord from '@/models/FinancialRecord';
import { connectDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const query = dateFilter.$gte || dateFilter.$lte ? { date: dateFilter } : {};

    // Aggregate statistics
    const [incomeStats, expenditureStats, categoryBreakdown] = await Promise.all([
      // Total income
      FinancialRecord.aggregate([
        { $match: { type: 'income', ...query } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            average: { $avg: '$amount' },
          },
        },
      ]),
      
      // Total expenditure
      FinancialRecord.aggregate([
        { $match: { type: 'expenditure', ...query } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            average: { $avg: '$amount' },
          },
        },
      ]),
      
      // Category breakdown
      FinancialRecord.aggregate([
        { $match: { type: 'expenditure', ...query } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    const income = incomeStats[0] || { total: 0, count: 0, average: 0 };
    const expenditure = expenditureStats[0] || { total: 0, count: 0, average: 0 };
    const balance = income.total - expenditure.total;

    // Get monthly trends
    const monthlyTrends = await FinancialRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalIncome: income.total,
          totalExpenditure: expenditure.total,
          balance,
          incomeCount: income.count,
          expenditureCount: expenditure.count,
          averageIncome: income.average,
          averageExpenditure: expenditure.average,
        },
        categoryBreakdown: categoryBreakdown.map(cat => ({
          category: cat._id,
          total: cat.total,
          count: cat.count,
        })),
        monthlyTrends: monthlyTrends.map(trend => ({
          year: trend._id.year,
          month: trend._id.month,
          type: trend._id.type,
          total: trend.total,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching financial statistics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}