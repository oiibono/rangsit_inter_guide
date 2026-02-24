
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

export const ManageClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    const { data, error } = await supabase.from("clubs").select("*");
    if (error) console.log("Error fetching clubs:", error);
    else setClubs(data);
  };

  const handleFileChange = (file) => {
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrlToSave = imageUrl;

    if (imageFile) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images")
        .upload(`clubs/${Date.now()}_${imageFile.name}`, imageFile);

      if (uploadError) {
        console.log("Error uploading image:", uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(uploadData.path);

      imageUrlToSave = publicUrlData.publicUrl;
    }

    if (editing) {
      const { data, error } = await supabase
        .from("clubs")
        .update({ name, description, image_url: imageUrlToSave })
        .eq("id", editing)
        .select();
      if (error) console.log("Error updating club:", error);
      else setClubs(clubs.map((c) => (c.id === editing ? data[0] : c)));
    } else {
      const { data, error } = await supabase
        .from("clubs")
        .insert([{ name, description, image_url: imageUrlToSave }])
        .select();
      if (error) console.log("Error creating club:", error);
      else setClubs([...clubs, data[0]]);
    }
    setName("");
    setDescription("");
    setImageUrl("");
    setImageFile(null);
    setEditing(null);
  };

  const handleEdit = (club) => {
    setName(club.name);
    setDescription(club.description);
    setImageUrl(club.image_url);
    setEditing(club.id);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("clubs").delete().eq("id", id);
    if (error) console.log("Error deleting club:", error);
    else setClubs(clubs.filter((c) => c.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Clubs</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            type="file"
            onChange={(e) => {
              if (e.target.files) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
          <Button type="submit">{editing ? "Update" : "Create"}</Button>
        </form>
        <div className="mt-8 space-y-4">
          {clubs.map((club) => (
            <div key={club.id} className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{club.name}</h3>
                <p className="text-sm text-muted-foreground">{club.description}</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(club)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(club.id)}>
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


