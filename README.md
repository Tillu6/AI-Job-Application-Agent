# 🤖 JobAgent AI - Your Smart Job Application Assistant

<div align="center">

![JobAgent AI Logo](https://img.shields.io/badge/🤖-JobAgent%20AI-blue?style=for-the-badge&logoColor=white)

**Automate your job search with AI-powered CV tailoring and cover letter generation**

[![Live Demo](https://img.shields.io/badge/🌐-Live%20Demo-success?style=for-the-badge)](https://cheerful-arithmetic-fc60f2.netlify.app)
[![React](https://img.shields.io/badge/⚛️-React%2018-61DAFB?style=for-the-badge)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/📘-TypeScript-3178C6?style=for-the-badge)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/🧠-OpenAI%20GPT--4-412991?style=for-the-badge)](https://openai.com/)

</div>

---

## 🌟 What is JobAgent AI?

JobAgent AI is your personal job application assistant that makes finding and applying for jobs effortless! It automatically searches Australian job sites, optimizes your CV for each position, and generates personalized cover letters - all powered by artificial intelligence.

### 🎯 Perfect For:
- 👨‍💼 Job seekers who want to save time
- 📈 Professionals looking to improve their application success rate
- 🎓 Recent graduates entering the job market
- 🔄 Career changers exploring new opportunities

---

## ✨ Amazing Features

### 🔍 **Smart Job Search**
- 🌐 Searches **Seek**, **Indeed**, and **LinkedIn** automatically
- 📍 Covers all major Australian cities
- 🎯 Matches jobs based on your skills and preferences
- ⚡ Real-time job discovery and updates

### 🧠 **AI-Powered CV Optimization**
- 📊 **ATS Score Analysis** - See how well your CV performs with hiring systems
- 🎯 **Keyword Optimization** - Automatically adds relevant keywords
- 📝 **Custom Tailoring** - Adapts your CV for each specific job
- 💡 **Smart Suggestions** - Get tips to improve your CV

### ✍️ **Personalized Cover Letters**
- 🤖 **AI-Generated Content** - Creates unique letters for each job
- 🎨 **Professional Format** - Follows Australian business standards
- 💼 **Company Research** - Incorporates company-specific details
- ⚡ **Instant Generation** - Ready in seconds, not hours

### 📊 **Application Tracking**
- 📈 **Progress Dashboard** - See your application statistics
- 🎯 **Match Scores** - Know which jobs fit you best
- 📋 **Status Tracking** - Keep track of applications sent
- 📊 **Success Analytics** - Monitor your job search performance

---

## 🚀 Quick Start Guide

### 1️⃣ **Get Your OpenAI API Key**
```bash
# Visit OpenAI and create an account
🌐 https://platform.openai.com/api-keys
```

### 2️⃣ **Clone & Install**
```bash
# Clone the repository
git clone https://github.com/Tillu6/AI-Job-Application-Agent.git
cd AI-Job-Application-Agent

# Install dependencies
npm install
```

### 3️⃣ **Setup Environment**
```bash
# Copy the example environment file
cp .env.example .env

# Add your OpenAI API key to .env file
VITE_OPENAI_API_KEY=your_api_key_here
```

### 4️⃣ **Launch the App**
```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:5173
```

---

## 🎮 How to Use

### 📤 **Step 1: Upload Your CV**
- Click the upload area in the CV Analyzer
- Support for **PDF**, **DOCX**, and **TXT** files
- Get instant ATS optimization score and suggestions

### 🔍 **Step 2: Search for Jobs**
- Enter your skills (e.g., "React, Python, Marketing")
- Choose your preferred location
- Click "Search Jobs" and watch the magic happen!

### 🎯 **Step 3: Apply with AI**
- **Tailor CV** - AI optimizes your CV for each job
- **Generate Cover Letter** - Creates personalized letters
- **Apply** - Mark jobs as applied and track progress

### 📊 **Step 4: Track Your Success**
- Monitor applications in the dashboard
- See match scores for each position
- Track your application success rate

---

## 🛠️ Technology Stack

<div align="center">

| Frontend | AI & APIs | Tools & Utils |
|----------|-----------|---------------|
| ⚛️ **React 18** | 🧠 **OpenAI GPT-4** | 🎨 **Tailwind CSS** |
| 📘 **TypeScript** | 🌐 **Web Scraping** | 📊 **React Query** |
| ⚡ **Vite** | 📄 **PDF Parser** | 🔧 **Zod Validation** |
| 🎯 **Lucide Icons** | 📝 **Document Parser** | 💾 **Browser Cache** |

</div>

---

## 📋 Requirements

- 🟢 **Node.js 18+** and npm
- 🔑 **OpenAI API Key** (required for AI features)
- 🌐 **Modern web browser** (Chrome, Firefox, Safari, Edge)

---

## 🚀 Deployment

### 🌐 **Netlify (Recommended)**
```bash
# Build the project
npm run build

# Deploy to Netlify
# Upload the dist/ folder or connect your GitHub repo
```

### ⚡ **Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy with one command
vercel --prod
```

### 🐳 **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🔧 Configuration

### 🌍 **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | 🔑 Your OpenAI API key | ✅ Yes |
| `VITE_APP_NAME` | 📱 Application name | ❌ No |
| `VITE_APP_VERSION` | 🏷️ App version | ❌ No |

### ⚡ **Rate Limits**
- 🔍 **Job Search**: 10 requests per minute
- 📝 **CV Tailoring**: 5 requests per minute
- ✍️ **Cover Letters**: 10 requests per minute

---

## 🛡️ Privacy & Security

- 🔒 **Your data stays private** - All processing happens in your browser
- 🔐 **Secure API calls** - Your OpenAI key is never exposed
- 🚫 **No data storage** - We don't store your CVs or personal information
- ⚡ **Rate limiting** - Prevents abuse and protects your API quota

---

## 🐛 Troubleshooting

### ❌ **Common Issues**

**🔑 OpenAI API Errors**
```bash
# Check your API key is valid
# Ensure you have sufficient credits
# Verify rate limits in OpenAI dashboard
```

**🌐 Job Scraping Issues**
```bash
# Job sites may have changed structure
# Check your internet connection
# Try different search keywords
```

**📄 Document Upload Problems**
```bash
# Ensure file is under 10MB
# Use supported formats: PDF, DOCX, TXT
# Check file isn't password protected
```

---

## 🤝 Contributing

We love contributions! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b amazing-feature`)
3. 💻 **Make** your changes
4. ✅ **Test** everything works
5. 📤 **Submit** a pull request

### 🎯 **Areas We Need Help With:**
- 🌐 Adding more job sites
- 🧠 Improving AI prompts
- 🎨 UI/UX enhancements
- 🐛 Bug fixes and optimizations
- 📚 Documentation improvements

---

## 🗺️ Roadmap

### 🔜 **Coming Soon**
- [ ] 📧 **Email Integration** - Send applications directly
- [ ] 📱 **Mobile App** - iOS and Android versions
- [ ] 🌍 **International Support** - More countries and job sites
- [ ] 📊 **Advanced Analytics** - Detailed success metrics
- [ ] 🤖 **Interview Prep** - AI-powered interview questions

### 💡 **Future Ideas**
- [ ] 📅 **Calendar Integration** - Schedule interviews automatically
- [ ] 🔗 **LinkedIn Integration** - Sync with your profile
- [ ] 📈 **Salary Insights** - Market rate analysis
- [ ] 🎯 **Job Alerts** - Get notified of perfect matches

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

Need help? We're here for you!

- 📖 **Documentation**: Check our [Wiki](https://github.com/yourusername/jobagent-ai/wiki)
- 🐛 **Bug Reports**: [Create an Issue](https://github.com/yourusername/jobagent-ai/issues)
- 💬 **Questions**: [Start a Discussion](https://github.com/yourusername/jobagent-ai/discussions)
- 📧 **Email**: psakethreddy97@gmail.com 

---

## 🌟 Show Your Support

If JobAgent AI helped you land your dream job, please:

- ⭐ **Star this repository**
- 🐦 **Share on Twitter** with #JobAgentAI
- 📝 **Write a review** on your blog
- 🤝 **Refer friends** who are job hunting

---

<div align="center">

### 🚀 **Ready to Transform Your Job Search?**

[![Get Started](https://img.shields.io/badge/🚀-Get%20Started%20Now-success?style=for-the-badge&logoColor=white)](https://cheerful-arithmetic-fc60f2.netlify.app)

**Made with ❤️ by developers, for job seekers**

---

*JobAgent AI - Because your dream job shouldn't be a dream anymore* ✨

</div>
