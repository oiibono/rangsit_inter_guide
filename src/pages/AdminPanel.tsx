import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import ClubAnnouncementsPage from "@/pages/ClubAnnouncementsPage";
import { ManageClubs } from "@/components/ManageClubs";
import { ManageInternationalPrograms } from "@/components/ManageInternationalPrograms";
import { useUserRole } from "@/hooks/useUserRole";

const AdminPanel = () => {
  const { role, isLoading } = useUserRole();
  const isAdmin = role === "admin";
  const isClubAdmin = role === "club_admin";

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
          <h1 className="text-2xl sm:text-4xl font-bold text-center">Admin Panel</h1>
          <p className="mt-4 text-center text-muted-foreground">
            {isLoading
              ? "Loading..."
              : isClubAdmin
                ? "Manage your club's announcements."
                : isAdmin
                  ? "Welcome to the admin panel. Here you can manage the content of the website."
                  : "You don't have an admin or club admin role. Contact support to get access."}
          </p>

          <div className="mt-8 sm:mt-12">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : !isAdmin && !isClubAdmin ? (
              <p className="text-center text-muted-foreground text-sm sm:text-base">No access. Ask an administrator to assign you a role in the user_roles table.</p>
            ) : isClubAdmin ? (
              <ClubAnnouncementsPage />
            ) : (
              <Tabs defaultValue="announcements">
                <TabsList className="w-full flex flex-wrap sm:inline-flex sm:flex-nowrap h-auto p-2 gap-1 overflow-x-auto">
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                  <TabsTrigger value="club_announcements">Club announcements</TabsTrigger>
                  <TabsTrigger value="clubs">Clubs</TabsTrigger>
                  <TabsTrigger value="international">International Programs</TabsTrigger>
                </TabsList>
                <TabsContent value="announcements">
                  <AnnouncementsPage />
                </TabsContent>
                <TabsContent value="club_announcements">
                  <ClubAnnouncementsPage />
                </TabsContent>
                <TabsContent value="clubs">
                  <ManageClubs />
                </TabsContent>
                <TabsContent value="international">
                  <ManageInternationalPrograms />
                </TabsContent>
              </Tabs>
            )}
          </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPanel;
