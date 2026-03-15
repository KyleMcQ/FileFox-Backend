using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
namespace FileFox_Backend.Core.Models;

public class RegisterUserKeyDto
{
    public required string Algorithm { get; set; }
    public required string PublicKey { get; set; }
    public required string EncryptedPrivateKey { get; set; }
}