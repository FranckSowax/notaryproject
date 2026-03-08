import { FlaskConical } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-full shrink-0">
        <FlaskConical className="w-3 h-3" />
        Demo
      </span>
      <p className="text-xs text-amber-800">
        Donnees de demonstration. Creez un projet et ajoutez des candidats pour voir vos propres donnees.
      </p>
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
      <FlaskConical className="w-3 h-3" />
      Demo
    </span>
  );
}
