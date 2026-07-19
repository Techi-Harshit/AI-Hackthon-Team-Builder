const baseUrl = "http://localhost:5000/api/users/register";

const sharedData = {
  college: "National Institute of Technology, Trichy",
  branch: "Computer Science and Engineering",
  year: 3,
  skills: ["React", "Node.js", "MongoDB"],
  preferredRole: "Full Stack",
  interests: ["Artificial Intelligence", "Open Source", "Product Development"],
  availability: "Weekend",
  location: "New Delhi, India",
  github: "https://github.com/cosmoq-demo",
  linkedin: "https://www.linkedin.com/in/cosmoq-demo",
  bio: "Passionate hackathon builder with strong team collaboration skills.",
  experience: "Intermediate",
  avatar: "https://i.pravatar.cc/150?img=32",
};

const timestamp = Date.now();

const users = Array.from({ length: 20 }, (_, index) => ({
  name: `Test User ${index + 1}`,
  email: `test.user.${timestamp}.${index + 1}@cosmoq.app`,
  password: "Pass@1234",
  ...sharedData,
  skills: [...sharedData.skills, `Skill${index + 1}`],
  preferredRole: ["Full Stack", "Frontend", "Backend", "AI/ML"][index % 4],
  interests: ["AI/ML", "Web Development", "Hackathons"][index % 3],
  avatar: `https://i.pravatar.cc/150?img=${20 + index}`,
}));

(async () => {
  console.log(`Sending ${users.length} registration requests to ${baseUrl}`);

  for (const user of users) {
    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const body = await response.json();
      if (response.ok) {
        console.log(`✅ Created: ${user.email}`);
      } else {
        console.error(`❌ Failed: ${user.email} - ${body.message || JSON.stringify(body)}`);
      }
    } catch (error) {
      console.error(`❌ Error for ${user.email}:`, error.message);
    }
  }
})();
