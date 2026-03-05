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
    api.research.getResearches(),
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

      <h2 className="mt-6 text-xl font-semibold">Research Projects</h2>

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
