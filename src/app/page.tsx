import {
  Folder,
  ScrollText,
  FlaskConical,
  Clapperboard,
  PawPrint,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const [stats, researchProjects] = await Promise.all([
    api.research.getDashboardStats(),
    api.research.getResearches({ sortField: "createdAt", sortDir: "desc" }),
  ]);

  const metrics = [
    { label: "Apes observed", value: stats.apes, icon: PawPrint, href: "/ape" },
    {
      label: "Research projects",
      value: stats.projects,
      icon: FlaskConical,
      href: "/research",
    },
    {
      label: "Sessions",
      value: stats.sessions,
      icon: Clapperboard,
      href: "/admin/session",
    },
    { label: "Logs", value: stats.logs, icon: ScrollText, href: "/log" },
  ];

  return (
    <HydrateClient>
      <h1>Dashboard</h1>

      <div className="mb-6 space-y-2 text-sm text-muted-foreground">
        <p>Welcome to Gibbon ID, your central hub for gibbon behavioural research 🐒</p>
        <br />
        <p>Here is what you can do:</p>
        <ul className="space-y-1">
          <li>🌱 <strong>Track Your Research Projects:</strong> Maintain an organized, centralized overview of all your study groups and long-term data.</li>
          <li>⏱️ <strong>Live Observation Logging:</strong> Use the built-in timer to log primary and secondary behaviours in real-time as you observe one or multiple apes.</li>
          <li>🔍 <strong>Analyze &amp; Review:</strong> Easily sort, filter, and review historical logs.</li>
        </ul>
        <br />
        <p>Ready to start? Head over to the sidebar to view your active projects or start a new live observation!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-medium">
                  {label}
                </CardDescription>
                <Icon className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-6 text-xl font-semibold">My Research Projects</h2>

      <div className="grid gap-4 lg:grid-cols-3">
        {researchProjects.map((research) => (
          <Link key={research.id} href={`/research/${research.id}`}>
            <Card className="hover:bg-accent/50 transition-colors">
              <div className="flex grow items-center px-4">
                <Folder />
                <div className="grow">
                  <CardHeader>
                    <CardTitle>{research.title}</CardTitle>
                    <CardDescription>
                      {research.createdAt.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </HydrateClient>
  );
}
