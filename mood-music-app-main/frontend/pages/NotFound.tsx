import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6 space-y-4 text-center">
        <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </Card>
    </div>
  );
} 