const steps = [
  {
    number: "01",
    title: "Set your camera",
    description:
      "Simple positioning guidance helps keep the movement in frame before a set begins.",
  },
  {
    number: "02",
    title: "Understand your movement",
    description:
      "Pose landmarks will provide the base signals for measuring joint angles and movement phases.",
  },
  {
    number: "03",
    title: "Review each rep",
    description:
      "Clear, specific feedback will help you review chosen technique criteria—not replace a qualified coach.",
  },
];

export function ApproachSection() {
  return (
    <section id="how-it-works" className="border-y border-[#dfe5dc] bg-white/55">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.15em] text-[#658c50]">THE APPROACH</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Useful feedback starts with good signals.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#66736b]">The first release will focus on one exercise and clear, testable criteria before expanding to a larger workout library.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-[#dfe5dc] bg-[#fbfcf9] p-6 sm:p-7">
              <p className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f2df] text-sm font-semibold text-[#31563a]">{step.number}</p>
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#66736b]">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
