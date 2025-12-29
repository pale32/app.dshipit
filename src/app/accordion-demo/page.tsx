import AccordionMultipleOpenDemo from "@/components/accordion-08";

export default function AccordionDemoPage() {
  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Accordion Demo</h1>
        <p className="text-muted-foreground">Multiple items can be expanded at once</p>
      </div>

      <div className="flex justify-center">
        <AccordionMultipleOpenDemo />
      </div>
    </div>
  );
}
