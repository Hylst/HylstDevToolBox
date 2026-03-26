import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, Copy, Download } from "lucide-react";
import { toast } from "sonner";

export default function HtmlMarkdownConverter() {
  const [html, setHtml] = useState("<h1>Hello World</h1>\n<p>This is a <strong>paragraph</strong> with <em>formatting</em>.</p>");
  const [markdown, setMarkdown] = useState("# Hello World\n\nThis is a **paragraph** with *formatting*.");

  const htmlToMarkdown = (html: string): string => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();
  };

  const markdownToHtml = (md: string): string => {
    return md
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(.+)$/gm, "<p>$1</p>")
      .replace(/<p><\/p>/g, "");
  };

  const convertHtmlToMd = () => { setMarkdown(htmlToMarkdown(html)); toast.success("Converti !"); };
  const convertMdToHtml = () => { setHtml(markdownToHtml(markdown)); toast.success("Converti !"); };
  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copié !"); };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ArrowLeftRight className="h-8 w-8 text-primary" />
        HTML ↔ Markdown Converter
      </h1>
      <Tabs defaultValue="html-to-md">
        <TabsList className="mb-4">
          <TabsTrigger value="html-to-md">HTML → Markdown</TabsTrigger>
          <TabsTrigger value="md-to-html">Markdown → HTML</TabsTrigger>
        </TabsList>
        <TabsContent value="html-to-md">
          <div className="grid md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle>HTML</CardTitle></CardHeader><CardContent>
              <Textarea value={html} onChange={e => setHtml(e.target.value)} rows={12} className="font-mono" />
              <Button onClick={convertHtmlToMd} className="mt-2 w-full">Convertir →</Button>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Markdown</CardTitle></CardHeader><CardContent>
              <Textarea value={markdown} readOnly rows={12} className="font-mono" />
              <Button variant="outline" onClick={() => copy(markdown)} className="mt-2 w-full gap-2"><Copy className="h-4 w-4" />Copier</Button>
            </CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="md-to-html">
          <div className="grid md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle>Markdown</CardTitle></CardHeader><CardContent>
              <Textarea value={markdown} onChange={e => setMarkdown(e.target.value)} rows={12} className="font-mono" />
              <Button onClick={convertMdToHtml} className="mt-2 w-full">Convertir →</Button>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>HTML</CardTitle></CardHeader><CardContent>
              <Textarea value={html} readOnly rows={12} className="font-mono" />
              <Button variant="outline" onClick={() => copy(html)} className="mt-2 w-full gap-2"><Copy className="h-4 w-4" />Copier</Button>
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
