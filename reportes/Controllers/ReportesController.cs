using Microsoft.AspNetCore.Mvc;
using reportes.Services;

namespace reportes.Controllers;

[ApiController]
[Route("api/reportes")]
public class ReportesController : ControllerBase
{
    private readonly ReporteService _reporteService;

    public ReportesController(ReporteService reporteService)
    {
        _reporteService = reporteService;
    }

    private static bool EsExcel(string formato) =>
        string.Equals(formato, "excel", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(formato, "xlsx", StringComparison.OrdinalIgnoreCase);

    private FileResult PdfOExcel(
        string nombreBase,
        string formato,
        Func<byte[]> pdf,
        Func<byte[]> excel)
    {
        return EsExcel(formato)
            ? File(excel(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{nombreBase}.xlsx")
            : File(pdf(), "application/pdf", $"{nombreBase}.pdf");
    }

    [HttpGet("eventos")]
    public async Task<IActionResult> Eventos([FromQuery] string? formato)
    {
        var filas = await _reporteService.GetEventosAsync();
        return PdfOExcel("reporte-eventos", formato ?? "pdf",
            () => _reporteService.GenerarPdfEventos(filas),
            () => ReporteService.GenerarExcel(
                "Eventos",
                new[] { "Evento", "Organización", "Categoría", "Estado", "Fecha", "Capacidad", "Localidades" },
                filas,
                f => new object?[]
                {
                    f.Titulo,
                    f.Organizacion,
                    f.Categoria,
                    f.Estado,
                    f.FechaInicio.ToString("yyyy-MM-dd"),
                    f.CapacidadTotal,
                    f.CapacidadLocalidades,
                }));
    }

    [HttpGet("ventas")]
    public async Task<IActionResult> Ventas([FromQuery] string? formato)
    {
        var filas = await _reporteService.GetVentasAsync();
        return PdfOExcel("reporte-ventas", formato ?? "pdf",
            () => _reporteService.GenerarPdfVentas(filas),
            () => ReporteService.GenerarExcel(
                "Ventas",
                new[] { "Evento", "Organización", "Reservas", "Tickets", "Ingresos ($)" },
                filas,
                f => new object?[]
                {
                    f.Evento,
                    f.Organizacion,
                    f.TotalReservas,
                    f.TicketsVendidos,
                    f.IngresosEstimados,
                }));
    }

    [HttpGet("organizaciones")]
    public async Task<IActionResult> Organizaciones([FromQuery] string? formato)
    {
        var filas = await _reporteService.GetOrganizacionesAsync();
        return PdfOExcel("reporte-organizaciones", formato ?? "pdf",
            () => _reporteService.GenerarPdfOrganizaciones(filas),
            () => ReporteService.GenerarExcel(
                "Organizaciones",
                new[] { "Organización", "Estado", "Calificación", "Establecimientos", "Eventos aprobados" },
                filas,
                f => new object?[]
                {
                    f.Nombre,
                    f.Estado,
                    f.CalificacionPromedio,
                    f.Establecimientos,
                    f.EventosAprobados,
                }));
    }

    [HttpGet("reservas/{id:guid}/qr")]
    public async Task<IActionResult> QrReserva(Guid id)
    {
        var payload = await _reporteService.GetQrPayloadAsync(id);
        if (payload is null)
        {
            return NotFound(new { success = false, message = "Reserva no encontrada" });
        }
        return File(ReporteService.GenerarQr(payload), "image/png", $"qr-{id}.png");
    }
}
