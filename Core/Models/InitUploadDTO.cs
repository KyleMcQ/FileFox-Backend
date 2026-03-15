using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
namespace FileFox_Backend.Core.Models;

public class InitUploadDto
{
    public string EncryptedFileName { get; set; } = null!;
    public string EncryptedManifestHeader { get; set; } = null!;
    public string WrappedFileKey { get; set; } = null!;
    public int ChunkSize { get; set; }
    public string CryptoVersion { get; set; } = "v1";
}