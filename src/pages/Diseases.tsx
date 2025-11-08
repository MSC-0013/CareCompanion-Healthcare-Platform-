import { useState } from 'react';
import { diseases, type Disease } from '@/lib/diseases';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Diseases = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  const filteredDiseases = diseases.filter(
    (disease) =>
      disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.overview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Disease Explorer</h1>
            <p className="text-muted-foreground text-lg">
              Learn about common health conditions, symptoms, and treatments
            </p>
          </div>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search diseases, symptoms, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDiseases.map((disease) => (
              <Card
                key={disease.id}
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedDisease(disease)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{disease.name}</CardTitle>
                    <Badge variant="secondary">{disease.category}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{disease.overview}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDiseases.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No diseases found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedDisease} onOpenChange={() => setSelectedDisease(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedDisease && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-2xl">{selectedDisease.name}</DialogTitle>
                  <Badge variant="secondary">{selectedDisease.category}</Badge>
                </div>
                <DialogDescription>{selectedDisease.overview}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Symptoms</h3>
                  <ul className="space-y-1">
                    {selectedDisease.symptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Common Causes</h3>
                  <ul className="space-y-1">
                    {selectedDisease.causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Treatment Options</h3>
                  <ul className="space-y-1">
                    {selectedDisease.treatments.map((treatment, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{treatment}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Disclaimer:</strong> This information is for educational purposes only and
                    should not replace professional medical advice. Always consult with a healthcare
                    provider for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Diseases;
