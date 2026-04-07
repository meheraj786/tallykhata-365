import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function More() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">আরও</h1>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">অ্যাপ সম্পর্কে</p>
            <p className="text-sm text-muted-foreground mt-2">
              খাতা — আয়-ব্যয় ট্র্যাক করার সহজ PWA অ্যাপ।<br />
              অফলাইনেও কাজ করে। ডেটা আপনার ব্রাউজারে সেভ হয়।
            </p>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            if (confirm('সব ডেটা মুছে ফেলবেন?')) {
              localStorage.removeItem('khata-storage-v1');
              window.location.reload();
            }
          }}
        >
          ডেটা রিসেট করুন (Reset)
        </Button>
      </div>
    </div>
  );
}