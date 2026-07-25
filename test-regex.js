const text = `[FOLLOW_UP]{"questions": ["Kya aapko kisi specific job role ke liye resume tailor karna hai?", "Aapke resume mein aur kya details add karne hain?", "Kya aapko interview preparation ke liye madad chahiye?"]}[/FOLLOW_UP]
[ARTIFACT_resume_builder]{"title":"Generated Resume","data":{}}`;

const followUpTagRegex = /\[FOLLOW_UP\]([\s\S]*?)(?:\[\/FOLLOW_UP\]|$)/i;
const match = text.match(followUpTagRegex);
console.log("Follow Up Match:", match ? match[0] : "null");

let newText = text.replace(followUpTagRegex, "").trim();
console.log("Text after follow up:", newText);

const artifactRegex = /\[ARTIFACT_[a-zA-Z0-9_]+\]([\s\S]*?)\[\/ARTIFACT_[a-zA-Z0-9_]+\]/gi;
newText = newText.replace(artifactRegex, "").trim();
console.log("Text after artifact:", newText);

// Fix for artifact streaming
const artifactStreamingRegex = /\[ARTIFACT_[a-zA-Z0-9_]+\]([\s\S]*?)(?:\[\/ARTIFACT_[a-zA-Z0-9_]+\]|$)/gi;
let newText2 = text.replace(artifactStreamingRegex, "").trim();
console.log("Text after artifact streaming fix:", newText2);
