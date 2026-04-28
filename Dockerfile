# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy only the main project file to restore dependencies
COPY ["FileFox-Backend.csproj", "./"]
RUN dotnet restore "FileFox-Backend.csproj"

# Copy the remaining source code
COPY . .

# Build the application
RUN dotnet build "FileFox-Backend.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "FileFox-Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose the default ASP.NET Core port
EXPOSE 8080

ENTRYPOINT ["dotnet", "FileFox-Backend.dll"]
