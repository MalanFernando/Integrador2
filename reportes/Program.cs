using reportes.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<ReporteService>();

var frontendUrl = builder.Configuration["FRONTEND_URL"] ?? "http://localhost:3001";
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.WithOrigins(frontendUrl)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("frontend");
app.UseAuthorization();
app.MapControllers();

var port = builder.Configuration["PORT"] ?? "3002";
app.Run($"http://0.0.0.0:{port}");
