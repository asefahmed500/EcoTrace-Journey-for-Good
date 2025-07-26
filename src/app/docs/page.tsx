import { Code, Terminal } from "lucide-react";

const codeSnippet = `
// Example: Calculate carbon emissions for a route
const response = await fetch('https://api.ecotrace.io/v1/calculate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    origin: 'San Francisco, CA',
    destination: 'Los Angeles, CA',
    mode: 'driving',
    vehicleType: 'ev'
  })
});

const data = await response.json();
console.log(data.emissions.co2_kg);
`.trim();

export default function DocsPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
         <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <Terminal className="size-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          API Documentation
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Integrate EcoTrace's powerful carbon calculation engine into your own applications. Our developer-friendly API provides a simple way to access our advanced environmental impact data.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
            <h3 className="text-lg font-semibold">Getting Started</h3>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li><a href="#introduction" className="hover:text-primary">Introduction</a></li>
              <li><a href="#authentication" className="hover:text-primary">Authentication</a></li>
            </ul>

            <h3 className="text-lg font-semibold mt-6">Endpoints</h3>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li><a href="#calculate" className="font-medium text-primary">POST /calculate</a></li>
              <li><a href="#journeys" className="hover:text-primary">GET /journeys</a></li>
              <li><a href="#user-stats" className="hover:text-primary">GET /user/stats</a></li>
            </ul>
             <h3 className="text-lg font-semibold mt-6">Reference</h3>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li><a href="#error-codes" className="hover:text-primary">Error Codes</a></li>
              <li><a href="#rate-limiting" className="hover:text-primary">Rate Limiting</a></li>
            </ul>
        </aside>

        <main className="lg:col-span-3">
          <section id="introduction">
            <h2 className="text-2xl font-bold">Introduction</h2>
            <p className="mt-4 text-muted-foreground">
              Welcome to the EcoTrace API. Our goal is to make environmental impact data accessible to everyone. You can use our API to calculate carbon footprints, analyze travel patterns, and build sustainability features into your products.
            </p>
          </section>

           <section id="authentication" className="mt-12">
            <h2 className="text-2xl font-bold">Authentication</h2>
            <p className="mt-4 text-muted-foreground">
              All API requests require authentication. You can get your API key from your Enterprise dashboard. Include your API key in the `Authorization` header as a Bearer token.
            </p>
          </section>

          <section id="calculate" className="mt-12">
            <h2 className="text-2xl font-bold">POST /calculate</h2>
            <p className="mt-4 text-muted-foreground">
              This is the core endpoint for calculating carbon emissions. Provide an origin, destination, and mode of transport to receive a detailed breakdown of the environmental impact.
            </p>
            <div className="mt-6 bg-card rounded-lg border">
                <div className="p-4 border-b flex items-center gap-2 text-sm text-muted-foreground">
                    <Code className="size-4" />
                    <span>Example Request</span>
                </div>
                <pre className="p-4 text-sm overflow-x-auto">
                    <code className="language-javascript">{codeSnippet}</code>
                </pre>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
