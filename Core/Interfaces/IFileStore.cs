using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;

public interface IFileStore
{
    Task<Guid> SaveAsync(Guid userId, IFormFile file, CancellationToken ct = default);
    Task<IEnumerable<FileRecord>> ListAsync(Guid userId, CancellationToken ct = default);
    Task<FileRecord?> GetAsync(Guid userId, Guid fileId);
    Task<bool> DeleteAsync(Guid userId, Guid fileId);
    Task ClearAsync(Guid userId);
}
