import { useState, useEffect, useCallback, useRef } from "react";
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

const BUCKET_NAME = "announcements";
const TABLE_NAME = "club_announcements";
const DEFAULT_IMAGE_URL = "https://stock.adobe.com/th/search?k=image";
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i;
function isImageUrl(url: string | null): boolean {
  if (!url) return false;
  return IMAGE_EXT.test(url) || !/\.[a-z0-9]+(\?|$)/i.test(url);
}

export type ClubAnnouncement = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  date: string | null;
  see_more_url: string | null;
  category: string | null;
  created_at: string | null;
  club_id: number;
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
  category: "",
  club_id: "" as string,
};

export default function ClubAnnouncementsPage() {
  const { role, clubId, isLoading: roleLoading } = useUserRole();
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubFilter, setClubFilter] = useState<string>("all");
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = role === "admin";
  const isClubAdmin = role === "club_admin";
  const canManage = isAdmin || isClubAdmin;
  const lockedClubId = isClubAdmin ? clubId : null;
  const clubAdminNoClub = isClubAdmin && clubId == null;

  const fetchAnnouncements = useCallback(async () => {
    setFetchError(null);
    setListLoading(true);
    let query = supabase
      .from(TABLE_NAME)
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (isClubAdmin && clubId != null) {
      query = query.eq("club_id", clubId);
    } else if (isAdmin && clubFilter !== "all") {
      query = query.eq("club_id", Number(clubFilter));
    }

    const { data, error } = await query;
    setListLoading(false);
    if (error) {
      setFetchError(error.message);
      setAnnouncements([]);
      return;
    }
    setAnnouncements((data as ClubAnnouncement[]) ?? []);
  }, [isAdmin, isClubAdmin, clubId, clubFilter]);

  useEffect(() => {
    if (!canManage || clubAdminNoClub) return;
    fetchAnnouncements();
  }, [canManage, clubAdminNoClub, fetchAnnouncements]);

  useEffect(() => {
    if (isAdmin) {
      supabase
        .from("clubs")
        .select("id, name, description, image_url, managed_by")
        .then(({ data }) => setClubs((data as Club[]) ?? []));
    } else if (isClubAdmin && clubId != null) {
      supabase
        .from("clubs")
        .select("id, name, description, image_url, managed_by")
        .eq("id", clubId)
        .single()
        .then(({ data }) => setClubs(data ? [data as Club] : []));
    }
  }, [isAdmin, isClubAdmin, clubId]);

  const openCreate = () => {
    setForm({
      ...defaultForm,
      date: new Date().toISOString().slice(0, 10),
      club_id: isAdmin ? (clubFilter !== "all" ? clubFilter : "") : String(lockedClubId ?? ""),
    });
    setImageFile(null);
    setImagePreviewUrl(null);
    setEditingId(null);
    setDialogOpen(true);
  };
  const canCreate = isClubAdmin ? lockedClubId != null : true;

  const openEdit = (a: ClubAnnouncement) => {
    setForm({
      title: a.title,
      subtitle: a.subtitle ?? "",
      image_url: a.image_url ?? "",
      date: a.date ? a.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      category: a.category ?? "",
      club_id: String(a.club_id),
    });
    setImageFile(null);
    setImagePreviewUrl(null);
    setEditingId(a.id);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setDialogOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setImageFile(null);
    setActionError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setImageFile(file ?? null);
    if (file) setImagePreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    const resolvedClubId = isClubAdmin ? lockedClubId : (isAdmin && form.club_id ? Number(form.club_id) : null);
    if (resolvedClubId == null && isClubAdmin) {
      setActionError("Your club is not set. Contact an administrator.");
      return;
    }
    if (resolvedClubId == null && isAdmin) {
      setActionError("Please select a club.");
      return;
    }

    setSubmitLoading(true);
    let imageUrlToSave = form.image_url.trim();

    if (imageFile) {
      const path = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, imageFile, { upsert: false });
      if (uploadError) {
        setActionError(`Upload failed (${uploadError.message}). Saving with default.`);
        imageUrlToSave = DEFAULT_IMAGE_URL;
      } else {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);
        imageUrlToSave = urlData.publicUrl;
      }
    }
    if (!imageUrlToSave) imageUrlToSave = DEFAULT_IMAGE_URL;

    const { data: { user } } = await supabase.auth.getUser();
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      image_url: imageUrlToSave,
      date: form.date || null,
      see_more_url: null,
      category: form.category.trim() || null,
      club_id: resolvedClubId,
    };
    if (!editingId) {
      payload.created_by_role = role ?? null;
      payload.created_by_user_id = user?.id ?? null;
    }

    if (editingId) {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (error) {
        setActionError(error.message || "Update failed.");
        setSubmitLoading(false);
        return;
      }
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editingId ? (data as ClubAnnouncement) : a))
      );
    } else {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([payload])
        .select()
        .single();
      if (error) {
        setActionError(error.message || "Create failed.");
        setSubmitLoading(false);
        return;
      }
      setAnnouncements((prev) => [(data as ClubAnnouncement), ...prev]);
    }
    setSubmitLoading(false);
    setActionError(null);
    closeDialog();
    fetchAnnouncements();
  };

  const handleDelete = async (id: number) => {
    setActionError(null);
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
    if (error) {
      setActionError(error.message || "Delete failed.");
    } else {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      fetchAnnouncements();
    }
    setDeleteId(null);
  };

  const clubName = (id: number) => {
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
            You don&apos;t have permission to manage club announcements.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (clubAdminNoClub) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Club announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive font-medium">
            No club assigned to your account.
          </p>
          <p className="text-muted-foreground mt-2">
            Ask an administrator to set your club in the <code className="text-sm bg-muted px-1">user_roles</code> table
            (your user must have <code className="text-sm bg-muted px-1">role = &apos;club_admin&apos;</code> and a valid <code className="text-sm bg-muted px-1">club_id</code>).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {isClubAdmin && lockedClubId != null && (
            <p className="text-sm text-muted-foreground">
              Managing club announcements for your club
            </p>
          )}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground whitespace-nowrap">Club</Label>
              <Select value={clubFilter} onValueChange={setClubFilter}>
                <SelectTrigger className="w-[200px]">
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
          )}
        </div>
        <Button
          onClick={openCreate}
          disabled={!canCreate}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New club announcement
        </Button>
      </div>

      {(fetchError || actionError) && (
        <p className="text-sm text-destructive">{fetchError || actionError}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Club announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <p className="text-muted-foreground py-8 text-center">Loading…</p>
          ) : announcements.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No club announcements yet. Create one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">File</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  {isAdmin && <TableHead>Club</TableHead>}
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {a.image_url && isImageUrl(a.image_url) ? (
                        <img
                          src={a.image_url}
                          alt=""
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : a.image_url ? (
                        <a
                          href={a.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate max-w-[80px] block"
                        >
                          File
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
                    {isAdmin && <TableCell>{clubName(a.club_id)}</TableCell>}
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
              {editingId ? "Edit club announcement" : "Create club announcement"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {actionError && (
              <p className="text-sm text-destructive">{actionError}</p>
            )}
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
            {isAdmin && (
              <div>
                <Label>Club (required)</Label>
                <Select
                  value={form.club_id || "none"}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, club_id: v === "none" ? "" : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select club" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Label>Upload file</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Choose a file from your device. It will be uploaded when you save.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose file
                  </Button>
                  {imageFile && (
                    <span className="text-xs text-muted-foreground">
                      Selected: {imageFile.name}
                    </span>
                  )}
                </div>
                <div className="rounded-md border border-border overflow-hidden bg-muted/30 w-32 h-32 flex items-center justify-center shrink-0 p-2">
                  {imagePreviewUrl && imageFile?.type.startsWith("image/") ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : imageFile ? (
                    <span className="text-xs text-muted-foreground text-center break-all">
                      File: {imageFile.name}
                    </span>
                  ) : form.image_url ? (
                    <img
                      src={form.image_url}
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  submitLoading ||
                  (isAdmin && !form.club_id) ||
                  (isClubAdmin && lockedClubId == null)
                }
              >
                {submitLoading ? "Saving…" : editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this club announcement?</AlertDialogTitle>
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
