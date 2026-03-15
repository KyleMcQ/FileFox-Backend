using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using Microsoft.Extensions.Configuration;

namespace FileFox_Backend.Infrastructure.Services;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;

public class LocalSecretProvider : ISecretProvider
{
    private readonly IConfiguration _config;

    public LocalSecretProvider(IConfiguration config)
    {
        _config = config;
    }

    public string GetSecret(string key)
    {
        var value = _config[key];
        
        if (string.IsNullOrWhiteSpace(value))
            throw new Exception($"Missing secret: {key}");

        return value;
    }
}