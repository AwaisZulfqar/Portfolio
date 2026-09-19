/**
 * Single source of truth for everything personal.
 * Edit this file — the whole page (and the 3D ID badge) reads from it.
 */
export const site = {
  name: "Hafiz Awais Zulfqar",
  shortName: "Awais Zulfqar",
  initials: "HA",
  role: "Full Stack AI Engineer",
  tagline:
    "Two years building production SaaS end to end — RAG pipelines, real-time microservices and Node/TypeScript backends that hold up under real traffic.",
  location: "Bahawalpur, Pakistan",
  /** Short form printed on the 3D badge, where space is tight. */
  cardLocation: "Bahawalpur, PK",
  phone: "+92 326 5288928",
  /** Same number, opened as a WhatsApp chat. */
  whatsapp: "https://wa.me/923265288928",
  available: true,
  email: "awaiszulfqar505@gmail.com",
  employeeId: "AI-2024-ENG",
  since: "2023",
  portrait: "/portrait.jpg",
  resume: "/Hafiz-Awais-Zulfqar-CV.pdf",

  /** Short status block — the thing a recruiter scans first. */
  now: [
    { key: "Status", value: "Open to full-time & contract" },
    { key: "Focus", value: "AI products · real-time backends" },
    { key: "Base", value: "Bahawalpur, PK — UTC+5" },
    { key: "Start", value: "Immediately" },
  ],

  /** Third-party platforms wired into shipped products. */
  integrations: [
    "OpenAI",
    "DeepSeek",
    "Stripe",
    "SendGrid",
    "AWS S3",
    "Cloudflare R2",
    "Cloudinary",
    "RingCentral",
    "Agency Zoom",
    "Ricochet",
    "OAuth",
    "Formspree",
  ],

  intro:
    "I'm a Full Stack AI Engineer with two years shipping production SaaS — not prototypes. I own features from schema to screen: retrieval pipelines over pgvector, LLM providers swapped at runtime, Socket.IO and queue-backed services that stay responsive under load, wrapped in Next.js front ends people actually enjoy using.",
  introSecond:
    "At Enigmatix I spent two years on backend microservices, third-party platform integrations and React dashboards for apps under heavy production traffic. Most recently I worked on PayOn's restaurant POS frontend. Alongside client work I design and ship my own products — VectaJob is the largest, a full RAG platform I built and run myself.",

  socials: [
    { label: "GitHub", href: "https://github.com/AwaisZulfqar" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/awais-zulfqar-9270002a7" },
    { label: "Email", href: "mailto:awaiszulfqar505@gmail.com" },
    { label: "WhatsApp", href: "https://wa.me/923265288928" },
  ],

  stats: [
    { value: "2 yrs", label: "In production" },
    { value: "6", label: "Products shipped" },
    { value: "10+", label: "Platforms integrated" },
    { value: "24h", label: "Reply time" },
  ],

  stack: [
    {
      group: "AI & ML",
      items: [
        "RAG pipelines",
        "OpenAI / GPT-4",
        "DeepSeek",
        "pgvector",
        "Semantic search",
        "Prompt engineering",
      ],
    },
    {
      group: "Frontend",
      items: ["React.js", "Next.js", "TypeScript", "Tailwind CSS"],
    },
    {
      group: "Backend",
      items: [
        "Node.js",
        "Express.js",
        "Fastify",
        "Microservices",
        "GraphQL (Apollo)",
        "Socket.IO",
        "BullMQ / RabbitMQ",
        "Prisma",
      ],
    },
    {
      group: "Data & Platform",
      items: [
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "AWS S3",
        "Cloudflare R2",
        "Cloudinary",
        "Stripe",
        "CI/CD",
      ],
    },
  ],

  services: [
    {
      title: "AI product engineering",
      body: "RAG over your own data: embeddings, pgvector retrieval, GPT-4 or DeepSeek generation, with provider switching so you're never locked to one model.",
    },
    {
      title: "Backend & real-time systems",
      body: "Node and TypeScript microservices, REST and GraphQL, Socket.IO channels, RabbitMQ and BullMQ queues, auth, storage and billing wired end to end.",
    },
    {
      title: "Product front ends",
      body: "Next.js and React interfaces — dashboards, analytics, live API views — fast, accessible and built to survive real feature growth.",
    },
  ],

  projects: [
    {
      index: "01",
      title: "VectaJob",
      subtitle: "AI job application platform",
      year: "2025",
      role: "Founder · Full stack",
      body: "AI job-matching platform built on a RAG pipeline — OpenAI embeddings into pgvector, GPT-4 and DeepSeek for semantic matching, AI chat and personalised career recommendations. Backend switches LLM providers at runtime, aggregates jobs from multiple sources through BullMQ workers, and bills subscriptions via Stripe.",
      tags: ["Next.js", "Node.js", "PostgreSQL", "pgvector", "GPT-4", "Redis", "Stripe"],
      metric: "RAG + LLM routing",
      href: "https://vectajob.com/",
      live: true,
    },
    {
      index: "02",
      title: "PayOn",
      subtitle: "Restaurant POS platform",
      year: "2026",
      role: "Frontend",
      body: "Point-of-sale platform for restaurants. I worked on the customer-facing side, including the QR-scan flow diners use to open a venue's menu and order from their own phone.",
      tags: ["React", "TypeScript", "REST APIs", "Responsive UI"],
      metric: "QR ordering",
      href: "",
      live: false,
    },
    {
      index: "03",
      title: "Real-Time Chat",
      subtitle: "Microservices messaging app",
      year: "2026",
      role: "Personal · Full stack",
      body: "Chat platform split into three services — user, chat and mail — behind a React and TypeScript client. Socket.IO carries messages and typing indicators, Redis holds JWT sessions, RabbitMQ pushes email notifications off the request path, and Cloudinary stores avatars and image uploads.",
      tags: ["TypeScript", "Socket.IO", "MongoDB", "Redis", "RabbitMQ", "Cloudinary"],
      metric: "3 services · WebSockets",
      href: "https://github.com/AwaisZulfqar/real-time-chat-app",
      live: false,
    },
    {
      index: "04",
      title: "OONO",
      subtitle: "Social networking platform",
      year: "2024",
      role: "Full stack",
      body: "Full-stack social platform with OAuth authentication, Stripe payments and AWS S3 media storage. Added SendGrid notification flows, a referral reward system and interactive analytics dashboards for users.",
      tags: ["Node.js", "Express", "React.js", "MongoDB", "AWS S3", "SendGrid"],
      metric: "OAuth · Stripe · S3",
      href: "https://oono.ai/",
      live: true,
    },
    {
      index: "05",
      title: "EXT Insurance Lab",
      subtitle: "Full stack insurance app",
      year: "2024",
      role: "Full stack",
      body: "Insurance application on React and Apollo Client over a Fastify GraphQL API. Third-party CRM integrations, inbound webhooks, SendGrid email automation and dynamic forms driven by react-jsonschema-form.",
      tags: ["Fastify", "GraphQL", "Apollo", "React", "Prisma", "TypeScript"],
      metric: "CRM + webhooks",
      href: "#",
      live: false,
    },
    {
      index: "06",
      title: "Accountant For All",
      subtitle: "SEO accounting platform",
      year: "2024",
      role: "Frontend",
      body: "Responsive accounting site in Next.js and TypeScript with a reusable component set, strong accessibility and SEO-tuned performance across devices. Formspree for secure contact submissions, Google Search Console wired up for ongoing SEO.",
      tags: ["Next.js", "React", "TypeScript", "SEO", "Formspree"],
      metric: "SEO optimised",
      href: "https://accountantforall.com/",
      live: true,
    },
  ],

  experience: [
    {
      period: "Jun 2026 — Aug 2026",
      company: "PayOn",
      place: "3-month contract",
      title: "Frontend Developer",
      points: [
        "Triaged and fixed bugs across the client-facing side of a restaurant POS platform, working from audit findings and QA tickets rather than shipping new features.",
        "Integrated REST APIs into existing React views, wiring live data into screens that had been running on static placeholders.",
        "Optimised UI and UX: responsive layout fixes, loading and empty states, form validation and accessibility passes.",
      ],
    },
    {
      period: "Aug 2024 — Jun 2026",
      company: "Enigmatix",
      place: "Bahawalpur, Pakistan",
      title: "Full Stack Developer",
      points: [
        "Built and shipped scalable backend microservices and secure REST and GraphQL APIs in Node.js and TypeScript for applications serving heavy production traffic.",
        "Integrated RingCentral, Agency Zoom and Ricochet, consolidating communication workflows and cutting manual data entry across teams.",
        "Designed core system components: secure authentication, scheduled background jobs, AWS S3 storage and automated email workflows.",
        "Delivered responsive React and TypeScript front ends with dynamic dashboards, analytics pages and live API integrations.",
      ],
    },
  ],

  education: {
    degree: "BS Software Engineering",
    school: "Islamia University of Bahawalpur",
    place: "Bahawalpur, Pakistan",
    detail: "CGPA 3.5",
  },
} as const;

export type Site = typeof site;
