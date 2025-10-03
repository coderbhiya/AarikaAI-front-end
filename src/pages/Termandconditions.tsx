const Termandconditions = () => {
  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="px-8 py-10 md:px-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6 text-center">
            Terms & Conditions
          </h1>
          <p className="text-center text-purple-200 mb-10">
            Effective Date: <span className="font-semibold">01 October 2025</span>
          </p>

          <div className="space-y-8 text-gray-200">
            {[
              {
                title: "Eligibility",
                points: [
                  "You must be at least 16 years old to use this app.",
                  "If under 18, parental consent is required.",
                ],
              },
              {
                title: "Usage Rules",
                points: [
                  "You agree not to misuse the app or engage in illegal activities.",
                  "You are responsible for maintaining the confidentiality of your account.",
                ],
              },
              {
                title: "Intellectual Property",
                points: [
                  "All app content, logos, and materials are owned by CareerBuddy and cannot be copied or redistributed without permission.",
                ],
              },
              {
                title: "Limitation of Liability",
                points: [
                  "CareerBuddy provides career guidance but does not guarantee job placement or outcomes. Use of the app is at your own risk.",
                ],
              },
              {
                title: "Termination",
                points: [
                  "We may suspend or terminate access if these terms are violated.",
                ],
              },
              {
                title: "Changes to Terms",
                points: [
                  "We may update these Terms from time to time. Updates will be posted on this page with a new effective date.",
                ],
              },
              {
                title: "Governing Law",
                points: [
                  "These terms are governed by the laws of India.",
                ],
              },
            ].map((section, idx) => (
              <section key={idx}>
                <h2 className="text-2xl font-bold text-white mb-3">{section.title}</h2>
                <ul className="list-disc list-inside space-y-2">
                  {section.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300">
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Termandconditions;
