import Link from "next/link";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/examintel?igsh=MXIwaGlnODdsejM0Zg==" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/exam-intel/" },
  { label: "WhatsApp", href: "https://whatsapp.com/channel/0029Vb6y0qlBqbr8lNBzqV0Q" },
  { label: "Telegram", href: "https://t.me/ExamIntel" },
];

export function Footer() {
  return <footer className="border-t border-zinc-200 py-8">
    <div className="page-shell text-sm text-zinc-500">
      <div className="flex flex-col justify-between gap-6 border-b border-zinc-200 pb-6 sm:flex-row sm:items-start">
        <div>
          <p className="font-semibold text-zinc-900">Exam Intel</p>
          <p className="mt-2 text-xs">Exam notifications, counselling dates and cutoffs in one place. Running since May 2024.</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-900">Elsewhere</p>
          <div className="mt-2.5 flex max-w-lg flex-wrap gap-x-5 gap-y-2 text-xs">
            {socialLinks.map(({ label, href }) => <a key={label} href={href} target="_blank" rel="noreferrer" className="hover:text-zinc-900 hover:underline">{label}</a>)}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-3 pt-6 text-xs sm:flex-row sm:items-center">
        <span>Made by Anurag Soroya</span>
        <Link href="/#faqs" className="hover:text-zinc-900 hover:underline">FAQs</Link>
      </div>
    </div>
  </footer>;
}
