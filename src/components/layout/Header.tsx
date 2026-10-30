"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HeaderHem, Paw } from "@/components/art/chrome";
import { nav, site, whatsappHref } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Solid bar once we leave the top; tuck away while scrolling down, return on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A new page always starts with the header showing.
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setHidden(false);
  }

  return (
    <header
      id="site-header"
      data-scrolled={scrolled}
      data-hidden={hidden}
      data-home={pathname === "/"}
      className="tp-header fixed inset-x-0 top-0 z-50"
    >
      <div className="tp-header__bar gutter">
        <Link className="tp-header__brand" aria-label={`${site.name} — home`} href="/">
          <Image alt="" width={56} height={56} className="tp-header__logo" src="/brand/logo.png" priority />
          <span className="font-plush tp-header__name">{site.short}</span>
        </Link>
        <nav aria-label="Main" className="tp-header__nav">
          <ul>
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    data-active={active}
                    className="tp-nav-link"
                    href={item.href}
                  >
                    <span>{item.label}</span>
                    <Paw />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="tp-header__end">
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp tp-header__wa">
            WhatsApp us
          </a>
          <MobileMenu pathname={pathname} />
        </div>
      </div>
      <HeaderHem />
    </header>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const ref = useRef<HTMLDialogElement>(null);

  const open = () => ref.current?.showModal();
  const close = () => {
    const d = ref.current;
    if (!d?.open || d.dataset.closing !== undefined) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return d.close();
    d.dataset.closing = "";
    d.addEventListener(
      "animationend",
      () => {
        delete d.dataset.closing;
        d.close();
      },
      { once: true },
    );
  };

  // Navigating closes the menu.
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-cocoa bg-milk px-4 text-[0.95rem] font-semibold lg:hidden"
        aria-haspopup="dialog"
      >
        <Paw className="size-4" />
        Menu
      </button>
      <dialog
        ref={ref}
        aria-label="Site menu"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="tp-menu m-0 h-dvh max-h-none w-screen max-w-none bg-honey p-0 text-cocoa backdrop:bg-cocoa/40"
      >
        <div className="flex h-full flex-col gutter pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5">
          <div className="flex items-center justify-between">
            <span className="font-scrawl text-lg">where to, friend?</span>
            <button type="button" onClick={close} className="h-11 rounded-full bg-cocoa px-5 font-semibold text-milk">
              Close
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-10 flex-1">
            <ul className="space-y-1">
              {nav.map((item, i) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                    <Link
                      aria-current={active ? "page" : undefined}
                      data-active={active}
                      className="tp-menu-link font-plush block py-2 text-[clamp(2.4rem,11vw,3.4rem)]"
                      href={item.href}
                    >
                      <span>{item.label}</span>
                      <Paw />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="space-y-3">
            <a href={whatsappHref()} className="btn btn-whatsapp w-full" target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
            <p className="text-center text-sm font-medium">{site.phone}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
