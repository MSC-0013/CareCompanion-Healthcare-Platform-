import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { getReminders, type Reminder } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Calendar,
  Crown,
  Lightbulb,
  TrendingUp,
  Activity,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const healthTips = [
  'Drink 8 glasses of water daily for optimal hydration.',
  'Take a 10-minute walk after meals to aid digestion.',
  'Get 7-9 hours of sleep each night for better health.',
  'Practice deep breathing for 5 minutes to reduce stress.',
  'Eat a serving of fruits and vegetables with every meal.',
  'Stand up and stretch every hour if you sit at a desk.',
  'Limit screen time before bed for better sleep quality.',
];

const Home = () => {
  const user = getCurrentUser();
  const [nextReminder, setNextReminder] = useState<Reminder | null>(null);
  const [dailyTip] = useState(() => healthTips[Math.floor(Math.random() * healthTips.length)]);

  useEffect(() => {
    const loadReminders = async () => {
      const reminders = await getReminders();
      const upcoming = reminders
        .filter((r) => r.status === 'upcoming')
        .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

      if (upcoming.length > 0) {
        setNextReminder(upcoming[0]);
      }
    };

    loadReminders();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Welcome Section */}
          <section className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-extralight tracking-tight">
              Welcome back, <span className="font-semibold">{user?.name}</span>.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Your health companion is here to provide clarity and support on your wellness journey.
            </p>
          </section>

          {/* Quick Stats Grid */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Current Plan</CardTitle>
                <Crown className="h-5 w-5 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{user?.plan || 'Free'}</div>
                <p className="text-sm text-slate-500 mt-1">
                  <Link to="/plans" className="font-medium text-slate-900 hover:underline flex items-center gap-1">
                    Upgrade now <ChevronRight className="h-3 w-3" />
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Next Check-up</CardTitle>
                <Calendar className="h-5 w-5 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {nextReminder ? new Date(nextReminder.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {nextReminder ? nextReminder.title : 'No upcoming reminders'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">AI Assistant</CardTitle>
                <MessageSquare className="h-5 w-5 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Available</div>
                <p className="text-sm text-slate-500 mt-1">
                  <Link to="/chat" className="font-medium text-slate-900 hover:underline flex items-center gap-1">
                    Start chatting <ChevronRight className="h-3 w-3" />
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Member Since</CardTitle>
                <Activity className="h-5 w-5 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Today'}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
                    Active
                  </Badge>
                </div>

              </CardContent>
            </Card>
          </section>

          {/* Daily Tip */}
          <Card className="border-slate-200 shadow-md bg-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-light">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <Lightbulb className="h-6 w-6 text-slate-700" />
                </div>
                Daily Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-slate-700 leading-relaxed">{dailyTip}</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-light">Quick Actions</CardTitle>
              <CardDescription className="text-slate-500">Access your most-used features</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Button asChild variant="outline" className="h-auto p-6 justify-start border-slate-300 hover:bg-slate-900 hover:text-white transition-all duration-300 group">
                <Link to="/chat" className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-white">
                    <MessageSquare className="h-6 w-6 text-slate-700 group-hover:text-slate-900" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Chat with AI</div>
                    <div className="text-sm opacity-70">Get instant health advice</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-6 justify-start border-slate-300 hover:bg-slate-900 hover:text-white transition-all duration-300 group">
                <Link to="/diseases" className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-white">
                    <TrendingUp className="h-6 w-6 text-slate-700 group-hover:text-slate-900" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Explore Conditions</div>
                    <div className="text-sm opacity-70">Learn about diseases</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-6 justify-start border-slate-300 hover:bg-slate-900 hover:text-white transition-all duration-300 group">
                <Link to="/profile" className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-white">
                    <Crown className="h-6 w-6 text-slate-700 group-hover:text-slate-900" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Your Profile</div>
                    <div className="text-sm opacity-70">Manage your account</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;