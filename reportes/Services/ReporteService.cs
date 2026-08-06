using ClosedXML.Excel;
using Npgsql;
using QRCoder;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace reportes.Services;

public record EventoReporte(
    string Titulo,
    string Organizacion,
    string Categoria,
    string Estado,
    DateTime FechaInicio,
    int CapacidadTotal,
    int CapacidadLocalidades);

public record VentasReporte(
    string Evento,
    string Organizacion,
    long TotalReservas,
    long TicketsVendidos,
    decimal IngresosEstimados);

public record OrganizacionReporte(
    string Nombre,
    string Slug,
    string EmailContacto,
    string Telefono,
    string Estado,
    decimal CalificacionPromedio,
    int Establecimientos,
    int EventosAprobados);

public class ReporteService
{
    private readonly string _connectionString;

    public ReporteService(IConfiguration config)
    {
        var host = config["DB_HOST"] ?? "localhost";
        var port = config["DB_PORT"] ?? "5432";
        var user = config["DB_USER"] ?? "postgres";
        var pass = config["DB_PASS"] ?? "";
        var name = config["DB_NAME"] ?? "hasta_la_vuelta";
        _connectionString =
            $"Host={host};Port={port};Username={user};Password={pass};Database={name}";
    }

    private async Task<T> WithConnectionAsync<T>(
        Func<NpgsqlConnection, Task<T>> action)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        return await action(conn);
    }

    public Task<List<EventoReporte>> GetEventosAsync() =>
        WithConnectionAsync(async conn =>
        {
            const string sql = """
                SELECT e.titulo, org.nombre AS organizacion, cat.nombre AS categoria,
                       e.estado, e.fecha_inicio, e.capacidad_total,
                       COALESCE((SELECT SUM(l.capacidad_total) FROM localidades l
                                 WHERE l.evento_id = e.id AND l.deleted_at IS NULL), 0)::int AS capacidad_localidades
                FROM eventos e
                JOIN organizaciones org ON org.id = e.organizacion_id
                JOIN categorias cat ON cat.id = e.categoria_id
                WHERE e.deleted_at IS NULL
                ORDER BY e.fecha_inicio DESC
                """;
            await using var cmd = new NpgsqlCommand(sql, conn);
            await using var reader = await cmd.ExecuteReaderAsync();
            var rows = new List<EventoReporte>();
            while (await reader.ReadAsync())
            {
                rows.Add(new EventoReporte(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetDateTime(4),
                    reader.GetInt32(5),
                    reader.GetInt32(6)));
            }
            return rows;
        });

    public Task<List<VentasReporte>> GetVentasAsync() =>
        WithConnectionAsync(async conn =>
        {
            const string sql = """
                SELECT e.titulo, org.nombre AS organizacion,
                       COUNT(DISTINCT r.id)::bigint AS total_reservas,
                       COALESCE(SUM(r.cantidad_tickets), 0)::bigint AS tickets_vendidos,
                       COALESCE(SUM(r.cantidad_tickets * l.precio), 0) AS ingresos_estimados
                FROM eventos e
                JOIN organizaciones org ON org.id = e.organizacion_id
                LEFT JOIN localidades l ON l.evento_id = e.id AND l.deleted_at IS NULL
                LEFT JOIN reservas r ON r.localidad_id = l.id AND r.estado <> 'cancelada'
                WHERE e.deleted_at IS NULL
                GROUP BY e.id, org.nombre
                ORDER BY ingresos_estimados DESC
                """;
            await using var cmd = new NpgsqlCommand(sql, conn);
            await using var reader = await cmd.ExecuteReaderAsync();
            var rows = new List<VentasReporte>();
            while (await reader.ReadAsync())
            {
                rows.Add(new VentasReporte(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetInt64(2),
                    reader.GetInt64(3),
                    reader.GetDecimal(4)));
            }
            return rows;
        });

    public Task<List<OrganizacionReporte>> GetOrganizacionesAsync() =>
        WithConnectionAsync(async conn =>
        {
            const string sql = """
                SELECT org.nombre, org.slug, org.email_contacto, COALESCE(org.telefono, ''),
                       org.estado, org.calificacion_promedio,
                       (SELECT COUNT(*) FROM establecimientos es
                        WHERE es.organizacion_id = org.id AND es.deleted_at IS NULL)::int,
                       (SELECT COUNT(*) FROM eventos ev
                        WHERE ev.organizacion_id = org.id AND ev.deleted_at IS NULL
                          AND ev.estado = 'aprobado')::int
                FROM organizaciones org
                WHERE org.deleted_at IS NULL
                ORDER BY org.nombre
                """;
            await using var cmd = new NpgsqlCommand(sql, conn);
            await using var reader = await cmd.ExecuteReaderAsync();
            var rows = new List<OrganizacionReporte>();
            while (await reader.ReadAsync())
            {
                rows.Add(new OrganizacionReporte(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetString(4),
                    reader.GetDecimal(5),
                    reader.GetInt32(6),
                    reader.GetInt32(7)));
            }
            return rows;
        });

    public Task<string?> GetQrPayloadAsync(Guid reservaId) =>
        WithConnectionAsync(async conn =>
        {
            const string sql = """
                SELECT qr_payload FROM reservas WHERE id = $1
                """;
            await using var cmd = new NpgsqlCommand(sql, conn)
            {
                Parameters = { new() { Value = reservaId } },
            };
            var result = await cmd.ExecuteScalarAsync();
            return result as string;
        });

    public byte[] GenerarPdfEventos(List<EventoReporte> filas)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.DefaultTextStyle(style => style.FontSize(10).FontColor(Colors.Grey.Darken3));
                page.Header()
                    .PaddingBottom(12)
                    .BorderBottom(1)
                    .BorderColor(Colors.Grey.Lighten2)
                    .Row(row =>
                    {
                        row.RelativeItem().Column(column =>
                        {
                            column.Item().Text("Hasta la Vuelta").FontSize(20).Bold().FontColor(Colors.Blue.Darken3);
                            column.Item().Text("Reporte de eventos").FontSize(13).FontColor(Colors.Grey.Darken2);
                        });
                        row.ConstantItem(120).AlignRight().Text(DateTime.Now.ToString("yyyy-MM-dd")).FontColor(Colors.Grey.Medium);
                    });
                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });
                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .Text("Evento").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .Text("Organización").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .Text("Categoría").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .Text("Estado").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .Text("Fecha").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .AlignRight().Text("Capacidad").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .AlignRight().Text("Localidades").Bold().FontColor(Colors.White);
                    });
                    foreach (var (fila, i) in filas.Select((f, i) => (f, i)))
                    {
                        var background = i % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                        table.Cell().Background(background).Padding(5).Text(fila.Titulo);
                        table.Cell().Background(background).Padding(5).Text(fila.Organizacion);
                        table.Cell().Background(background).Padding(5).Text(fila.Categoria);
                        table.Cell().Background(background).Padding(5).Text(fila.Estado);
                        table.Cell().Background(background).Padding(5).Text(fila.FechaInicio.ToString("yyyy-MM-dd"));
                        table.Cell().Background(background).Padding(5).AlignRight().Text(fila.CapacidadTotal.ToString());
                        table.Cell().Background(background).Padding(5).AlignRight().Text(fila.CapacidadLocalidades.ToString());
                    }
                });
                page.Footer()
                    .AlignCenter()
                    .Text(t =>
                    {
                        t.Span("Generado por Hasta la Vuelta · ").FontColor(Colors.Grey.Medium);
                        t.Span(DateTime.Now.ToString("G")).FontColor(Colors.Grey.Medium);
                    });
            });
        }).GeneratePdf();
    }

    public byte[] GenerarPdfVentas(List<VentasReporte> filas)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.DefaultTextStyle(style => style.FontSize(10).FontColor(Colors.Grey.Darken3));
                page.Header()
                    .PaddingBottom(12)
                    .BorderBottom(1)
                    .BorderColor(Colors.Grey.Lighten2)
                    .Row(row =>
                    {
                        row.RelativeItem().Column(column =>
                        {
                            column.Item().Text("Hasta la Vuelta").FontSize(20).Bold().FontColor(Colors.Blue.Darken3);
                            column.Item().Text("Reporte de ventas por evento").FontSize(13).FontColor(Colors.Grey.Darken2);
                        });
                        row.ConstantItem(120).AlignRight().Text(DateTime.Now.ToString("yyyy-MM-dd")).FontColor(Colors.Grey.Medium);
                    });
                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });
                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .Text("Evento").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .Text("Organización").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .AlignRight().Text("Reservas").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .AlignRight().Text("Tickets").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .AlignRight().Text("Ingresos ($)").Bold().FontColor(Colors.White);
                    });
                    foreach (var (fila, i) in filas.Select((f, i) => (f, i)))
                    {
                        var background = i % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                        table.Cell().Background(background).Padding(5).Text(fila.Evento);
                        table.Cell().Background(background).Padding(5).Text(fila.Organizacion);
                        table.Cell().Background(background).Padding(5).AlignRight().Text(fila.TotalReservas.ToString());
                        table.Cell().Background(background).Padding(5).AlignRight().Text(fila.TicketsVendidos.ToString());
                        table.Cell().Background(background).Padding(5).AlignRight().Text(fila.IngresosEstimados.ToString("N2"));
                    }
                });
                page.Footer()
                    .AlignCenter()
                    .Text(t =>
                    {
                        t.Span("Generado por Hasta la Vuelta · ").FontColor(Colors.Grey.Medium);
                        t.Span(DateTime.Now.ToString("G")).FontColor(Colors.Grey.Medium);
                    });
            });
        }).GeneratePdf();
    }

    public byte[] GenerarPdfOrganizaciones(List<OrganizacionReporte> filas)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.DefaultTextStyle(style => style.FontSize(10).FontColor(Colors.Grey.Darken3));
                page.Header()
                    .PaddingBottom(12)
                    .BorderBottom(1)
                    .BorderColor(Colors.Grey.Lighten2)
                    .Row(row =>
                    {
                        row.RelativeItem().Column(column =>
                        {
                            column.Item().Text("Hasta la Vuelta").FontSize(20).Bold().FontColor(Colors.Blue.Darken3);
                            column.Item().Text("Reporte de organizaciones").FontSize(13).FontColor(Colors.Grey.Darken2);
                        });
                        row.ConstantItem(120).AlignRight().Text(DateTime.Now.ToString("yyyy-MM-dd")).FontColor(Colors.Grey.Medium);
                    });
                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });
                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .Text("Organización").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .Text("Estado").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .AlignRight().Text("Calificación").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .AlignRight().Text("Establecimientos").Bold().FontColor(Colors.White);
                        header.Cell().Background(Colors.Blue.Darken3).Padding(6)
                            .AlignRight().Text("Eventos aprobados").Bold().FontColor(Colors.White);
                    });
                    foreach (var (fila, i) in filas.Select((f, i) => (f, i)))
                    {
                        var background = i % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;
                        table.Cell().Background(background).Padding(5).Text(fila.Nombre);
                        table.Cell().Background(background).Padding(5).Text(fila.Estado);
                        table.Cell().Background(background).Padding(5).AlignRight().Text(fila.CalificacionPromedio.ToString("N2"));
                        table.Cell().Background(background).Padding(5).AlignRight().Text(fila.Establecimientos.ToString());
                        table.Cell().Background(background).Padding(5).AlignRight().Text(fila.EventosAprobados.ToString());
                    }
                });
                page.Footer()
                    .AlignCenter()
                    .Text(t =>
                    {
                        t.Span("Generado por Hasta la Vuelta · ").FontColor(Colors.Grey.Medium);
                        t.Span(DateTime.Now.ToString("G")).FontColor(Colors.Grey.Medium);
                    });
            });
        }).GeneratePdf();
    }

    public static byte[] GenerarExcel<T>(
        string hoja,
        string[] columnas,
        IEnumerable<T> filas,
        Func<T, object?[]> selector)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(hoja);
        for (var c = 0; c < columnas.Length; c++)
        {
            worksheet.Cell(1, c + 1).Value = columnas[c];
        }
        worksheet.Row(1).Style.Font.Bold = true;
        worksheet.Row(1).Style.Fill.BackgroundColor = XLColor.FromHtml("#0D47A1");
        worksheet.Row(1).Style.Font.FontColor = XLColor.White;

        var r = 2;
        foreach (var fila in filas)
        {
            var valores = selector(fila);
            for (var c = 0; c < valores.Length; c++)
            {
                var cell = worksheet.Cell(r, c + 1);
                switch (valores[c])
                {
                    case int i: cell.Value = i; break;
                    case long l: cell.Value = l; break;
                    case decimal m: cell.Value = (double)m; break;
                    case double d: cell.Value = d; break;
                    case DateTime dt: cell.Value = dt; break;
                    case bool b: cell.Value = b; break;
                    default: cell.Value = valores[c]?.ToString() ?? string.Empty; break;
                }
            }
            r++;
        }
        worksheet.Columns().AdjustToContents();
        worksheet.SheetView.FreezeRows(1);

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    public static byte[] GenerarQr(string contenido)
    {
        using var generator = new QRCodeGenerator();
        var qrData = generator.CreateQrCode(contenido, QRCodeGenerator.ECCLevel.M);
        using var qrCode = new PngByteQRCode(qrData);
        return qrCode.GetGraphic(10);
    }
}
