"use client"
import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar,
  TrendingUp,
  Filter,
  Plus,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { tasksApi, ITaskStats, ITask,  mockTasksResponse } from '@/lib/tasksApi';
import Link from 'next/link';

// Quick Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; isPositive: boolean };
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{trend.value}% vs last week</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// Recent Tasks Component
const RecentTasks = ({ tasks }: { tasks: ITask[] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
        View all
      </button>
    </div>
    <div className="space-y-4">
      {tasks.slice(0, 5)?.map((task, index) => (
        <motion.div
          key={task._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
            <p className="text-sm text-gray-600 mt-1">
              Assigned to: {task.assignedTo.name}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <PriorityBadge priority={task.priority} />
            {task.isOverdue && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// Upcoming Deadlines Component
const UpcomingDeadlines = ({ tasks }: { tasks: ITaskStats['upcomingTasks'] }) => {
  console.log(tasks)
  return (
    <div className="bg-white h-full rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
      <Calendar className="w-5 h-5 text-gray-400" />
    </div>
    <div className="space-y-3">
      {tasks?.map((task, index) => (
        <motion.div
          key={task._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
        >
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
            <p className="text-xs text-gray-600 mt-1">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          </div>
          <PriorityBadge priority={task.priority} />
        </motion.div>
      ))}
    </div>
  </div>
  )
};

// Category Distribution Chart (Simple)
const CategoryChart = ({ data }: { data: ITaskStats['byCategory'] }) => {
 
  const total = Object.values(data).reduce((sum, data) => sum + data.count, 0);
  
  return (
    <div className="bg-white rounded-xl h-full shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Category</h3>
      <div className="space-y-3">
        {data?.map(({ count, _id:category}, index) => {
         
          const percentage = (count / total) * 100;
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 capitalize">
                  {category.replace('_', ' ')}
                </span>
                <span className="font-medium">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="bg-blue-600 h-2 rounded-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Main Dashboard Component
const TasksDashboard = () => {
  const [stats, setStats] = useState<ITaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In development, use mock data
        // Production API calls
          const [statsResponse, tasksResponse] = await Promise.all([
            tasksApi.getTaskStats(),
            tasksApi.getTasks({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
          ]);

          console.log(statsResponse, tasksResponse)
          

          if((statsResponse).success && statsResponse.stats){

            setStats((statsResponse).stats);
          } else{

          }

          if(tasksResponse.success && tasksResponse.data){

            setRecentTasks(tasksResponse.data.tasks);
          }
          
      } catch (err) {
        // setStats(mockTaskStats);
          setRecentTasks(mockTasksResponse.tasks);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4]?.map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return <div className='p-8'>Nothing to show here</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's an overview of your tasks.
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <Link href={'/dashboard/tasks/new'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Task
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Total Tasks"
            value={stats.overall.total}
            icon={CheckCircle}
            color="bg-blue-600"
            
          />
          <StatsCard
            title="In Progress"
            value={stats.overall.inProgress}
            icon={Clock}
            color="bg-orange-600"
          />
          <StatsCard
            title="Completed"
            value={stats.overall.completed}
            icon={CheckCircle}
            color="bg-green-600"
          />
          <StatsCard
            title="Overdue"
            value={stats.overall.overdue}
            icon={AlertTriangle}
            color="bg-red-600"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Tasks - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <RecentTasks tasks={recentTasks} />
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className='h-full '
          >
            <UpcomingDeadlines tasks={stats.upcomingTasks} />
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CategoryChart data={stats.byCategory} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href={'/dashboard/tasks/new'} className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Create New Task</span>
              </Link>
              <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Search className="w-5 h-5 text-green-600" />
                <span className="font-medium">Search Tasks</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Manage Assignments</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="font-medium">View Calendar</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TasksDashboard;