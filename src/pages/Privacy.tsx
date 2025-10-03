const Privacy = () => {
  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="px-8 py-10 md:px-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6 text-center">
            Privacy Policy
          </h1>
          <p className="text-center text-purple-200 mb-10">
            Effective Date: <span className="font-semibold">01 October 2025</span>
          </p>

          <div className="space-y-8 text-gray-200">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Personal Information: Name, email, phone number (if provided by you).</li>
                <li>Usage Data: Interactions, preferences, device type, app version.</li>
                <li>Optional Data: Uploaded files such as resumes or documents.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To provide career guidance and skill assessment features.</li>
                <li>To improve app performance and user experience.</li>
                <li>To send updates, alerts, or recommendations (with your consent).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Data Sharing</h2>
              <p className="mb-2">We do not sell your data. We may share it only:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>With trusted service providers (cloud hosting, analytics) strictly for app functionality.</li>
                <li>If required by law or regulatory authorities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">User Rights</h2>
              <p>
                You may request access, correction, or deletion of your data by contacting us at{" "}
                <a
                  href="mailto:dave@senseforge.in"
                  className="text-purple-300 underline hover:text-purple-100 transition"
                >
                  dave@senseforge.in
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Security</h2>
              <p>
                We implement industry-standard measures to protect your personal data, but no method is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Contact</h2>
              <p>
                If you have any questions, please contact us at:{" "}
                <a
                  href="mailto:dave@senseforge.in"
                  className="text-purple-300 underline hover:text-purple-100 transition"
                >
                  dave@senseforge.in
                </a>
                <br />
                Address: [your company address]
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
