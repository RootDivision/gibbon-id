"use client";

import { Github, Mail, User } from "lucide-react";
import { authClient } from "lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="container mx-auto max-w-lg py-12">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-lg py-12">
        <Card>
          <CardHeader>
            <CardTitle>Not signed in</CardTitle>
            <CardDescription>
              Sign in with GitHub to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "github",
                  callbackURL: "/profile",
                })
              }
            >
              <Github className="mr-2 h-4 w-4" />
              Sign in with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="container mx-auto max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Your session information from GitHub OAuth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? "User"}
              />
              <AvatarFallback>
                {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="text-muted-foreground h-4 w-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  User ID
                </p>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Email
                </p>
                <p className="text-sm">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Github className="text-muted-foreground h-4 w-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  Provider
                </p>
                <p className="text-sm">GitHub</p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/";
                  },
                },
              })
            }
          >
            <Github className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
