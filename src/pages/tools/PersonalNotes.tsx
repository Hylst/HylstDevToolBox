import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickyNote, Plus, Search, Pin, Trash2, Edit, Download, Upload, Tag, Star, Eye, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { marked } from "marked";

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  async: false,
});

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  pinned: boolean;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

const templates = [
  { name: "Note vide", title: "", content: "", tags: [], category: "Général" },
  { name: "TODO List", title: "À faire", content: "## Tâches\n\n- [ ] Tâche 1\n- [ ] Tâche 2\n- [ ] Tâche 3\n\n## Priorités\n\n1. Haute\n2. Moyenne\n3. Basse", tags: ["todo"], category: "Tâches" },
  { name: "Bug Report", title: "Bug: ", content: "## Description\n\n\n## Étapes pour reproduire\n\n1. \n2. \n3. \n\n## Comportement attendu\n\n\n## Comportement actuel\n\n\n## Environnement\n\n- OS: \n- Browser: \n- Version: ", tags: ["bug"], category: "Dev" },
  { name: "Meeting Notes", title: "Réunion: ", content: "## Date\n\n\n## Participants\n\n- \n\n## Ordre du jour\n\n1. \n\n## Notes\n\n\n## Actions\n\n- [ ] \n\n## Prochaine réunion\n\n", tags: ["meeting"], category: "Réunions" },
  { name: "Code Review", title: "Review: ", content: "## PR/Commit\n\n\n## Changements\n\n\n## Points positifs\n\n- \n\n## Suggestions\n\n- \n\n## Questions\n\n- ", tags: ["review", "code"], category: "Dev" },
  { name: "Documentation", title: "Doc: ", content: "## Aperçu\n\n\n## Installation\n\n```bash\n\n```\n\n## Utilisation\n\n```javascript\n\n```\n\n## API\n\n### Méthode 1\n\n\n## Exemples\n\n", tags: ["doc"], category: "Dev" },
];

const defaultCategories = ["Général", "Dev", "Tâches", "Réunions", "Idées", "Personnel"];

export default function PersonalNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("personal-notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  const { toast } = useToast();

  // Memoized markdown preview
  const previewHtml = (() => {
    if (!editingNote?.content) return "";
    return marked.parse(editingNote.content) as string;
  })();

  useEffect(() => {
    localStorage.setItem("personal-notes", JSON.stringify(notes));
  }, [notes]);

  const allTags = [...new Set(notes.flatMap((n) => n.tags))];
  const allCategories = [...new Set([...defaultCategories, ...notes.map((n) => n.category)])];

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "Tous" || note.category === selectedCategory;
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      return matchesSearch && matchesCategory && matchesTag;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const createNote = (template?: typeof templates[0]) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: template?.title || "",
      content: template?.content || "",
      tags: template?.tags || [],
      category: template?.category || "Général",
      pinned: false,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingNote(newNote);
    setIsDialogOpen(true);
  };

  const saveNote = () => {
    if (!editingNote) return;
    const now = new Date().toISOString();
    const noteToSave = { ...editingNote, updatedAt: now };
    
    if (notes.find((n) => n.id === editingNote.id)) {
      setNotes(notes.map((n) => (n.id === editingNote.id ? noteToSave : n)));
    } else {
      setNotes([...notes, noteToSave]);
    }
    
    setIsDialogOpen(false);
    setEditingNote(null);
    toast({ title: "Sauvegardé !", description: "Note enregistrée avec succès" });
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    toast({ title: "Supprimé", description: "Note supprimée" });
  };

  const togglePin = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const toggleFavorite = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)));
  };

  const addTag = () => {
    if (!editingNote || !newTagInput.trim()) return;
    if (!editingNote.tags.includes(newTagInput.trim())) {
      setEditingNote({
        ...editingNote,
        tags: [...editingNote.tags, newTagInput.trim()],
      });
    }
    setNewTagInput("");
  };

  const removeTag = (tag: string) => {
    if (!editingNote) return;
    setEditingNote({
      ...editingNote,
      tags: editingNote.tags.filter((t) => t !== tag),
    });
  };

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personal-notes.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exporté !", description: `${notes.length} notes exportées` });
  };

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setNotes([...notes, ...imported]);
          toast({ title: "Importé !", description: `${imported.length} notes importées` });
        }
      } catch {
        toast({ title: "Erreur", description: "Fichier JSON invalide", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <StickyNote className="h-8 w-8 text-primary" />
          Notes Personnelles
        </h1>
        <p className="text-muted-foreground">
          Organisez vos notes, idées et snippets avec Markdown
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={() => createNote()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNote?.id ? "Éditer la note" : "Nouvelle note"}</DialogTitle>
              </DialogHeader>
              {editingNote && (
                <div className="space-y-4">
                  <Input
                    placeholder="Titre de la note"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Select
                      value={editingNote.category}
                      onValueChange={(v) => setEditingNote({ ...editingNote, category: v })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1 flex-wrap flex-1">
                      {editingNote.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter un tag"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button variant="outline" onClick={addTag}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Editor with Edit/Preview tabs */}
                  <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as "edit" | "preview")} className="w-full">
                    <TabsList className="mb-2">
                      <TabsTrigger value="edit" className="flex items-center gap-1">
                        <Pencil className="h-4 w-4" />
                        Édition
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Prévisualisation
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="edit" className="mt-0">
                      <Textarea
                        placeholder="Contenu de la note (Markdown supporté)"
                        value={editingNote.content}
                        onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supporte Markdown : # titres, **gras**, *italique*, `code`, listes, etc.
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="mt-0">
                      <div 
                        className="min-h-[300px] p-4 border rounded-md bg-muted/30 prose prose-sm dark:prose-invert max-w-none overflow-auto"
                        dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-muted-foreground">Aucun contenu à prévisualiser</p>' }}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={saveNote}>Sauvegarder</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {templates.map((template) => (
                <Button
                  key={template.name}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => createNote(template)}
                >
                  {template.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Catégories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button
                variant={selectedCategory === "Tous" ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setSelectedCategory("Tous")}
              >
                Tous
                <Badge variant="secondary" className="ml-auto">{notes.length}</Badge>
              </Button>
              {allCategories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                  <Badge variant="secondary" className="ml-auto">
                    {notes.filter((n) => n.category === cat).length}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {allTags.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={exportNotes}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <label className="flex-1">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </span>
              </Button>
              <input type="file" accept=".json" className="hidden" onChange={importNotes} />
            </label>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-3 pr-4">
              {filteredNotes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune note. Créez votre première note !</p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotes.map((note) => (
                  <Card key={note.id} className={`hover:shadow-md transition-shadow ${note.pinned ? "border-primary" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {note.pinned && <Pin className="h-4 w-4 text-primary" />}
                            {note.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                            <CardTitle className="text-lg">{note.title || "Sans titre"}</CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{note.category}</Badge>
                            <span className="text-xs">
                              {new Date(note.updatedAt).toLocaleDateString("fr-FR")}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => togglePin(note.id)}>
                            <Pin className={`h-4 w-4 ${note.pinned ? "text-primary" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleFavorite(note.id)}>
                            <Star className={`h-4 w-4 ${note.favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingNote(note);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteNote(note.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 font-sans">
                        {note.content || "Aucun contenu"}
                      </pre>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
