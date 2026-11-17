import type { Visual as VisualSpec } from '@/lib/content/types';

export function Visual({ visual }: { visual: VisualSpec }) {
  if (visual.kind === 'emoji') {
    return (
      <figure className="flex flex-col items-center">
        <span className="text-7xl leading-none sm:text-8xl" role="img" aria-label={visual.caption ?? 'picture'}>
          {visual.value}
        </span>
        {visual.caption && <figcaption className="mt-2 text-sm text-slate-500">{visual.caption}</figcaption>}
      </figure>
    );
  }
  return <CircuitDiagram {...visual} />;
}

type CircuitProps = Extract<VisualSpec, { kind: 'circuit' }>;

/** A simple electric circuit: dry cell (left), bulb (top), switch (right), optional gap (bottom). */
export function CircuitDiagram({ switchClosed, gap, bulbOn, caption }: CircuitProps) {
  const wire = 'stroke-slate-700';
  const on = !!bulbOn;
  const description = `Circuit with a dry cell, a bulb and a switch that is ${switchClosed ? 'closed' : 'open'}${gap ? ', and a gap in the wire' : ''}.`;
  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 260 180" className="w-64 max-w-full" role="img" aria-label={description}>
        <g fill="none" strokeWidth="4" strokeLinecap="round" className={wire}>
          {/* top wire with bulb gap */}
          <path d="M30 30H110M150 30H230" />
          {/* left wire with cell gap */}
          <path d="M30 30V70M30 110V150" />
          {/* right wire with switch gap */}
          <path d="M230 30V60M230 120V150" />
          {/* bottom wire, optionally broken */}
          {gap ? <path d="M30 150H110M150 150H230" /> : <path d="M30 150H230" />}
        </g>
        {/* dry cell */}
        <g strokeLinecap="round">
          <line x1="12" y1="78" x2="48" y2="78" strokeWidth="5" className="stroke-slate-800" />
          <line x1="20" y1="92" x2="40" y2="92" strokeWidth="9" className="stroke-slate-800" />
          <line x1="30" y1="70" x2="30" y2="78" strokeWidth="4" className="stroke-slate-700" />
          <line x1="30" y1="92" x2="30" y2="110" strokeWidth="4" className="stroke-slate-700" />
          <text x="52" y="76" className="fill-slate-500 text-[11px]">+</text>
        </g>
        {/* bulb */}
        {on && <circle cx="130" cy="30" r="30" className="fill-amber-200/70" />}
        <circle cx="130" cy="30" r="18" strokeWidth="4" className={`${on ? 'fill-amber-300 stroke-amber-500' : 'fill-white stroke-slate-700'}`} />
        <path d="M118 30h4l3-6 5 12 5-12 3 6h4" fill="none" strokeWidth="2.5" strokeLinejoin="round" className={on ? 'stroke-amber-700' : 'stroke-slate-500'} />
        {/* switch */}
        <circle cx="230" cy="62" r="4" className="fill-slate-700" />
        <circle cx="230" cy="118" r="4" className="fill-slate-700" />
        {switchClosed ? (
          <line x1="230" y1="62" x2="230" y2="118" strokeWidth="4" strokeLinecap="round" className="stroke-slate-700" />
        ) : (
          <line x1="230" y1="118" x2="252" y2="72" strokeWidth="4" strokeLinecap="round" className="stroke-slate-700" />
        )}
        {gap && <text x="130" y="168" textAnchor="middle" className="fill-rose-500 text-[12px] font-semibold">gap</text>}
        <text x="66" y="96" className="fill-slate-500 text-[11px]">dry cell</text>
        <text x="156" y="62" className="fill-slate-500 text-[11px]">bulb</text>
        <text x="178" y="96" className="fill-slate-500 text-[11px]">switch</text>
      </svg>
      {caption && <figcaption className="mt-1 text-sm text-slate-500">{caption}</figcaption>}
    </figure>
  );
}
