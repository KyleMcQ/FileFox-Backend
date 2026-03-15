using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using System.Security.Claims;

namespace FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Models;

public interface ITokenService
{
    string CreateToken(User user);
    string CreateMfaToken(User user);
    ClaimsPrincipal? ValidateMfaToken(string token);

}