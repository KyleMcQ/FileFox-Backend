using FileFox_Backend.Infrastructure.Extensions;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace FileFox_Backend.Infrastructure.Services;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;
using FileFox_Backend.Core.Models;
using FileFox_Backend.Core.Interfaces;
using FileFox_Backend.Infrastructure.Data;

public class LocalFileStore : IFileStore
{
    private readonly ApplicationDbContext _db;
    private readonly IBlobStorageService _blob;

    public LocalFileStore(ApplicationDbContext db, IBlobStorageService blob)
    {
        _db = db;
        _blob = blob;
    }

    public async Task<Guid> SaveAsync(Guid userId, IFormFile file, CancellationToken ct = default)
    {
        var fileId = Guid.NewGuid();

        // This is a direct upload, so we don't have client-side encrypted manifest header or wrapped keys in this simplified flow.
        // In a real FileFox flow, everything is encrypted client-side.
        // For the sake of completing the "allow for file uploading" requirement:

        await using var stream = file.OpenReadStream();
        // Treat the whole file as one chunk for simple upload
        await _blob.PutChunkAsync(fileId, 0, stream);

        var record = new FileRecord
        {
            Id = fileId,
            UserId = userId,
            EncryptedFileName = file.FileName, // In reality, this would be encrypted
            ChunkSize = (int)file.Length,
            CryptoVersion = "v1-simple",
            ManifestBlobPath = string.Empty,
            UploadedAt = DateTimeOffset.UtcNow
        };

        _db.Files.Add(record);
        await _db.SaveChangesAsync(ct);

        return fileId;
    }

    public async Task<IEnumerable<FileRecord>> ListAsync(Guid userId, CancellationToken ct = default)
    {
        return await _db.Files
            .Where(f => f.UserId == userId)
            .ToListAsync(ct);
    }

    public async Task<FileRecord?> GetAsync(Guid userId, Guid fileId)
    {
        return await _db.Files
            .FirstOrDefaultAsync(f => f.UserId == userId && f.Id == fileId);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid fileId)
    {
        var record = await GetAsync(userId, fileId);
        if (record == null) return false;

        _db.Files.Remove(record);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task ClearAsync(Guid userId)
    {
        var files = await _db.Files.Where(f => f.UserId == userId).ToListAsync();
        _db.Files.RemoveRange(files);
        await _db.SaveChangesAsync();
    }
}
