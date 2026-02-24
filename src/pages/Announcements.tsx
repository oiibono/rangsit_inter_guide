import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x240?text=Announcement";

type Announcement = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  date: string | null;
  see_more_url: string | null;
  category: string | null;
  club_id: number | null;
};

type ClubAnnouncementRow = Announcement & {
  club_id: number;
  clubs?: { name: string | null } | null;
};

const Announcements = () => {
  const [generalAnnouncements, setGeneralAnnouncements] = useState<Announcement[]>([]);
  const [clubAnnouncements, setClubAnnouncements] = useState<ClubAnnouncementRow[]>([]);
  const [clubsMap, setClubsMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const [
        { data: generalData, error: generalError },
        { data: clubData, error: clubError },
        { data: clubsData },
      ] = await Promise.all([
        supabase
          .from("announcements")
          .select("*")
          .is("club_id", null)
          .order("date", { ascending: false }),
        supabase
          .from("club_announcements")
          .select("*, clubs(name)")
          .order("date", { ascending: false }),
        supabase.from("clubs").select("id, name"),
      ]);

      if (generalError) console.error("Error fetching announcements:", generalError);
      else setGeneralAnnouncements((generalData as Announcement[]) ?? []);

      if (clubError) console.error("Error fetching club_announcements:", clubError);
      else setClubAnnouncements((clubData as ClubAnnouncementRow[]) ?? []);

      const map: Record<number, string> = {};
      (clubsData ?? []).forEach((c: { id: number; name: string | null }) => {
        map[c.id] = c.name ?? `Club ${c.id}`;
      });
      setClubsMap(map);
    };
    fetchData();
  }, []);

  const general = generalAnnouncements;

  const renderCard = (announcement: Announcement | ClubAnnouncementRow, showClubName?: boolean) => {
    const clubName = showClubName && "club_id" in announcement && announcement.club_id
      ? (announcement.clubs as { name: string | null } | null)?.name ?? clubsMap[announcement.club_id] ?? `Club ${announcement.club_id}`
      : null;
    const imageUrl = announcement.image_url?.trim() || PLACEHOLDER_IMAGE;
    return (
      <Card
        key={announcement.id}
        className="p-6 border-2 hover:border-primary transition-all duration-300 hover:shadow-card bg-card group cursor-pointer"
      >
        <img
          src={imageUrl}
          alt={announcement.title}
          className="w-full h-48 object-cover mb-4 rounded"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== PLACEHOLDER_IMAGE) {
              target.src = PLACEHOLDER_IMAGE;
            }
          }}
        />
        {clubName && (
          <p className="text-xs font-medium text-primary mb-2">{clubName}</p>
        )}
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {announcement.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {announcement.subtitle}
        </p>
        {announcement.see_more_url && (
          <a
            href={announcement.see_more_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            See more
          </a>
        )}
      </Card>
    );
  };

  return (
    <>
      <main className="pt-20 lg:pt-0 lg:mr-[80px]">
        <section id="announcements" className="pb-20 lg:pt-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Announcements
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stay informed with the latest news and updates from Rangsit University
              </p>
            </div>

            <Tabs defaultValue="general" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="general">Announcements</TabsTrigger>
                <TabsTrigger value="clubs">Club announcements</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {general.length === 0 ? (
                    <p className="col-span-2 text-center text-muted-foreground py-12">
                      No general announcements at the moment.
                    </p>
                  ) : (
                    general.map((a) => renderCard(a))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="clubs" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {clubAnnouncements.length === 0 ? (
                    <p className="col-span-2 text-center text-muted-foreground py-12">
                      No club announcements at the moment.
                    </p>
                  ) : (
                    clubAnnouncements.map((a) => renderCard(a, true))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Announcements;
