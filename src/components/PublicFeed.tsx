import { Card } from '@/components/ui/card';

export function PublicFeed() {
  // Mock data for demonstration
  const publicMoments = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg',
      note: 'First day at my dream job!',
      date: new Date(2024, 2, 15),
      author: 'Alice Chen',
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg',
      note: 'Exploring the city streets',
      date: new Date(2024, 2, 14),
      author: 'John Smith',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {publicMoments.map(moment => (
        <Card key={moment.id} className="overflow-hidden bg-card/50 border-border/10">
          <img src={moment.image} alt={moment.note} className="w-full h-64 object-cover" />
          <div className="p-6">
            <p className="text-base mb-4">{moment.note}</p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{moment.author}</span>
              <time>{moment.date.toLocaleDateString()}</time>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
