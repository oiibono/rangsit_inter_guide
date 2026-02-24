import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageAnnouncements } from "@/components/ManageAnnouncements";
import { ManageClubs } from "@/components/ManageClubs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useUserRole } from "@/hooks/useUserRole";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { role, clubId, isLoading } = useUserRole();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  const isAdmin = role === "admin";
  const isClubAdmin = role === "club_admin";

  return (
    <>
      <div className="container mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-center">Admin Panel</h1>
          <p className="mt-4 text-center text-muted-foreground">
            {isLoading
              ? "Loading..."
              : isClubAdmin
                ? "Manage your club's announcements."
                : isAdmin
                  ? "Welcome to the admin panel. Here you can manage the content of the website."
                  : "You don't have an admin or club admin role. Contact support to get access."}
          </p>

          <div className="mt-12">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : !isAdmin && !isClubAdmin ? (
              <p className="text-center text-muted-foreground">No access. Ask an administrator to assign you a role in the user_roles table.</p>
            ) : (
              <Tabs defaultValue="announcements">
                <TabsList>
                  <TabsTrigger value="announcements">Manage Announcements</TabsTrigger>
                  {isAdmin && (
                    <TabsTrigger value="clubs">Manage Clubs</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="announcements">
                  <ManageAnnouncements clubId={isClubAdmin ? clubId ?? undefined : undefined} />
                </TabsContent>
                {isAdmin && (
                  <TabsContent value="clubs">
                    <ManageClubs />
                  </TabsContent>
                )}
              </Tabs>
            )}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="outline" size="lg" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPanel;
