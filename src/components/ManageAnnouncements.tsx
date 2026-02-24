import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

type Announcement = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  club_id: number | null;
  [key: string]: unknown;
};

type Club = { id: number; name: string | null };

interface ManageAnnouncementsProps {
  /** When set (club admin), only this club's announcements are shown and new ones get this club_id */
  clubId?: number;
}

export const ManageAnnouncements = ({ clubId }: ManageAnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string>("none");

  const fetchAnnouncements = useCallback(async () => {
    let query = supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (clubId != null) {
      query = query.eq("club_id", clubId);
    }
    const { data, error } = await query;
    if (error) console.error("Error fetching announcements:", error);
    else setAnnouncements((data as Announcement[]) ?? []);
  }, [clubId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    if (clubId === undefined) {
      supabase.from("clubs").select("id, name").then(({ data }) => setClubs(data ?? []));
    }
  }, [clubId]);

  const handleFileChange = (file: File) => {
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrlToSave = imageUrl;

    if (imageFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images")
        .upload(`announcements/${Date.now()}_${imageFile.name}`, imageFile);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(uploadData.path);

      imageUrlToSave = publicUrlData.publicUrl;
    }

    const payload = {
      title,
      subtitle,
      image_url: imageUrlToSave,
      club_id: clubId ?? (selectedClubId && selectedClubId !== "none" ? Number(selectedClubId) : null),
    };

    if (editing) {
      const { data, error } = await supabase
        .from("announcements")
        .update(payload)
        .eq("id", editing)
        .select();
      if (error) console.error("Error updating announcement:", error);
      else setAnnouncements((prev) => prev.map((a) => (a.id === editing ? (data as Announcement[])[0] : a)));
    } else {
      const { data, error } = await supabase
        .from("announcements")
        .insert([payload])
        .select();
      if (error) console.error("Error creating announcement:", error);
      else setAnnouncements((prev) => [(data as Announcement[])[0], ...prev]);
    }
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setImageFile(null);
    setEditing(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setTitle(announcement.title);
    setSubtitle(announcement.subtitle ?? "");
    setImageUrl(announcement.image_url);
    setEditing(announcement.id);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) console.error("Error deleting announcement:", error);
    else setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const isClubAdmin = clubId !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
          {!isClubAdmin && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Club (optional)</label>
              <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                <SelectTrigger>
                  <SelectValue placeholder="General announcement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General</SelectItem>
                  {clubs.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name ?? `Club ${c.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
            }}
          />
          <Button type="submit">{editing ? "Update" : "Create"}</Button>
        </form>
        <div className="mt-8 space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground">{announcement.subtitle}</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(announcement)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(announcement.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
