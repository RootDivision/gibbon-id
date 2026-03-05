"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { api } from "~/trpc/react";
import React from "react";

// Parse route segments from pathname into breadcrumb items
// Returns array of { label, href } where last item has no href (current page)
function useResolvedCrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  // /research/[id]
  const researchId =
    segments[0] === "research" && segments[1] ? Number(segments[1]) : null;

  // /research/[id]/session/[sessionId]
  const sessionId =
    segments[0] === "research" &&
    segments[2] === "session" &&
    segments[3] &&
    segments[3] !== "log"
      ? Number(segments[3])
      : null;

  const { data: project } = api.research.getResearchById.useQuery(
    { researchId: researchId! },
    { enabled: researchId != null },
  );

  const { data: session } = api.session.getSessionById.useQuery(
    { sessionId: sessionId! },
    { enabled: sessionId != null },
  );

  const crumbs: { label: string; href?: string }[] = [];

  if (segments.length === 0) {
    crumbs.push({ label: "Home" });
    return crumbs;
  }

  const root = segments[0];

  // Top-level pages
  const rootLabels: Record<string, string> = {
    research: "Research",
    ape: "Apes",
    log: "Logs",
    "live-observation": "Live Observation",
    admin: "Admin",
  };

  crumbs.push({
    label: rootLabels[root ?? ""] ?? root ?? "",
    href: segments.length > 1 ? `/${root}` : undefined,
  });

  if (root === "research" && researchId != null) {
    const projectLabel = project?.title ?? `Research #${researchId}`;

    if (segments.length === 2) {
      crumbs.push({ label: projectLabel });
    } else {
      crumbs.push({
        label: projectLabel,
        href: `/research/${researchId}`,
      });

      if (segments[2] === "session") {
        if (segments[3] === "log" || segments[3] === undefined) {
          // /research/[id]/session/log
          crumbs.push({ label: "New Session" });
        } else if (sessionId != null) {
          const sessionLabel = session?.name ?? `Session #${sessionId}`;

          if (segments.length === 4) {
            crumbs.push({ label: sessionLabel });
          } else {
            crumbs.push({
              label: sessionLabel,
              href: `/research/${researchId}/session/${sessionId}`,
            });
            // deeper segments (e.g. /log)
            crumbs.push({ label: "Logs" });
          }
        }
      } else if (segments[2] === "log") {
        crumbs.push({ label: "Add Log" });
      }
    }
  } else if (root === "admin" && segments[1]) {
    const adminLabels: Record<string, string> = {
      session: "Sessions",
    };
    crumbs.push({ label: adminLabels[segments[1]] ?? segments[1] });
  }

  return crumbs;
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const crumbs = useResolvedCrumbs(pathname);

  if (crumbs.length <= 1 && !crumbs[0]?.href) {
    // Only one item with no link — no point showing breadcrumb
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {!isLast && crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
