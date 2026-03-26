import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server } from "lucide-react";

// Import sub-components inline to keep it manageable
import MockApiBuilder from "./MockApiBuilder";
import ApiResponseMocker from "./ApiResponseMocker";

export default function ApiMockerPro() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Server className="h-8 w-8 text-primary" />
          API Mocker Pro
        </h1>
        <p className="text-muted-foreground mt-1">
          Créez des APIs mock et générez des réponses réalistes — tout en un
        </p>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">🔗 Endpoints Builder</TabsTrigger>
          <TabsTrigger value="responses">📦 Response Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <MockApiBuilderInline />
        </TabsContent>

        <TabsContent value="responses">
          <ResponseMockerInline />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Inline versions without their own headers (since ApiMockerPro provides the header)
function MockApiBuilderInline() {
  // Re-render the original component but strip the header by wrapping
  return (
    <div className="[&>div>div:first-child]:hidden">
      <MockApiBuilder />
    </div>
  );
}

function ResponseMockerInline() {
  return (
    <div className="[&>div>div:first-child]:hidden">
      <ApiResponseMocker />
    </div>
  );
}
