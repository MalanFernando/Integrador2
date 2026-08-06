import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Download } from 'lucide-react';

const statCards = [
  { label: 'Reportes generados', value: '24', change: '+5 este mes', color: 'green' },
  { label: 'Programados', value: '6', change: '+2 este mes', color: 'green' },
  { label: 'Descargas este mes', value: '89', change: '+12 este mes', color: 'green' },
  { label: 'Exportaciones', value: '134', change: '+18 este mes', color: 'green' },
  { label: 'Pendientes', value: '3', change: '+1 este mes', color: 'red' },
];

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-clash text-2xl font-semibold text-white">
            Reportes
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Genera y descarga reportes de la plataforma
          </p>
        </div>
        <Button
          variant="ghost"
          className="border border-white/10 bg-transparent text-white hover:bg-white/5"
        >
          <Download className="h-4 w-4 mr-1" /> Exportar todo
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="border border-white/10 rounded-lg p-5">
            <p className="text-[#848484] text-xs uppercase tracking-wide font-medium">
              {stat.label}
            </p>
            <p className="mt-1 text-[40px] font-medium text-white">{stat.value}</p>
            <p
              className={`mt-1 text-sm ${
                stat.color === 'red' ? 'text-[#C04C4C]' : 'text-[#45B46A]'
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-lg p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <BarChart3 className="h-16 w-16 text-white/20 mb-4" />
          <h2 className="font-clash text-xl font-semibold text-white mb-2">
            Módulo de reportes
          </h2>
          <p className="text-sm text-white/50 max-w-md">
            Esta funcionalidad estará disponible próximamente. Podrás generar
            reportes detallados de usuarios, eventos, organizaciones y más.
          </p>
          <Button
            variant="ghost"
            className="border border-white/10 bg-transparent text-white hover:bg-white/5 mt-6"
            disabled
          >
            <FileText className="h-4 w-4 mr-1" /> Próximamente
          </Button>
        </div>
      </div>
    </div>
  );
}
