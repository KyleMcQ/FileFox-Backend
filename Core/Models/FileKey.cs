using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
namespace FileFox_Backend.Core.Models;
public class FileKey
{
    public Guid Id { get; set; }
    public Guid FileRecordId { get; set; }
    public string WrappedFileKey { get; set; } = null!;
    public string Algorithm { get; set; } = "ECIES-P256";
    public int KeyVersion { get; set; } = 1;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public FileRecord FileRecord { get; set; } = null!;
}