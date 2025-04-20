import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function Index() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dominantEmotion, setDominantEmotion] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select an image first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');
      
      const data = await res.json();
      setDominantEmotion(data.dominant_emotion);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze image',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!dominantEmotion) {
      toast({
        title: 'Error',
        description: 'Please analyze an image first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_description: dominantEmotion }),
      });

      if (!res.ok) throw new Error('Recommendation failed');
      
      const data = await res.json();
      setRecommendations(data.suggested_songs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center mb-6">Mood Music Recommender</h1>
        
        <div className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          
          <Button 
            onClick={analyzeImage} 
            disabled={!selectedFile || isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Analyze Image'}
          </Button>

          {dominantEmotion && (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Detected Emotion</h3>
                <p className="text-lg">{dominantEmotion}</p>
              </Card>

              <Button 
                onClick={fetchRecommendations} 
                disabled={isLoading}
                className="w-full"
              >
                Get Music Recommendations
              </Button>
            </div>
          )}

          {recommendations && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Recommended Songs</h3>
              <pre className="whitespace-pre-wrap">{recommendations}</pre>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
} 