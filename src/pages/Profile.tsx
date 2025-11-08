import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Activity,
  Pill,
  Shield,
  Settings,
  Save,
  Edit,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProfileData {
  personalInfo: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
      email?: string;
    };
  };
  healthInfo: {
    bloodType?: string;
    height?: {
      value?: number;
      unit?: string;
    };
    weight?: {
      value?: number;
      unit?: string;
    };
    allergies?: Array<{
      allergen: string;
      severity: string;
      notes: string;
    }>;
    medications?: Array<{
      _id?: string;
      name: string;
      dosage: string;
      frequency: string;
      startDate?: string;
      endDate?: string;
      prescribedBy: string;
      notes: string;
    }>;
    medicalConditions?: Array<{
      condition: string;
      diagnosedDate?: string;
      status: string;
      notes: string;
    }>;
  };
  lifestyle: {
    activityLevel?: string;
    diet?: string;
    smoking?: {
      status: string;
      years?: number;
      cigarettesPerDay?: number;
    };
    alcohol?: {
      status: string;
      drinksPerWeek?: number;
    };
    exercise?: {
      frequency: string;
      duration?: number;
      type?: string[];
    };
  };
  bio?: string;
  completionPercentage?: number;
  isComplete?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;


const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [editingMedication, setEditingMedication] = useState<string | null>(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    notes: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ get token safely
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/profile/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });


        const data = await response.json();

        if (data.success && data.data) {
          setProfile({
            ...data.data,
            personalInfo: {
              ...data.data.personalInfo,
              dateOfBirth: data.data.personalInfo?.dateOfBirth
                ? data.data.personalInfo.dateOfBirth.split('T')[0] // ✅ format fix
                : ''
            }
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    fetchProfile();
  }, []);



  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProfile();
      if (response.success) {
        setProfile(response.data.profile);
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (section: string, data: any) => {
    try {
      setIsSaving(true);
      let response;

      switch (section) {
        case 'personal':
          response = await apiService.updatePersonalInfo(data);
          break;
        case 'health':
          response = await apiService.updateHealthInfo(data);
          break;
        case 'lifestyle':
          response = await apiService.updateLifestyle(data);
          break;
        default:
          response = await apiService.updateProfile(data);
      }

      if (response.success) {
        setProfile(prev => ({
          ...prev,
          ...response.data
        }));
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addMedication = async () => {
    try {
      setIsSaving(true);
      const response = await apiService.addMedication(newMedication);

      if (response.success) {
        setProfile(prev => ({
          ...prev,
          healthInfo: {
            ...prev?.healthInfo,
            medications: response.data.medications
          }
        }));
        setNewMedication({
          name: '',
          dosage: '',
          frequency: '',
          startDate: '',
          endDate: '',
          prescribedBy: '',
          notes: ''
        });
        toast.success('Medication added successfully');
      }
    } catch (error: any) {
      console.error('Failed to add medication:', error);
      toast.error('Failed to add medication');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMedication = async (medicationId: string) => {
    try {
      const response = await apiService.deleteMedication(medicationId);

      if (response.success) {
        setProfile(prev => ({
          ...prev,
          healthInfo: {
            ...prev?.healthInfo,
            medications: response.data.medications
          }
        }));
        toast.success('Medication deleted successfully');
      }
    } catch (error: any) {
      console.error('Failed to delete medication:', error);
      toast.error('Failed to delete medication');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-black text-white text-xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-black">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    <User className="h-3 w-3 mr-1" />
                    {user?.role}
                  </Badge>
                  {profile?.isComplete ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Incomplete
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm text-gray-500">{profile?.completionPercentage || 0}%</span>
              </div>
              <Progress value={profile?.completionPercentage || 0} className="h-2" />
            </div>
          </div>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="personal" className="data-[state=active]:bg-white">
                <User className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="health" className="data-[state=active]:bg-white">
                <Heart className="h-4 w-4 mr-2" />
                Health
              </TabsTrigger>
              <TabsTrigger value="lifestyle" className="data-[state=active]:bg-white">
                <Activity className="h-4 w-4 mr-2" />
                Lifestyle
              </TabsTrigger>
              <TabsTrigger value="medications" className="data-[state=active]:bg-white">
                <Pill className="h-4 w-4 mr-2" />
                Medications
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="mt-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile?.personalInfo?.firstName || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev?.personalInfo,
                            firstName: e.target.value
                          }
                        }))}
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile?.personalInfo?.lastName || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev?.personalInfo,
                            lastName: e.target.value
                          }
                        }))}
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profile?.personalInfo?.dateOfBirth || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev?.personalInfo,
                            dateOfBirth: e.target.value
                          }
                        }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={profile?.personalInfo?.gender || ''}
                        onValueChange={(value) => setProfile(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev?.personalInfo,
                            gender: value
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile?.personalInfo?.phone || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev?.personalInfo,
                            phone: e.target.value
                          }
                        }))}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={profile?.personalInfo?.address?.street || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev?.personalInfo,
                            address: {
                              ...prev?.personalInfo?.address,
                              street: e.target.value
                            }
                          }
                        }))}
                        placeholder="Enter street address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profile?.personalInfo?.address?.city || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev?.personalInfo,
                              address: {
                                ...prev?.personalInfo?.address,
                                city: e.target.value
                              }
                            }
                          }))}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={profile?.personalInfo?.address?.state || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev?.personalInfo,
                              address: {
                                ...prev?.personalInfo?.address,
                                state: e.target.value
                              }
                            }
                          }))}
                          placeholder="State"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-end">
                  <Button
                    onClick={() => saveProfile('personal', profile?.personalInfo)}
                    disabled={isSaving}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Health Information Tab */}
            <TabsContent value="health" className="mt-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Health Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Select
                        value={profile?.healthInfo?.bloodType || ''}
                        onValueChange={(value) => setProfile(prev => ({
                          ...prev,
                          healthInfo: {
                            ...prev?.healthInfo,
                            bloodType: value
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          type="number"
                          value={profile?.healthInfo?.height?.value || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            healthInfo: {
                              ...prev?.healthInfo,
                              height: {
                                ...prev?.healthInfo?.height,
                                value: parseFloat(e.target.value) || 0
                              }
                            }
                          }))}
                          placeholder="Height"
                        />
                      </div>
                      <div>
                        <Label htmlFor="heightUnit">Unit</Label>
                        <Select
                          value={profile?.healthInfo?.height?.unit || 'cm'}
                          onValueChange={(value) => setProfile(prev => ({
                            ...prev,
                            healthInfo: {
                              ...prev?.healthInfo,
                              height: {
                                ...prev?.healthInfo?.height,
                                unit: value
                              }
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cm">cm</SelectItem>
                            <SelectItem value="ft">ft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={profile?.healthInfo?.weight?.value || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            healthInfo: {
                              ...prev?.healthInfo,
                              weight: {
                                ...prev?.healthInfo?.weight,
                                value: parseFloat(e.target.value) || 0
                              }
                            }
                          }))}
                          placeholder="Weight"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weightUnit">Unit</Label>
                        <Select
                          value={profile?.healthInfo?.weight?.unit || 'kg'}
                          onValueChange={(value) => setProfile(prev => ({
                            ...prev,
                            healthInfo: {
                              ...prev?.healthInfo,
                              weight: {
                                ...prev?.healthInfo?.weight,
                                unit: value
                              }
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lbs">lbs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile?.bio || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          bio: e.target.value
                        }))}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-end">
                  <Button
                    onClick={() => saveProfile('health', profile?.healthInfo)}
                    disabled={isSaving}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Lifestyle Tab */}
            <TabsContent value="lifestyle" className="mt-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Lifestyle Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="activityLevel">Activity Level</Label>
                      <Select
                        value={profile?.lifestyle?.activityLevel || ''}
                        onValueChange={(value) => setProfile(prev => ({
                          ...prev,
                          lifestyle: {
                            ...prev?.lifestyle,
                            activityLevel: value
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="lightly-active">Lightly Active</SelectItem>
                          <SelectItem value="moderately-active">Moderately Active</SelectItem>
                          <SelectItem value="very-active">Very Active</SelectItem>
                          <SelectItem value="extremely-active">Extremely Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="diet">Diet Type</Label>
                      <Select
                        value={profile?.lifestyle?.diet || ''}
                        onValueChange={(value) => setProfile(prev => ({
                          ...prev,
                          lifestyle: {
                            ...prev?.lifestyle,
                            diet: value
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select diet type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="omnivore">Omnivore</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="keto">Keto</SelectItem>
                          <SelectItem value="paleo">Paleo</SelectItem>
                          <SelectItem value="mediterranean">Mediterranean</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="smoking">Smoking Status</Label>
                      <Select
                        value={profile?.lifestyle?.smoking?.status || 'never'}
                        onValueChange={(value) => setProfile(prev => ({
                          ...prev,
                          lifestyle: {
                            ...prev?.lifestyle,
                            smoking: {
                              ...prev?.lifestyle?.smoking,
                              status: value
                            }
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="former">Former</SelectItem>
                          <SelectItem value="current">Current</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="alcohol">Alcohol Consumption</Label>
                      <Select
                        value={profile?.lifestyle?.alcohol?.status || 'never'}
                        onValueChange={(value) => setProfile(prev => ({
                          ...prev,
                          lifestyle: {
                            ...prev?.lifestyle,
                            alcohol: {
                              ...prev?.lifestyle?.alcohol,
                              status: value
                            }
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="occasional">Occasional</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex justify-end">
                  <Button
                    onClick={() => saveProfile('lifestyle', profile?.lifestyle)}
                    disabled={isSaving}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="mt-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medications
                </h3>

                {/* Add New Medication */}
                <div className="mb-6 p-4 border border-gray-300 rounded-lg">
                  <h4 className="font-medium mb-4">Add New Medication</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medName">Medication Name</Label>
                      <Input
                        id="medName"
                        value={newMedication.name}
                        onChange={(e) => setNewMedication(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        placeholder="Enter medication name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medDosage">Dosage</Label>
                      <Input
                        id="medDosage"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication(prev => ({
                          ...prev,
                          dosage: e.target.value
                        }))}
                        placeholder="e.g., 10mg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medFrequency">Frequency</Label>
                      <Input
                        id="medFrequency"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication(prev => ({
                          ...prev,
                          frequency: e.target.value
                        }))}
                        placeholder="e.g., Once daily"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medPrescribedBy">Prescribed By</Label>
                      <Input
                        id="medPrescribedBy"
                        value={newMedication.prescribedBy}
                        onChange={(e) => setNewMedication(prev => ({
                          ...prev,
                          prescribedBy: e.target.value
                        }))}
                        placeholder="Doctor's name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="medNotes">Notes</Label>
                      <Textarea
                        id="medNotes"
                        value={newMedication.notes}
                        onChange={(e) => setNewMedication(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        placeholder="Additional notes..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={addMedication}
                      disabled={isSaving || !newMedication.name}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                </div>

                {/* Medications List */}
                <div className="space-y-4">
                  {profile?.healthInfo?.medications?.map((medication, index) => (
                    <div key={medication._id || index} className="p-4 border border-gray-300 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{medication.name}</h4>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Dosage:</span> {medication.dosage}
                            </div>
                            <div>
                              <span className="font-medium">Frequency:</span> {medication.frequency}
                            </div>
                            <div>
                              <span className="font-medium">Prescribed By:</span> {medication.prescribedBy}
                            </div>
                            {medication.startDate && (
                              <div>
                                <span className="font-medium">Start Date:</span> {new Date(medication.startDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {medication.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {medication.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMedication(medication._id!)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!profile?.healthInfo?.medications || profile.healthInfo.medications.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No medications added yet</p>
                      <p className="text-sm">Add your first medication above</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;