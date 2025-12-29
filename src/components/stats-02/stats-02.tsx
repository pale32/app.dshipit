import React from "react";

const Stats02Page = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-screen-xl px-6 py-12 xl:px-0">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
          The perfect starting point for any project
        </h2>
        <p className="text-foreground/70 mt-6 max-w-2xl text-lg">
          The world&apos;s most advanced UI kit for Figma. Meticulously crafted with 100% Auto
          Layout 5.0, variables, smart variants, and WCAG accessibility.
        </p>

        <div className="mt-16 grid justify-center gap-x-10 gap-y-16 sm:mt-24 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <span className="text-5xl font-bold text-indigo-500 md:text-6xl">900+</span>
            <p className="mt-6 text-xl font-semibold">Global styles + variables</p>
            <p className="text-muted-foreground mt-2 text-[17px]">
              Super smart global color, typography and effects styles + variables!
            </p>
          </div>
          <div>
            <span className="text-5xl font-bold text-rose-500 md:text-6xl">10,000+</span>
            <p className="mt-6 text-xl font-semibold">Components and variants</p>
            <p className="text-muted-foreground mt-2 text-[17px]">
              We&apos;ve thought of everything you need so you don&apos;t have to.
            </p>
          </div>
          <div>
            <span className="text-5xl font-bold text-emerald-500 md:text-6xl">420+</span>
            <p className="mt-6 text-xl font-semibold">Page design examples</p>
            <p className="text-muted-foreground mt-2 text-[17px]">
              A whopping 420+ ready-to-go desktop and mobile page examples.
            </p>
          </div>
          <div>
            <span className="text-5xl font-bold text-blue-500 md:text-6xl">2,000+</span>
            <p className="mt-6 text-xl font-semibold">Icons and logos</p>
            <p className="text-muted-foreground mt-2 text-[17px]">
              All the icons you&apos;ll need, including country flags and payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats02Page;
