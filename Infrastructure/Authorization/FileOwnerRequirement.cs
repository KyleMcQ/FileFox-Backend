using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace FileFox_Backend.Infrastructure.Authorization
{
    public class FileOwnerRequirement : IAuthorizationRequirement
    {
    }
}