using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using FileFox_Backend.Infrastructure.Services;
using Xunit;

namespace FileFox_Backend.Tests;

public class BlobStorageTests
{
    private InMemoryBlobStorage GetBlobStorage()
    {
        return new InMemoryBlobStorage();
    }

    [Fact]
    public async Task PutAndGetChunk_Works()
    {
        var blob = GetBlobStorage();
        var fileId = Guid.NewGuid();
        var chunkData = Encoding.UTF8.GetBytes("test chunk data");

        using var ms = new MemoryStream(chunkData);
        var key = await blob.PutChunkAsync(fileId, 0, ms);
        Assert.NotEmpty(key);

        using var retrieved = await blob.GetChunkAsync(fileId, 0);
        Assert.NotNull(retrieved);
        using var reader = new StreamReader(retrieved!);
        var text = await reader.ReadToEndAsync();
        Assert.Equal("test chunk data", text);
    }

    [Fact]
    public async Task PutAndGetManifest_Works()
    {
        var blob = GetBlobStorage();
        var fileId = Guid.NewGuid();
        var manifestData = Encoding.UTF8.GetBytes("manifest content");

        using var ms = new MemoryStream(manifestData);
        var key = await blob.PutManifestAsync(fileId, ms);
        Assert.NotEmpty(key);

        using var retrieved = await blob.GetManifestAsync(fileId);
        Assert.NotNull(retrieved);
        using var reader = new StreamReader(retrieved!);
        var text = await reader.ReadToEndAsync();
        Assert.Equal("manifest content", text);
    }
}
