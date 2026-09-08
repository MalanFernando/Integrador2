'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  const isMini =
    pathname.startsWith('/perfil') ||
    pathname.startsWith('/host') ||
    pathname.startsWith('/organizaciones');

  const isCompleto =
    pathname === '/' ||
    pathname === '/inicio' ||
    pathname === '/login' ||
    pathname === '/register';

  if (isMini) {
    return (
      <footer className="relative mt-20 border-t border-white/10 bg-black px-4 py-7 md:px-16">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <span className="font-semibold text-white">
            Copyright &copy; Hasta la vuelta 2026
          </span>
          <Link href="#" className="font-semibold text-white">
            Pol&iacute;ticas
          </Link>
          <Link href="#" className="font-semibold text-white">
            Instagram
          </Link>
          <Link href="#" className="font-semibold text-white">
            Contactos
          </Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative mt-20 overflow-hidden bg-black overflow-x-clip">
      <div className="relative px-4 pt-7 sm:px-6 lg:px-16 pb-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5">
            <p className="max-w-[300px] text-sm text-white/60">
              La plataforma que revolutiona tu manera de descubrir y vivir
              eventos.
            </p>
            <a className="text-lg text-white md:text-2xl">
              hastalav11elta@gmail.com
            </a>
            <nav className="flex flex-col gap-2 mt-2">
              <Link
                href="/explorar"
                className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
              >
                Explorar
              </Link>
              <Link
                href="/mapa"
                className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
              >
                Mapa
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center justify-center absolute right-8 top-0 h-[200px] w-[200px]">
            <svg
              width="130"
              height="130"
              viewBox="0 0 100 100"
              className="animate-[spinText_18s_linear_infinite]"
            >
              <defs>
                <path
                  id="circlePath"
                  d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                />
              </defs>
              <text
                fontSize="8.5"
                letterSpacing="0.1em"
                fill="#FFFFFF"
                className="font-medium"
              >
                <textPath href="#circlePath">
                  &Uacute;nete y s&eacute; parte de lo que todos commmentar&aacute;n &bull;
                </textPath>
              </text>
            </svg>
            <Link
              href="/login"
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="flex items-center justify-center w-16 h-16 -rotate-45">
                <ArrowRight className="h-8 w-8 text-white" strokeWidth={1} />
              </div>
            </Link>
          </div>
        </div>

        {isCompleto && (
          <div className="relative mt-20 md:mt-24 h-[calc(21.84vw-40px)] min-h-[30px] md:h-[208px]">
            <h2 className="absolute inset-x-0 -bottom-[40px] md:-bottom-[120px] w-full text-center font-clash text-[14vw] font-bold uppercase leading-[0.78] tracking-[-0.06em] text-white md:text-[210px] pointer-events-none select-none">
              HASTA
              <br />
              LA VUELTA
            </h2>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-0 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-black px-4 py-7 text-sm md:px-16">
        <span className="font-semibold text-white">
          Copyright &copy; Hasta la vuelta 2026
        </span>
        <Link href="#" className="font-semibold text-white">
          Pol&iacute;ticas
        </Link>
        <Link href="#" className="font-semibold text-white">
          Instagram
        </Link>
        <Link href="#" className="font-semibold text-white">
          Contactos
        </Link>
      </div>
    </footer>
  );
}
