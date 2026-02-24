import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Pencil, Trash2, PlusCircle } from "lucide-react";

const BUCKET_NAME = "images";
const UPLOAD_PATH_PREFIX = "international_programs/";

export type InternationalProgram = {
  id: number;
  created_at: string | null;
  image_url: string | null;
  name_line1: string | null;
  name_line2: string | null;
};

export function ManageInternationalPrograms() {
  const [programs, setPrograms] = useState<InternationalProgram[]>([]);
  const [nameLine1, setNameLine1] = useState("");
  const [nameLine2, setNameLine2] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    const { data, err } = await supabase
      .from("international_programs")
      .select("*")
      .order("id", { ascending: true });
    if (err) {
      setError(err.message);
      setPrograms([]);
      return;
    }
    setError(null);
    setPrograms((data as InternationalProgram[]) ?? []);
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const openCreate = () => {
    setNameLine1("");
    setNameLine2("");
    setImageUrl("");
    setImageFile(null);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (p: InternationalProgram) => {
    setNameLine1(p.name_line1 ?? "");
    setNameLine2(p.name_line2 ?? "");
    setImageUrl(p.image_url ?? "");
    setImageFile(null);
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setNameLine1("");
    setNameLine2("");
    setImageUrl("");
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    let imageUrlToSave = imageUrl.trim();

    if (imageFile) {
      const path = `${UPLOAD_PATH_PREFIX}${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, imageFile, { upsert: false });
      if (uploadError) {
        setError(uploadError.message);
        setSubmitLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadData.path);
      imageUrlToSave = urlData.publicUrl;
    }

    const payload = {
      name_line1: nameLine1.trim() || null,
      name_line2: nameLine2.trim() || null,
      image_url: imageUrlToSave || null,
    };

    if (editingId) {
      const { data, err } = await supabase
        .from("international_programs")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (err) {
        setError(err.message);
        setSubmitLoading(false);
        return;
      }
      setPrograms((prev) =>
        prev.map((item) => (item.id === editingId ? (data as InternationalProgram) : item))
      );
    } else {
      const { data, err } = await supabase
        .from("international_programs")
        .insert([payload])
        .select()
        .single();
      if (err) {
        setError(err.message);
        setSubmitLoading(false);
        return;
      }
      setPrograms((prev) => [...prev, data as InternationalProgram]);
    }
    setSubmitLoading(false);
    closeDialog();
  };

  const handleDelete = async (id: number) => {
    const { error: err } = await supabase
      .from("international_programs")
      .delete()
      .eq("id", id);
    if (!err) setPrograms((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add program
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>International Programs</CardTitle>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No programs yet. Add one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name line 1</TableHead>
                  <TableHead>Name line 2</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <img
                        src={p.image_url || ""}
                        alt=""
                        className="h-12 w-12 rounded object-cover"
                      />
                    </TableCell>
                    <TableCell>{p.name_line1 ?? "—"}</TableCell>
                    <TableCell>{p.name_line2 ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(p.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit program" : "Add program"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name_line1">Name line 1</Label>
              <Input
                id="name_line1"
                value={nameLine1}
                onChange={(e) => setNameLine1(e.target.value)}
                placeholder="e.g. Bachelor of Science"
              />
            </div>
            <div>
              <Label htmlFor="name_line2">Name line 2</Label>
              <Input
                id="name_line2"
                value={nameLine2}
                onChange={(e) => setNameLine2(e.target.value)}
                placeholder="e.g. Computer Science"
              />
            </div>
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              {!imageFile && imageUrl && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Current: {imageUrl}
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
                {submitLoading ? "Saving…" : editingId ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this program?</AlertDialogTitle>
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
