import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button
} from '@afc-sear/ui';
import { PlusCircle, Users, FileText, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Content
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Members', value: '1,284', icon: Users, color: 'text-blue-600' },
          { title: 'Published Items', value: '34', icon: FileText, color: 'text-green-600' },
          { title: 'Pending Reviews', value: '12', icon: CheckCircle, color: 'text-yellow-600' },
          { title: 'Active Events', value: '5', icon: FileText, color: 'text-purple-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <p className="text-sm text-gray-500 italic">Activity tracking is being initialized...</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">Update Webcast Status</Button>
            <Button variant="outline" className="w-full justify-start">Send Weekly Announcement</Button>
            <Button variant="outline" className="w-full justify-start">Download Giving Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
