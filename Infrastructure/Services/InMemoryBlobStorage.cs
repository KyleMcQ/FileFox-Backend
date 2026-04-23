using System.Collections.Concurrent;
using FileFox_Backend.Core.Interfaces;

namespace FileFox_Backend.Infrastructure.Services;

public class InMemoryBlobStorage : IBlobStorageService
{
    private readonly ConcurrentDictionary<string, byte[]> _storage = new();

    private string ChunkKey(Guid fileId, int index) => $"chunk:{fileId}:{index}";
    private string ManifestKey(Guid fileId) => $"manifest:{fileId}";

    public async Task<string> PutChunkAsync(Guid fileId, int chunkIndex, Stream ciphertext)
    {
        var key = ChunkKey(fileId, chunkIndex);
        using var ms = new MemoryStream();
        await ciphertext.CopyToAsync(ms);
        _storage[key] = ms.ToArray();
        return key;
    }

    public Task<Stream?> GetChunkAsync(Guid fileId, int chunkIndex)
    {
        var key = ChunkKey(fileId, chunkIndex);
        if (_storage.TryGetValue(key, out var data))
        {
            return Task.FromResult<Stream?>(new MemoryStream(data));
        }
        return Task.FromResult<Stream?>(null);
    }

    public async Task<string> PutManifestAsync(Guid fileId, Stream encryptedManifest)
    {
        var key = ManifestKey(fileId);
        using var ms = new MemoryStream();
        await encryptedManifest.CopyToAsync(ms);
        _storage[key] = ms.ToArray();
        return key;
    }

    public Task<Stream?> GetManifestAsync(Guid fileId)
    {
        var key = ManifestKey(fileId);
        if (_storage.TryGetValue(key, out var data))
        {
            return Task.FromResult<Stream?>(new MemoryStream(data));
        }
        return Task.FromResult<Stream?>(null);
    }
}
