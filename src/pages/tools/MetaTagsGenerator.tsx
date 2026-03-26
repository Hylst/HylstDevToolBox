import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Globe, Code2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MetaTagsGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [siteName, setSiteName] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("website");
  const [productPrice, setProductPrice] = useState("");
  const [productCurrency, setProductCurrency] = useState("EUR");
  const [faqItems, setFaqItems] = useState([{ q: "", a: "" }]);

  const titleLength = title.length;
  const descLength = description.length;

  const seoScore = useMemo(() => {
    let score = 0;
    const checks: { label: string; ok: boolean; tip: string }[] = [];

    const titleOk = titleLength > 0 && titleLength <= 60;
    checks.push({ label: "Titre (1-60 car.)", ok: titleOk, tip: titleLength === 0 ? "Ajoutez un titre" : titleLength > 60 ? "Trop long" : "OK" });
    if (titleOk) score += 15;

    const descOk = descLength >= 50 && descLength <= 160;
    checks.push({ label: "Description (50-160 car.)", ok: descOk, tip: descLength < 50 ? "Trop courte" : descLength > 160 ? "Trop longue" : "OK" });
    if (descOk) score += 15;

    const urlOk = url.startsWith("https://");
    checks.push({ label: "URL HTTPS", ok: urlOk, tip: urlOk ? "OK" : "Utilisez HTTPS" });
    if (urlOk) score += 10;

    const imageOk = image.length > 0;
    checks.push({ label: "Image OG", ok: imageOk, tip: imageOk ? "OK" : "Ajoutez une image 1200×630" });
    if (imageOk) score += 15;

    const kwOk = keywords.split(",").filter(k => k.trim()).length >= 3;
    checks.push({ label: "3+ mots-clés", ok: kwOk, tip: kwOk ? "OK" : "Ajoutez des mots-clés" });
    if (kwOk) score += 10;

    const authorOk = author.length > 0;
    checks.push({ label: "Auteur", ok: authorOk, tip: authorOk ? "OK" : "Ajoutez un auteur" });
    if (authorOk) score += 10;

    const siteOk = siteName.length > 0;
    checks.push({ label: "Nom du site", ok: siteOk, tip: siteOk ? "OK" : "Ajoutez le nom" });
    if (siteOk) score += 10;

    const twitterOk = twitterHandle.length > 0;
    checks.push({ label: "Twitter handle", ok: twitterOk, tip: twitterOk ? "OK" : "Ajoutez @handle" });
    if (twitterOk) score += 5;

    const canonicalOk = url.length > 0;
    checks.push({ label: "URL canonique", ok: canonicalOk, tip: canonicalOk ? "OK" : "Ajoutez l'URL" });
    if (canonicalOk) score += 10;

    return { score, checks };
  }, [titleLength, descLength, url, image, keywords, author, siteName, twitterHandle]);

  const generateMetaTags = () => {
    const tags: string[] = [];
    if (title) { tags.push(`<title>${title}</title>`); tags.push(`<meta name="title" content="${title}">`); }
    if (description) tags.push(`<meta name="description" content="${description}">`);
    if (keywords) tags.push(`<meta name="keywords" content="${keywords}">`);
    if (author) tags.push(`<meta name="author" content="${author}">`);
    if (url) tags.push(`<link rel="canonical" href="${url}">`);
    tags.push("", "<!-- Open Graph / Facebook -->");
    tags.push(`<meta property="og:type" content="${type}">`);
    if (url) tags.push(`<meta property="og:url" content="${url}">`);
    if (title) tags.push(`<meta property="og:title" content="${title}">`);
    if (description) tags.push(`<meta property="og:description" content="${description}">`);
    if (image) tags.push(`<meta property="og:image" content="${image}">`);
    if (siteName) tags.push(`<meta property="og:site_name" content="${siteName}">`);
    tags.push("", "<!-- Twitter -->");
    tags.push(`<meta name="twitter:card" content="summary_large_image">`);
    if (url) tags.push(`<meta name="twitter:url" content="${url}">`);
    if (title) tags.push(`<meta name="twitter:title" content="${title}">`);
    if (description) tags.push(`<meta name="twitter:description" content="${description}">`);
    if (image) tags.push(`<meta name="twitter:image" content="${image}">`);
    if (twitterHandle) tags.push(`<meta name="twitter:site" content="${twitterHandle}">`);
    return tags.join("\n");
  };

  const generateJsonLd = () => {
    if (type === "product" && productPrice) {
      const schema = {
        "@context": "https://schema.org", "@type": "Product",
        name: title || undefined, description: description || undefined, url: url || undefined, image: image || undefined,
        offers: { "@type": "Offer", price: productPrice, priceCurrency: productCurrency, availability: "https://schema.org/InStock" },
      };
      return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
    }
    if (type === "faq") {
      const validFaq = faqItems.filter(f => f.q && f.a);
      const schema = {
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: validFaq.map(f => ({
          "@type": "Question", name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      };
      return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
    }
    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "WebPage",
      name: title || undefined, description: description || undefined, url: url || undefined, image: image || undefined,
    };
    if (author && type === "article") schema.author = { "@type": "Person", name: author };
    Object.keys(schema).forEach(k => { if (schema[k] === undefined) delete schema[k]; });
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  };

  const handleCopy = (content: string) => { navigator.clipboard.writeText(content); toast.success("Copié !"); };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Meta Tags Generator</h1>
          <p className="text-muted-foreground">Générez vos balises meta, JSON-LD et analysez votre score SEO</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Titre</Label>
                <Badge variant={titleLength <= 60 ? "default" : "destructive"}>{titleLength}/60</Badge>
              </div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mon super site web" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <Badge variant={descLength <= 160 ? "default" : "destructive"}>{descLength}/160</Badge>
              </div>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Une description concise..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>URL de la page</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" />
            </div>
            <div className="space-y-2">
              <Label>URL de l'image (1200×630)</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://example.com/og-image.jpg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du site</Label>
                <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Mon Site" />
              </div>
              <div className="space-y-2">
                <Label>Type de contenu</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Auteur</Label>
                <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Twitter @</Label>
                <Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@username" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mots-clés (virgules)</Label>
              <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="seo, meta tags, web" />
            </div>

            {/* Product fields */}
            {type === "product" && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                <div className="space-y-2">
                  <Label>Prix</Label>
                  <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="29.99" />
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select value={productCurrency} onValueChange={setProductCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* FAQ fields */}
            {type === "faq" && (
              <div className="space-y-3 p-3 bg-muted rounded-lg">
                <Label>Questions / Réponses</Label>
                {faqItems.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <Input value={item.q} onChange={(e) => { const arr = [...faqItems]; arr[i].q = e.target.value; setFaqItems(arr); }} placeholder={`Question ${i + 1}`} />
                    <Textarea value={item.a} onChange={(e) => { const arr = [...faqItems]; arr[i].a = e.target.value; setFaqItems(arr); }} placeholder="Réponse" rows={2} />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setFaqItems([...faqItems, { q: "", a: "" }])}>+ Ajouter</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* SEO Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Score SEO
                <Badge variant={seoScore.score >= 80 ? "default" : seoScore.score >= 50 ? "secondary" : "destructive"}>
                  {seoScore.score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={seoScore.score} className="h-3" />
              <div className="space-y-2">
                {seoScore.checks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {check.ok ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    <span className={check.ok ? "" : "text-muted-foreground"}>{check.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{check.tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Preview */}
          <Card>
            <CardHeader><CardTitle>Prévisualisation</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="google">
                <TabsList className="mb-4">
                  <TabsTrigger value="google">Google</TabsTrigger>
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                  <TabsTrigger value="twitter">Twitter</TabsTrigger>
                </TabsList>
                <TabsContent value="google">
                  <div className="p-4 bg-white rounded-lg border text-black">
                    <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">{title || "Titre de votre page"}</p>
                    <p className="text-green-700 text-sm truncate">{url || "https://example.com/page"}</p>
                    <p className="text-gray-600 text-sm line-clamp-2">{description || "La description de votre page..."}</p>
                  </div>
                </TabsContent>
                <TabsContent value="facebook">
                  <div className="border rounded-lg overflow-hidden bg-white text-black">
                    {image && <div className="h-40 bg-muted"><img src={image} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
                    <div className="p-3">
                      <p className="text-xs text-gray-500 uppercase">{siteName || url || "example.com"}</p>
                      <p className="font-semibold truncate">{title || "Titre"}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{description || "Description..."}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="twitter">
                  <div className="border rounded-xl overflow-hidden bg-white text-black">
                    {image && <div className="h-40 bg-muted"><img src={image} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
                    <div className="p-3">
                      <p className="font-semibold truncate">{title || "Titre"}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{description || "Description..."}</p>
                      <p className="text-xs text-gray-500 mt-1">{url || "example.com"}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Generated Code */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5" /> Code généré</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="meta">
                <TabsList className="mb-4">
                  <TabsTrigger value="meta">Meta Tags</TabsTrigger>
                  <TabsTrigger value="jsonld">JSON-LD</TabsTrigger>
                </TabsList>
                <TabsContent value="meta" className="space-y-2">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleCopy(generateMetaTags())}><Copy className="h-4 w-4 mr-2" /> Copier</Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-[300px]">{generateMetaTags()}</pre>
                </TabsContent>
                <TabsContent value="jsonld" className="space-y-2">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleCopy(generateJsonLd())}><Copy className="h-4 w-4 mr-2" /> Copier</Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-[300px]">{generateJsonLd()}</pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
