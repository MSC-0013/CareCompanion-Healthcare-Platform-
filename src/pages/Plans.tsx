import { useState, useEffect } from 'react';
import { getCurrentUser, updateUser } from '@/lib/auth';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
}

const Plans = () => {
  const user = getCurrentUser();
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || 'free');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiService.getPlans();
        if (response.success) {
          setPlans(response.data.plans);
        } else {
          toast.error('Failed to load plans');
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = async (planId: 'free' | 'pro' | 'ultimate') => {
    if (!user) {
      toast.error('Please log in to select a plan');
      return;
    }

    if (selectedPlan === planId) {
      toast.info(`You are already on the ${planId} plan`);
      return;
    }

    setUpdating(true);
    try {
      // For free plan, we can update directly
      if (planId === 'free') {
        updateUser({ plan: planId });
        setSelectedPlan(planId);
        toast.success(`Successfully switched to Free plan!`);
      } else {
        // For paid plans, we would typically redirect to payment
        // For demo purposes, we'll simulate payment
        const response = await apiService.subscribeToPlan(
          planId,
          'credit_card',
          'demo_payment_id'
        );
        
        if (response.success) {
          updateUser({ plan: planId });
          setSelectedPlan(planId);
          toast.success(`Successfully switched to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`);
        } else {
          toast.error(response.message || 'Failed to update plan');
        }
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg">Loading plans...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground text-lg">
              Select the perfect plan to match your health goals
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.id === 'free' ? Star : plan.id === 'pro' ? Zap : Crown;
              const isCurrentPlan = selectedPlan === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all hover:shadow-xl ${
                    plan.popular ? 'border-primary shadow-lg' : ''
                  } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="min-h-[3rem]">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">/{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.limitations?.map((limitation, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-sm line-through">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? 'secondary' : 'default'}
                      disabled={isCurrentPlan || updating}
                      onClick={() => handleSelectPlan(plan.id as 'free' | 'pro' | 'ultimate')}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        'Select Plan'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle>Need Help Choosing?</CardTitle>
              <CardDescription>
                We're here to help you find the perfect plan for your health journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="font-semibold mb-1">Free</p>
                  <p className="text-sm text-muted-foreground">Best for casual health tracking</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="font-semibold mb-1">Pro</p>
                  <p className="text-sm text-muted-foreground">Ideal for active health management</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg">
                  <p className="font-semibold mb-1">Ultimate</p>
                  <p className="text-sm text-muted-foreground">Complete family health solution</p>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                All plans include secure data storage and regular feature updates
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Plans;