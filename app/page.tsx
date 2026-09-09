import { ExamCards } from "@/components/ExamCards";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Exam Intel?",
    answer: [
      "Exam Intel is a student-focused platform providing the latest exam notifications, counselling updates, important dates, results, cutoffs and other academic updates in one place.",
      "We started our journey in May 2024 on Telegram, with a simple goal — to make important exam and admission updates easier for students to find, understand and access. Since then, Exam Intel has grown into a dedicated platform for timely educational updates.",
    ],
  },
  {
    question: "Which exams does Exam Intel cover?",
    answer: [
      "Exam Intel has been covering JEE-related updates since 2024. From 2026, we expanded our coverage to include counselling updates, including important admission and counselling-related information across India.",
    ],
  },
  {
    question: "Are the updates verified?",
    answer: [
      "We aim to provide information sourced from official notifications and authorities. For important decisions, students are always advised to cross-check critical details with the respective official website.",
    ],
  },
  {
    question: "Where can I find the latest exam notifications?",
    answer: [
      "The latest notifications, announcements and important updates are regularly shared in the Latest Updates section of our Telegram channel.",
    ],
  },
  {
    question: "Can I find previous-year cutoffs on Exam Intel?",
    answer: [
      "Yes. Wherever reliable data is available, we provide previous-year cutoffs and admission-related information for reference and comparison. This information is currently available through our Telegram channel.",
    ],
  },
  {
    question: "How can I find information about a specific exam?",
    answer: [
      "You can use the Search option in our Telegram channel to find updates related to a specific exam or category, including notifications, important dates, results, cutoffs and other relevant information.",
    ],
  },
  {
    question: "How frequently is Exam Intel updated?",
    answer: [
      "We regularly share updates whenever new official notifications, schedules, results, counselling updates or other important announcements are released.",
      "Note: While we strive to cover all important updates, we cannot guarantee 100% coverage of every notification or development.",
    ],
  },
  {
    question: "What if I find an incorrect or outdated update?",
    answer: [
      "Since our journey began in 2024, we have maintained a strong focus on accuracy and reliability. To the best of our knowledge, we have had only one incorrect update since 2024.",
      "However, if you notice any incorrect, outdated or missing information, please inform us through the Contact Us section or directly on our Telegram channel. We will review the information and make corrections wherever required.",
    ],
  },
];

const steps = [
  { title: "Enter your details", text: "Your rank or score, category and home state." },
  { title: "See your matches", text: "A list of colleges with an admission chance estimate for each." },
  { title: "Narrow it down", text: "Filter by course, college type and annual tuition." },
];

export default function Home() {
  return <main id="main">
    <section className="border-b border-zinc-200 pb-14 pt-16 sm:pb-16 sm:pt-20">
      <div className="page-shell">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl leading-[1.15] font-semibold tracking-tight sm:text-5xl">Find colleges you can get into</h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-zinc-600">Enter your NEET rank and see your admission chances across MBBS, BDS and AYUSH seats.</p>
        </div>
        <ExamCards />
      </div>
    </section>
    <section id="how-it-works" className="page-shell py-16">
      <div className="max-w-2xl"><h2 className="text-2xl font-semibold tracking-tight">How it works</h2><p className="mt-2 text-sm text-zinc-600">Three steps, about a minute of your time.</p></div>
      <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
        {steps.map(({ title, text }, index) => <div key={title}><p className="text-sm font-medium text-zinc-400">0{index + 1}</p><h3 className="mt-2 text-base font-semibold">{title}</h3><p className="mt-1.5 text-sm leading-6 text-zinc-600">{text}</p></div>)}
      </div>
    </section>
    <section aria-labelledby="counselling-heading" className="page-shell pb-16">
      <div className="rounded-2xl border border-zinc-200 p-6 sm:p-8">
        <div className="max-w-2xl">
          <h2 id="counselling-heading" className="text-2xl font-semibold tracking-tight">MCC and state counselling, in one place</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-600">After your NEET UG result, seats are allotted through national and state counselling routes. Exam Intel helps you understand both, so you can weigh All India Quota and home-state options together.</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article>
            <h3 className="text-base font-semibold">MCC — All India Quota</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">MCC conducts counselling for 15% All India Quota MBBS and BDS seats, along with seats in participating central institutes, universities and deemed universities. Allotment depends on eligibility, NEET rank, category, the published seat matrix and your choice filling.</p>
            <p className="mt-4 text-xs leading-6 text-zinc-500">AYUSH All India Quota counselling is conducted separately by AACCC.</p>
          </article>
          <article>
            <h3 className="text-base font-semibold">State counselling</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">Each state or UT runs its own NEET counselling for state-quota and other participating seats. Exam Intel brings the major state pathways together so you can understand home-state options alongside national counselling.</p>
          </article>
        </div>
        <p className="mt-6 border-t border-zinc-200 pt-5 text-xs leading-6 text-zinc-500">This preview uses illustrative sample closing ranks and is meant as guidance. Final allotments depend on each year&apos;s official seat matrix, counselling rounds, eligibility rules, choice filling and category movement — use the results as a starting point, not a guarantee.</p>
      </div>
    </section>
    <section id="faqs" className="page-shell grid gap-8 pb-20 md:grid-cols-[.75fr_1.25fr]">
      <div><h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2><p className="mt-2 text-sm text-zinc-600">About Exam Intel.</p></div>
      <div>{faqs.map(({ question, answer }) => <details key={question} className="group border-b border-zinc-200 py-5 first:pt-0"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">{question}<ChevronDown size={16} className="shrink-0 text-zinc-400 transition group-open:rotate-180" /></summary><div className="mt-4 space-y-3 pr-6 text-sm leading-7 text-zinc-600">{answer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details>)}</div>
    </section>
  </main>;
}
