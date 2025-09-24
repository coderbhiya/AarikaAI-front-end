import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const UpdatesFaq = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="mobile-header">
        <Button
          variant="ghost"
          size="icon"
          className="mobile-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold">Updates & FAQ</h1>
        <div className="w-10"></div>
      </div>

      <div className="mobile-content">
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Latest Updates</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">New Chat Features</h3>
                <span className="text-xs text-gray-400">May 8, 2025</span>
              </div>
              <p className="text-sm text-gray-300">
                We've added improved context awareness to our AI chat, making
                conversations more natural and helpful.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Mobile Experience Enhancement</h3>
                <span className="text-xs text-gray-400">May 1, 2025</span>
              </div>
              <p className="text-sm text-gray-300">
                The app is now fully responsive with a dedicated mobile
                interface for seamless use on all devices.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">New AI Models</h3>
                <span className="text-xs text-gray-400">April 25, 2025</span>
              </div>
              <p className="text-sm text-gray-300">
                We've integrated the latest AI models to provide more accurate
                and helpful responses to your queries.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="font-medium mb-2">How do I start a new chat?</h3>
              <p className="text-sm text-gray-300">
                Click on the "Begin a New Chat" button in the sidebar or tap on
                the chat input at the bottom of the screen.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="font-medium mb-2">How is my data protected?</h3>
              <p className="text-sm text-gray-300">
                We use industry-standard encryption to protect your
                conversations. Your data is never shared with third parties
                without your consent.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="font-medium mb-2">
                Can I delete my conversation history?
              </h3>
              <p className="text-sm text-gray-300">
                Yes, you can clear your conversation history by clicking on
                "Clear conversations" in the sidebar menu.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="font-medium mb-2">
                How do I change the chat category?
              </h3>
              <p className="text-sm text-gray-300">
                Start a new chat and select from the available categories, or
                navigate back to the welcome screen to select a different
                category.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="font-medium mb-2">
                Is there a limit to how much I can chat?
              </h3>
              <p className="text-sm text-gray-300">
                Currently, there are no conversation limits for registered
                users. We monitor usage to ensure a quality experience for all.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Contact Support</h2>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-gray-300 mb-4">
              Can't find the answer you're looking for? Our support team is here
              to help.
            </p>
            <Button className="w-full">Contact Support</Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UpdatesFaq;