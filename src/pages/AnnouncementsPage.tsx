import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, PlusCircle } from "lucide-react";

// Create bucket "announcements" in Supabase Storage (Dashboard → Storage) if it doesn't exist
const BUCKET_NAME = "announcements";

export type Announcement = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  date: string | null;
  see_more_url: string | null;
  category: string | null;
  created_at: string | null;
  club_id: number | null;
  created_by_role: "admin" | "club_admin" | null;
  created_by_user_id: string | null;
};

export type Club = {
  id: number;
  name: string | null;
  description: string | null;
  image_url: string | null;
  managed_by: string | null;
};

const defaultForm = {
  title: "",
  subtitle: "",
  image_url: "",
  date: new Date().toISOString().slice(0, 10),
  see_more_url: "",
  category: "",
  club_id: "" as string,
};

export default function AnnouncementsPage() {
  const { role, clubId, isLoading: roleLoading } = useUserRole();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubFilter, setClubFilter] = useState<string>("all");
  const [managedByFilter, setManagedByFilter] = useState<string>("all");
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isAdmin = role === "admin";
  const isClubAdmin = role === "club_admin";
  const canManage = isAdmin || isClubAdmin;
  const lockedClubId = isClubAdmin ? clubId : null;

  const fetchAnnouncements = useCallback(async () => {
    setFetchError(null);
    let query = supabase
      .from("announcements")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (isClubAdmin && clubId != null) {
      query = query.eq("club_id", clubId);
    } else if (isAdmin && clubFilter !== "all") {
      query = query.eq("club_id", Number(clubFilter));
    }
    // Filter by created_by_role is applied in client for flexibility

    const { data, error } = await query;
    if (error) {
      setFetchError(error.message);
      setAnnouncements([]);
      return;
    }
    setAnnouncements((data as Announcement[]) ?? []);
  }, [isAdmin, isClubAdmin, clubId, clubFilter]);

  useEffect(() => {
    if (!canManage) return;
    fetchAnnouncements();
  }, [canManage, fetchAnnouncements]);

  useEffect(() => {
    if (isAdmin) {
      supabase
        .from("clubs")
        .select("id, name, description, image_url, managed_by")
        .then(({ data }) => setClubs((data as Club[]) ?? []));
    }
  }, [isAdmin]);

  const openCreate = () => {
    setForm({
      ...defaultForm,
      date: new Date().toISOString().slice(0, 10),
      club_id: isAdmin ? "" : String(lockedClubId ?? ""),
    });
    setImageFile(null);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setForm({
      title: a.title,
      subtitle: a.subtitle ?? "",
      image_url: a.image_url ?? "",
      date: a.date ? a.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      see_more_url: a.see_more_url ?? "",
      category: a.category ?? "",
      club_id: a.club_id != null ? String(a.club_id) : "",
    });
    setImageFile(null);
    setEditingId(a.id);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    let imageUrlToSave = form.image_url.trim();

    if (imageFile) {
      const path = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, imageFile, { upsert: false });

      if (uploadError) {
        setSubmitLoading(false);
        console.error("Upload error:", uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadData.path);
      imageUrlToSave = urlData.publicUrl;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      image_url: imageUrlToSave || undefined,
      date: form.date || null,
      see_more_url: form.see_more_url.trim() || null,
      category: form.category.trim() || null,
      club_id:
        isAdmin && form.club_id
          ? Number(form.club_id)
          : lockedClubId ?? null,
    };
    if (!editingId) {
      payload.created_by_role = role ?? null;
      payload.created_by_user_id = user?.id ?? null;
    }

    if (editingId) {
      const { data, error } = await supabase
        .from("announcements")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (error) {
        setSubmitLoading(false);
        return;
      }
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editingId ? (data as Announcement) : a))
      );
    } else {
      const { data, error } = await supabase
        .from("announcements")
        .insert([payload])
        .select()
        .single();
      if (error) {
        setSubmitLoading(false);
        return;
      }
      setAnnouncements((prev) => [(data as Announcement), ...prev]);
    }
    setSubmitLoading(false);
    closeDialog();
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (!error) setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setDeleteId(null);
  };

  const clubName = (id: number | null) => {
    if (id == null) return "—";
    const c = clubs.find((x) => x.id === id);
    return c?.name ?? `Club ${id}`;
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!canManage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            You don&apos;t have permission to manage announcements. Contact an administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredAnnouncements =
    managedByFilter === "all"
      ? announcements
      : announcements.filter((a) => a.created_by_role === managedByFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {isClubAdmin && lockedClubId != null && (
            <p className="text-sm text-muted-foreground">
              Managing announcements for your club
            </p>
          )}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground whitespace-nowrap">Club</Label>
                <Select value={clubFilter} onValueChange={setClubFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All clubs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clubs</SelectItem>
                    {clubs.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name ?? `Club ${c.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground whitespace-nowrap">Managed by</Label>
                <Select value={managedByFilter} onValueChange={setManagedByFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="club_admin">Club admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <Button onClick={openCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New announcement
        </Button>
      </div>

      {fetchError && (
        <p className="text-sm text-destructive">{fetchError}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAnnouncements.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No announcements yet. Create one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  {isAdmin && <TableHead>Club</TableHead>}
                  {isAdmin && <TableHead>Managed by</TableHead>}
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <img
                        src={a.image_url || ""}
                        alt=""
                        className="h-12 w-12 rounded object-cover"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{a.title}</div>
                      {a.subtitle && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {a.subtitle}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{a.category || "—"}</TableCell>
                    <TableCell>{a.date ? a.date.slice(0, 10) : "—"}</TableCell>
                    {isAdmin && (
                      <TableCell>{clubName(a.club_id)}</TableCell>
                    )}
                    {isAdmin && (
                      <TableCell>
                        {a.created_by_role === "admin"
                          ? "Admin"
                          : a.created_by_role === "club_admin"
                            ? "Club admin"
                            : "—"}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(a)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(a.id)}
                        aria-label="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit announcement" : "Create announcement"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                placeholder="Announcement title"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Short description"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Events, News"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="see_more_url">See more URL</Label>
              <Input
                id="see_more_url"
                type="url"
                value={form.see_more_url}
                onChange={(e) => setForm((f) => ({ ...f, see_more_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            {isAdmin && (
              <div>
                <Label>Club</Label>
                <Select
                  value={form.club_id || "none"}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, club_id: v === "none" ? "" : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select club (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No club (general)</SelectItem>
                    {clubs.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name ?? `Club ${c.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isClubAdmin && lockedClubId != null && (
              <div>
                <Label>Club</Label>
                <Input
                  value={clubName(lockedClubId)}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files?.[0] ?? null)
                }
              />
              {!imageFile && form.image_url && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current: {form.image_url.slice(0, 50)}…
                </p>
              )}
              {imageFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  New file: {imageFile.name}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? "Saving…" : editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId != null && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
