import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-black">
      <div className="relative px-4 pt-7 sm:px-6 lg:px-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4">
            <p className="max-w-[300px] text-sm text-white/60">
              La plataforma que revoluciona tu manera de descubrir y vivir
              eventos.
            </p>
            <a className="font-clash text-2xl text-white md:text-3xl">
              proyecto@gmail.com
            </a>
          </div>
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
            >
              Inicio
            </Link>
            <Link
              href="/mapa"
              className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
            >
              Mapa
            </Link>
            <Link
              href="/eventos"
              className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
            >
              Eventos
            </Link>
          </nav>
        </div>

        <div className="relative mt-16 text-center md:mt-24">
          <div className="absolute -top-36 right-8 hidden h-[110px] w-[110px] flex-col items-center justify-center rounded-full border border-dashed border-white/30 p-2.5 text-center md:flex">
            <span className="mb-1 text-2xl text-white">↗</span>
            <span className="text-[10px] text-white/60">
              Únete y sé parte de lo que todos comentarán mañana
            </span>
          </div>
          <h2 className="font-clash text-[14vw] font-semibold uppercase leading-[0.8] tracking-[-4px] text-white md:text-[10vw]">
            Hasta
            <br />
            la vuelta
          </h2>
        </div>
      </div>

      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-black px-4 py-7 text-sm md:px-16">
        <span className="font-semibold text-white">
          Copyright &copy; proyecto 2026
        </span>
        <Link href="#" className="font-semibold text-white">
          Pol&iacute;ticas
        </Link>
        <Link href="#" className="font-semibold text-white">
          Instagram
        </Link>
        <Link href="#" className="font-semibold text-white">
          Tiktok
        </Link>
      </div>
    </footer>
  );
}
