import React, { useState, useEffect } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Menu, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

SyntaxHighlighter.registerLanguage("json", json);

const mockApiData = [
  {
    category: "Healthcare",
    icon: "🏥",
    title: "Patient Record API",
    description: "Manage electronic health records securely.",
    baseUrl: "https://api.healthcare.com/v1",
    auth: "API Key",
    endpoints: [
      {
        method: "GET",
        path: "/patients",
        params: {
          query: ["name", "dob"]
        },
        requestExample: {},
        responseExample: {
          patients: [
            {
              id: "123",
              name: "John Doe"
            }
          ]
        }
      },
      {
        method: "POST",
        path: "/patients",
        params: {
          body: ["name", "dob", "conditions"]
        },
        requestExample: {
          name: "Jane Smith",
          dob: "1990-01-01",
          conditions: ["asthma"]
        },
        responseExample: {
          id: "124",
          status: "created"
        }
      }
    ]
  },
  {
    category: "Finance",
    icon: "💰",
    title: "Transaction API",
    description: "Track financial transactions across accounts.",
    baseUrl: "https://api.finance.com/v1",
    auth: "API Key",
    endpoints: [
      {
        method: "GET",
        path: "/transactions",
        params: {
          query: ["accountId", "date"]
        },
        requestExample: {},
        responseExample: {
          transactions: []
        }
      }
    ]
  }
];

const ApiDocs = () => {
  const [selectedApi, setSelectedApi] = useState(mockApiData[0]);

  useEffect(() => {
    setSelectedApi(mockApiData[0]);
  }, []);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 p-4 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-semibold mb-4">API Categories</h2>
        <ul className="space-y-2">
          {mockApiData.map((api) => (
            <li
              key={api.category}
              className={cn(
                "cursor-pointer p-2 rounded hover:bg-neutral-800",
                selectedApi.category === api.category && "bg-neutral-800"
              )}
              onClick={() => setSelectedApi(api)}
            >
              <span className="mr-2">{api.icon}</span>
              {api.category}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Top Nav */}
        <nav className="flex items-center justify-between mb-6">
          <div className="text-2xl font-bold">DevDocs</div>
          <div className="flex items-center space-x-4">
            <button className="bg-white text-black px-3 py-1 rounded flex items-center gap-1">
              <LogIn size={16} /> Login
            </button>
            <button className="border border-white px-3 py-1 rounded flex items-center gap-1">
              <UserPlus size={16} /> Signup
            </button>
          </div>
        </nav>

        {/* API Info */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{selectedApi.title}</h1>
          <p className="text-gray-300 mb-2">{selectedApi.description}</p>
          <div className="text-sm text-gray-400">
            <p><strong>Base URL:</strong> {selectedApi.baseUrl}</p>
            <p><strong>Auth Method:</strong> {selectedApi.auth}</p>
          </div>
        </section>

        {/* Endpoints */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>
          <div className="space-y-6">
            {selectedApi.endpoints.map((endpoint, index) => (
              <div key={index} className="border border-white/10 rounded p-4 bg-neutral-800">
                <div className="mb-2">
                  <span className="text-green-400 font-mono mr-2">{endpoint.method}</span>
                  <span className="font-mono">{endpoint.path}</span>
                </div>

                {endpoint.params && (
                  <div className="text-sm text-gray-300 mb-2">
                    <p><strong>Parameters:</strong></p>
                    {Object.entries(endpoint.params).map(([type, keys]) => (
                      <p key={type} className="ml-4">
                       <span className="capitalize">{type}</span>: {/*keys.join(", ")*/}
                      </p>
                    ))}
                  </div>
                )}

                <div className="text-sm mb-2">
                  <p className="font-semibold text-white">Request Example:</p>
                  <SyntaxHighlighter language="json" style={atomOneDark} className="rounded">
                    {JSON.stringify(endpoint.requestExample, null, 2)}
                  </SyntaxHighlighter>
                </div>

                <div className="text-sm">
                  <p className="font-semibold text-white">Response Example:</p>
                  <SyntaxHighlighter language="json" style={atomOneDark} className="rounded">
                    {JSON.stringify(endpoint.responseExample, null, 2)}
                  </SyntaxHighlighter>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ApiDocs;
