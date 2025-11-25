import { useState, useEffect } from "react";
import { getCurrentUser, updateUser } from "@/lib/auth";
import { apiService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Crown,
  Zap,
  Loader2,
  Shield,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ✨ PLAN INTERFACE
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
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || "free");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ✨ FETCH PLANS
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiService.getPlans();
        if (response.success) {
          setPlans(response.data.plans);
        } else {
          toast.error("Failed to load plans");
        }
      } catch (error) {
        toast.error("Error loading plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // ✨ SELECT PLAN
  const handleSelectPlan = async (
    planId: "free" | "pro" | "ultimate"
  ) => {
    if (!user) {
      toast.error("Please log in to select a plan");
      return;
    }

    if (selectedPlan === planId) {
      toast.info(`You already have the ${planId} plan`);
      return;
    }

    setUpdating(true);
    try {
      if (planId === "free") {
        updateUser({ plan: planId });
        setSelectedPlan(planId);
        toast.success("Switched to Free plan");
      } else {
        const response = await apiService.subscribeToPlan(
          planId,
          "credit_card",
          "demo-payment"
        );

        if (response.success) {
          updateUser({ plan: planId });
          setSelectedPlan(planId);
          toast.success(`Upgraded to ${planId}`);
        } else {
          toast.error(response.message || "Payment failed");
        }
      }
    } catch {
      toast.error("Failed to update plan");
    } finally {
      setUpdating(false);
    }
  };

  // ✨ LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col neon-aws-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col neon-aws-bg">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-14">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* ✨ HEADER */}
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-light text-white drop-shadow-md">
              Choose Your Plan
            </h1>
            <p className="text-white/70 text-lg">
              Transparent, simple pricing. Upgrade only when you're ready.
            </p>
          </div>

          {/* ✨ PLANS GRID */}
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon =
                plan.id === "free"
                  ? Star
                  : plan.id === "pro"
                    ? Zap
                    : Crown;

              const isCurrentPlan = selectedPlan === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`
                    relative backdrop-blur-lg bg-white/10 border-white/20 
                    rounded-2xl shadow-xl hover:shadow-2xl transition-all 
                    hover:-translate-y-1 hover:border-white/30 
                    ${plan.popular
                      ? "ring-2 ring-primary/50 shadow-primary/30"
                      : ""
                    }
                  `}
                >
                  {/* ✨ Popular badge */}
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white shadow">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="text-center space-y-3 pb-3">
                    <div className="mx-auto h-14 w-14 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-xl">
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    <CardTitle className="text-2xl text-white">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-white/60 text-sm min-h-[50px]">
                      {plan.description}
                    </CardDescription>

                    <div className="mt-2">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-white/60 ml-1">
                        /{plan.period}
                      </span>
                    </div>
                  </CardHeader>

                  {/* ✨ FEATURES */}
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-400 mt-1" />
                          <span className="text-white/90 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}

                      {plan.limitations?.map((limit, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-white/50"
                        >
                          <span className="line-through text-sm">
                            {limit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  {/* ✨ BUTTON */}
                  <CardFooter>
                    <Button
                      className="w-full text-white bg-primary/30 hover:bg-primary/50 border-white/30 backdrop-blur-xl"
                      variant={isCurrentPlan ? "secondary" : "default"}
                      disabled={isCurrentPlan || updating}
                      onClick={() =>
                        handleSelectPlan(
                          plan.id as "free" | "pro" | "ultimate"
                        )
                      }
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        "Select Plan"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* ✨ EXTRA INFORMATION */}
          <Card className="backdrop-blur-2xl bg-white/5 border-white/20 p-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Need Help Choosing?
              </CardTitle>
              <CardDescription className="text-white/70">
                Here’s a quick guide to pick what’s right for you:
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-xl text-center">
                  <p className="text-white font-semibold">Free</p>
                  <p className="text-white/70 text-sm">
                    Basic health tracking
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-xl text-center">
                  <p className="text-white font-semibold">Pro</p>
                  <p className="text-white/70 text-sm">
                    Great for daily health management
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white/10 backdrop-blur-xl text-center">
                  <p className="text-white font-semibold">Ultimate</p>
                  <p className="text-white/70 text-sm">
                    Full family or power users
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-white/70 pt-2">
                <Shield className="h-5 w-5" />
                Secure data storage & encrypted health protection included
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Plans;
